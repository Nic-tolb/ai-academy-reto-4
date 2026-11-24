import { describe, expect, it } from 'vitest';
import { MISSIONS, type MissionId } from '../data/missions';
import { PROFILES } from '../data/profiles';
import { QUESTIONS } from '../data/recommender';
import {
  nextStep,
  reasonsFor,
  recommend,
  REASON_INDEXES,
  type Answers,
  type Meta,
  type Quien,
} from './recommend';

const IDS = Object.keys(MISSIONS) as MissionId[];

describe('nextStep', () => {
  it('empieza por el formato', () => {
    expect(nextStep({})).toBe('formato');
  });
  it('termina tras «a mi ritmo» (Nebula no depende de las demás)', () => {
    expect(nextStep({ formato: 'ritmo' })).toBeNull();
  });
  it('termina tras «a medida» (Odyssey es personalizado)', () => {
    expect(nextStep({ formato: 'vivo', quien: 'medida' })).toBeNull();
  });
  it('pide la meta para las etapas en vivo', () => {
    expect(nextStep({ formato: 'vivo', quien: 'equipo' })).toBe('meta');
  });
});

describe('recommend', () => {
  const cases: [Answers, MissionId, MissionId][] = [
    [{ formato: 'ritmo' }, 'nebula', 'ignition'],
    [{ formato: 'vivo', quien: 'medida' }, 'odyssey', 'liftoff'],
    [{ formato: 'vivo', quien: 'yo', meta: 'diario' }, 'ignition', 'booster'],
    [{ formato: 'vivo', quien: 'yo', meta: 'agentes' }, 'booster', 'ignition'],
    [{ formato: 'vivo', quien: 'equipo', meta: 'agentes' }, 'booster', 'liftoff'],
    [{ formato: 'vivo', quien: 'equipo', meta: 'automatizar' }, 'liftoff', 'odyssey'],
    [{ formato: 'vivo', quien: 'yo', meta: 'automatizar' }, 'liftoff', 'booster'],
  ];

  it.each(cases)('%o → %s (alternativa %s)', (answers, mission, alternative) => {
    expect(recommend(answers)).toEqual({ mission, alternative });
  });

  it('no recomienda con respuestas incompletas', () => {
    expect(recommend({ formato: 'vivo' })).toBeNull();
  });

  it('nunca propone la misma misión como alternativa', () => {
    for (const [answers] of cases) {
      const r = recommend(answers);
      expect(r?.mission).not.toBe(r?.alternative);
    }
  });

  it('cubre todas las combinaciones de respuestas sin quedar indefinido', () => {
    for (const q of QUESTIONS.find((x) => x.id === 'quien')!.options) {
      for (const m of QUESTIONS.find((x) => x.id === 'meta')!.options) {
        const r = recommend({ formato: 'vivo', quien: q.value as Quien, meta: m.value as Meta });
        expect(r).not.toBeNull();
      }
    }
  });
});

describe('razones', () => {
  it('cada misión tiene tres razones que son viñetas reales (no inventa beneficios)', () => {
    for (const id of IDS) {
      const reasons = reasonsFor(id);
      expect(reasons).toHaveLength(3);
      reasons.forEach((r) => expect(MISSIONS[id].includes).toContain(r));
    }
  });
  it('los índices apuntan a viñetas existentes', () => {
    for (const id of IDS) {
      REASON_INDEXES[id].forEach((i) => expect(MISSIONS[id].includes[i]).toBeDefined());
    }
  });
});

describe('perfiles del hero', () => {
  it('sus textos se construyen con los datos reales de la misión', () => {
    const lider = PROFILES.find((p) => p.id === 'lider')!;
    expect(lider.lead).toContain(MISSIONS.booster.duration);
    expect(lider.lead).not.toMatch(/undefined/);
    PROFILES.forEach((p) => expect(p.lead).not.toMatch(/undefined/));
  });
  it('cada perfil apunta a una misión existente', () => {
    PROFILES.forEach((p) => expect(MISSIONS[p.target]).toBeDefined());
  });
});
