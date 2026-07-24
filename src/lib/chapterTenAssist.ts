/**
 * Chapter 10 — route-point assist (deterministic click pattern)
 * =============================================================
 *
 * Collecting all 28 light points before Gate 40 is the one genuinely demanding
 * bit of dexterity in Chapter 10. After five straight failures the game offers
 * a *precise* flap schedule: a set of frames at which pressing Space threads the
 * bird through every point and reaches Gate 40 alive. The offer is worded so the
 * player knows it only helps them clear the chapter and changes nothing in the
 * story:
 *
 *     ENABLE ROUTE GUIDE?
 *     Shows the old timing marks for this run. Story progress is unchanged.
 *
 * This module is the *maths* behind that help. It mirrors the exact pre-Gate-40
 * physics of `FlappyGame` (bird pinned at x=80, gravity 0.18, jump -3.6, world
 * scrolling 4.8 px/frame, one pipe every 40 frames) so a schedule proven here
 * behaves identically in the real loop. It is fully deterministic and verified
 * by simulation in the tests — no browser needed.
 *
 * The rendered on-screen crosses are just this schedule projected forward:
 * a mark for flap frame `f` sits at `birdX + (f - currentFrame) * pipeSpeed`,
 * so it drifts toward the bird at the same speed as the world; the player
 * presses Space as each cross reaches the bird.
 */

import {
  EASY_FLAPPY_SETTINGS,
  GATE_40_INDEX,
  FLAPPY_PIPE_WIDTH,
  getGateHeights,
  getGateSpawnX,
  resolvePipeCollision,
} from './flappyPhysics';
import {
  CHAPTER_TEN_ROUTE_COLLECTION_RADIUS,
  deriveRoutePoints,
  requiredRoutePointCount,
  touchesRoutePoint,
  type RoutePoint,
} from './chapterTenFlight';

export interface AssistWorldConfig {
  canvasWidth: number;
  canvasHeight: number;
  birdX: number;
  birdRadius: number;
  gravity: number;
  jump: number;
  maxFall: number;
  pipeSpeed: number;
  paceFrames: number;
  startY: number;
  collectionRadius: number;
}

/** The exact constants the live Chapter 10 pre-Gate-40 loop runs on. */
export const ASSIST_WORLD: AssistWorldConfig = {
  canvasWidth: 640,
  canvasHeight: 320,
  birdX: 80,
  birdRadius: 12,
  gravity: 0.18,
  jump: -3.6,
  maxFall: EASY_FLAPPY_SETTINGS.maxFallSpeed,
  pipeSpeed: EASY_FLAPPY_SETTINGS.pipeSpeed,
  paceFrames: EASY_FLAPPY_SETTINGS.spawnIntervalFrames,
  startY: 150,
  collectionRadius: CHAPTER_TEN_ROUTE_COLLECTION_RADIUS,
};

/** First-entry guidance from the recovered game, not Arcane's dialogue. */
export const CHAPTER_TEN_WELCOME_LABEL = 'WELCOME, ARC-184.';
export const CHAPTER_TEN_BOOT_STATUS = [
  'LUMEN ARC BACKUP · LINKED',
  'ROUTE RECOVERY · AVAILABLE',
] as const;
export const CHAPTER_TEN_WELCOME_NOTE =
  'Recovered Skyline 256 route data is ready. Follow every light point to open Gate 40.';

/** The exact reassurance wording shown with the offer. */
export const CHAPTER_TEN_ASSIST_PROMPT = 'ENABLE ROUTE GUIDE?';
export const CHAPTER_TEN_ASSIST_NOTE = 'Shows the old timing marks for this run. Story progress is unchanged.';

/** Number of consecutive sub-41 failures that unlocks the offer. */
export const CHAPTER_TEN_ASSIST_FAIL_THRESHOLD = 5;

interface SimPipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  index: number;
  passed: boolean;
}

export interface RouteTarget {
  id: number;
  gateIndex: number;
  /** Frame at which this point is nearest to the bird's x. */
  frame: number;
  /** Canvas Y the bird must reach to collect it. */
  y: number;
}

/**
 * Simulate the pipes alone (no bird) and record, for each route point, the
 * frame at which it passes closest to the bird's x and the Y required there.
 * Deterministic: pipe spawn frames and speeds are fixed.
 */
export const extractRouteTargets = (config: AssistWorldConfig = ASSIST_WORLD): RouteTarget[] => {
  const points = deriveRoutePoints(config.canvasHeight, config.birdRadius);
  const byId = new Map<number, { point: RoutePoint; bestDist: number; frame: number }>();
  for (const point of points) byId.set(point.id, { point, bestDist: Infinity, frame: 0 });

  const pipes: SimPipe[] = [];
  let counter = 0;
  // Run past the moment Gate 40 reaches the bird.
  const lastFrame = config.paceFrames * (GATE_40_INDEX + 2) + 400;
  for (let frame = 1; frame <= lastFrame; frame += 1) {
    if (frame % config.paceFrames === 0) {
      const gateIndex = counter;
      counter += 1;
      const heights = getGateHeights(gateIndex, config.canvasHeight);
      pipes.push({ x: getGateSpawnX(gateIndex, config.canvasWidth), ...heights, index: gateIndex, passed: false });
    }
    for (const pipe of pipes) pipe.x -= config.pipeSpeed;

    for (const pipe of pipes) {
      for (const point of points) {
        if (point.gateIndex !== pipe.index) continue;
        const pointX = pipe.x + point.offsetX;
        const dist = Math.abs(pointX - config.birdX);
        const record = byId.get(point.id)!;
        if (dist < record.bestDist) {
          record.bestDist = dist;
          record.frame = frame;
        }
      }
    }
  }

  return points
    .map((point) => {
      const record = byId.get(point.id)!;
      return { id: point.id, gateIndex: point.gateIndex, frame: record.frame, y: point.y };
    })
    .sort((a, b) => a.frame - b.frame);
};

export interface GuidedRunResult {
  collectedIds: Set<number>;
  collectedCount: number;
  died: boolean;
  reachedGate40: boolean;
  reachedGate40Frame: number | null;
  /** Bird Y at each frame index (1-based; trajectory[f] is Y after frame f). */
  trajectory: number[];
  deathFrame?: number;
  deathInfo?: string;
}

/**
 * Faithfully replay the pre-Gate-40 loop with a fixed set of flap frames. Order
 * of operations mirrors `FlappyGame`: optional flap, gravity + move, spawn,
 * scroll, collect, then non-fatal horizontal / fatal vertical collision.
 */
export const simulateGuidedRoute = (
  flapFrames: Iterable<number>,
  config: AssistWorldConfig = ASSIST_WORLD,
): GuidedRunResult => {
  const flapSet = new Set<number>(flapFrames);
  const points = deriveRoutePoints(config.canvasHeight, config.birdRadius);
  const collected = new Set<number>();
  const pipes: SimPipe[] = [];
  const trajectory: number[] = [0];
  let counter = 0;
  let birdY = config.startY;
  let velocity = 0;
  let died = false;
  let reachedGate40Frame: number | null = null;
  let deathFrame: number | undefined;
  let deathInfo: string | undefined;

  const lastFrame = config.paceFrames * (GATE_40_INDEX + 2) + 400;
  for (let frame = 1; frame <= lastFrame && !died && reachedGate40Frame === null; frame += 1) {
    if (flapSet.has(frame)) velocity = config.jump;
    velocity = Math.min(velocity + config.gravity, config.maxFall);
    birdY += velocity;
    if (birdY < 0) {
      birdY = 0;
      velocity = 0;
    }

    if (frame % config.paceFrames === 0) {
      const gateIndex = counter;
      counter += 1;
      const heights = getGateHeights(gateIndex, config.canvasHeight);
      pipes.push({ x: getGateSpawnX(gateIndex, config.canvasWidth), ...heights, index: gateIndex, passed: false });
    }
    for (const pipe of pipes) pipe.x -= config.pipeSpeed;

    // Collect route points touched this frame.
    for (const pipe of pipes) {
      for (const point of points) {
        if (point.gateIndex !== pipe.index || collected.has(point.id)) continue;
        if (touchesRoutePoint(config.birdX, birdY, pipe.x + point.offsetX, point.y, config.collectionRadius)) {
          collected.add(point.id);
        }
      }
    }

    // Collision, matching the live rules: horizontal contact is non-fatal
    // (and adjusts the bird), a vertical face is fatal, Gate 40 is the goal.
    for (const pipe of pipes) {
      if (pipe.x <= -60) continue;
      const collision = resolvePipeCollision({
        x: config.birdX,
        radius: config.birdRadius,
        previousY: trajectory[frame - 1] ?? config.startY,
        currentY: birdY,
        velocityY: velocity,
        pipeX: pipe.x,
        pipeWidth: FLAPPY_PIPE_WIDTH,
        topHeight: pipe.topHeight,
        bottomHeight: pipe.bottomHeight,
        canvasHeight: config.canvasHeight,
      });
      const safeHorizontal = collision.kind === 'land' || collision.kind === 'ceiling';
      if (safeHorizontal && pipe.index !== GATE_40_INDEX) {
        birdY = collision.y;
        velocity = collision.velocityY;
        continue;
      }
      const overlapsX =
        pipe.x <= config.birdX + config.birdRadius && pipe.x + FLAPPY_PIPE_WIDTH >= config.birdX - config.birdRadius;
      if (overlapsX) {
        if (pipe.index === GATE_40_INDEX) {
          reachedGate40Frame = frame;
          break;
        }
        if (collision.fatal) {
          died = true;
          deathFrame = frame;
          deathInfo = `pipe#${pipe.index} x=${pipe.x.toFixed(1)} birdY=${birdY.toFixed(1)} kind=${collision.kind} top=${pipe.topHeight} bot=${pipe.bottomHeight}`;
          break;
        }
      }
    }

    pipes.splice(0, pipes.length, ...pipes.filter((p) => p.x > -60));
    trajectory[frame] = birdY;
  }

  return {
    collectedIds: collected,
    collectedCount: collected.size,
    died,
    reachedGate40: reachedGate40Frame !== null,
    reachedGate40Frame,
    trajectory,
    deathFrame,
    deathInfo,
  };
};

export interface AssistPlan {
  flapFrames: number[];
  /** One cross per flap: the frame to press and the Y to draw it at. */
  marks: Array<{ frame: number; y: number }>;
  collectedCount: number;
  requiredCount: number;
  success: boolean;
  reachedGate40Frame: number | null;
}

/** Pipes present at a given frame, computed analytically (deterministic). */
const activePipesAt = (frame: number, config: AssistWorldConfig): SimPipe[] => {
  const pipes: SimPipe[] = [];
  const maxIndex = Math.floor(frame / config.paceFrames);
  for (let k = 0; k <= maxIndex; k += 1) {
    const spawnFrame = config.paceFrames * (k + 1);
    if (frame < spawnFrame) continue;
    const x = getGateSpawnX(k, config.canvasWidth) - config.pipeSpeed * (frame - spawnFrame + 1);
    if (x <= -60) continue;
    const heights = getGateHeights(k, config.canvasHeight);
    pipes.push({ x, ...heights, index: k, passed: false });
  }
  return pipes;
};

interface BeamState {
  y: number;
  v: number;
  prevY: number;
  mask: number; // bitset of collected point ids
  count: number; // popcount(mask), cached
  flaps: number[];
  lastFlap: number;
  reachedGate40: number | null;
}

/**
 * One faithful frame for the search: optional flap, gravity + move, collect,
 * then collision. Returns null if this choice kills the bird. Mirrors the order
 * of operations in `simulateGuidedRoute` (and the live loop).
 */
const stepBeam = (
  state: BeamState,
  frame: number,
  doFlap: boolean,
  pointsByGate: Map<number, RoutePoint[]>,
  config: AssistWorldConfig,
): BeamState | null => {
  let v = doFlap ? config.jump : state.v;
  const prevY = state.y;
  v = Math.min(v + config.gravity, config.maxFall);
  let y = state.y + v;
  if (y < 0) {
    y = 0;
    v = 0;
  }

  const pipes = activePipesAt(frame, config);
  let mask = state.mask;
  for (const pipe of pipes) {
    const points = pointsByGate.get(pipe.index);
    if (!points) continue;
    for (const point of points) {
      if (mask & (1 << point.id)) continue;
      if (touchesRoutePoint(config.birdX, y, pipe.x + point.offsetX, point.y, config.collectionRadius)) {
        mask |= 1 << point.id;
      }
    }
  }

  let reachedGate40 = state.reachedGate40;
  for (const pipe of pipes) {
    const collision = resolvePipeCollision({
      x: config.birdX,
      radius: config.birdRadius,
      previousY: prevY,
      currentY: y,
      velocityY: v,
      pipeX: pipe.x,
      pipeWidth: FLAPPY_PIPE_WIDTH,
      topHeight: pipe.topHeight,
      bottomHeight: pipe.bottomHeight,
      canvasHeight: config.canvasHeight,
    });
    const safeHorizontal = collision.kind === 'land' || collision.kind === 'ceiling';
    if (safeHorizontal && pipe.index !== GATE_40_INDEX) {
      y = collision.y;
      v = collision.velocityY;
      continue;
    }
    const overlapsX =
      pipe.x <= config.birdX + config.birdRadius && pipe.x + FLAPPY_PIPE_WIDTH >= config.birdX - config.birdRadius;
    if (overlapsX) {
      if (pipe.index === GATE_40_INDEX) {
        reachedGate40 = frame;
        break;
      }
      if (collision.fatal) return null;
    }
  }

  const count = state.mask === mask ? state.count : popcount(mask);
  return {
    y,
    v,
    prevY,
    mask,
    count,
    flaps: doFlap ? [...state.flaps, frame] : state.flaps,
    lastFlap: doFlap ? frame : state.lastFlap,
    reachedGate40,
  };
};

const popcount = (n: number): number => {
  let count = 0;
  let value = n;
  while (value) {
    value &= value - 1;
    count += 1;
  }
  return count;
};

/**
 * Compute the flap schedule with a deterministic beam search over flap / no-flap
 * at every frame. A single -3.6 flap swings ~36px, while the doubled 34px
 * collection radius — so no simple "aim at the next point" controller can thread
 * 28 fixed (frame, height) windows. The beam keeps the most-collecting survivors
 * each frame (ranked by points gathered, then nearness to the next point) and
 * finds a schedule that gathers them all and reaches Gate 40 alive. The winner
 * is then cross-checked by the independent faithful replay.
 */
export const computeAssistPlan = (
  config: AssistWorldConfig = ASSIST_WORLD,
  beamWidth = 400,
  minFlapGap = 10,
): AssistPlan => {
  const targets = extractRouteTargets(config);
  const required = requiredRoutePointCount();
  const points = deriveRoutePoints(config.canvasHeight, config.birdRadius);
  const pointsByGate = new Map<number, RoutePoint[]>();
  for (const point of points) {
    const list = pointsByGate.get(point.gateIndex) ?? [];
    list.push(point);
    pointsByGate.set(point.gateIndex, list);
  }

  const lastFrame = (targets.length ? targets[targets.length - 1].frame : 0) + config.paceFrames + 200;

  const nextTargetDistance = (state: BeamState, frame: number): number => {
    for (const target of targets) {
      if (target.frame < frame) continue;
      if (state.mask & (1 << target.id)) continue;
      return Math.abs(state.y - target.y);
    }
    return 0;
  };

  let beam: BeamState[] = [
    { y: config.startY, v: 0, prevY: config.startY, mask: 0, count: 0, flaps: [], lastFlap: -minFlapGap, reachedGate40: null },
  ];
  let best: BeamState | null = null;

  for (let frame = 1; frame <= lastFrame; frame += 1) {
    const nextBeam: BeamState[] = [];
    for (const state of beam) {
      if (state.reachedGate40 !== null) {
        if (!best || state.count > best.count) best = state;
        continue;
      }
      // A human presses Space at each cross, so flaps must be spaced far enough
      // apart to be physically pressable — never two on adjacent frames.
      const canFlap = frame - state.lastFlap >= minFlapGap;
      const choices = canFlap ? [false, true] : [false];
      for (const doFlap of choices) {
        const child = stepBeam(state, frame, doFlap, pointsByGate, config);
        if (child) nextBeam.push(child);
      }
    }
    if (nextBeam.length === 0) break;
    // Rank: most points first, then closest to the next uncollected point,
    // then fewer flaps. Deterministic ordering (no randomness).
    nextBeam.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const da = nextTargetDistance(a, frame + 1);
      const db = nextTargetDistance(b, frame + 1);
      if (da !== db) return da - db;
      return a.flaps.length - b.flaps.length;
    });
    // Deduplicate on (mask, coarse y, coarse v) so the beam keeps genuinely
    // distinct survivors instead of collapsing onto one near-identical cluster
    // that all dies at the next gate.
    const seen = new Set<string>();
    const pruned: BeamState[] = [];
    for (const state of nextBeam) {
      const key = `${state.mask}:${Math.round(state.y / 3)}:${Math.round(state.v / 0.6)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pruned.push(state);
      if (pruned.length >= beamWidth) break;
    }
    beam = pruned;
    if (best && best.count >= required) break;
  }

  for (const state of beam) {
    if (state.reachedGate40 !== null && (!best || state.count > best.count)) best = state;
  }

  const flapFrames = best ? best.flaps : [];
  const verification = simulateGuidedRoute(flapFrames, config);
  const trajectory = verification.trajectory;
  const marks = flapFrames.map((frame) => ({ frame, y: trajectory[frame] ?? config.startY }));

  return {
    flapFrames,
    marks,
    collectedCount: verification.collectedCount,
    requiredCount: required,
    success: verification.collectedCount >= required && !verification.died && verification.reachedGate40,
    reachedGate40Frame: verification.reachedGate40Frame,
  };
};

/**
 * Project the plan's crosses to their current on-screen positions. A cross for
 * flap frame `f` is at `birdX + (f - currentFrame) * pipeSpeed`; press when it
 * reaches the bird. Only crosses within the visible canvas are returned.
 */
export const getAssistMarkPositions = (
  plan: AssistPlan,
  currentFrame: number,
  config: AssistWorldConfig = ASSIST_WORLD,
): Array<{ x: number; y: number; frame: number; imminent: boolean }> =>
  plan.marks
    .map((mark) => ({
      x: config.birdX + (mark.frame - currentFrame) * config.pipeSpeed,
      y: mark.y,
      frame: mark.frame,
      imminent: Math.abs(mark.frame - currentFrame) <= 2,
    }))
    .filter((mark) => mark.x >= -20 && mark.x <= config.canvasWidth + 20);
