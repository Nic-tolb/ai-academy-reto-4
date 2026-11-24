/**
 * Campo de trayectorias del hero (I-01). Controlador: ciclo de vida, eventos y bucle.
 *
 * - Las partículas viajan por una trayectoria de lanzamiento (geometry.ts).
 * - El cursor o el dedo las desvían; un toque lanza una onda (particles.ts).
 * - Al elegir perfil convergen y el trazo se dibuja hasta la misión (renderer.ts).
 * - El scroll acelera el «despegue» (setBoost).
 *
 * Estabilidad: se pausa fuera de pantalla o con la pestaña oculta, limita el
 * devicePixelRatio, se aligera o se congela si el equipo no da abasto
 * (frame-monitor.ts) y cualquier error detiene el bucle sin afectar a la página.
 */
import type { MissionId } from '../../data/missions';
import { FrameMonitor } from './frame-monitor';
import { buildPaths, clamp, lerp, type Paths } from './geometry';
import {
  MAX_PULSES,
  particleBudget,
  simulate,
  spawn,
  stepPulses,
  type Particle,
  type Pointer,
  type Pulse,
} from './particles';
import { render } from './renderer';

export interface FieldController {
  setTarget(target: MissionId | null): void;
  setBoost(value: number): void;
  destroy(): void;
}

export interface FieldOptions {
  reducedMotion: boolean;
  /** Se llama la primera vez que la persona mueve el cursor o toca el hero. */
  onInteract?: () => void;
}

const WIDE_MIN = 960;
const INTERACTIVE = 'a, button, input, label, select, textarea';

export function createField(canvas: HTMLCanvasElement, opts: FieldOptions): FieldController | null {
  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;
  if (!ctx || !host) return null;

  // ---------- Estado ----------
  let width = 0;
  let height = 0;
  let wide = false;
  let paths: Paths = buildPaths(1, 1, false);
  const particles: Particle[] = [];
  const pulses: Pulse[] = [];
  const pointer: Pointer = { x: -9999, y: -9999, active: false, strength: 0 };
  const monitor = new FrameMonitor();

  let target: MissionId | null = null;
  let focus = 0; // 0 = disperso, 1 = convergido en la trayectoria
  let trail = 0; // progreso del trazo hasta la misión (0–1)
  let boost = 0; // progreso del scroll sobre el hero (0–1)

  let frozen = opts.reducedMotion;
  let running = false;
  let visible = true;
  let raf = 0;
  let last = 0;
  let interacted = false;

  const cores = navigator.hardwareConcurrency || 4;
  const spread = () =>
    (wide ? height * 0.2 : height * 0.16) * lerp(1, 0.1, focus) * (1 + boost * 0.6);
  const pointerRadius = () => (pointer.active ? (wide ? 140 : 110) : 0);
  const lift = () => boost * height * 0.25;

  // ---------- Dibujo de un fotograma ----------
  function frame(dt: number): void {
    simulate(particles, {
      dt,
      frozen,
      boost,
      path: paths.main,
      spread: spread(),
      pointer,
      pointerRadius: pointerRadius(),
      pulses,
      lift: lift(),
    });
    render(ctx!, {
      width,
      height,
      wide,
      main: paths.main,
      branch: paths.branch,
      particles,
      target,
      focus,
      trail,
      lift: lift(),
      pointer,
      pointerRadius: pointerRadius(),
      pulses,
    });
  }

  function resizeParticles(): void {
    const budget = particleBudget(wide, cores, monitor.degraded);
    if (particles.length > budget) particles.length = budget;
    while (particles.length < budget) particles.push(spawn());
  }

  function layout(): void {
    const rect = host!.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    wide = width >= WIDE_MIN;
    const dpr = Math.min(window.devicePixelRatio || 1, wide ? 2 : 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    paths = buildPaths(width, height, wide);
    resizeParticles();
    if (frozen) frame(0);
  }

  // ---------- Bucle ----------
  function step(now: number): void {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    try {
      focus = lerp(focus, target ? 1 : 0, 1 - Math.exp(-dt * 4));
      trail = target ? Math.min(1, trail + dt / 1.1) : Math.max(0, trail - dt * 2);
      pointer.strength = lerp(pointer.strength, pointer.active ? 1 : 0, 1 - Math.exp(-dt * 6));
      stepPulses(pulses, dt);
      frame(dt);
      if (!document.hidden) {
        const action = monitor.push(dt);
        if (action === 'degrade') resizeParticles();
        if (action === 'freeze') freeze();
      }
    } catch (error) {
      console.warn('[field] detenido por un error', error);
      stop();
      return;
    }
    if (running) raf = requestAnimationFrame(step);
  }

  function start(): void {
    if (running || frozen || !visible || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(step);
  }

  function stop(): void {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /** Imagen fija: movimiento reducido o equipo que no sostiene la animación. */
  function freeze(): void {
    frozen = true;
    stop();
    focus = target ? 1 : 0;
    trail = target ? 1 : 0;
    frame(0);
  }

  // ---------- Eventos ----------
  const toLocal = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onMove = (e: PointerEvent) => {
    const p = toLocal(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = true;
    if (!interacted) {
      interacted = true;
      opts.onInteract?.();
    }
  };
  const onLeave = () => {
    pointer.active = false;
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest(INTERACTIVE)) return;
    const p = toLocal(e);
    if (pulses.length < MAX_PULSES) pulses.push({ x: p.x, y: p.y, r: 4, life: 1 });
    onMove(e);
  };

  if (!frozen) {
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onDown, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });
    host.addEventListener('pointercancel', onLeave, { passive: true });
  }

  const resizeObserver = new ResizeObserver(() => layout());
  resizeObserver.observe(host);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) start();
    else stop();
  });
  visibilityObserver.observe(host);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  layout();
  // Las etiquetas del canvas usan Poppins: si está congelado, se redibuja al cargar la fuente.
  document.fonts?.ready.then(() => frozen && frame(0)).catch(() => undefined);
  start();

  return {
    setTarget(next) {
      target = next;
      trail = 0;
      if (frozen) {
        focus = next ? 1 : 0;
        trail = next ? 1 : 0;
        frame(0);
      }
    },
    setBoost(value) {
      boost = clamp(value, 0, 1);
      if (frozen) frame(0);
    },
    destroy() {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointercancel', onLeave);
    },
  };
}
