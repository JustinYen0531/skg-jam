/**
 * Chapter 10 — Arcane's performance (deterministic hard-route choreography)
 * ========================================================================
 *
 * After Gate 40, Arcane takes the controls and *performs*: the smooth re-flight
 * becomes a brutal, Geometry-Dash-flavoured gauntlet — moving pipes, gravity
 * portals (while inverted, a tap drops instead of lifts), non-fatal ceilings for
 * spin sections, extreme jumps, spiked pipes, floating spikes, and hidden
 * ambushes that lunge out. The player only watches him thread all of it.
 *
 * The design order is deliberate and is what makes it bug-proof:
 *
 *   1. Author a deterministic *click pattern* — the exact frames Arcane taps and
 *      the frames gravity flips. Simulate it to get his trajectory.
 *   2. Build the hard route *around that trajectory*: every pipe opening, portal,
 *      spike and ambush is placed relative to where Arcane actually is, with a
 *      known safety margin. The hazards look lethal but the performed line
 *      always clears them.
 *   3. Verify by replay that the click pattern clears the whole route and never
 *      touches a hazard. If it ever did, the build fails a test — Arcane can
 *      never get stuck.
 *
 * Nothing here uses nondeterministic randomness. Because Arcane is performing
 * (not a human at a keyboard) the taps may be frame-tight — that impossibly
 * precise rhythm is the point of the spectacle.
 */

import { CHAPTER_TEN_NODES } from './chapterTenFlight';

export interface PerformanceConfig {
  canvasHeight: number;
  birdRadius: number;
  gravity: number;
  tapImpulse: number;
  maxFall: number;
  /** World scroll speed in px/frame; obstacle x = birdX + (atFrame - frame) * this. */
  worldSpeed: number;
  birdX: number;
  /** Total frames of the performed gauntlet (Gate 40 → score 256). */
  frames: number;
}

export const PERFORMANCE_CONFIG: PerformanceConfig = {
  canvasHeight: 320,
  birdRadius: 12,
  gravity: 0.62,
  tapImpulse: 7.4,
  maxFall: 9.2,
  worldSpeed: 5,
  birdX: 80,
  frames: 1500,
};

export interface PerformanceInputs {
  /** Frames on which Arcane taps. */
  taps: number[];
  /** Frames on which a gravity portal flips his gravity. */
  flips: number[];
}

export interface PerformanceSample {
  frame: number;
  y: number;
  v: number;
  gravitySign: 1 | -1;
  tapped: boolean;
  flipped: boolean;
}

interface PerfState {
  y: number;
  v: number;
  gravitySign: 1 | -1;
}

/**
 * Advance one frame. Order: apply a flip, then a tap (impulse toward the current
 * "up"), then gravity, then move, then clamp to the non-fatal top/bottom edges.
 * Riding an edge is allowed and never fatal — that is what a spin section is.
 */
const stepPerformance = (
  state: PerfState,
  tap: boolean,
  flip: boolean,
  config: PerformanceConfig,
): PerfState => {
  let gravitySign = state.gravitySign;
  if (flip) gravitySign = (gravitySign * -1) as 1 | -1;

  let v = state.v;
  if (tap) v = -gravitySign * config.tapImpulse;
  v += gravitySign * config.gravity;
  // Clamp terminal velocity in whichever direction gravity currently pulls.
  if (gravitySign > 0) v = Math.min(v, config.maxFall);
  else v = Math.max(v, -config.maxFall);

  let y = state.y + v;
  const top = config.birdRadius;
  const bottom = config.canvasHeight - config.birdRadius;
  if (y < top) {
    y = top;
    if (v < 0) v = 0;
  } else if (y > bottom) {
    y = bottom;
    if (v > 0) v = 0;
  }
  return { y, v, gravitySign };
};

// ---------------------------------------------------------------------------
// The authored click pattern (Arcane's choreography)
// ---------------------------------------------------------------------------

export type PerformancePhaseId =
  | 'warmup'
  | 'first-spin'
  | 'extreme-jumps'
  | 'record-climb'
  | 'inverted-corridor'
  | 'ambush-run'
  | 'terminal-approach';

export interface PerformancePhase {
  id: PerformancePhaseId;
  /** Fraction of the total run [0,1) where this phase starts. */
  start: number;
}

/**
 * Phase timeline. Fractions are chosen so the clean upright `record-climb`
 * spans score 184 (t ≈ 0.664) — the "I remember how I hit 184" beat.
 */
export const PERFORMANCE_PHASES: readonly PerformancePhase[] = [
  { id: 'warmup', start: 0.0 },
  { id: 'first-spin', start: 0.14 },
  { id: 'extreme-jumps', start: 0.32 },
  { id: 'record-climb', start: 0.56 }, // spans ~162→196: contains the 184 record
  { id: 'inverted-corridor', start: 0.72 },
  { id: 'ambush-run', start: 0.84 },
  { id: 'terminal-approach', start: 0.93 },
];

export const phaseAtFrame = (frame: number, config: PerformanceConfig): PerformancePhaseId => {
  const t = frame / config.frames;
  let current: PerformancePhaseId = PERFORMANCE_PHASES[0].id;
  for (const phase of PERFORMANCE_PHASES) {
    if (t >= phase.start) current = phase.id;
  }
  return current;
};

/** Map a frame to the story score (42 → 256), so beats land on the nodes. */
export const performanceScoreAtFrame = (frame: number, config: PerformanceConfig): number => {
  const { takeover, terminal } = CHAPTER_TEN_NODES;
  const t = Math.min(1, Math.max(0, frame / config.frames));
  return Math.round((takeover + (terminal - takeover) * t) / 2) * 2;
};

/**
 * A designed, dramatic target altitude for each frame. This is the *shape* of
 * Arcane's line — where the choreography wants him. The controller then taps to
 * follow it. Built only from fixed constants (phase, sines, ramps): deterministic.
 */
const designedTargetY = (frame: number, config: PerformanceConfig): number => {
  const H = config.canvasHeight;
  const mid = H / 2;
  const edgeHi = config.birdRadius + 20;
  const edgeLo = H - config.birdRadius - 20;
  const phase = phaseAtFrame(frame, config);
  const f = frame;
  switch (phase) {
    case 'warmup':
      return mid + Math.sin(f * 0.06) * 34;
    case 'first-spin':
      // Ride toward an edge and hold a fast oscillation (spin feel).
      return edgeHi + Math.abs(Math.sin(f * 0.16)) * 46;
    case 'extreme-jumps':
      // Big, slow swings from near-floor to near-ceiling.
      return mid + Math.sin(f * 0.045) * (mid - edgeHi - 6);
    case 'record-climb':
      // A clean confident climb to a held high line — the memory beat.
      return mid - 40 + Math.sin(f * 0.03) * 12;
    case 'inverted-corridor':
      // Tight, fast zigzag through a narrow band.
      return mid + Math.sin(f * 0.22) * 30;
    case 'ambush-run':
      // Fastest, most varied — sharp shelf changes.
      return mid + Math.sin(f * 0.1) * 60 + Math.sin(f * 0.31) * 18;
    case 'terminal-approach':
    default:
      // Settle toward a low, quiet line before the final dive.
      return mid + 44 + Math.sin(f * 0.05) * 14;
  }
};

/** Frames where a gravity portal flips Arcane. Scripted, deterministic. */
export const performanceFlipFrames = (config: PerformanceConfig): number[] => {
  const at = (fraction: number) => Math.round(config.frames * fraction);
  // Invert for the first spin, restore before the extreme jumps, invert again
  // for the corridor (after the upright 184 climb), restore before the ambushes.
  return [at(0.16), at(0.3), at(0.72), at(0.84)];
};

/**
 * Author the click pattern: simulate Arcane following the designed line under
 * the current gravity, tapping whenever he has drifted to the "falling" side of
 * the target. Flips come from the scripted portals. Returns the inputs and the
 * full trajectory they produce.
 */
export const computePerformance = (
  config: PerformanceConfig = PERFORMANCE_CONFIG,
): { inputs: PerformanceInputs; samples: PerformanceSample[] } => {
  const flipSet = new Set(performanceFlipFrames(config));
  const taps: number[] = [];
  const flips: number[] = [...flipSet].sort((a, b) => a - b);
  const samples: PerformanceSample[] = [];

  let state: PerfState = { y: config.canvasHeight / 2, v: 0, gravitySign: 1 };
  let lastTap = -99;

  for (let frame = 1; frame <= config.frames; frame += 1) {
    const flip = flipSet.has(frame);
    const gAfterFlip = (flip ? -state.gravitySign : state.gravitySign) as 1 | -1;
    const target = designedTargetY(frame, config);

    // Predict next y with no tap; tap if that drifts further from the target on
    // the gravity side. A small deadband + min gap keeps the rhythm crisp
    // instead of a full-speed edge pin.
    const predict = stepPerformance(state, false, flip, config);
    let tap = false;
    const band = 6;
    if (gAfterFlip > 0) {
      if (predict.y > target + band && frame - lastTap >= 4) tap = true;
    } else if (predict.y < target - band && frame - lastTap >= 4) {
      tap = true;
    }

    state = stepPerformance(state, tap, flip, config);
    if (tap) {
      taps.push(frame);
      lastTap = frame;
    }
    samples.push({ frame, y: state.y, v: state.v, gravitySign: state.gravitySign, tapped: tap, flipped: flip });
  }

  return { inputs: { taps, flips }, samples };
};

// ---------------------------------------------------------------------------
// The hard route, built around Arcane's trajectory
// ---------------------------------------------------------------------------

export type HazardKind = 'pipe' | 'floating-spike' | 'ambush' | 'portal';

export interface PipeObstacle {
  kind: 'pipe';
  atFrame: number;
  openingTop: number;
  openingBottom: number;
  /** Vertical bob amplitude of a moving pipe; opening still clears at atFrame. */
  moveAmplitude: number;
  movePhase: number;
  spiked: boolean;
}

export interface FloatingSpikeObstacle {
  kind: 'floating-spike';
  atFrame: number;
  y: number;
  radius: number;
  /** Which edge it points from, for rendering. */
  from: 'top' | 'bottom' | 'free';
}

export interface AmbushObstacle {
  kind: 'ambush';
  atFrame: number;
  from: 'top' | 'bottom';
  /** How far it lunges in from the edge. */
  reach: number;
  radius: number;
}

export interface PortalObstacle {
  kind: 'portal';
  atFrame: number;
}

export type PerformanceObstacle =
  | PipeObstacle
  | FloatingSpikeObstacle
  | AmbushObstacle
  | PortalObstacle;

const sampleAt = (samples: PerformanceSample[], frame: number): PerformanceSample =>
  samples[Math.max(0, Math.min(samples.length - 1, frame - 1))];

/** Arcane's min/max height across the whole window a hazard overlaps his column. */
const birdRangeOver = (
  samples: PerformanceSample[],
  atFrame: number,
  half: number,
): { minY: number; maxY: number } => {
  let minY = Infinity;
  let maxY = -Infinity;
  for (let f = atFrame - half; f <= atFrame + half; f += 1) {
    const y = sampleAt(samples, f).y;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minY, maxY };
};

// Frames a hazard overlaps the bird column, from its physical width. Shared by
// the builder and the verifier so placement and collision use one window.
export const pipeFrameHalfWidth = (config: PerformanceConfig): number =>
  Math.ceil((50 + 2 * config.birdRadius) / config.worldSpeed / 2);
export const pointFrameHalfWidth = (radius: number, config: PerformanceConfig): number =>
  Math.ceil((radius + config.birdRadius) / config.worldSpeed);

/**
 * Build the gauntlet from Arcane's trajectory. Every hazard is positioned clear
 * of his height *range across the frames it overlaps his column* — not just his
 * height at one instant — so a hazard can never catch him mid-move. The result
 * looks lethal but the performed line always threads it.
 */
export const buildPerformanceRoute = (
  samples: PerformanceSample[],
  config: PerformanceConfig = PERFORMANCE_CONFIG,
): PerformanceObstacle[] => {
  const obstacles: PerformanceObstacle[] = [];
  const H = config.canvasHeight;
  const r = config.birdRadius;

  // Portals at the flip frames.
  for (const sample of samples) {
    if (sample.flipped) obstacles.push({ kind: 'portal', atFrame: sample.frame });
  }

  // Tight tracking pipes on a steady cadence. The opening hugs Arcane's height
  // *range* over the crossing; the extra margin tightens through the run.
  const pipeHalf = pipeFrameHalfWidth(config);
  const pipeSpacingFrames = 26;
  for (let frame = 40; frame <= config.frames - 20; frame += pipeSpacingFrames) {
    const { minY, maxY } = birdRangeOver(samples, frame, pipeHalf);
    const t = frame / config.frames;
    const margin = r + 22 - t * 10; // ~34 → ~24 px beyond his own body
    // Let the opening recede off-screen when he hugs an edge: a top face below
    // 0 (or a bottom face beyond H) simply means no pipe segment there, so a
    // ceiling/floor ride can never be clipped by a clamped face.
    const openingTop = minY - margin;
    const openingBottom = maxY + margin;
    const phase = phaseAtFrame(frame, config);
    const moving = phase === 'extreme-jumps' || phase === 'ambush-run';
    obstacles.push({
      kind: 'pipe',
      atFrame: frame,
      openingTop,
      openingBottom,
      moveAmplitude: moving ? 14 : 0, // visual bob only; opening is the true gap
      movePhase: (frame % 37) / 37,
      spiked: t > 0.16,
    });
  }

  // Floating spikes: on the far side of the corridor, clear of his whole range
  // over their window, so they crowd the screen without touching his line.
  const spikeRadius = 9;
  const spikeHalf = pointFrameHalfWidth(spikeRadius, config);
  for (let frame = 55; frame <= config.frames - 30; frame += 19) {
    const { minY, maxY } = birdRangeOver(samples, frame, spikeHalf);
    const centre = (minY + maxY) / 2;
    const clear = r + spikeRadius + 10;
    const towardTop = centre > H / 2;
    const y = towardTop
      ? Math.max(spikeRadius + 2, minY - clear - 8)
      : Math.min(H - spikeRadius - 2, maxY + clear + 8);
    const safe = towardTop ? minY - y : y - maxY;
    if (safe >= clear) {
      obstacles.push({ kind: 'floating-spike', atFrame: frame, y, radius: spikeRadius, from: towardTop ? 'top' : 'bottom' });
    }
  }

  // Ambushes: a plant lunges from the edge Arcane is furthest from, its reach
  // stopping short of his whole range over the strike window.
  const ambushRadius = 12;
  const ambushHalf = pointFrameHalfWidth(ambushRadius, config);
  for (let frame = 120; frame <= config.frames - 40; frame += 63) {
    const { minY, maxY } = birdRangeOver(samples, frame, ambushHalf);
    const distTop = minY - r;
    const distBottom = H - r - maxY;
    const from: 'top' | 'bottom' = distTop > distBottom ? 'top' : 'bottom';
    const clearance = from === 'top' ? distTop : distBottom;
    const reach = clearance - (ambushRadius + 12);
    if (reach >= 18) {
      obstacles.push({ kind: 'ambush', atFrame: frame, from, reach, radius: ambushRadius });
    }
  }

  obstacles.sort((a, b) => a.atFrame - b.atFrame);
  return obstacles;
};

// ---------------------------------------------------------------------------
// Verification — the click pattern must clear the whole route
// ---------------------------------------------------------------------------

export interface HazardZone {
  /** Fatal if the bird centre is inside [yMin,yMax] while |atFrame-frame| small. */
  yMin: number;
  yMax: number;
  atFrame: number;
  /** Half-width in frames during which the hazard overlaps the bird column. */
  frameHalfWidth: number;
  source: HazardKind;
}

/** Flatten obstacles into the fatal zones a passing bird must avoid. */
export const hazardZonesFor = (
  obstacles: PerformanceObstacle[],
  config: PerformanceConfig = PERFORMANCE_CONFIG,
): HazardZone[] => {
  const zones: HazardZone[] = [];
  const r = config.birdRadius;
  const H = config.canvasHeight;
  const pipeHalf = pipeFrameHalfWidth(config);
  for (const obs of obstacles) {
    if (obs.kind === 'pipe') {
      // The opening is the true collision gap; the bob is cosmetic. Solid above
      // and below the opening are the fatal faces.
      zones.push({ yMin: -Infinity, yMax: obs.openingTop + r, atFrame: obs.atFrame, frameHalfWidth: pipeHalf, source: 'pipe' });
      zones.push({ yMin: obs.openingBottom - r, yMax: Infinity, atFrame: obs.atFrame, frameHalfWidth: pipeHalf, source: 'pipe' });
    } else if (obs.kind === 'floating-spike') {
      zones.push({
        yMin: obs.y - obs.radius - r,
        yMax: obs.y + obs.radius + r,
        atFrame: obs.atFrame,
        frameHalfWidth: pointFrameHalfWidth(obs.radius, config),
        source: 'floating-spike',
      });
    } else if (obs.kind === 'ambush') {
      const yMin = obs.from === 'top' ? -Infinity : H - obs.reach - r;
      const yMax = obs.from === 'top' ? obs.reach + r : Infinity;
      zones.push({
        yMin,
        yMax,
        atFrame: obs.atFrame,
        frameHalfWidth: pointFrameHalfWidth(obs.radius, config),
        source: 'ambush',
      });
    }
  }
  return zones;
};

export interface PerformanceVerification {
  clears: boolean;
  reachedEnd: boolean;
  firstHitFrame: number | null;
  firstHitSource: HazardKind | null;
  minClearance: number;
  obstacleCount: number;
  tapCount: number;
  flipCount: number;
}

/**
 * Replay the click pattern against the built route and confirm Arcane never
 * enters a fatal zone. `minClearance` is the tightest px margin over the run —
 * proof the route is genuinely hard yet always cleared.
 */
export const verifyPerformance = (
  samples: PerformanceSample[],
  obstacles: PerformanceObstacle[],
  inputs: PerformanceInputs,
  config: PerformanceConfig = PERFORMANCE_CONFIG,
): PerformanceVerification => {
  const zones = hazardZonesFor(obstacles, config);
  let firstHitFrame: number | null = null;
  let firstHitSource: HazardKind | null = null;
  let minClearance = Infinity;

  for (const sample of samples) {
    for (const zone of zones) {
      if (Math.abs(zone.atFrame - sample.frame) > zone.frameHalfWidth) continue;
      // Distance outside the fatal band (positive = safe margin).
      const above = zone.yMin - sample.y; // safe if bird above the band
      const below = sample.y - zone.yMax; // safe if bird below the band
      const clearance = Math.max(above, below);
      if (clearance < minClearance) minClearance = clearance;
      if (clearance <= 0 && firstHitFrame === null) {
        firstHitFrame = sample.frame;
        firstHitSource = zone.source;
      }
    }
  }

  return {
    clears: firstHitFrame === null,
    reachedEnd: samples.length >= config.frames,
    firstHitFrame,
    firstHitSource,
    minClearance: Number.isFinite(minClearance) ? minClearance : config.canvasHeight,
    obstacleCount: obstacles.length,
    tapCount: inputs.taps.length,
    flipCount: inputs.flips.length,
  };
};

/** Convenience: compute the whole performance (pattern + route + proof) once. */
export interface PerformancePlan {
  config: PerformanceConfig;
  inputs: PerformanceInputs;
  samples: PerformanceSample[];
  obstacles: PerformanceObstacle[];
  verification: PerformanceVerification;
}

export const computePerformancePlan = (
  config: PerformanceConfig = PERFORMANCE_CONFIG,
): PerformancePlan => {
  const { inputs, samples } = computePerformance(config);
  const obstacles = buildPerformanceRoute(samples, config);
  const verification = verifyPerformance(samples, obstacles, inputs, config);
  return { config, inputs, samples, obstacles, verification };
};

/** An obstacle projected to its current on-screen x for the given frame. */
export type PlacedObstacle = PerformanceObstacle & { x: number };

/**
 * Obstacles near the visible window at `frame`, each carrying its live screen x
 * (birdX + (atFrame - frame) * worldSpeed). The renderer draws these directly;
 * because both bird and obstacles index the same frame, what is drawn is exactly
 * the verified, always-cleared gauntlet.
 */
export const getPerformanceObstaclePositions = (
  plan: PerformancePlan,
  frame: number,
  canvasWidth = 640,
): PlacedObstacle[] => {
  const { worldSpeed, birdX } = plan.config;
  const out: PlacedObstacle[] = [];
  for (const obs of plan.obstacles) {
    const x = birdX + (obs.atFrame - frame) * worldSpeed;
    if (x < -80 || x > canvasWidth + 80) continue;
    out.push({ ...obs, x });
  }
  return out;
};

/** Bird sample for a frame, clamped to the run (last pose holds at the end). */
export const performanceSampleAt = (plan: PerformancePlan, frame: number): PerformanceSample =>
  plan.samples[Math.max(0, Math.min(plan.samples.length - 1, frame - 1))];
