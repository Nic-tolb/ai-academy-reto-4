/**
 * Perfiles del hero («¿Quién va en esta misión?»).
 * Los textos se construyen con los datos de las misiones: si cambia una
 * duración o una viñeta en missions.ts, el hero se actualiza solo.
 */
import type { Quien } from '../lib/recommend';
import { inSentence, MISSIONS, type Channel, type MissionId } from './missions';

export type Profile = 'empresa' | 'lider' | 'independiente';

export interface ProfileInfo {
  id: Profile;
  label: string;
  /** Respuesta sugerida para la pregunta 2 del recomendador. */
  quien: Quien;
  /** Misión hacia la que se dibuja la trayectoria. */
  target: MissionId;
  lead: string;
  cta: { label: string; channel: Channel };
}

const { ignition, booster, odyssey, nebula } = MISSIONS;

export const PROFILES: readonly ProfileInfo[] = [
  {
    id: 'empresa',
    label: 'Empresa',
    quien: 'medida',
    target: 'odyssey',
    lead: `${odyssey.includes[0]}: ${inSentence(odyssey.includes[1] ?? '')}, con ${inSentence(odyssey.includes[2] ?? '')}.`,
    cta: { label: 'Hablar con un especialista', channel: 'whatsapp' },
  },
  {
    id: 'lider',
    label: 'Líder de equipo',
    quien: 'equipo',
    target: 'booster',
    lead: `En ${booster.duration} tu equipo aprende ${inSentence(booster.includes[1] ?? '')} y ${inSentence(booster.includes[3] ?? '')}.`,
    cta: { label: 'Inscribir a mi equipo', channel: 'inscripcion' },
  },
  {
    id: 'independiente',
    label: 'Independiente',
    quien: 'yo',
    target: 'ignition',
    lead: `Empieza con ${ignition.duration} ${ignition.modality} o ${nebula.modality} con contenido ${nebula.duration.toLowerCase()}, y ${inSentence(ignition.includes[1] ?? '')}.`,
    cta: { label: 'Inscríbete', channel: 'inscripcion' },
  },
];

export const profile = (id: Profile): ProfileInfo => {
  const found = PROFILES.find((p) => p.id === id);
  if (!found) throw new Error(`Perfil desconocido: ${id}`);
  return found;
};
