/**
 * Crea o actualiza un administrador. La contraseña NUNCA va en el código:
 * se pasa por variable de entorno.
 *
 *   ADMIN_EMAIL=evaluador@aiacademy.test ADMIN_NAME="Evaluador" ADMIN_PASSWORD='...' npm run admin:create
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.mjs';
import { hashPassword } from './auth.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const {
  ADMIN_EMAIL: email,
  ADMIN_NAME: name,
  ADMIN_PASSWORD: password,
  DATABASE_FILE,
} = process.env;

if (!email || !name || !password) {
  console.error('Faltan ADMIN_EMAIL, ADMIN_NAME o ADMIN_PASSWORD.');
  process.exit(1);
}
if (password.length < 12) {
  console.error('La contraseña debe tener al menos 12 caracteres.');
  process.exit(1);
}

const db = openDb(resolve(rootDir, DATABASE_FILE ?? 'data/ai-academy.db'));
const admin = db.upsertAdmin(email.trim(), name.trim(), hashPassword(password));
console.log(`Administrador listo: ${admin.name} <${admin.email}>`);
db.close();
