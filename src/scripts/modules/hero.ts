/**
 * I-01 · Hero «¿Quién va en esta misión?».
 * La elección funciona siempre (HTML + este módulo). El campo de trayectorias
 * es una mejora progresiva que se carga después del primer pintado.
 * Todos los textos vienen de src/data (perfiles y misiones).
 */
import { $, $$, prefersReducedMotion, whenIdle } from '../lib/dom';
import { emit } from '../lib/store';
import { MISSIONS, summary } from '../../data/missions';
import { LINKS } from '../../data/links';
import { profile, type Profile } from '../../data/profiles';
import type { FieldController } from '../hero/field';

let field: FieldController | null = null;
let pendingTarget: Parameters<FieldController['setTarget']>[0] = null;

export function initHero(): void {
  const hero = $('[data-hero]');
  if (!hero) return;
  const lead = $('[data-hero-lead]', hero);
  const cta2 = $<HTMLAnchorElement>('[data-hero-cta2]', hero);
  const chip = $<HTMLAnchorElement>('[data-mission-chip]', hero);
  const chipName = $('[data-chip-name]', hero);
  const chipMeta = $('[data-chip-meta]', hero);
  const buttons = $$<HTMLButtonElement>('[data-profile]', hero);

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const info = profile(button.dataset.profile as Profile);
      const mission = MISSIONS[info.target];

      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      if (lead) lead.textContent = info.lead;
      if (cta2) {
        const wa = info.cta.channel === 'whatsapp';
        cta2.textContent = info.cta.label;
        cta2.href = wa ? LINKS.whatsapp : LINKS.inscripcion;
        if (wa) {
          cta2.target = '_blank';
          cta2.rel = 'noopener';
        } else {
          cta2.removeAttribute('target');
          cta2.removeAttribute('rel');
        }
      }
      if (chip && chipName && chipMeta) {
        chipName.textContent = mission.name;
        chipMeta.textContent = summary(mission);
        chip.href = `#mision-${mission.id}`;
        chip.hidden = false;
        // Reinicia la animación de entrada en cada elección.
        chip.style.animation = 'none';
        void chip.offsetWidth;
        chip.style.animation = '';
      }

      pendingTarget = mission.id;
      field?.setTarget(mission.id);
      emit('profile', info.id);
    });
  }

  // Mejora progresiva: el campo se carga cuando el navegador está libre.
  const canvas = $<HTMLCanvasElement>('[data-field]', hero);
  const hint = $('[data-field-hint]', hero);
  if (!canvas || !('ResizeObserver' in window) || !('IntersectionObserver' in window)) return;

  whenIdle(async () => {
    try {
      const { createField } = await import('../hero/field');
      field = createField(canvas, {
        reducedMotion: prefersReducedMotion(),
        onInteract: () => hint?.classList.remove('is-visible'),
      });
      if (!field) return;
      field.setTarget(pendingTarget);
      if (!prefersReducedMotion()) {
        hint?.classList.add('is-visible');
        setTimeout(() => hint?.classList.remove('is-visible'), 6000);
      }
    } catch (error) {
      console.warn('[hero] el campo de trayectorias no está disponible', error);
    }
  });
}

/** Lo usa el módulo de movimiento para el «despegue» con el scroll. */
export const heroField = {
  setBoost(value: number): void {
    field?.setBoost(value);
  },
};
