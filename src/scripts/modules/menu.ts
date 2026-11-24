import { $ } from '../lib/dom';

/** Menú móvil accesible: Escape cierra, el foco vuelve al botón, el fondo no se desplaza. */
export function initMenu(): void {
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const label = $('[data-menu-label]');
  if (!toggle || !menu) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: open }));
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  // Si la ventana pasa a escritorio con el menú abierto, se cierra.
  window.matchMedia('(min-width: 1200px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) setOpen(false);
  });
}
