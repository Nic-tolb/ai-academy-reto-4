/**
 * Persistencia en SQLite (node:sqlite, incluido en Node ≥ 22.5; sin dependencias).
 * Entidades: interesados (leads), administradores, sesiones, notas e historial (events).
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export const STATUSES = ['Nuevo', 'Contactado', 'En seguimiento', 'Cerrado'];

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  program          TEXT NOT NULL,
  phone            TEXT,
  status           TEXT NOT NULL DEFAULT 'Nuevo'
                   CHECK (status IN ('Nuevo','Contactado','En seguimiento','Cerrado')),
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  idempotency_key  TEXT UNIQUE,
  notify_status    TEXT NOT NULL DEFAULT 'pendiente'
                   CHECK (notify_status IN ('pendiente','enviado','fallido')),
  notify_attempts  INTEGER NOT NULL DEFAULT 0,
  notified_at      TEXT,
  notify_error     TEXT
);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at);

CREATE TABLE IF NOT EXISTS notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id    TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  admin_id   INTEGER NOT NULL REFERENCES admins(id),
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Historial: cada acción real queda registrada con autor (o «Sistema») y fecha.
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id     TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  admin_id    INTEGER REFERENCES admins(id),
  type        TEXT NOT NULL CHECK (type IN ('creado','estado','nota','aviso')),
  from_status TEXT,
  to_status   TEXT,
  detail      TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_lead_idx ON events(lead_id, created_at);
`;

const now = () => new Date().toISOString();

export function openDb(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(SCHEMA);

  /** Ejecuta varias escrituras como una sola unidad: o todas o ninguna. */
  const tx = (fn) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const out = fn();
      db.exec('COMMIT');
      return out;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };

  const q = {
    adminByEmail: db.prepare('SELECT * FROM admins WHERE email = ?'),
    adminById: db.prepare('SELECT id, email, name FROM admins WHERE id = ?'),
    insertAdmin: db.prepare(
      'INSERT INTO admins (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)',
    ),
    updateAdminPassword: db.prepare(
      'UPDATE admins SET name = ?, password_hash = ? WHERE email = ?',
    ),
    insertSession: db.prepare(
      'INSERT INTO sessions (token_hash, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
    ),
    sessionAdmin: db.prepare(
      `SELECT a.id, a.email, a.name FROM sessions s JOIN admins a ON a.id = s.admin_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    ),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    purgeSessions: db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
    leadByKey: db.prepare('SELECT * FROM leads WHERE idempotency_key = ?'),
    insertLead: db.prepare(
      `INSERT INTO leads (id, name, email, program, phone, status, created_at, updated_at, idempotency_key)
       VALUES (?, ?, ?, ?, ?, 'Nuevo', ?, ?, ?)`,
    ),
    lead: db.prepare('SELECT * FROM leads WHERE id = ?'),
    setStatus: db.prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?'),
    touchLead: db.prepare('UPDATE leads SET updated_at = ? WHERE id = ?'),
    insertNote: db.prepare(
      'INSERT INTO notes (lead_id, admin_id, body, created_at) VALUES (?, ?, ?, ?)',
    ),
    notes: db.prepare(
      `SELECT n.id, n.body, n.created_at, a.name AS author, a.email AS author_email
       FROM notes n JOIN admins a ON a.id = n.admin_id WHERE n.lead_id = ? ORDER BY n.created_at DESC, n.id DESC`,
    ),
    insertEvent: db.prepare(
      `INSERT INTO events (lead_id, admin_id, type, from_status, to_status, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ),
    events: db.prepare(
      `SELECT e.id, e.type, e.from_status, e.to_status, e.detail, e.created_at,
              COALESCE(a.name, 'Sistema') AS author, a.email AS author_email
       FROM events e LEFT JOIN admins a ON a.id = e.admin_id
       WHERE e.lead_id = ? ORDER BY e.created_at DESC, e.id DESC`,
    ),
    counts: db.prepare('SELECT status, COUNT(*) AS n FROM leads GROUP BY status'),
    markNotify: db.prepare(
      `UPDATE leads SET notify_status = ?, notify_attempts = notify_attempts + 1,
       notified_at = ?, notify_error = ? WHERE id = ?`,
    ),
    pendingNotifications: db.prepare(
      `SELECT * FROM leads WHERE notify_status IN ('pendiente','fallido') AND notify_attempts < ?
       ORDER BY created_at`,
    ),
  };

  return {
    db,
    close: () => db.close(),

    // ---------- Administradores y sesiones ----------
    adminByEmail: (email) => q.adminByEmail.get(email),
    upsertAdmin(email, name, passwordHash) {
      if (q.adminByEmail.get(email)) q.updateAdminPassword.run(name, passwordHash, email);
      else q.insertAdmin.run(email, name, passwordHash, now());
      return q.adminByEmail.get(email);
    },
    createSession(tokenHash, adminId, ttlMs) {
      const created = new Date();
      q.purgeSessions.run(created.toISOString());
      q.insertSession.run(
        tokenHash,
        adminId,
        created.toISOString(),
        new Date(created.getTime() + ttlMs).toISOString(),
      );
    },
    sessionAdmin: (tokenHash) => q.sessionAdmin.get(tokenHash, now()) ?? null,
    deleteSession: (tokenHash) => q.deleteSession.run(tokenHash),

    // ---------- Interesados ----------
    /** Crea el registro y su evento «creado». Reenvíos con la misma clave devuelven el existente. */
    createLead({ name, email, program, phone, idempotencyKey }) {
      if (idempotencyKey) {
        const existing = q.leadByKey.get(idempotencyKey);
        if (existing) return { lead: existing, duplicate: true };
      }
      return tx(() => {
        const id = randomUUID();
        const ts = now();
        q.insertLead.run(id, name, email, program, phone ?? null, ts, ts, idempotencyKey ?? null);
        q.insertEvent.run(
          id,
          null,
          'creado',
          null,
          'Nuevo',
          'Solicitud recibida desde la landing',
          ts,
        );
        return { lead: q.lead.get(id), duplicate: false };
      });
    },
    lead: (id) => q.lead.get(id) ?? null,
    listLeads({ status, program, search } = {}) {
      const where = [];
      const args = [];
      if (status) {
        where.push('status = ?');
        args.push(status);
      }
      if (program) {
        where.push('program = ?');
        args.push(program);
      }
      if (search) {
        where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
        const like = `%${search.replace(/[%_]/g, '')}%`;
        args.push(like, like, like);
      }
      const sql = `SELECT l.*,
          (SELECT COUNT(*) FROM notes n WHERE n.lead_id = l.id) AS notes_count,
          (SELECT e.created_at FROM events e WHERE e.lead_id = l.id ORDER BY e.created_at DESC, e.id DESC LIMIT 1) AS last_activity
        FROM leads l ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY l.created_at DESC LIMIT 500`;
      return db.prepare(sql).all(...args);
    },
    counts() {
      const out = Object.fromEntries(STATUSES.map((s) => [s, 0]));
      for (const row of q.counts.all()) out[row.status] = row.n;
      return { total: Object.values(out).reduce((a, b) => a + b, 0), ...out };
    },
    notes: (leadId) => q.notes.all(leadId),
    events: (leadId) => q.events.all(leadId),

    /** Cambia el estado y registra el evento en la misma transacción. */
    changeStatus(leadId, adminId, toStatus) {
      return tx(() => {
        const lead = q.lead.get(leadId);
        if (!lead) return null;
        if (lead.status === toStatus) return lead;
        const ts = now();
        q.setStatus.run(toStatus, ts, leadId);
        q.insertEvent.run(leadId, adminId, 'estado', lead.status, toStatus, null, ts);
        return q.lead.get(leadId);
      });
    },

    /** Añade una nota (nunca sobrescribe) y su evento en la misma transacción. */
    addNote(leadId, adminId, body) {
      return tx(() => {
        if (!q.lead.get(leadId)) return null;
        const ts = now();
        q.insertNote.run(leadId, adminId, body, ts);
        q.insertEvent.run(leadId, adminId, 'nota', null, null, body, ts);
        q.touchLead.run(ts, leadId);
        return true;
      });
    },

    // ---------- Avisos ----------
    markNotification(leadId, ok, error) {
      const ts = now();
      tx(() => {
        q.markNotify.run(
          ok ? 'enviado' : 'fallido',
          ok ? ts : null,
          ok ? null : String(error).slice(0, 300),
          leadId,
        );
        q.insertEvent.run(
          leadId,
          null,
          'aviso',
          null,
          null,
          ok
            ? 'Aviso enviado a Telegram'
            : `Falló el aviso a Telegram: ${String(error).slice(0, 200)}`,
          ts,
        );
      });
    },
    pendingNotifications: (maxAttempts) => q.pendingNotifications.all(maxAttempts),
  };
}
