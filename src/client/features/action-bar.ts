import { $ } from '../core/dom';
import { on } from '../core/events';

/**
 * Barra de acción móvil: aparece al salir del hero, y se oculta en el footer,
 * con el menú abierto o mientras la persona usa el recomendador (no interrumpe).
 */
export function initActionBar(): void {
  const bar = $('[data-action-bar]');
  const hero = $('[data-hero]');
  const footer = $('[data-footer]');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  const state = { hero: true, footer: false, menu: false, rec: false };
  const render = () => {
    const show = !state.hero && !state.footer && !state.menu && !state.rec;
    bar.classList.toggle('is-visible', show);
    // `inert` la saca del orden de tabulación y de los lectores cuando está oculta.
    bar.toggleAttribute('inert', !show);
  };

  new IntersectionObserver(([e]) => {
    state.hero = Boolean(e?.isIntersecting);
    render();
  }, { threshold: 0.1 }).observe(hero);

  if (footer) {
    new IntersectionObserver(([e]) => {
      state.footer = Boolean(e?.isIntersecting);
      render();
    }).observe(footer);
  }

  document.addEventListener('menu:toggle', (e) => {
    state.menu = Boolean((e as CustomEvent<boolean>).detail);
    render();
  });
  on('recommenderFocus', (focused) => {
    state.rec = focused;
    render();
  });
}
