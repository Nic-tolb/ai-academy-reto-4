// Pruebas del servidor (node --test server/). Base temporal y un n8n simulado SOLO para la prueba.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.mjs';
import { createNotifier } from './notify.mjs';
import { createApp } from './app.mjs';
import { hashPassword } from './auth.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SECRET = 'secreto-de-prueba-1234567890';
let dir,
  db,
  app,
  base,
  fakeN8n,
  n8nMode = 'ok';
const received = [];

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'aia-'));
  db = openDb(join(dir, 'test.db'));
  db.upsertAdmin('ana@aiacademy.test', 'Ana Admin', hashPassword('clave-de-prueba-123'));
  db.upsertAdmin('beto@aiacademy.test', 'Beto Admin', hashPassword('clave-de-prueba-456'));

  fakeN8n = createServer(async (req, res) => {
    let body = '';
    for await (const c of req) body += c;
    received.push({ secret: req.headers['x-webhook-secret'], body: JSON.parse(body) });
    if (n8nMode === 'down') return res.writeHead(500).end();
    if (n8nMode === 'empty') return res.writeHead(200).end(); // así responde n8n si Telegram falla
    res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
  }).listen(0);
  await new Promise((r) => fakeN8n.once('listening', r));

  const notifier = createNotifier({
    db,
    webhookUrl: `http://127.0.0.1:${fakeN8n.address().port}/webhook`,
    secret: SECRET,
    publicUrl: 'http://localhost',
    log: { warn() {} },
  });
  app = createApp({
    db,
    notifier,
    rootDir,
    log: { error() {} },
    limits: { leadsPerMinute: 100, loginsPer15Min: 100 },
  }).listen(0);
  await new Promise((r) => app.once('listening', r));
  base = `http://127.0.0.1:${app.address().port}`;
});

after(() => {
  app.close();
  fakeN8n.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const post = (path, body, headers = {}) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
const waitFor = async (fn, ms = 2000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fn()) return true;
    await new Promise((r) => setTimeout(r, 25));
  }
  return false;
};
async function login(email, password) {
  const res = await post('/api/admin/login', { email, password });
  assert.equal(res.status, 200);
  return res.headers.get('set-cookie').split(';')[0];
}

test('QA-01/02/03/04/12 · registro válido sin teléfono: se guarda como Nuevo y avisa con sus datos', async () => {
  const res = await post('/api/leads', {
    name: '  Valentina   Ficticia ',
    email: 'VALE@ejemplo.test',
    program: 'booster',
  });
  assert.equal(res.status, 201);
  const { id } = await res.json();
  const lead = db.lead(id);
  assert.equal(lead.status, 'Nuevo');
  assert.equal(lead.name, 'Valentina Ficticia');
  assert.equal(lead.email, 'vale@ejemplo.test');
  assert.equal(lead.phone, null);
  assert.ok(!Number.isNaN(Date.parse(lead.created_at)));
  assert.ok(await waitFor(() => db.lead(id).notify_status === 'enviado'));
  const sent = received.find((r) => r.body.id === id);
  assert.equal(sent.secret, SECRET);
  assert.equal(sent.body.name, 'Valentina Ficticia');
  assert.equal(sent.body.email, 'vale@ejemplo.test');
  assert.equal(sent.body.program, 'booster');
});

test('QA-10/11 · datos inválidos: 422, sin registro y sin aviso', async () => {
  const before = db.counts().total;
  const calls = received.length;
  for (const body of [
    { name: 'Laura', email: 'laura@', program: 'booster' },
    { name: '   ', email: '', program: '' },
    { name: 'Laura', email: 'laura@ejemplo.test', program: 'master-en-ia' },
    { name: '<script>alert(1)</script>', email: 'x@ejemplo.test', program: 'ignition' },
    { name: 'Laura', email: 'laura@ejemplo.test', program: 'ignition', phone: '12ab' },
  ]) {
    const res = await post('/api/leads', body);
    assert.equal(res.status, 422);
  }
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(db.counts().total, before);
  assert.equal(received.length, calls);
});

test('doble envío con la misma clave: un solo registro y un solo aviso', async () => {
  const key = '0f8f0d2e-1111-4222-8333-444455556666';
  const body = {
    name: 'Doble Clic',
    email: 'doble@ejemplo.test',
    program: 'ignition',
    idempotencyKey: key,
  };
  const a = await (await post('/api/leads', body)).json();
  const b = await (await post('/api/leads', body)).json();
  assert.equal(a.id, b.id);
  await waitFor(() => db.lead(a.id).notify_status === 'enviado');
  assert.equal(received.filter((r) => r.body.id === a.id).length, 1);
});

test('QA-15 · si n8n/Telegram falla, el registro se conserva y queda «fallido»; el reintento lo envía', async () => {
  n8nMode = 'empty';
  const { id } = await (
    await post('/api/leads', {
      name: 'Sin Aviso',
      email: 'sin@ejemplo.test',
      program: 'nebula',
      phone: '+57 300 000 0000',
    })
  ).json();
  assert.ok(await waitFor(() => db.lead(id).notify_status === 'fallido'));
  assert.ok(db.lead(id));
  n8nMode = 'ok';
  const cookie = await login('ana@aiacademy.test', 'clave-de-prueba-123');
  const res = await fetch(`${base}/api/admin/leads/${id}/notify`, {
    method: 'POST',
    headers: { cookie, 'x-requested-with': 'aia-admin' },
  });
  assert.equal(res.status, 200);
  assert.equal(db.lead(id).notify_status, 'enviado');
});

test('QA-13/14 · sin sesión no hay acceso; contraseña incorrecta rechazada', async () => {
  assert.equal((await fetch(`${base}/api/admin/leads`)).status, 401);
  assert.equal(
    (await post('/api/admin/login', { email: 'ana@aiacademy.test', password: 'mala' })).status,
    401,
  );
  assert.equal(
    (await fetch(`${base}/api/admin/leads`, { headers: { cookie: 'aia_session=falsa' } })).status,
    401,
  );
});

test('QA-05/06/07/08/09 · estado, nota e historial con autor de la sesión; otro admin continúa', async () => {
  const { id } = await (
    await post('/api/leads', {
      name: 'Seguimiento Demo',
      email: 'seg@ejemplo.test',
      program: 'liftoff',
    })
  ).json();
  const ana = await login('ana@aiacademy.test', 'clave-de-prueba-123');
  const h = { cookie: ana, 'content-type': 'application/json', 'x-requested-with': 'aia-admin' };

  const list = await (await fetch(`${base}/api/admin/leads?q=seg@`, { headers: h })).json();
  assert.ok(list.leads.some((l) => l.id === id));

  // Sin la cabecera propia, la mutación se rechaza (defensa CSRF).
  assert.equal(
    (
      await fetch(`${base}/api/admin/leads/${id}/status`, {
        method: 'PATCH',
        headers: { cookie: ana, 'content-type': 'application/json' },
        body: '{"status":"Contactado"}',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(`${base}/api/admin/leads/${id}/status`, {
        method: 'PATCH',
        headers: h,
        body: '{"status":"Ganado"}',
      })
    ).status,
    422,
  );
  // Un campo «author» enviado por el cliente se ignora: el autor sale de la sesión.
  assert.equal(
    (
      await fetch(`${base}/api/admin/leads/${id}/status`, {
        method: 'PATCH',
        headers: h,
        body: '{"status":"Contactado","author":"Hacker"}',
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await fetch(`${base}/api/admin/leads/${id}/notes`, {
        method: 'POST',
        headers: h,
        body: '{"body":"Primera llamada hecha."}',
      })
    ).status,
    201,
  );

  const beto = await login('beto@aiacademy.test', 'clave-de-prueba-456');
  const hb = { ...h, cookie: beto };
  await fetch(`${base}/api/admin/leads/${id}/notes`, {
    method: 'POST',
    headers: hb,
    body: '{"body":"Envié fechas de Liftoff."}',
  });
  await fetch(`${base}/api/admin/leads/${id}/status`, {
    method: 'PATCH',
    headers: hb,
    body: '{"status":"En seguimiento"}',
  });

  const detail = await (await fetch(`${base}/api/admin/leads/${id}`, { headers: hb })).json();
  assert.equal(detail.lead.status, 'En seguimiento');
  assert.equal(detail.notes.length, 2); // las notas no se sobrescriben
  const changes = detail.events.filter((e) => e.type === 'estado');
  assert.deepEqual(
    changes.map((e) => [e.from_status, e.to_status, e.author]),
    [
      ['Contactado', 'En seguimiento', 'Beto Admin'],
      ['Nuevo', 'Contactado', 'Ana Admin'],
    ],
  );
  assert.ok(!JSON.stringify(detail).includes('Hacker'));
});

test('QA-16 · los datos persisten al reabrir la base (reinicio)', async () => {
  const total = db.counts().total;
  const again = openDb(join(dir, 'test.db'));
  assert.equal(again.counts().total, total);
  again.close();
});

test('límite de registros por IP: el exceso recibe 429 sin crear registros', async () => {
  const limited = createApp({
    db,
    notifier: { notify: async () => ({ ok: true }) },
    rootDir,
    log: { error() {} },
    limits: { leadsPerMinute: 2, loginsPer15Min: 2 },
  }).listen(0);
  await new Promise((r) => limited.once('listening', r));
  const url = `http://127.0.0.1:${limited.address().port}/api/leads`;
  const send = (i) =>
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Limite Prueba',
        email: `lim${i}@ejemplo.test`,
        program: 'ignition',
      }),
    });
  const statuses = [];
  for (let i = 0; i < 3; i++) statuses.push((await send(i)).status);
  limited.close();
  assert.deepEqual(statuses, [201, 201, 429]);
});

test('cierre de sesión invalida la sesión en el servidor', async () => {
  const cookie = await login('ana@aiacademy.test', 'clave-de-prueba-123');
  await fetch(`${base}/api/admin/logout`, { method: 'POST', headers: { cookie } });
  assert.equal(
    (await (await fetch(`${base}/api/admin/me`, { headers: { cookie } })).json()).admin,
    null,
  );
  assert.equal((await fetch(`${base}/api/admin/leads`, { headers: { cookie } })).status, 401);
});
