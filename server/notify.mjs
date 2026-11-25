/**
 * Aviso a n8n (que envía el mensaje a Telegram).
 * - Se llama SOLO después de guardar el registro: un fallo nunca pierde datos.
 * - Webhook protegido con un secreto compartido en cabecera (no llega al navegador).
 * - Sin duplicados: no se reenvía un aviso ya marcado como «enviado».
 * - Reintentos: al arrancar el servidor y desde el panel («Reintentar aviso»).
 */
import { PROGRAMS } from './validate.mjs';

export const MAX_ATTEMPTS = 5;

export function createNotifier({ db, webhookUrl, secret, publicUrl, timeoutMs = 10_000, log = console }) {
  const inFlight = new Set();

  async function notify(lead) {
    if (!lead || lead.notify_status === 'enviado' || inFlight.has(lead.id)) return { skipped: true };
    if (!webhookUrl || !secret) {
      db.markNotification(lead.id, false, 'n8n no está configurado (N8N_WEBHOOK_URL / N8N_WEBHOOK_SECRET)');
      return { ok: false };
    }
    inFlight.add(lead.id);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-webhook-secret': secret },
        body: JSON.stringify({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          program: lead.program,
          programName: PROGRAMS[lead.program] ?? lead.program,
          phone: lead.phone,
          status: lead.status,
          createdAt: lead.created_at,
          adminUrl: publicUrl ? `${publicUrl.replace(/\/$/, '')}/admin/#/lead/${lead.id}` : null,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`n8n respondió HTTP ${res.status}`);
      // Un 2xx no basta: si Telegram falla, n8n puede responder 200 sin cuerpo.
      // Solo el nodo «Responder · aviso enviado» devuelve { ok: true }.
      const body = await res.json().catch(() => null);
      if (!body || body.ok !== true) throw new Error('n8n no confirmó el envío a Telegram');
      db.markNotification(lead.id, true);
      return { ok: true };
    } catch (err) {
      const message = err?.name === 'TimeoutError' ? 'n8n no respondió a tiempo' : err?.message || String(err);
      db.markNotification(lead.id, false, message);
      log.warn?.(`[aviso] ${lead.id}: ${message}`);
      return { ok: false, error: message };
    } finally {
      inFlight.delete(lead.id);
    }
  }

  async function retryPending() {
    for (const lead of db.pendingNotifications(MAX_ATTEMPTS)) await notify(lead);
  }

  return { notify, retryPending };
}
