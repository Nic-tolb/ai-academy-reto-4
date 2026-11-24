/** Geometría de la trayectoria de lanzamiento. Funciones puras (Vitest). */
import type { MissionId } from '../../data/missions';

export interface Point {
  x: number;
  y: number;
}

export type Cubic = readonly [Point, Point, Point, Point];

export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Punto de una curva cúbica de Bézier en t ∈ [0, 1]. */
export function bezier([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

/** Tangente unitaria de la curva en t (para separar las partículas en carriles). */
export function tangent([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  const x = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const y = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

/** Posición de cada etapa en vivo sobre la trayectoria (0 = despegue, 1 = fin). */
export const STOPS = { ignition: 0.3, booster: 0.56, liftoff: 0.84 } as const;
export type StageStop = keyof typeof STOPS;
export const STAGE_STOPS = Object.keys(STOPS) as StageStop[];

/** Hasta dónde se dibuja el trazo para cada misión (Odyssey se bifurca en Booster). */
export function stopT(target: MissionId | null): number {
  if (!target) return 0;
  if (target === 'odyssey') return STOPS.booster;
  if (target === 'nebula') return 1;
  return STOPS[target];
}

export interface Paths {
  main: Cubic;
  branch: Cubic;
}

/**
 * Trayectorias según el tamaño del hero.
 * Escritorio: columna derecha, sin cruzar el texto.
 * Móvil: diagonal baja, por detrás de los botones y lejos del titular.
 */
export function buildPaths(width: number, height: number, wide: boolean): Paths {
  const main: Cubic = wide
    ? [
        { x: width * 0.56, y: height * 1.02 },
        { x: width * 0.64, y: height * 0.66 },
        { x: width * 0.78, y: height * 0.5 },
        { x: width * 0.97, y: height * 0.06 },
      ]
    : [
        { x: -width * 0.05, y: height * 1.02 },
        { x: width * 0.35, y: height * 0.9 },
        { x: width * 0.72, y: height * 0.74 },
        { x: width * 1.05, y: height * 0.46 },
      ];
  const b0 = bezier(main, STOPS.booster);
  const k = wide ? 1 : 0.7;
  const branch: Cubic = [
    b0,
    { x: b0.x + 70 * k, y: b0.y + 4 * k },
    { x: b0.x + 120 * k, y: b0.y + 36 * k },
    { x: b0.x + 160 * k, y: b0.y + 96 * k },
  ];
  return { main, branch };
}
