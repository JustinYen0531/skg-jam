/**
 * Chapter 10 — performance gauntlet renderer (self-contained).
 *
 * Draws the hard route authored in `chapterTenPerformance.ts`: spiked / bobbing
 * pipes, floating spikes, gravity portals, and lunging ambushes, plus Arcane's
 * pixel bird which flips when his gravity inverts. Pure canvas, no assets. The
 * cosmetic pipe bob is deliberately tiny (≤5px) so what is drawn stays inside
 * the verified safe margin — it looks alive without lying about the hitbox.
 */

import type { PlacedObstacle } from '../lib/chapterTenPerformance';

// Gate 40–184 must still look like a recovered 2013 mobile game. Keep every
// hazard in hard, opaque arcade colours; the grey-teal developer palette made
// the gauntlet read like the rejected terminal presentation at score 42.
const PIPE_BODY = '#58b947';
const PIPE_EDGE = '#2d6f32';
const SPIKE = '#d85a38';
const SPIKE_EDGE = '#7e3025';
const PORTAL = '#f1c84b';
const AMBUSH = '#c84a2f';
const AMBUSH_EDGE = '#78281f';

const drawSpikeTri = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  half: number,
  height: number,
  fill: string,
  edge: string,
) => {
  ctx.beginPath();
  ctx.moveTo(cx - half, baseY);
  ctx.lineTo(cx, baseY - height);
  ctx.lineTo(cx + half, baseY);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.stroke();
};

const PIPE_WIDTH = 50;

const drawPipe = (
  ctx: CanvasRenderingContext2D,
  obs: Extract<PlacedObstacle, { kind: 'pipe' }>,
  frame: number,
  height: number,
) => {
  // Tiny cosmetic bob, capped so the drawn gap never crosses the safe margin.
  const bob = obs.moveAmplitude > 0 ? Math.sin(frame * 0.14 + obs.movePhase * Math.PI * 2) * Math.min(5, obs.moveAmplitude) : 0;
  const top = obs.openingTop + bob;
  const bottom = obs.openingBottom + bob;
  const x = obs.x;

  ctx.save();
  ctx.fillStyle = PIPE_BODY;
  ctx.strokeStyle = PIPE_EDGE;
  ctx.lineWidth = 2;
  if (top > 0) {
    ctx.fillRect(x, 0, PIPE_WIDTH, top);
    ctx.strokeRect(x + 0.5, -2, PIPE_WIDTH - 1, top + 2);
  }
  if (bottom < height) {
    ctx.fillRect(x, bottom, PIPE_WIDTH, height - bottom);
    ctx.strokeRect(x + 0.5, bottom, PIPE_WIDTH - 1, height - bottom + 2);
  }

  if (obs.spiked) {
    // Spikes on the inner lips, pointing into the gap — dangerous look only.
    const spikes = 4;
    for (let i = 0; i < spikes; i += 1) {
      const sx = x + 7 + i * ((PIPE_WIDTH - 14) / (spikes - 1));
      if (top > 0) drawSpikeTri(ctx, sx, top, 5, 8, SPIKE, SPIKE_EDGE);
      if (bottom < height) drawSpikeTri(ctx, sx, bottom, 5, -8, SPIKE, SPIKE_EDGE);
    }
  }
  ctx.restore();
};

const drawFloatingSpike = (
  ctx: CanvasRenderingContext2D,
  obs: Extract<PlacedObstacle, { kind: 'floating-spike' }>,
) => {
  // A diamond of four spikes so it reads as a hazard from any side.
  const { x, y, radius } = obs;
  ctx.save();
  drawSpikeTri(ctx, x, y + radius, radius * 0.7, radius, SPIKE, SPIKE_EDGE);
  drawSpikeTri(ctx, x, y - radius, radius * 0.7, -radius, SPIKE, SPIKE_EDGE);
  ctx.beginPath();
  ctx.moveTo(x - radius, y);
  ctx.lineTo(x, y - radius * 0.7);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius * 0.7);
  ctx.closePath();
  ctx.fillStyle = SPIKE;
  ctx.fill();
  ctx.strokeStyle = SPIKE_EDGE;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
};

const drawPortal = (
  ctx: CanvasRenderingContext2D,
  obs: Extract<PlacedObstacle, { kind: 'portal' }>,
  height: number,
) => {
  // A tall gravity ring the bird passes through; flips his gravity.
  ctx.save();
  ctx.strokeStyle = PORTAL;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.ellipse(obs.x, height / 2, 14, height / 2 - 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = PORTAL;
  ctx.fill();
  // Up/down chevrons marking the flip.
  ctx.globalAlpha = 1;
  ctx.fillStyle = PORTAL;
  for (const cy of [height * 0.32, height * 0.68]) {
    ctx.beginPath();
    ctx.moveTo(obs.x - 5, cy + 4);
    ctx.lineTo(obs.x, cy - 4);
    ctx.lineTo(obs.x + 5, cy + 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

const drawAmbush = (
  ctx: CanvasRenderingContext2D,
  obs: Extract<PlacedObstacle, { kind: 'ambush' }>,
  frame: number,
  height: number,
) => {
  // Lunge factor peaks when the ambush is nearest the bird column (x≈birdX).
  const lunge = Math.max(0, 1 - Math.abs(obs.x - 80) / 120);
  const reach = obs.reach * lunge;
  const baseY = obs.from === 'top' ? 0 : height;
  const dir = obs.from === 'top' ? 1 : -1;
  const headY = baseY + dir * reach;
  ctx.save();
  // Stalk.
  ctx.strokeStyle = '#4e6b3a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(obs.x, baseY);
  ctx.lineTo(obs.x, headY);
  ctx.stroke();
  // Head (a snapping mouth of spikes).
  ctx.fillStyle = AMBUSH;
  ctx.beginPath();
  ctx.arc(obs.x, headY, obs.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = AMBUSH_EDGE;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const teeth = 5;
  for (let i = 0; i < teeth; i += 1) {
    const a = (i / (teeth - 1)) * Math.PI - Math.PI / 2;
    const tx = obs.x + Math.sin(a) * obs.radius;
    const ty = headY + dir * Math.cos(a) * obs.radius * -0.2;
    drawSpikeTri(ctx, tx, ty, 3, dir * 6, SPIKE, SPIKE_EDGE);
  }
  ctx.restore();
};

/** Draw the whole gauntlet for the current frame. */
export const drawPerformanceObstacles = (
  ctx: CanvasRenderingContext2D,
  obstacles: PlacedObstacle[],
  frame: number,
  height: number,
) => {
  for (const obs of obstacles) {
    if (obs.kind === 'portal') drawPortal(ctx, obs, height);
  }
  for (const obs of obstacles) {
    if (obs.kind === 'pipe') drawPipe(ctx, obs, frame, height);
    else if (obs.kind === 'floating-spike') drawFloatingSpike(ctx, obs);
    else if (obs.kind === 'ambush') drawAmbush(ctx, obs, frame, height);
  }
};

/**
 * Arcane's compact Skyline-256 pixel bird, flipped vertically while his gravity
 * is inverted so a portal visibly turns him upside-down.
 */
export const drawPerformanceBird = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  gravitySign: 1 | -1,
  velocityY: number,
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, gravitySign); // flip when inverted
  const tilt = Math.max(-0.5, Math.min(0.5, velocityY * 0.05)) * gravitySign;
  ctx.rotate(tilt);

  // Body (2013 pixel look: flat blocks, hand-placed).
  ctx.fillStyle = '#e8d27a';
  ctx.fillRect(-9, -7, 18, 14);
  ctx.fillStyle = '#d8b94e';
  ctx.fillRect(-9, 1, 18, 6);
  // Wing.
  ctx.fillStyle = '#c79a34';
  ctx.fillRect(-7, -1, 7, 5);
  // Belly highlight.
  ctx.fillStyle = '#f4e6a8';
  ctx.fillRect(-7, -5, 6, 3);
  // Beak.
  ctx.fillStyle = '#e0663a';
  ctx.fillRect(9, -2, 5, 4);
  // Eye.
  ctx.fillStyle = '#1c2233';
  ctx.fillRect(3, -4, 3, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, -4, 1, 1);
  // Outline.
  ctx.strokeStyle = '#6b5320';
  ctx.lineWidth = 1;
  ctx.strokeRect(-9, -7, 18, 14);
  ctx.restore();
};
