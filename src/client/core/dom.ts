/** Utilidades mínimas del DOM con tipos estrictos. */

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(selector);
}

export function $$<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Ejecuta cuando el navegador esté libre (con respaldo para Safari). */
export function whenIdle(fn: () => void, timeout = 1500): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, 200);
  }
}
