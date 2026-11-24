/**
 * I-03 · Interfaz del recomendador. La lógica vive en src/lib/recommend.ts y
 * todos los textos de las misiones se derivan de src/data/missions.ts.
 */
import { $, $$, prefersReducedMotion } from '../core/dom';
import { emit, getProfile, on } from '../core/events';
import { brief, ctaLabel, MISSIONS, summary } from '../../data/missions';
import { profile } from '../../data/profiles';
import { STEP_ORDER } from '../../data/recommender';
import { nextStep, reasonsFor, recommend, type Answers, type StepId } from '../../lib/recommend';

export function initRecommender(): void {
  const root = $('[data-recommender]');
  if (!root) return;
  const inscripcion = root.dataset.inscripcion ?? '#';
  const whatsapp = root.dataset.whatsapp ?? '#';

  const steps = new Map(STEP_ORDER.map((id) => [id, $<HTMLFieldSetElement>(`[data-step="${id}"]`, root)!]));
  const progress = $$('[data-progress]', root);
  const result = $('[data-result]', root)!;
  const nav = $('[data-rec-nav]', root)!;
  const back = $<HTMLButtonElement>('[data-rec-back]', root)!;
  const restart = $<HTMLButtonElement>('[data-rec-restart]', root)!;
  const live = $('[data-rec-live]', root)!;
  const maxAnalitico = $('[data-max="analitico"]', root);
  const maxIdea = $('[data-max="idea"]', root);

  let answers: Answers = {};
  let history: StepId[] = ['formato'];

  const markPressed = (step: HTMLElement, value?: string) =>
    $$('.opt', step).forEach((o) => o.setAttribute('aria-pressed', String(o.dataset.value === value)));

  function paintProgress(done: boolean): void {
    progress.forEach((li, i) => {
      const id = STEP_ORDER[i]!;
      li.classList.toggle('is-done', answers[id] !== undefined && history.includes(id));
      li.classList.toggle('is-skipped', done && !history.includes(id));
    });
  }

  function showStep(id: StepId, focus = true): void {
    steps.forEach((el, key) => (el.hidden = key !== id));
    result.hidden = true;
    nav.hidden = history.length < 2;
    back.hidden = history.length < 2;
    maxAnalitico?.removeAttribute('hidden');
    maxIdea?.setAttribute('hidden', '');
    paintProgress(false);
    if (focus) steps.get(id)?.querySelector('legend')?.focus({ preventScroll: true });
  }

  function clearHighlight(): void {
    $$('[data-mission]').forEach((el) => {
      el.classList.remove('is-recommended');
      $('[data-badge]', el)?.setAttribute('hidden', '');
    });
  }

  function showResult(): void {
    const rec = recommend(answers);
    if (!rec) return;
    const mission = MISSIONS[rec.mission];
    const alt = MISSIONS[rec.alternative];

    steps.forEach((el) => (el.hidden = true));
    result.hidden = false;
    nav.hidden = false;
    back.hidden = false;
    maxAnalitico?.setAttribute('hidden', '');
    maxIdea?.removeAttribute('hidden');

    $('[data-r-name]', result)!.textContent = mission.name;
    $('[data-r-meta]', result)!.textContent = `${summary(mission)} · ${mission.stage}`;
    $('[data-r-reasons]', result)!.replaceChildren(
      ...reasonsFor(mission.id).map((r) => Object.assign(document.createElement('li'), { textContent: r })),
    );
    const altLink = Object.assign(document.createElement('a'), { href: `#mision-${alt.id}`, textContent: alt.name });
    $('[data-r-alt]', result)!.replaceChildren('Alternativa cercana: ', altLink, ` (${brief(alt)}).`);

    const cta = $<HTMLAnchorElement>('[data-r-cta]', result)!;
    const wa = mission.channel === 'whatsapp';
    cta.textContent = ctaLabel(mission);
    cta.href = wa ? whatsapp : inscripcion;
    if (wa) {
      cta.target = '_blank';
      cta.rel = 'noopener';
    } else {
      cta.removeAttribute('target');
      cta.removeAttribute('rel');
    }
    $<HTMLAnchorElement>('[data-r-see]', result)!.href = `#mision-${mission.id}`;

    clearHighlight();
    const card = document.getElementById(`mision-${mission.id}`);
    card?.classList.add('is-recommended');
    card?.querySelector('[data-badge]')?.removeAttribute('hidden');

    paintProgress(true);
    live.textContent = `Te recomendamos ${mission.name}: ${brief(mission)}.`;
    result.focus({ preventScroll: true });
    if (window.innerWidth < 1200) {
      result.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }

  /** La elección del hero solo sugiere: resalta la opción, no la responde. */
  function applyPreset(quien: Answers['quien']): void {
    const step = steps.get('quien');
    if (!step || !quien) return;
    $$('.preset', step).forEach((n) => n.remove());
    $(`.opt[data-value="${quien}"] strong`, step)?.append(
      Object.assign(document.createElement('span'), { className: 'preset', textContent: '· según tu elección arriba' }),
    );
  }

  steps.forEach((step, id) => {
    step.addEventListener('click', (e) => {
      const opt = (e.target as Element).closest<HTMLButtonElement>('.opt');
      if (!opt?.dataset.value) return;
      // Responder una pregunta invalida las respuestas posteriores.
      const idx = STEP_ORDER.indexOf(id);
      const kept: Answers = {};
      for (const key of STEP_ORDER.slice(0, idx)) {
        if (answers[key] !== undefined) Object.assign(kept, { [key]: answers[key] });
      }
      answers = { ...kept, [id]: opt.dataset.value };
      markPressed(step, opt.dataset.value);
      STEP_ORDER.slice(idx + 1).forEach((later) => {
        const el = steps.get(later);
        if (el) markPressed(el);
      });
      const next = nextStep(answers);
      if (next === null) {
        showResult();
      } else {
        history = [...history.slice(0, history.indexOf(id) + 1), next];
        showStep(next);
      }
    });
  });

  back.addEventListener('click', () => {
    if (!result.hidden) {
      showStep(history[history.length - 1]!);
      return;
    }
    history = history.slice(0, -1);
    showStep(history[history.length - 1] ?? 'formato');
  });

  restart.addEventListener('click', () => {
    answers = {};
    history = ['formato'];
    steps.forEach((s) => markPressed(s));
    clearHighlight();
    const current = getProfile();
    if (current) applyPreset(profile(current).quien);
    showStep('formato');
  });

  root.addEventListener('focusin', () => emit('recommenderFocus', true));
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) emit('recommenderFocus', false);
  });

  on('profile', (id) => applyPreset(profile(id).quien));

  showStep('formato', false);
}
