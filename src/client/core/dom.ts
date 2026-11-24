/** Utilidades mínimas del DOM con tipos estrictos. */

export function $<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T | null {
  return root.querySelector<T>(selector);
}

export function $$<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** El HTML no tiene un elemento que el módulo necesita. */
export class MissingElementError extends Error {
  constructor(selector: string, context: string) {
    super(`[${context}] falta el elemento «${selector}» en el HTML`);
    this.name = 'MissingElementError';
  }
}

/**
 * Como `$`, pero el elemento es obligatorio: si falta, lanza un error que dice
 * cuál y en qué módulo. Úsalo al iniciar el módulo para fallar pronto y con
 * claridad (main.ts lo captura sin afectar al resto de la página).
 */
export function required<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
  context = 'dom',
): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new MissingElementError(selector, context);
  return el;
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = (): boolean =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Ejecuta cuando el navegador esté libre (con respaldo para Safari). */
export function whenIdle(fn: () => void, timeout = 1500): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, 200);
  }
}
