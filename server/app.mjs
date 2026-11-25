/**
 * Servidor HTTP del Reto 4 (sin frameworks, solo módulos de Node).
 *   /                 landing (build estático de Astro en dist/)
 *   /admin/           panel de administración (server/admin/)
 *   /api/leads        registro público de interesados
 *   /api/admin/*      API del panel (requiere sesión)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { STATUSES } from './db.mjs';
import { PROGRAMS, validateLead, isUuid } from './validate.mjs';
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  hashPassword,
  newToken,
  parseCookies,
  sessionCookie,
  tokenHash,
  verifyAgainstDummy,
  verifyPassword,
} from './auth.mjs';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

/** Límite simple por IP y ventana deslizante (memoria del proceso). */
function rateLimiter(limit, windowMs) {
  const hits = new Map();
  return (key) => {
    const t = Date.now();
    const list = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
    list.push(t);
    hits.set(key, list);
    return list.length <= limit;
  };
}

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

async function readJson(req, maxBytes = 16_384) {
  const type = req.headers['content-type'] ?? '';
  if (!type.includes('application/json')) throw new HttpError(415, 'Se espera JSON.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, 'La solicitud es demasiado grande.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw new HttpError(400, 'JSON no válido.');
  }
}

export function createApp({
  db,
  notifier,
  rootDir,
  secureCookies = false,
  log = console,
  limits = { leadsPerMinute: 5, loginsPer15Min: 8 },
}) {
  const distDir = resolve(rootDir, 'dist');
  const adminDir = resolve(rootDir, 'server', 'admin');
  const fontsDir = resolve(rootDir, 'node_modules', '@fontsource', 'poppins', 'files');
  const brandDir = resolve(rootDir, 'src', 'assets', 'brand');

  const leadLimit = rateLimiter(limits.leadsPerMinute, 60_000); // registros por minuto por IP
  const loginLimit = rateLimiter(limits.loginsPer15Min, 15 * 60_000); // intentos de acceso por IP

  const send = (res, status, body, headers = {}) => {
    const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
    res.writeHead(status, {
      ...SECURITY_HEADERS,
      ...(isJson ? { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } : {}),
      ...headers,
    });
    res.end(isJson ? JSON.stringify(body) : body);
  };

  async function serveFile(res, baseDir, relPath, cache = 'no-cache') {
    const target = normalize(join(baseDir, relPath));
    if (!target.startsWith(baseDir + sep) && target !== baseDir) throw new HttpError(404, 'No encontrado.');
    let file = target;
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const data = await readFile(file);
      send(res, 200, data, {
        'content-type': MIME[extname(file)] ?? 'application/octet-stream',
        'cache-control': cache,
      });
    } catch {
      throw new HttpError(404, 'No encontrado.');
    }
  }

  const ip = (req) => req.socket.remoteAddress ?? 'desconocida';

  function currentAdmin(req) {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    return token ? db.sessionAdmin(tokenHash(token)) : null;
  }

  function requireAdmin(req) {
    const admin = currentAdmin(req);
    if (!admin) throw new HttpError(401, 'Inicia sesión para continuar.');
    // Defensa CSRF adicional a SameSite=Strict: las mutaciones exigen una cabecera propia.
    if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'aia-admin') {
      throw new HttpError(403, 'Solicitud no permitida.');
    }
    return admin;
  }

  const serializeLead = (l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    program: l.program,
    programName: PROGRAMS[l.program] ?? l.program,
    phone: l.phone,
    status: l.status,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    notifyStatus: l.notify_status,
    notifyAttempts: l.notify_attempts,
    notifiedAt: l.notified_at,
    notifyError: l.notify_error,
    notesCount: l.notes_count,
    lastActivity: l.last_activity,
  });

  async function route(req, res) {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname;

    // ---------- API pública ----------
    if (path === '/api/health') return send(res, 200, { ok: true });

    if (path === '/api/leads' && req.method === 'POST') {
      if (!leadLimit(ip(req))) throw new HttpError(429, 'Demasiadas solicitudes. Intenta de nuevo en un minuto.');
      const body = await readJson(req);
      // Trampa para bots: un campo oculto que una persona nunca llena.
      if (typeof body.website === 'string' && body.website.trim()) {
        return send(res, 400, { ok: false, message: 'No pudimos procesar la solicitud.' });
      }
      const result = validateLead(body);
      if (!result.ok) return send(res, 422, { ok: false, errors: result.errors });
      const key = isUuid(body.idempotencyKey) ? body.idempotencyKey : null;
      const { lead, duplicate } = db.createLead({ ...result.data, idempotencyKey: key });
      // Responder primero (el registro ya está guardado) y avisar después.
      send(res, duplicate ? 200 : 201, { ok: true, id: lead.id, status: lead.status, createdAt: lead.created_at });
      if (!duplicate) notifier.notify(lead).catch((e) => log.error('[aviso]', e));
      return;
    }

    // ---------- API del panel ----------
    if (path === '/api/admin/login' && req.method === 'POST') {
      if (!loginLimit(ip(req))) throw new HttpError(429, 'Demasiados intentos. Espera unos minutos.');
      const { email, password } = await readJson(req);
      const admin = typeof email === 'string' ? db.adminByEmail(email.trim()) : null;
      const valid = admin ? verifyPassword(String(password ?? ''), admin.password_hash) : verifyAgainstDummy(String(password ?? ''));
      if (!admin || !valid) throw new HttpError(401, 'Correo o contraseña incorrectos.');
      const token = newToken();
      db.createSession(tokenHash(token), admin.id, SESSION_TTL_MS);
      return send(res, 200, { ok: true, admin: { name: admin.name, email: admin.email } }, {
        'set-cookie': sessionCookie(token, { secure: secureCookies }),
      });
    }

    if (path === '/api/admin/logout' && req.method === 'POST') {
      const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
      if (token) db.deleteSession(tokenHash(token));
      return send(res, 200, { ok: true }, { 'set-cookie': sessionCookie('', { secure: secureCookies, maxAgeMs: 0 }) });
    }

    if (path.startsWith('/api/admin/')) {
      const admin = requireAdmin(req);

      if (path === '/api/admin/me' && req.method === 'GET') {
        return send(res, 200, { admin: { name: admin.name, email: admin.email } });
      }

      if (path === '/api/admin/leads' && req.method === 'GET') {
        const status = url.searchParams.get('status');
        const program = url.searchParams.get('program');
        const search = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
        return send(res, 200, {
          counts: db.counts(),
          statuses: STATUSES,
          programs: PROGRAMS,
          leads: db
            .listLeads({
              status: STATUSES.includes(status) ? status : undefined,
              program: Object.hasOwn(PROGRAMS, program ?? '') ? program : undefined,
              search: search || undefined,
            })
            .map(serializeLead),
        });
      }

      const m = path.match(/^\/api\/admin\/leads\/([0-9a-f-]{36})(\/status|\/notes|\/notify)?$/i);
      if (m) {
        const [, id, action] = m;
        if (!db.lead(id)) throw new HttpError(404, 'Registro no encontrado.');

        if (!action && req.method === 'GET') {
          return send(res, 200, {
            lead: serializeLead(db.lead(id)),
            notes: db.notes(id),
            events: db.events(id),
            statuses: STATUSES,
          });
        }
        if (action === '/status' && req.method === 'PATCH') {
          const { status } = await readJson(req);
          if (!STATUSES.includes(status)) throw new HttpError(422, 'Estado no válido.');
          db.changeStatus(id, admin.id, status);
          return send(res, 200, { ok: true, lead: serializeLead(db.lead(id)), events: db.events(id) });
        }
        if (action === '/notes' && req.method === 'POST') {
          const { body } = await readJson(req);
          const text = typeof body === 'string' ? body.trim() : '';
          if (text.length < 2 || text.length > 2000) throw new HttpError(422, 'La nota debe tener entre 2 y 2000 caracteres.');
          db.addNote(id, admin.id, text);
          return send(res, 201, { ok: true, notes: db.notes(id), events: db.events(id) });
        }
        if (action === '/notify' && req.method === 'POST') {
          const result = await notifier.notify(db.lead(id));
          return send(res, 200, { ok: Boolean(result.ok || result.skipped), lead: serializeLead(db.lead(id)), events: db.events(id) });
        }
      }
      throw new HttpError(404, 'Ruta no encontrada.');
    }

    if (path.startsWith('/api/')) throw new HttpError(404, 'Ruta no encontrada.');

    // ---------- Archivos ----------
    if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Método no permitido.');
    if (path === '/admin') return send(res, 301, '', { location: '/admin/' });
    if (path.startsWith('/admin/fonts/')) return serveFile(res, fontsDir, path.slice('/admin/fonts/'.length), 'public, max-age=31536000, immutable');
    if (path.startsWith('/admin/brand/')) return serveFile(res, brandDir, path.slice('/admin/brand/'.length), 'public, max-age=86400');
    if (path.startsWith('/admin/')) return serveFile(res, adminDir, decodeURIComponent(path.slice('/admin/'.length)) || 'index.html');
    const cache = path.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache';
    return serveFile(res, distDir, decodeURIComponent(path), cache);
  }

  return createServer((req, res) => {
    route(req, res).catch((err) => {
      if (res.headersSent) return;
      if (err instanceof HttpError) return send(res, err.status, { ok: false, message: err.message, ...err.extra });
      log.error('[servidor]', err);
      send(res, 500, { ok: false, message: 'Ocurrió un error inesperado.' });
    });
  });
}

export { hashPassword };
