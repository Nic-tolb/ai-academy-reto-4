/**
 * Las cinco misiones con sus datos literales (docs/RESEARCH.md §2.6).
 * No se modifican nombres, duraciones ni contenidos (C-05, C-10).
 */
export type MissionId = 'ignition' | 'booster' | 'liftoff' | 'odyssey' | 'nebula';

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
  includes: readonly string[];
  /** Índice de la viñeta que hereda la etapa anterior («Todo Ignition…»). */
  inheritedIndex?: number;
  cta: 'inscripcion' | 'whatsapp';
}

export const MISSIONS: Record<MissionId, Mission> = {
  ignition: {
    id: 'ignition',
    name: 'Ignition',
    stage: 'Fase 01',
    duration: '4 horas',
    hours: 4,
    kind: 'stage',
    modality: 'en vivo',
    includes: [
      'Comprende el impacto real de la IA en tu industria',
      'Domina la IA generativa de tu elección como asistente diario',
      'Conoce las 10 herramientas de IA más relevantes',
      'Aprende a crear agentes básicos de IA en vivo',
    ],
    cta: 'inscripcion',
  },
  booster: {
    id: 'booster',
    name: 'Booster',
    stage: 'Fase 02',
    duration: '8 horas',
    hours: 8,
    kind: 'stage',
    modality: 'en vivo',
    includes: [
      'Todo Ignition con enfoque profesional avanzado',
      'Técnicas de prompting para resultados precisos',
      'Domina 2 herramientas de IA a tu elección',
      'Construye agentes personalizados para tu rol',
    ],
    inheritedIndex: 0,
    cta: 'inscripcion',
  },
  liftoff: {
    id: 'liftoff',
    name: 'Liftoff',
    stage: 'Fase 03',
    duration: '12 horas',
    hours: 12,
    kind: 'stage',
    modality: 'en vivo',
    includes: [
      'Todo Booster enfocado en escalar tu operación',
      'Domina una herramienta de IA adicional elegida',
      'Aprende a automatizar procesos reales con n8n',
      'Diseña flujos automáticos aplicados a tu negocio',
    ],
    inheritedIndex: 0,
    cta: 'inscripcion',
  },
  odyssey: {
    id: 'odyssey',
    name: 'Odyssey',
    stage: 'Expedición',
    duration: 'Personalizado',
    kind: 'track',
    modality: 'a la medida de tu empresa',
    includes: [
      'Programa 100% personalizado para tu empresa',
      'Elige herramientas, duración y profundidad',
      'Casos de uso reales según tu industria y roles',
      'Acompañamiento estratégico con sesiones tácticas',
    ],
    cta: 'whatsapp',
  },
  nebula: {
    id: 'nebula',
    name: 'Nebula',
    stage: 'Órbita',
    duration: 'Pregrabado',
    kind: 'track',
    modality: 'a tu ritmo',
    includes: [
      'Contenidos organizados por niveles de aprendizaje',
      'Evaluaciones continuas para medir el progreso',
      'Acceso flexible 24/7 a materiales, recursos y actualizaciones',
      'Comunidad activa de soporte y aprendizaje colaborativo',
    ],
    cta: 'inscripcion',
  },
};

export const STAGES = [MISSIONS.ignition, MISSIONS.booster, MISSIONS.liftoff] as const;
export const TRACKS = [MISSIONS.odyssey, MISSIONS.nebula] as const;
export const MAX_HOURS = 12;
