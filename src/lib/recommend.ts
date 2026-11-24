/**
 * Lógica del recomendador «Configura tu misión» (I-03).
 * Funciones puras: se prueban con Vitest y se usan en el navegador.
 * Cada recomendación se justifica solo con viñetas reales de la misión.
 */
import { MISSIONS, type MissionId } from '../data/missions';

export type Formato = 'vivo' | 'ritmo';
export type Quien = 'yo' | 'equipo' | 'medida';
export type Meta = 'diario' | 'agentes' | 'automatizar';

export interface Answers {
  formato?: Formato;
  quien?: Quien;
  meta?: Meta;
}

export type StepId = keyof Answers;

export interface Recommendation {
  mission: MissionId;
  alternative: MissionId;
}

/** Siguiente pregunta, o `null` si ya hay datos suficientes para recomendar. */
export function nextStep(a: Answers): StepId | null {
  if (!a.formato) return 'formato';
  if (a.formato === 'ritmo') return null;
  if (!a.quien) return 'quien';
  if (a.quien === 'medida') return null;
  if (!a.meta) return 'meta';
  return null;
}

/** Recomienda una misión. Devuelve `null` si faltan respuestas. */
export function recommend(a: Answers): Recommendation | null {
  if (nextStep(a) !== null) return null;
  if (a.formato === 'ritmo') return { mission: 'nebula', alternative: 'ignition' };
  if (a.quien === 'medida') return { mission: 'odyssey', alternative: 'liftoff' };
  switch (a.meta) {
    case 'diario':
      return { mission: 'ignition', alternative: 'booster' };
    case 'agentes':
      return { mission: 'booster', alternative: a.quien === 'yo' ? 'ignition' : 'liftoff' };
    case 'automatizar':
      return { mission: 'liftoff', alternative: a.quien === 'equipo' ? 'odyssey' : 'booster' };
    default:
      return null;
  }
}

/**
 * Qué viñetas de «Incluye» justifican cada misión (por índice, en orden de
 * importancia). Se referencian por posición para no duplicar el texto.
 */
export const REASON_INDEXES: Readonly<Record<MissionId, readonly number[]>> = {
  ignition: [0, 1, 3],
  booster: [1, 3, 0],
  liftoff: [2, 3, 0],
  odyssey: [0, 1, 2],
  nebula: [2, 0, 1],
};

export function reasonsFor(id: MissionId): string[] {
  const includes = MISSIONS[id].includes;
  return REASON_INDEXES[id].map((i) => includes[i]).filter((r): r is string => Boolean(r));
}
