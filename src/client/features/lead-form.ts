/**
 * Reto 4 · Envío del formulario de interesados.
 * - Valida en el navegador (retroalimentación inmediata); el servidor vuelve a validar.
 * - Clave de idempotencia por envío: un doble clic o un reintento no crea dos registros.
 * - La confirmación solo se muestra cuando el servidor confirma que el registro se guardó.
 */
import { $, $$ } from '../core/dom';

type Errors = Partial<Record<'name' | 'email' | 'program' | 'phone', string>>;

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

function validate(data: Record<string, string>, programs: string[]): Errors {
  const e: Errors = {};
  const name = data.name?.trim() ?? '';
  if (!name) e.name = 'Escribe tu nombre.';
  else if (name.length < 2) e.name = 'El nombre debe tener al menos 2 caracteres.';
  else if (/[<>]/.test(name) || !/\p{L}/u.test(name)) e.name = 'Revisa el nombre: solo letras y signos habituales.';
  const email = data.email?.trim() ?? '';
  if (!email) e.email = 'Escribe tu correo.';
  else if (!EMAIL.test(email)) e.email = 'Escribe un correo válido, por ejemplo nombre@empresa.com.';
  if (!data.program) e.program = 'Elige un programa.';
  else if (!programs.includes(data.program)) e.program = 'Elige un programa de la lista.';
  const phone = data.phone?.trim() ?? '';
  if (phone && !/^\+?\d{7,15}$/.test(phone.replace(/[\s().-]/g, ''))) {
    e.phone = 'Revisa el teléfono: entre 7 y 15 dígitos (puede empezar con +).';
  }
  return e;
}

export function initLeadForm(): void {
  const root = $('[data-lead-form-root]');
  const form = $<HTMLFormElement>('[data-lead-form]', root ?? document);
  if (!root || !form) return;
  const success = $('[data-lead-success]', root);
  const submit = $<HTMLButtonElement>('[data-submit]', form);
  const formError = $('[data-form-error]', form);
  const programs = $$<HTMLOptionElement>('#lead-program option', form)
    .map((o) => o.value)
    .filter(Boolean);
  let idempotencyKey = crypto.randomUUID();
  let sending = false;

  const showErrors = (errors: Errors) => {
    for (const field of ['name', 'email', 'program', 'phone'] as const) {
      const input = form.elements.namedItem(field) as HTMLInputElement | null;
      const msg = $(`[data-error="${field}"]`, form);
      const text = errors[field] ?? '';
      if (msg) msg.textContent = text;
      input?.setAttribute('aria-invalid', String(Boolean(text)));
    }
    const first = (['name', 'email', 'program', 'phone'] as const).find((f) => errors[f]);
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return; // evita envíos múltiples
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errors = validate(data, programs);
    showErrors(errors);
    if (formError) formError.textContent = '';
    if (Object.keys(errors).length) return;

    sending = true;
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Enviando…';
    }
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, idempotencyKey }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors; message?: string };
      if (res.status === 422 && body.errors) {
        showErrors(body.errors);
        return;
      }
      if (!res.ok || !body.ok) throw new Error(body.message ?? 'No pudimos enviar tu solicitud.');
      // Guardado confirmado por el servidor.
      const name = $('[data-success-name]', root);
      if (name) name.textContent = data.name?.trim().split(' ')[0] ?? '';
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
      form.reset();
      idempotencyKey = crypto.randomUUID();
    } catch (err) {
      if (formError) {
        formError.textContent = `${err instanceof Error ? err.message : 'No pudimos enviar tu solicitud.'} Intenta de nuevo o escríbenos por WhatsApp.`;
      }
    } finally {
      sending = false;
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'Enviar solicitud';
      }
    }
  });

  $('[data-lead-again]', root)?.addEventListener('click', () => {
    if (success) success.hidden = true;
    form.hidden = false;
    showErrors({});
    (form.elements.namedItem('name') as HTMLElement | null)?.focus();
  });
}
