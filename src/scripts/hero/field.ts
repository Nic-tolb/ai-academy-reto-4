/**
 * Campo de trayectorias del hero (I-01). Canvas 2D, sin dependencias.
 *
 * - Las partículas viajan por una trayectoria de lanzamiento.
 * - El cursor o el dedo las desvían (pozo de gravedad); un toque lanza una onda.
 * - Al elegir perfil, convergen en la trayectoria y esta se dibuja hasta la misión.
 * - El scroll acelera el «despegue».
 *
 * Estabilidad: se pausa fuera de pantalla o con la pestaña oculta, limita el
 * devicePixelRatio, reduce partículas si el equipo va lento y, si aun así no da
 * abasto, se congela en un fotograma estático. Cualquier error detiene el bucle
 * sin afectar al resto de la página.
 */
import type { MissionId } from '../../data/missions';

export interface FieldController {
  setTarget(target: MissionId | null): void;
  setBoost(value: number): void;
  destroy(): void;
}

interface Options {
  reducedMotion: boolean;
  /** Muestra etiquetas de misión dentro del canvas (solo en pantallas anchas). */
  onInteract?: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Particle {
  t: number;
  speed: number;
  lane: number;
  size: number;
  alpha: number;
  dx: number;
  dy: number;
}

const COLORS = {
  soft: '183,131,255',
  electric: '150,54,255',
  white: '255,255,255',
  muted: '142,137,152',
};

const STOPS: Record<Exclude<MissionId, 'odyssey' | 'nebula'>, number> = {
  ignition: 0.3,
  booster: 0.56,
  liftoff: 0.84,
};
const LABELS: Record<MissionId, [string, string]> = {
  ignition: ['IGNITION', '4 horas'],
  booster: ['BOOSTER', '8 horas'],
  liftoff: ['LIFTOFF', '12 horas'],
  odyssey: ['ODYSSEY', 'a medida'],
  nebula: ['NEBULA', 'pregrabado'],
};

// ---------- Geometría ----------
type Cubic = [Point, Point, Point, Point];

function bezier([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

function tangent([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  const x = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const y = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function createField(canvas: HTMLCanvasElement, opts: Options): FieldController | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const host = canvas.parentElement;
  if (!host) return null;

  let width = 0;
  let height = 0;
  let wide = false;
  let main: Cubic = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
  let branch: Cubic = main;
  let particles: Particle[] = [];

  // Estado animado
  let target: MissionId | null = null;
  let focus = 0; // 0 = disperso, 1 = convergido en la trayectoria
  let trail = 0; // progreso del trazo dibujado (0..1 de la ruta hasta el destino)
  let boost = 0;
  const pointer = { x: -9999, y: -9999, active: false, strength: 0 };
  const pulses: { x: number; y: number; r: number; life: number }[] = [];

  let running = false;
  let visible = true;
  let frozen = opts.reducedMotion;
  let raf = 0;
  let last = 0;
  const frameTimes: number[] = [];
  let degradeLevel = 0;

  // ---------- Tamaño ----------
  function particleBudget(): number {
    const cores = navigator.hardwareConcurrency || 4;
    const base = wide ? 150 : 70;
    const factor = cores <= 4 ? 0.6 : 1;
    return Math.round(base * factor * (degradeLevel === 0 ? 1 : 0.5));
  }

  function spawn(randomT = true): Particle {
    return {
      t: randomT ? Math.random() : 0,
      speed: 0.035 + Math.random() * 0.05, // fracción de la ruta por segundo
      lane: (Math.random() + Math.random() + Math.random() - 1.5) / 1.5, // ~normal en [-1, 1]
      size: 1 + Math.random() * 1.8,
      alpha: 0.4 + Math.random() * 0.6,
      dx: 0,
      dy: 0,
    };
  }

  function layout(): void {
    const rect = host!.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    wide = width >= 960;
    const dpr = Math.min(window.devicePixelRatio || 1, wide ? 2 : 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (wide) {
      // Columna derecha: no cruza el texto.
      main = [
        { x: width * 0.56, y: height * 1.02 },
        { x: width * 0.64, y: height * 0.66 },
        { x: width * 0.78, y: height * 0.5 },
        { x: width * 0.97, y: height * 0.06 },
      ];
    } else {
      // Diagonal baja: pasa por detrás de los botones, lejos del titular.
      main = [
        { x: -width * 0.05, y: height * 1.02 },
        { x: width * 0.35, y: height * 0.9 },
        { x: width * 0.72, y: height * 0.74 },
        { x: width * 1.05, y: height * 0.46 },
      ];
    }
    const b0 = bezier(main, STOPS.booster);
    const k = wide ? 1 : 0.7;
    branch = [
      b0,
      { x: b0.x + 70 * k, y: b0.y + 4 * k },
      { x: b0.x + 120 * k, y: b0.y + 36 * k },
      { x: b0.x + 160 * k, y: b0.y + 96 * k },
    ];

    const budget = particleBudget();
    if (particles.length > budget) particles.length = budget;
    while (particles.length < budget) particles.push(spawn());
    if (frozen) draw(0);
  }

  // ---------- Dibujo ----------
  const spread = () => (wide ? height * 0.2 : height * 0.16) * lerp(1, 0.1, focus) * (1 + boost * 0.6);

  function targetT(): number {
    if (!target) return 0;
    if (target === 'odyssey') return STOPS.booster;
    if (target === 'nebula') return 1;
    return STOPS[target];
  }

  function drawPath(c: Cubic, alpha: number, dash: number[] = []): void {
    ctx!.save();
    ctx!.setLineDash(dash);
    ctx!.strokeStyle = `rgba(${COLORS.soft},${alpha})`;
    ctx!.lineWidth = 1.5;
    ctx!.beginPath();
    ctx!.moveTo(c[0].x, c[0].y);
    ctx!.bezierCurveTo(c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y);
    ctx!.stroke();
    ctx!.restore();
  }

  function drawTrail(c: Cubic, upTo: number): Point {
    const steps = 48;
    ctx!.strokeStyle = `rgba(${COLORS.electric},0.95)`;
    ctx!.lineWidth = 3;
    ctx!.lineCap = 'round';
    ctx!.beginPath();
    let p = bezier(c, 0);
    ctx!.moveTo(p.x, p.y);
    for (let i = 1; i <= steps; i++) {
      p = bezier(c, (upTo * i) / steps);
      ctx!.lineTo(p.x, p.y);
    }
    ctx!.stroke();
    return p;
  }

  function drawStop(p: Point, id: MissionId, active: boolean): void {
    ctx!.beginPath();
    ctx!.arc(p.x, p.y, active ? 7 : 5, 0, Math.PI * 2);
    ctx!.fillStyle = active ? `rgb(${COLORS.soft})` : '#050507';
    ctx!.fill();
    ctx!.lineWidth = 1.5;
    ctx!.strokeStyle = active ? `rgb(${COLORS.soft})` : `rgba(${COLORS.soft},0.5)`;
    ctx!.stroke();
    if (!wide) return; // en móvil la etiqueta vive en el DOM (ficha de misión)
    const [name, meta] = LABELS[id];
    const left = id === 'ignition';
    ctx!.textAlign = left ? 'left' : 'right';
    const x = p.x + (left ? 16 : -16);
    ctx!.font = '600 12px Poppins, sans-serif';
    ctx!.fillStyle = active ? `rgb(${COLORS.white})` : `rgba(${COLORS.muted},1)`;
    ctx!.fillText(name.split('').join(String.fromCharCode(8202)), x, p.y - 2);
    ctx!.font = '500 12px Poppins, sans-serif';
    ctx!.fillText(meta, x, p.y + 15);
  }

  function draw(dt: number): void {
    const c = ctx!;
    c.clearRect(0, 0, width, height);
    const lift = boost * height * 0.25;
    c.save();
    c.translate(0, -lift);

    // Trayectorias base
    drawPath(main, 0.28 + focus * 0.12);
    if (wide || target === 'odyssey') drawPath(branch, 0.3, [4, 6]);

    // Partículas
    const sp = spread();
    const pr = pointer.active ? (wide ? 140 : 110) : 0;
    for (const p of particles) {
      if (!frozen) {
        p.t += p.speed * dt * (1 + boost * 5);
        if (p.t > 1) Object.assign(p, spawn(false));
      }
      const base = bezier(main, p.t);
      const n = tangent(main, p.t);
      let x = base.x - n.y * p.lane * sp;
      let y = base.y + n.x * p.lane * sp;

      // Pozo de gravedad del puntero + ondas al tocar
      let fx = 0, fy = 0;
      if (pr > 0) {
        const vx = x - pointer.x, vy = y - (pointer.y + lift);
        const d = Math.hypot(vx, vy);
        if (d < pr && d > 0.01) {
          const f = (1 - d / pr) ** 2 * 46 * pointer.strength;
          fx += (vx / d) * f;
          fy += (vy / d) * f;
        }
      }
      for (const w of pulses) {
        const vx = x - w.x, vy = y - (w.y + lift);
        const d = Math.hypot(vx, vy);
        const band = Math.abs(d - w.r);
        if (band < 40 && d > 0.01) {
          const f = (1 - band / 40) * 26 * w.life;
          fx += (vx / d) * f;
          fy += (vy / d) * f;
        }
      }
      p.dx += (fx - p.dx) * 0.14;
      p.dy += (fy - p.dy) * 0.14;
      x += p.dx;
      y += p.dy;

      const onTrail = target && p.t <= trail * targetT() + 0.02;
      const a = p.alpha * (onTrail ? 1 : lerp(1, 0.55, focus));
      c.fillStyle = onTrail ? `rgba(${COLORS.white},${a})` : `rgba(${COLORS.soft},${a})`;
      c.fillRect(x, y, p.size, p.size);
    }

    // Trazo hacia la misión elegida
    if (target) {
      const tt = targetT();
      let tip: Point;
      if (target === 'odyssey') {
        const k = clamp(trail * 1.6, 0, 1);
        tip = drawTrail(main, tt * k);
        if (trail > 0.62) tip = drawTrail(branch, clamp((trail - 0.62) / 0.38, 0, 1));
      } else {
        tip = drawTrail(main, tt * trail);
      }
      c.beginPath();
      c.arc(tip.x, tip.y, 12, 0, Math.PI * 2);
      c.strokeStyle = `rgba(${COLORS.electric},0.8)`;
      c.lineWidth = 2;
      c.stroke();
      c.beginPath();
      c.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.fill();
    }

    // Paradas
    (Object.keys(STOPS) as (keyof typeof STOPS)[]).forEach((id) => {
      drawStop(bezier(main, STOPS[id]), id, target === id && trail > 0.98);
    });
    if (wide || target === 'odyssey') drawStop(branch[3], 'odyssey', target === 'odyssey' && trail > 0.98);

    // Anillo del puntero: deja ver que la página responde
    if (pointer.active && pointer.strength > 0.05) {
      c.beginPath();
      c.arc(pointer.x, pointer.y + lift, pr * 0.55, 0, Math.PI * 2);
      c.strokeStyle = `rgba(${COLORS.soft},${0.22 * pointer.strength})`;
      c.lineWidth = 1;
      c.stroke();
    }
    for (const w of pulses) {
      c.beginPath();
      c.arc(w.x, w.y + lift, w.r, 0, Math.PI * 2);
      c.strokeStyle = `rgba(${COLORS.electric},${0.5 * w.life})`;
      c.lineWidth = 1.5;
      c.stroke();
    }
    c.restore();
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
      for (let i = pulses.length - 1; i >= 0; i--) {
        const w = pulses[i]!;
        w.r += dt * 420;
        w.life -= dt * 1.4;
        if (w.life <= 0) pulses.splice(i, 1);
      }
      draw(dt);
      monitor(dt);
    } catch (error) {
      console.warn('[field] detenido por un error', error);
      stop();
      return;
    }
    raf = requestAnimationFrame(step);
  }

  /** Si el equipo no sostiene la animación, primero se aligera y luego se congela. */
  function monitor(dt: number): void {
    if (document.hidden) return;
    frameTimes.push(dt);
    if (frameTimes.length < 90) return;
    const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    frameTimes.length = 0;
    if (avg > 0.034 && degradeLevel === 0) {
      degradeLevel = 1;
      particles.length = particleBudget();
    } else if (avg > 0.045 && degradeLevel === 1) {
      degradeLevel = 2;
      freeze();
    }
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

  function freeze(): void {
    frozen = true;
    stop();
    focus = target ? 1 : 0;
    trail = target ? 1 : 0;
    draw(0);
  }

  // ---------- Eventos ----------
  const toLocal = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  let interacted = false;
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
    if ((e.target as Element).closest('a, button, input, label')) return;
    const p = toLocal(e);
    if (pulses.length < 4) pulses.push({ x: p.x, y: p.y, r: 4, life: 1 });
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
  // Las etiquetas del canvas usan Poppins: se redibuja cuando la fuente está lista.
  document.fonts?.ready.then(() => frozen && draw(0)).catch(() => undefined);
  start();

  return {
    setTarget(next) {
      target = next;
      trail = 0;
      if (frozen) {
        focus = next ? 1 : 0;
        trail = next ? 1 : 0;
        draw(0);
      }
    },
    setBoost(value) {
      boost = clamp(value, 0, 1);
      if (frozen) draw(0);
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
