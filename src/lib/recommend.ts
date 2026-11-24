/**
 * Lógica del recomendador «Configura tu misión» (I-03).
 * Función pura: se prueba con Vitest y se usa en el navegador.
 * Cada respuesta se apoya solo en datos reales de las misiones.
 */
import type { MissionId } from '../data/missions';

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
 * Viñetas literales de «Incluye» que justifican cada recomendación.
 * Se toman del texto real para no prometer nada que la misión no ofrezca.
 */
export const REASONS: Record<MissionId, readonly string[]> = {
  ignition: [
    'Comprende el impacto real de la IA en tu industria',
    'Domina la IA generativa de tu elección como asistente diario',
    'Aprende a crear agentes básicos de IA en vivo',
  ],
  booster: [
    'Técnicas de prompting para resultados precisos',
    'Construye agentes personalizados para tu rol',
    'Todo Ignition con enfoque profesional avanzado',
  ],
  liftoff: [
    'Aprende a automatizar procesos reales con n8n',
    'Diseña flujos automáticos aplicados a tu negocio',
    'Todo Booster enfocado en escalar tu operación',
  ],
  odyssey: [
    'Programa 100% personalizado para tu empresa',
    'Elige herramientas, duración y profundidad',
    'Casos de uso reales según tu industria y roles',
  ],
  nebula: [
    'Acceso flexible 24/7 a materiales, recursos y actualizaciones',
    'Contenidos organizados por niveles de aprendizaje',
    'Evaluaciones continuas para medir el progreso',
  ],
};

/** Perfil elegido en el hero → respuesta precargada y destino de la trayectoria. */
export type Profile = 'empresa' | 'lider' | 'independiente';

export const PROFILE_PRESET: Record<Profile, { quien: Quien; target: MissionId }> = {
  empresa: { quien: 'medida', target: 'odyssey' },
  lider: { quien: 'equipo', target: 'booster' },
  independiente: { quien: 'yo', target: 'ignition' },
};
