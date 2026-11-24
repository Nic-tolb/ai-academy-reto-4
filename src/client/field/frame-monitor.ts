/**
 * Vigila la duración de los fotogramas. Si el equipo no sostiene la animación,
 * primero pide aligerarla y, si sigue lenta, congelarla. Sin DOM (Vitest).
 */
export type MonitorAction = 'none' | 'degrade' | 'freeze';

export class FrameMonitor {
  private samples: number[] = [];
  private level: 0 | 1 | 2 = 0;

  constructor(
    private readonly sampleSize = 90,
    /** Promedio (s) a partir del cual se reduce la carga (~29 fps). */
    private readonly degradeAt = 0.034,
    /** Promedio (s) a partir del cual se congela (~22 fps). */
    private readonly freezeAt = 0.045,
  ) {}

  get degraded(): boolean {
    return this.level >= 1;
  }

  push(dt: number): MonitorAction {
    if (this.level === 2) return 'none';
    this.samples.push(dt);
    if (this.samples.length < this.sampleSize) return 'none';
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.samples = [];
    if (this.level === 0 && avg > this.degradeAt) {
      this.level = 1;
      return 'degrade';
    }
    if (this.level === 1 && avg > this.freezeAt) {
      this.level = 2;
      return 'freeze';
    }
    return 'none';
  }
}
