/** Simulación de partículas y fuerzas de interacción. Sin DOM (Vitest). */
import { bezier, tangent, type Cubic } from './geometry';

export interface Particle {
  /** Avance sobre la trayectoria (0–1). */
  t: number;
  /** Fracción de la ruta por segundo. */
  speed: number;
  /** Carril respecto a la trayectoria (−1 a 1). */
  lane: number;
  size: number;
  alpha: number;
  /** Desplazamiento suavizado por el puntero y las ondas. */
  dx: number;
  dy: number;
  /** Posición en pantalla calculada en el último paso. */
  x: number;
  y: number;
}

export interface Pointer {
  x: number;
  y: number;
  active: boolean;
  /** Intensidad suavizada (0–1) para que el efecto entre y salga sin saltos. */
  strength: number;
}

export interface Pulse {
  x: number;
  y: number;
  r: number;
  life: number;
}

export type Rng = () => number;

export const MAX_PULSES = 4;
const POINTER_FORCE = 46;
const PULSE_FORCE = 26;
const PULSE_BAND = 40;
const SMOOTHING = 0.14;

export function spawn(rng: Rng = Math.random, randomT = true): Particle {
  return {
    t: randomT ? rng() : 0,
    speed: 0.035 + rng() * 0.05,
    lane: (rng() + rng() + rng() - 1.5) / 1.5, // aproximadamente normal en [−1, 1]
    size: 1 + rng() * 1.8,
    alpha: 0.4 + rng() * 0.6,
    dx: 0,
    dy: 0,
    x: 0,
    y: 0,
  };
}

/** Cantidad de partículas según pantalla, núcleos del equipo y degradación. */
export function particleBudget(wide: boolean, cores: number, degraded: boolean): number {
  const base = wide ? 150 : 70;
  const factor = cores <= 4 ? 0.6 : 1;
  return Math.round(base * factor * (degraded ? 0.5 : 1));
}

/** Empuje que reciben las partículas desde el puntero y las ondas de toque. */
export function repulsion(
  x: number,
  y: number,
  pointer: Pointer,
  radius: number,
  pulses: readonly Pulse[],
  lift: number,
): { fx: number; fy: number } {
  let fx = 0;
  let fy = 0;
  if (radius > 0) {
    const vx = x - pointer.x;
    const vy = y - (pointer.y + lift);
    const d = Math.hypot(vx, vy);
    if (d < radius && d > 0.01) {
      const f = (1 - d / radius) ** 2 * POINTER_FORCE * pointer.strength;
      fx += (vx / d) * f;
      fy += (vy / d) * f;
    }
  }
  for (const w of pulses) {
    const vx = x - w.x;
    const vy = y - (w.y + lift);
    const d = Math.hypot(vx, vy);
    const band = Math.abs(d - w.r);
    if (band < PULSE_BAND && d > 0.01) {
      const f = (1 - band / PULSE_BAND) * PULSE_FORCE * w.life;
      fx += (vx / d) * f;
      fy += (vy / d) * f;
    }
  }
  return { fx, fy };
}

export interface SimulationInput {
  dt: number;
  frozen: boolean;
  boost: number;
  path: Cubic;
  spread: number;
  pointer: Pointer;
  pointerRadius: number;
  pulses: readonly Pulse[];
  lift: number;
  rng?: Rng;
}

/** Avanza las partículas y calcula su posición en pantalla. */
export function simulate(particles: Particle[], s: SimulationInput): void {
  const rng = s.rng ?? Math.random;
  for (const p of particles) {
    if (!s.frozen) {
      p.t += p.speed * s.dt * (1 + s.boost * 5);
      if (p.t > 1) Object.assign(p, spawn(rng, false));
    }
    const base = bezier(s.path, p.t);
    const n = tangent(s.path, p.t);
    const x = base.x - n.y * p.lane * s.spread;
    const y = base.y + n.x * p.lane * s.spread;
    const { fx, fy } = repulsion(x, y, s.pointer, s.pointerRadius, s.pulses, s.lift);
    p.dx += (fx - p.dx) * SMOOTHING;
    p.dy += (fy - p.dy) * SMOOTHING;
    p.x = x + p.dx;
    p.y = y + p.dy;
  }
}

/** Las ondas de toque crecen y se desvanecen. */
export function stepPulses(pulses: Pulse[], dt: number): void {
  for (let i = pulses.length - 1; i >= 0; i--) {
    const w = pulses[i]!;
    w.r += dt * 420;
    w.life -= dt * 1.4;
    if (w.life <= 0) pulses.splice(i, 1);
  }
}
