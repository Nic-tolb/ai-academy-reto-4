import { describe, expect, it } from 'vitest';
import { MISSIONS, type MissionId } from '../data/missions';
import { nextStep, recommend, REASONS, type Answers } from './recommend';

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
});

describe('REASONS', () => {
  it('solo usa viñetas literales de cada misión (no inventa beneficios)', () => {
    for (const [id, reasons] of Object.entries(REASONS) as [MissionId, readonly string[]][]) {
      for (const reason of reasons) {
        expect(MISSIONS[id].includes).toContain(reason);
      }
    }
  });
});
