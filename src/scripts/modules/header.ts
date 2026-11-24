import { $ } from '../lib/dom';

/** Filete inferior del encabezado y relleno del riel de fases según el scroll. */
export function initHeader(): void {
  const header = $('[data-header]');
  const railFill = $('[data-rail-fill]');
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 8);
    if (railFill) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      railFill.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
    }
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
