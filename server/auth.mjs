/**
 * Autenticación de administradores.
 * - Contraseñas con scrypt + sal aleatoria (node:crypto), comparación en tiempo constante.
 * - Sesión: token aleatorio en cookie HttpOnly/SameSite=Strict; en la base solo se guarda su hash.
 * - La identidad del administrador SIEMPRE sale de la sesión, nunca del cliente.
 */
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

const KEYLEN = 64;
export const SESSION_COOKIE = 'aia_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored).split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(String(password), Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Hash ficticio para igualar el tiempo de respuesta cuando el correo no existe.
const DUMMY = hashPassword(randomBytes(12).toString('hex'));
export const verifyAgainstDummy = (password) => verifyPassword(password, DUMMY);

export const newToken = () => randomBytes(32).toString('base64url');
export const tokenHash = (token) => createHash('sha256').update(token).digest('hex');

export function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((p) => p.trim().split('='))
      .filter(([k, v]) => k && v !== undefined)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]),
  );
}

export function sessionCookie(token, { secure, maxAgeMs = SESSION_TTL_MS } = {}) {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}
