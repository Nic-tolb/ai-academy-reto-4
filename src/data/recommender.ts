/**
 * Preguntas del recomendador: textos y valores juntos, tipados contra la lógica
 * (src/lib/recommend.ts). Las pistas que citan datos se derivan de las misiones.
 */
import type { Formato, Meta, Quien, StepId } from '../lib/recommend';
import { MISSIONS, stageHoursList } from './missions';

interface Option<V extends string> {
  value: V;
  label: string;
  hint: string;
}

export type Question =
  | { id: 'formato'; title: string; options: readonly Option<Formato>[] }
  | { id: 'quien'; title: string; options: readonly Option<Quien>[] }
  | { id: 'meta'; title: string; options: readonly Option<Meta>[] };

const { nebula, liftoff } = MISSIONS;

export const QUESTIONS: readonly Question[] = [
  {
    id: 'formato',
    title: '¿Cómo prefieres aprender?',
    options: [
      { value: 'vivo', label: 'En vivo, con un trainer', hint: `Sesiones de ${stageHoursList()} horas, presenciales o virtuales` },
      { value: 'ritmo', label: 'A mi ritmo, cuando pueda', hint: `Contenido ${nebula.duration.toLowerCase()} con acceso 24/7` },
    ],
  },
  {
    id: 'quien',
    title: '¿Quién se va a formar?',
    options: [
      { value: 'yo', label: 'Solo yo', hint: 'Quiero aplicarla en mi propio trabajo' },
      { value: 'equipo', label: 'Mi equipo', hint: 'Varias personas con tareas parecidas' },
      { value: 'medida', label: 'Mi empresa, con un programa a medida', hint: 'Herramientas, duración y casos según nuestra industria' },
    ],
  },
  {
    id: 'meta',
    title: '¿Hasta dónde quieres llegar?',
    options: [
      { value: 'diario', label: 'Usar la IA a diario y entender su impacto', hint: 'Un asistente de IA para tu trabajo diario' },
      { value: 'agentes', label: 'Prompts precisos y agentes para mi rol', hint: 'Resultados más finos y asistentes propios' },
      { value: 'automatizar', label: 'Automatizar procesos con n8n', hint: liftoff.includes[3] ?? '' },
    ],
  },
];

export const STEP_ORDER: readonly StepId[] = QUESTIONS.map((q) => q.id);
