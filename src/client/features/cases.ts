/**
 * I-04 · Antes/después: pestañas accesibles + interruptor con barrido.
 * El barrido también responde a un gesto horizontal sobre la tarjeta
 * (sin bloquear el scroll vertical: `touch-action: pan-y`).
 */
import { $, $$ } from '../core/dom';

const SWIPE_PX = 40;

export function initCases(): void {
  const root = $('[data-cases]');
  if (!root) return;
  const tabs = $$<HTMLButtonElement>('[data-tab]', root);
  const panels = $$('[data-panel]', root);
  const switchButtons = $$<HTMLButtonElement>('[data-switch] button', root);
  let showingAfter = false;

  const setAfter = (after: boolean) => {
    showingAfter = after;
    panels.forEach((panel) => $('[data-compare]', panel)?.classList.toggle('is-after', after));
    switchButtons.forEach((b) =>
      b.setAttribute('aria-pressed', String((b.dataset.state === 'after') === after)),
    );
  };

  const select = (index: number, focus = false) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel, i) => (panel.hidden = i !== index));
    setAfter(false); // cada perfil empieza por su «antes»
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const keys: Record<string, number> = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      };
      const target = keys[e.key];
      if (target !== undefined) {
        e.preventDefault();
        select(target, true);
      }
    });
  });

  switchButtons.forEach((b) =>
    b.addEventListener('click', () => setAfter(b.dataset.state === 'after')),
  );

  // Gesto horizontal: izquierda → después, derecha → antes. Un toque alterna.
  for (const panel of panels) {
    const card = $('[data-compare]', panel);
    if (!card) continue;
    let startX = 0;
    let startY = 0;
    card.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });
    card.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) setAfter(dx < 0);
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) setAfter(!showingAfter);
    });
  }
}
