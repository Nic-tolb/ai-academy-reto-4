/**
 * Punto de entrada: lee la configuración del entorno, abre la base y arranca.
 *   node --env-file-if-exists=.env server/index.mjs
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.mjs';
import { createNotifier } from './notify.mjs';
import { createApp } from './app.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = process.env;
const port = Number(env.PORT ?? 8787);
const publicUrl = env.PUBLIC_URL ?? `http://localhost:${port}`;

const db = openDb(resolve(rootDir, env.DATABASE_FILE ?? 'data/ai-academy.db'));
const notifier = createNotifier({
  db,
  webhookUrl: env.N8N_WEBHOOK_URL,
  secret: env.N8N_WEBHOOK_SECRET,
  publicUrl,
});
const app = createApp({ db, notifier, rootDir, secureCookies: publicUrl.startsWith('https://') });

app.listen(port, () => {
  console.log(`AI Academy · Reto 4 en ${publicUrl} (panel: ${publicUrl}/admin/)`);
  // Avisos que quedaron pendientes o fallidos (p. ej. n8n estaba apagado): se reintentan.
  notifier.retryPending().catch((e) => console.error('[aviso] reintento', e));
});

const shutdown = () => {
  app.close(() => {
    db.close();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
