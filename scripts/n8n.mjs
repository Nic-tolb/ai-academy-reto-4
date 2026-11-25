/**
 * Utilidades de n8n y Telegram para el Reto 4 (sin dependencias).
 *
 *   node scripts/n8n.mjs telegram-chat   → lee TELEGRAM_BOT_TOKEN de .env.telegram, busca el chat
 *                                          privado que escribió al bot y guarda TELEGRAM_CHAT_ID.
 *   node scripts/n8n.mjs start           → (re)crea el contenedor de n8n con los secretos como
 *                                          variables de entorno (nunca dentro del workflow).
 *   node scripts/n8n.mjs test-telegram   → envía un mensaje de prueba directo al chat.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const IMAGE = 'n8nio/n8n:1.123.4';
const CONTAINER = 'aia-n8n';
const PORT = 5690;

const readEnv = (file) =>
  existsSync(file)
    ? Object.fromEntries(
        readFileSync(file, 'utf8')
          .split(/\r?\n/)
          .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
          .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
      )
    : {};

const env = readEnv('.env');
const tg = readEnv('.env.telegram');
const docker = (...args) =>
  execFileSync('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim();

async function telegramChat() {
  if (!tg.TELEGRAM_BOT_TOKEN) throw new Error('Falta TELEGRAM_BOT_TOKEN en .env.telegram');
  const res = await fetch(`https://api.telegram.org/bot${tg.TELEGRAM_BOT_TOKEN}/getUpdates`);
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram respondió: ${data.description}`);
  const chat = [...data.result]
    .reverse()
    .map((u) => u.message?.chat)
    .find((c) => c?.type === 'private');
  if (!chat)
    throw new Error('No hay mensajes privados: escríbele cualquier cosa a tu bot y repite.');
  tg.TELEGRAM_CHAT_ID = String(chat.id);
  writeFileSync(
    '.env.telegram',
    `TELEGRAM_BOT_TOKEN=${tg.TELEGRAM_BOT_TOKEN}\nTELEGRAM_CHAT_ID=${tg.TELEGRAM_CHAT_ID}\n`,
  );
  console.log(`Chat privado de prueba: ${chat.first_name ?? ''} (id guardado en .env.telegram)`);
}

function start() {
  if (!env.N8N_WEBHOOK_SECRET) throw new Error('Falta N8N_WEBHOOK_SECRET en .env');
  try {
    docker('rm', '-f', CONTAINER);
  } catch {}
  docker(
    'run',
    '-d',
    '--name',
    CONTAINER,
    '--restart',
    'unless-stopped',
    '-p',
    `${PORT}:5678`,
    '-v',
    'aia_n8n:/home/node/.n8n',
    '-e',
    'GENERIC_TIMEZONE=America/Bogota',
    '-e',
    'TZ=America/Bogota',
    '-e',
    'N8N_BLOCK_ENV_ACCESS_IN_NODE=false',
    '-e',
    'N8N_DIAGNOSTICS_ENABLED=false',
    '-e',
    'N8N_PERSONALIZATION_ENABLED=false',
    '-e',
    `N8N_WEBHOOK_SECRET=${env.N8N_WEBHOOK_SECRET}`,
    '-e',
    `TELEGRAM_BOT_TOKEN=${tg.TELEGRAM_BOT_TOKEN ?? ''}`,
    '-e',
    `TELEGRAM_CHAT_ID=${tg.TELEGRAM_CHAT_ID ?? ''}`,
    IMAGE,
  );
  console.log(`n8n en http://localhost:${PORT} (contenedor ${CONTAINER})`);
}

async function testTelegram() {
  const res = await fetch(`https://api.telegram.org/bot${tg.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: tg.TELEGRAM_CHAT_ID,
      text: 'AI Academy · prueba de conexión del bot ✅',
    }),
  });
  console.log(
    (await res.json()).ok ? 'Mensaje de prueba enviado.' : 'Telegram rechazó el mensaje.',
  );
}

const cmd = process.argv[2];
const actions = { 'telegram-chat': telegramChat, start, 'test-telegram': testTelegram };
if (!actions[cmd]) {
  console.log('Uso: node scripts/n8n.mjs <telegram-chat|start|test-telegram>');
  process.exit(1);
}
Promise.resolve(actions[cmd]()).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
