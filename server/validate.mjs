/**
 * Validación del formulario. Se aplica en el servidor (fuente de verdad); la landing
 * aplica las mismas reglas para dar retroalimentación inmediata.
 * Los programas son las cinco misiones reales de AI Academy (Reto 3, src/data/missions.ts).
 */
export const PROGRAMS = {
  ignition: 'Ignition · 4 horas',
  booster: 'Booster · 8 horas',
  liftoff: 'Liftoff · 12 horas',
  odyssey: 'Odyssey · Personalizado',
  nebula: 'Nebula · Pregrabado',
};

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
// Caracteres de control o etiquetas: se rechazan en vez de «limpiarse» en silencio.
const UNSAFE = /[<>\u0000-\u001f\u007f]/;

const clean = (v) => (typeof v === 'string' ? v.normalize('NFC').trim().replace(/\s+/g, ' ') : '');

/**
 * @returns {{ ok: true, data: {name:string,email:string,program:string,phone:string|null} } | { ok: false, errors: Record<string,string> }}
 */
export function validateLead(input) {
  const errors = {};
  const src = input && typeof input === 'object' ? input : {};

  const name = clean(src.name);
  if (!name) errors.name = 'Escribe tu nombre.';
  else if (name.length < 2 || name.length > 80)
    errors.name = 'El nombre debe tener entre 2 y 80 caracteres.';
  else if (UNSAFE.test(name) || !/\p{L}/u.test(name))
    errors.name = 'Revisa el nombre: solo letras y signos habituales.';

  const email = clean(src.email).toLowerCase();
  if (!email) errors.email = 'Escribe tu correo.';
  else if (email.length > 120 || !EMAIL.test(email))
    errors.email = 'Escribe un correo válido, por ejemplo nombre@empresa.com.';

  const program = clean(src.program);
  if (!program) errors.program = 'Elige un programa.';
  else if (!Object.hasOwn(PROGRAMS, program)) errors.program = 'Elige un programa de la lista.';

  let phone = clean(src.phone);
  if (phone) {
    const digits = phone.replace(/[\s().-]/g, '');
    if (!/^\+?\d{7,15}$/.test(digits))
      errors.phone = 'Revisa el teléfono: entre 7 y 15 dígitos (puede empezar con +).';
    else phone = digits;
  } else {
    phone = null;
  }

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data: { name, email, program, phone } };
}

export const isUuid = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
