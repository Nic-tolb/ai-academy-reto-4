import { $, $$ } from '../lib/dom';

/** I-02 · Fase activa del plan de vuelo: riel, barra móvil y menú. */
export function initPhases(): void {
  const sections = $$('[data-phase]');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const railLinks = $$<HTMLAnchorElement>('[data-phase-link]');
  const segments = $$('[data-phase-seg]');
  const label = $('[data-phase-label]');
  const navLinks = $$<HTMLAnchorElement>('[data-nav-link]');

  const setActive = (index: number) => {
    const section = sections[index];
    if (!section) return;
    railLinks.forEach((a, i) => {
      a.classList.toggle('is-past', i < index);
      if (i === index) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    segments.forEach((s, i) => {
      s.classList.toggle('is-active', i === index);
      s.classList.toggle('is-past', i < index);
    });
    if (label) label.textContent = `${section.dataset.phaseCode ?? ''} · ${section.dataset.phaseName ?? ''}`;
    navLinks.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${section.id}`)));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(sections.indexOf(entry.target as HTMLElement));
      }
    },
    { rootMargin: '-45% 0px -54% 0px' },
  );
  sections.forEach((s) => observer.observe(s));
}
