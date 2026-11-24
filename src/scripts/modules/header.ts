import { $ } from '../lib/dom';

/** Filete inferior del encabezado cuando la página ya se desplazó. */
export function initHeader(): void {
  const header = $('[data-header]');
  if (!header) return;
  let ticking = false;

  const update = () => {
    ticking = false;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}
