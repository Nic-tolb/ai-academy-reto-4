/** Constelación de herramientas: filtros por objetivo + ficha de la herramienta. */
import { $, $$ } from '../core/dom';

export function initTools(): void {
  const root = $('[data-tools]');
  if (!root) return;
  const filters = $$<HTMLButtonElement>('[data-filter]', root);
  const items = $$('[data-tool]', root);
  const buttons = $$<HTMLButtonElement>('[data-tool-btn]', root);
  const card = {
    group: $('[data-card-group]', root),
    name: $('[data-card-name]', root),
    tagline: $('[data-card-tagline]', root),
  };

  const show = (button: HTMLButtonElement) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    if (card.group) card.group.textContent = button.dataset.groupLabel ?? '';
    if (card.name) card.name.textContent = button.dataset.name ?? '';
    if (card.tagline) card.tagline.textContent = button.dataset.tagline ?? '';
  };

  buttons.forEach((b) => b.addEventListener('click', () => show(b)));

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const group = filter.dataset.filter;
      filters.forEach((f) => f.setAttribute('aria-pressed', String(f === filter)));
      let first: HTMLButtonElement | null = null;
      items.forEach((item) => {
        const match = group === 'all' || item.dataset.group === group;
        item.classList.toggle('is-dim', !match);
        const btn = $<HTMLButtonElement>('[data-tool-btn]', item);
        if (match && !first && btn) first = btn;
      });
      if (first) show(first);
    });
  });
}
