import { describe, expect, it } from 'vitest';
import { FrameMonitor } from './frame-monitor';
import { bezier, buildPaths, STOPS, stopT, tangent, type Cubic } from './geometry';
import { particleBudget, repulsion, simulate, spawn, stepPulses, type Pointer, type Pulse } from './particles';

/** Generador pseudoaleatorio determinista para pruebas reproducibles. */
function seeded(seed = 1) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const line: Cubic = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 20, y: 0 },
  { x: 30, y: 0 },
];
const idlePointer: Pointer = { x: -9999, y: -9999, active: false, strength: 0 };

describe('geometría', () => {
  it('la curva empieza y termina en sus extremos', () => {
    expect(bezier(line, 0)).toEqual({ x: 0, y: 0 });
    expect(bezier(line, 1)).toEqual({ x: 30, y: 0 });
  });

  it('la tangente es unitaria', () => {
    const { main } = buildPaths(1440, 900, true);
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const v = tangent(main, t);
      expect(Math.hypot(v.x, v.y)).toBeCloseTo(1, 6);
    }
  });

  it('en escritorio la trayectoria queda en la mitad derecha (no cruza el texto)', () => {
    const { main } = buildPaths(1440, 900, true);
    for (let t = 0; t <= 1; t += 0.05) expect(bezier(main, t).x).toBeGreaterThan(1440 * 0.5);
  });

  it('la bifurcación de Odyssey nace en la parada de Booster', () => {
    const { main, branch } = buildPaths(375, 700, false);
    const b = bezier(main, STOPS.booster);
    expect(branch[0].x).toBeCloseTo(b.x);
    expect(branch[0].y).toBeCloseTo(b.y);
  });

  it('las paradas siguen el orden de las etapas', () => {
    expect(stopT('ignition')).toBeLessThan(stopT('booster'));
    expect(stopT('booster')).toBeLessThan(stopT('liftoff'));
    expect(stopT(null)).toBe(0);
  });
});

describe('partículas', () => {
  it('el presupuesto baja en equipos modestos y al degradar', () => {
    expect(particleBudget(true, 8, false)).toBe(150);
    expect(particleBudget(true, 4, false)).toBeLessThan(150);
    expect(particleBudget(false, 8, true)).toBe(35);
  });

  it('el puntero solo empuja dentro de su radio', () => {
    const pointer: Pointer = { x: 0, y: 0, active: true, strength: 1 };
    expect(repulsion(500, 0, pointer, 100, [], 0)).toEqual({ fx: 0, fy: 0 });
    const near = repulsion(20, 0, pointer, 100, [], 0);
    expect(near.fx).toBeGreaterThan(0); // hacia fuera
    expect(near.fy).toBeCloseTo(0);
  });

  it('el empuje es más fuerte cerca del puntero', () => {
    const pointer: Pointer = { x: 0, y: 0, active: true, strength: 1 };
    expect(repulsion(10, 0, pointer, 100, [], 0).fx).toBeGreaterThan(repulsion(80, 0, pointer, 100, [], 0).fx);
  });

  it('las partículas avanzan y se reciclan al terminar la ruta', () => {
    const rng = seeded(7);
    const p = spawn(rng);
    p.t = 0.999;
    simulate([p], { dt: 0.05, frozen: false, boost: 0, path: line, spread: 0, pointer: idlePointer, pointerRadius: 0, pulses: [], lift: 0, rng });
    expect(p.t).toBeLessThan(0.5);
  });

  it('congeladas no avanzan', () => {
    const p = spawn(seeded(3));
    const t0 = p.t;
    simulate([p], { dt: 0.05, frozen: true, boost: 1, path: line, spread: 0, pointer: idlePointer, pointerRadius: 0, pulses: [], lift: 0 });
    expect(p.t).toBe(t0);
  });

  it('las ondas se desvanecen y desaparecen', () => {
    const pulses: Pulse[] = [{ x: 0, y: 0, r: 4, life: 1 }];
    for (let i = 0; i < 60; i++) stepPulses(pulses, 0.016);
    expect(pulses).toHaveLength(0);
  });
});

describe('monitor de fotogramas', () => {
  it('con 60 fps no hace nada', () => {
    const m = new FrameMonitor(10);
    const actions = Array.from({ length: 30 }, () => m.push(1 / 60));
    expect(actions.every((a) => a === 'none')).toBe(true);
  });

  it('si va lento primero aligera y luego congela', () => {
    const m = new FrameMonitor(10);
    const actions = Array.from({ length: 30 }, () => m.push(0.06)).filter((a) => a !== 'none');
    expect(actions).toEqual(['degrade', 'freeze']);
    expect(m.degraded).toBe(true);
  });
});
