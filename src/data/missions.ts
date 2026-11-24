/**
 * Las cinco misiones con sus datos literales (docs/RESEARCH.md §2.6).
 * ÚNICA FUENTE de nombres, duraciones y contenidos: cualquier texto que los
 * mencione (hero, recomendador, trayectoria, botones) se deriva de aquí.
 * No se modifican (reto: C-05, C-10).
 */
export type MissionId = 'ignition' | 'booster' | 'liftoff' | 'odyssey' | 'nebula';
export type Channel = 'inscripcion' | 'whatsapp';

export interface Mission {
  id: MissionId;
  name: string;
  /** Etiqueta de la landing actual: «Fase 01», «Expedición», «Órbita». */
  stage: string;
  duration: string;
  /** Solo las etapas en vivo tienen horas. */
  hours?: number;
  kind: 'stage' | 'track';
  modality: string;
  /** Versión corta de la modalidad para espacios reducidos (trayectoria del hero). */
  shortModality: string;
  includes: readonly string[];
  /** Índice de la viñeta que hereda la etapa anterior («Todo Ignition…»). */
  inheritedIndex?: number;
  /** Canal principal de la llamada a la acción. */
  channel: Channel;
  /** Texto del botón cuando no es el genérico «Inscríbete en {nombre}». */
  ctaLabel?: string;
}

export const MISSIONS: Readonly<Record<MissionId, Mission>> = {
  ignition: {
    id: 'ignition',
    name: 'Ignition',
    stage: 'Fase 01',
    duration: '4 horas',
    hours: 4,
    kind: 'stage',
    modality: 'en vivo',
    shortModality: 'en vivo',
    includes: [
      'Comprende el impacto real de la IA en tu industria',
      'Domina la IA generativa de tu elección como asistente diario',
      'Conoce las 10 herramientas de IA más relevantes',
      'Aprende a crear agentes básicos de IA en vivo',
    ],
    channel: 'inscripcion',
  },
  booster: {
    id: 'booster',
    name: 'Booster',
    stage: 'Fase 02',
    duration: '8 horas',
    hours: 8,
    kind: 'stage',
    modality: 'en vivo',
    shortModality: 'en vivo',
    includes: [
      'Todo Ignition con enfoque profesional avanzado',
      'Técnicas de prompting para resultados precisos',
      'Domina 2 herramientas de IA a tu elección',
      'Construye agentes personalizados para tu rol',
    ],
    inheritedIndex: 0,
    channel: 'inscripcion',
  },
  liftoff: {
    id: 'liftoff',
    name: 'Liftoff',
    stage: 'Fase 03',
    duration: '12 horas',
    hours: 12,
    kind: 'stage',
    modality: 'en vivo',
    shortModality: 'en vivo',
    includes: [
      'Todo Booster enfocado en escalar tu operación',
      'Domina una herramienta de IA adicional elegida',
      'Aprende a automatizar procesos reales con n8n',
      'Diseña flujos automáticos aplicados a tu negocio',
    ],
    inheritedIndex: 0,
    channel: 'inscripcion',
  },
  odyssey: {
    id: 'odyssey',
    name: 'Odyssey',
    stage: 'Expedición',
    duration: 'Personalizado',
    kind: 'track',
    modality: 'a la medida de tu empresa',
    shortModality: 'a medida',
    includes: [
      'Programa 100% personalizado para tu empresa',
      'Elige herramientas, duración y profundidad',
      'Casos de uso reales según tu industria y roles',
      'Acompañamiento estratégico con sesiones tácticas',
    ],
    channel: 'whatsapp',
    ctaLabel: 'Diseñar mi programa',
  },
  nebula: {
    id: 'nebula',
    name: 'Nebula',
    stage: 'Órbita',
    duration: 'Pregrabado',
    kind: 'track',
    modality: 'a tu ritmo',
    shortModality: 'a tu ritmo',
    includes: [
      'Contenidos organizados por niveles de aprendizaje',
      'Evaluaciones continuas para medir el progreso',
      'Acceso flexible 24/7 a materiales, recursos y actualizaciones',
      'Comunidad activa de soporte y aprendizaje colaborativo',
    ],
    channel: 'inscripcion',
    ctaLabel: 'Accede ahora',
  },
};

export const STAGES = [MISSIONS.ignition, MISSIONS.booster, MISSIONS.liftoff] as const;
export const TRACKS = [MISSIONS.odyssey, MISSIONS.nebula] as const;
export const MAX_HOURS = Math.max(...STAGES.map((s) => s.hours ?? 0));

// ---------- Textos derivados (nunca se escriben a mano en otro lugar) ----------

/** «Inscríbete en Booster», «Accede ahora», «Diseñar mi programa». */
export const ctaLabel = (m: Mission): string => m.ctaLabel ?? `Inscríbete en ${m.name}`;

/** «8 horas · en vivo», «Personalizado · a la medida de tu empresa». */
export const summary = (m: Mission): string => `${m.duration} · ${m.modality}`;

/** «en vivo, 8 horas», «a tu ritmo, pregrabado». */
export const brief = (m: Mission): string => `${m.modality}, ${m.duration.toLowerCase()}`;

/** Etiqueta corta para la trayectoria: «8 horas», «a medida». */
export const shortMeta = (m: Mission): string => (m.hours ? m.duration : m.shortModality);

/** Viñeta en minúscula inicial para usarla dentro de una frase. */
export const inSentence = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);

/** «4, 8 o 12» a partir de las horas reales de las etapas. */
export const stageHoursList = (): string => {
  const hours = STAGES.map((s) => String(s.hours));
  return `${hours.slice(0, -1).join(', ')} o ${hours.at(-1)}`;
};
