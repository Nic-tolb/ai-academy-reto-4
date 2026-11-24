/** Dibujo del campo de trayectorias en canvas 2D. Solo pinta: no guarda estado. */
import { MISSIONS, shortMeta, type MissionId } from '../../data/missions';
import { bezier, clamp, lerp, STAGE_STOPS, STOPS, stopT, type Cubic, type Point } from './geometry';
import type { Particle, Pointer, Pulse } from './particles';

/** Colores de la paleta oficial en formato RGB para usarlos con transparencia. */
const RGB = {
  soft: '183,131,255', // Soft Violet
  electric: '150,54,255', // Electric Violet
  white: '255,255,255',
  muted: '142,137,152', // Muted Gray
};
const BLACK = '#050507';
const HAIR_SPACE = String.fromCharCode(8202);

export interface Scene {
  width: number;
  height: number;
  wide: boolean;
  main: Cubic;
  branch: Cubic;
  particles: readonly Particle[];
  target: MissionId | null;
  focus: number;
  trail: number;
  lift: number;
  pointer: Pointer;
  pointerRadius: number;
  pulses: readonly Pulse[];
}

const label = (id: MissionId): [string, string] => [
  MISSIONS[id].name.toUpperCase(),
  shortMeta(MISSIONS[id]),
];

function drawPath(
  ctx: CanvasRenderingContext2D,
  c: Cubic,
  alpha: number,
  dash: number[] = [],
): void {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.strokeStyle = `rgba(${RGB.soft},${alpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(c[0].x, c[0].y);
  ctx.bezierCurveTo(c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y);
  ctx.stroke();
  ctx.restore();
}

function drawTrail(ctx: CanvasRenderingContext2D, c: Cubic, upTo: number): Point {
  const steps = 48;
  ctx.strokeStyle = `rgba(${RGB.electric},0.95)`;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  let p = bezier(c, 0);
  ctx.moveTo(p.x, p.y);
  for (let i = 1; i <= steps; i++) {
    p = bezier(c, (upTo * i) / steps);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  return p;
}

function drawStop(
  ctx: CanvasRenderingContext2D,
  p: Point,
  id: MissionId,
  active: boolean,
  withLabel: boolean,
): void {
  ctx.beginPath();
  ctx.arc(p.x, p.y, active ? 7 : 5, 0, Math.PI * 2);
  ctx.fillStyle = active ? `rgb(${RGB.soft})` : BLACK;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = active ? `rgb(${RGB.soft})` : `rgba(${RGB.soft},0.5)`;
  ctx.stroke();
  if (!withLabel) return; // en móvil la etiqueta vive en el DOM (ficha de misión)
  const [name, meta] = label(id);
  const left = id === 'ignition';
  const x = p.x + (left ? 16 : -16);
  ctx.textAlign = left ? 'left' : 'right';
  ctx.fillStyle = active ? `rgb(${RGB.white})` : `rgb(${RGB.muted})`;
  ctx.font = '600 12px Poppins, sans-serif';
  ctx.fillText(name.split('').join(HAIR_SPACE), x, p.y - 2);
  ctx.font = '500 12px Poppins, sans-serif';
  ctx.fillText(meta, x, p.y + 15);
}

function drawVehicle(ctx: CanvasRenderingContext2D, tip: Point): void {
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 12, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${RGB.electric},0.8)`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = `rgb(${RGB.white})`;
  ctx.fill();
}

export function render(ctx: CanvasRenderingContext2D, s: Scene): void {
  ctx.clearRect(0, 0, s.width, s.height);
  ctx.save();
  ctx.translate(0, -s.lift);

  const showBranch = s.wide || s.target === 'odyssey';
  drawPath(ctx, s.main, 0.28 + s.focus * 0.12);
  if (showBranch) drawPath(ctx, s.branch, 0.3, [4, 6]);

  // Partículas: las que ya recorrió el trazo se encienden en blanco.
  const reached = s.trail * stopT(s.target) + 0.02;
  for (const p of s.particles) {
    const onTrail = s.target !== null && p.t <= reached;
    const a = p.alpha * (onTrail ? 1 : lerp(1, 0.55, s.focus));
    ctx.fillStyle = `rgba(${onTrail ? RGB.white : RGB.soft},${a})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  // Trazo hasta la misión elegida y «vehículo» en la punta.
  if (s.target) {
    let tip: Point;
    if (s.target === 'odyssey') {
      tip = drawTrail(ctx, s.main, STOPS.booster * clamp(s.trail * 1.6, 0, 1));
      if (s.trail > 0.62) tip = drawTrail(ctx, s.branch, clamp((s.trail - 0.62) / 0.38, 0, 1));
    } else {
      tip = drawTrail(ctx, s.main, stopT(s.target) * s.trail);
    }
    drawVehicle(ctx, tip);
  }

  // Paradas de cada misión.
  const arrived = s.trail > 0.98;
  for (const id of STAGE_STOPS) {
    drawStop(ctx, bezier(s.main, STOPS[id]), id, s.target === id && arrived, s.wide);
  }
  if (showBranch) drawStop(ctx, s.branch[3], 'odyssey', s.target === 'odyssey' && arrived, s.wide);

  // Anillo del puntero y ondas: dejan ver que la página responde.
  if (s.pointer.active && s.pointer.strength > 0.05) {
    ctx.beginPath();
    ctx.arc(s.pointer.x, s.pointer.y + s.lift, s.pointerRadius * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${RGB.soft},${0.22 * s.pointer.strength})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (const w of s.pulses) {
    ctx.beginPath();
    ctx.arc(w.x, w.y + s.lift, w.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${RGB.electric},${0.5 * w.life})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}
