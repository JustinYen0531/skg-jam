/**
 * Chapter 10 — Skyline 256 final flight (deterministic core)
 * ==========================================================
 *
 * This module owns the *rules* of the last chapter, kept apart from the render
 * loop so the演出 is testable without a browser and can never drift from canon:
 *
 *   player-route  → the player still flies. Before Gate 40 every existing
 *                   flight segment holds one quiet route point. Gate 40 only
 *                   becomes passable once every route point of the current run
 *                   has been collected; missing even one keeps it sealed.
 *   gate40-takeover → the instant the bird clears Gate 40, Arcane takes the
 *                   controls. From here real player input is ignored and the
 *                   flight replays a *saved* altitude track deterministically.
 *   peeling / restored-2013 / memory-184 / coordinate-flight / terminal-256
 *                 → autonomous flight advancing the real score to 256.
 *   complete      → after 256 the finger stops, the bird falls to altitude 0,
 *                   leaves the bottom of the screen, and the run is finished
 *                   (never a death).
 *
 * Nothing here draws on nondeterministic randomness: identical initial state +
 * config always produces the identical trajectory, so the autonomous flight,
 * the Meta finger, and the tests all read one source of truth.
 *
 * Route-point count and Gate 40 geometry are *derived* from the existing
 * `flappyPhysics` module — this file never hard-codes a second, conflicting
 * pipe count or opening height.
 */

import {
  EASY_FLAPPY_SETTINGS,
  GATE_40_INDEX,
  SCORE_PER_PIPE,
  getGateHeights,
  getGateOpeningBounds,
  getScoreAfterPassingGate,
} from './flappyPhysics';

/** Canonical score nodes. Locked — do not rewrite. */
export const CHAPTER_TEN_NODES = {
  /** Score once Gate 40 (pipe index 20) is cleared and Arcane takes over. */
  takeover: getScoreAfterPassingGate(GATE_40_INDEX),
  /** Arcane's real childhood record; identity is confirmed here, exactly once. */
  memory: 184,
  /** Ranking stops and the HUD switches to DISTANCE TO END from here on. */
  distanceHudFrom: 185,
  /** The true end: the black `SERVICE TERMINATED` structure. */
  terminal: 256,
} as const;

/** The overflow readout the score field steps through on the finish screen. */
export const CHAPTER_TEN_SCORE_OVERFLOW: readonly number[] = [256, 65535, -65535];

/**
 * The preserved altitude samples (0–256 space) Noah left on the route. Chapter
 * 10 no longer asks the player to recite or fly them by hand; they are the
 * ghost track the autonomous flight re-flies and the ruler marks it draws.
 */
export const PRESERVED_ALTITUDE_SAMPLES: readonly number[] = [
  184, 172, 149, 133, 121, 118, 126, 143,
];

export type ChapterTenPhase =
  | 'player-route'
  | 'gate40-takeover'
  | 'peeling'
  | 'restored-2013'
  | 'memory-184'
  | 'coordinate-flight'
  | 'terminal-256'
  | 'complete';

/** True only while the human is still allowed to move the bird. */
export const isPlayerControlled = (phase: ChapterTenPhase): boolean =>
  phase === 'player-route';

export interface InputModeOptions {
  reducedMotion?: boolean;
  fullscreenOnly?: boolean;
}

/**
 * Whether a player flap (mouse / Space / touch) may move the bird right now.
 * Control depends only on the phase, never on presentation mode: reduced-motion
 * and fullscreen-only still hand control to Arcane at Gate 40 and still ignore
 * input during the autonomous flight, so neither mode can wedge the run waiting
 * for an input that will never be accepted.
 */
export const shouldAcceptPlayerInput = (
  phase: ChapterTenPhase,
  _options: InputModeOptions = {},
): boolean => isPlayerControlled(phase);

// ---------------------------------------------------------------------------
// Route points before Gate 40
// ---------------------------------------------------------------------------

export interface RoutePoint {
  /** The gate section this point belongs to (0 .. GATE_40_INDEX-1). */
  gateIndex: number;
  /** Sample altitude in the 0–256 space, purely for the preserved-trace look. */
  altitude: number;
  /** Canvas Y, always inside that gate's real opening (a reachable path). */
  y: number;
}

/**
 * One quiet route point per existing flight segment up to (but not through)
 * Gate 40. Each point sits at the centre of that gate's real opening, so the
 * collection lies along a path the player can already fly — it never demands a
 * detour. The count follows `GATE_40_INDEX`; it is never a separate magic
 * number that could fall out of sync with the physics.
 */
export const deriveRoutePoints = (
  canvasHeight: number,
  birdRadius: number,
): RoutePoint[] => {
  const points: RoutePoint[] = [];
  for (let gateIndex = 0; gateIndex < GATE_40_INDEX; gateIndex += 1) {
    const heights = getGateHeights(gateIndex, canvasHeight);
    const opening = getGateOpeningBounds(heights, canvasHeight, birdRadius);
    const y = (opening.top + opening.bottom) / 2;
    const altitude = Math.round(((canvasHeight - y) / canvasHeight) * 256);
    points.push({ gateIndex, altitude, y });
  }
  return points;
};

/** Total route points that must be collected before Gate 40 will open. */
export const requiredRoutePointCount = (): number => GATE_40_INDEX;

/**
 * Gate 40 opens only when the current run has collected every route point.
 * Missing any single one keeps the structural lock closed.
 */
export const isGate40Passable = (
  collectedGateIndices: Iterable<number>,
  totalRequired: number = requiredRoutePointCount(),
): boolean => {
  const collected = new Set<number>();
  for (const index of collectedGateIndices) {
    if (index >= 0 && index < totalRequired) collected.add(index);
  }
  return collected.size >= totalRequired;
};

/**
 * A fresh run always starts with an empty route-point set, so a player can
 * never assemble a pass across several failed attempts.
 */
export const createRunRouteState = (): Set<number> => new Set<number>();

// ---------------------------------------------------------------------------
// Deterministic saved altitude track (autonomous flight)
// ---------------------------------------------------------------------------

/**
 * The saved altitude (0–256 space) Arcane re-flies for a given score. Built
 * only from fixed constants, so it is fully deterministic. It threads the
 * preserved samples through 40→184, eases down toward the terminal boundary
 * across 185→256, and is not consulted once the final dive begins.
 */
export const savedAltitudeForScore = (score: number): number => {
  const { takeover, memory, terminal } = CHAPTER_TEN_NODES;
  if (score <= takeover) return PRESERVED_ALTITUDE_SAMPLES[0];

  if (score <= memory) {
    // Interpolate across the preserved samples between takeover and 184.
    const span = memory - takeover;
    const t = (score - takeover) / span; // 0..1
    const segments = PRESERVED_ALTITUDE_SAMPLES.length - 1;
    const scaled = t * segments;
    const i = Math.min(segments - 1, Math.floor(scaled));
    const frac = scaled - i;
    const a = PRESERVED_ALTITUDE_SAMPLES[i];
    const b = PRESERVED_ALTITUDE_SAMPLES[i + 1];
    return a + (b - a) * frac;
  }

  // 185 → 256: glide from the last sample down toward a low cruising band; the
  // real drop to 0 happens only when the terminal dive starts.
  const t = Math.min(1, (score - memory) / (terminal - memory));
  const start = PRESERVED_ALTITUDE_SAMPLES[PRESERVED_ALTITUDE_SAMPLES.length - 1];
  const end = 48;
  return start + (end - start) * t;
};

// ---------------------------------------------------------------------------
// Autonomous flight state machine
// ---------------------------------------------------------------------------

export interface FlightConfig {
  canvasHeight: number;
  birdRadius: number;
  gravity: number;
  jump: number;
  maxFall: number;
  /** Frames between score increments while cruising (before the 185 sprint). */
  cruisePaceFrames: number;
  /** Frames between score increments after 185, letting the run accelerate. */
  sprintPaceFrames: number;
  scorePerPipe: number;
}

export const DEFAULT_FLIGHT_CONFIG: FlightConfig = {
  canvasHeight: 320,
  birdRadius: 12,
  gravity: 0.18,
  jump: -3.6,
  maxFall: EASY_FLAPPY_SETTINGS.maxFallSpeed,
  cruisePaceFrames: EASY_FLAPPY_SETTINGS.spawnIntervalFrames,
  sprintPaceFrames: Math.round(EASY_FLAPPY_SETTINGS.spawnIntervalFrames * 0.6),
  scorePerPipe: SCORE_PER_PIPE,
};

export interface FlightState {
  birdY: number;
  velocityY: number;
  /** Frames elapsed since Arcane took over at Gate 40. */
  frame: number;
  score: number;
  phase: ChapterTenPhase;
  memoryMatched: boolean;
  descending: boolean;
  exitedBottom: boolean;
  completed: boolean;
  flaps: number;
}

export type FlightEvent = 'flap' | 'memory-184' | 'terminal-256' | 'exit-bottom' | 'complete';

export interface FlightStep {
  state: FlightState;
  events: FlightEvent[];
}

/**
 * Start of the autonomous flight — the moment Gate 40 is cleared. `birdY` is
 * where the player left the bird; everything after is deterministic.
 */
export const createFlightState = (
  startY: number,
  config: FlightConfig = DEFAULT_FLIGHT_CONFIG,
): FlightState => ({
  birdY: startY,
  velocityY: 0,
  frame: 0,
  score: CHAPTER_TEN_NODES.takeover,
  phase: 'gate40-takeover',
  memoryMatched: false,
  descending: false,
  exitedBottom: false,
  completed: false,
  flaps: 0,
});

/** Canvas Y of a 0–256 altitude for this config. Altitude 0 is the bottom. */
const altitudeToY = (altitude: number, canvasHeight: number): number =>
  canvasHeight - (altitude / 256) * canvasHeight;

/** Score derived purely from frames since takeover — deterministic pacing. */
const scoreForFrame = (frame: number, config: FlightConfig): number => {
  const { takeover, memory, terminal } = CHAPTER_TEN_NODES;
  // Walk the score up one pipe at a time, changing cadence at the 185 sprint.
  let score = takeover;
  let f = 0;
  let guard = 0;
  while (f < frame && score < terminal && guard < 100000) {
    const pace = score >= memory ? config.sprintPaceFrames : config.cruisePaceFrames;
    f += pace;
    if (f <= frame) score += config.scorePerPipe;
    guard += 1;
  }
  return Math.min(terminal, score);
};

/**
 * Advance the autonomous flight by exactly one frame. Pure: it reads `state`
 * and returns the next state plus the events that fired this frame. The `flap`
 * event is the single source both the bird's rise and the Meta finger tap
 * consume, so they can never drift onto separate clocks.
 */
export const stepFlight = (
  state: FlightState,
  config: FlightConfig = DEFAULT_FLIGHT_CONFIG,
): FlightStep => {
  if (state.completed) return { state, events: [] };

  const events: FlightEvent[] = [];
  const next: FlightState = { ...state, frame: state.frame + 1 };
  const { terminal, memory } = CHAPTER_TEN_NODES;

  // Score follows the frame count until the terminal boundary is reached.
  const priorScore = state.score;
  next.score = state.descending ? state.score : scoreForFrame(next.frame, config);

  if (!state.memoryMatched && priorScore < memory && next.score >= memory) {
    next.memoryMatched = true;
    events.push('memory-184');
  }
  if (priorScore < terminal && next.score >= terminal) {
    events.push('terminal-256');
    next.descending = true; // Arcane's finger stops; gravity takes the bird.
  }

  const flapping = !next.descending && next.score < terminal;
  if (flapping) {
    // Deterministic re-flight of the saved track: flap whenever the bird has
    // sunk to or below its saved altitude and is no longer rising.
    const targetY = altitudeToY(savedAltitudeForScore(next.score), config.canvasHeight);
    const willFlap = next.velocityY >= 0 && next.birdY >= targetY;
    if (willFlap) {
      next.velocityY = config.jump;
      next.flaps = state.flaps + 1;
      events.push('flap');
    }
  }

  // Integrate gravity. During the dive there is no ceiling clamp — the bird is
  // allowed to leave the bottom of the screen.
  next.velocityY = Math.min(next.velocityY + config.gravity, config.maxFall);
  next.birdY = next.birdY + next.velocityY;
  if (!next.descending && next.birdY < 0) {
    next.birdY = 0;
    next.velocityY = 0;
  }

  if (next.descending && !next.exitedBottom) {
    if (next.birdY - config.birdRadius > config.canvasHeight) {
      next.exitedBottom = true;
      next.completed = true;
      events.push('exit-bottom');
      events.push('complete');
    }
  }

  next.phase = deriveAutonomousPhase(next);
  return { state: next, events };
};

/** Phase implied purely by an autonomous flight state (never player-route). */
export const deriveAutonomousPhase = (state: FlightState): ChapterTenPhase => {
  if (state.completed || state.exitedBottom) return 'complete';
  if (state.descending || state.score >= CHAPTER_TEN_NODES.terminal) return 'terminal-256';
  const s = state.score;
  if (s < CHAPTER_TEN_NODES.takeover + 8) return 'gate40-takeover';
  if (s < 120) return 'peeling';
  if (s < CHAPTER_TEN_NODES.memory) return 'restored-2013';
  if (s < CHAPTER_TEN_NODES.distanceHudFrom) return 'memory-184';
  return 'coordinate-flight';
};

/**
 * Run the autonomous flight to completion and collect a deterministic record.
 * Used by both a fast-forward path and the tests.
 */
export interface FlightRunResult {
  frames: number;
  flaps: number;
  finalState: FlightState;
  memoryFrame: number | null;
  terminalFrame: number | null;
  completeFrame: number | null;
  flapFrames: number[];
}

export const runFlight = (
  startY: number,
  config: FlightConfig = DEFAULT_FLIGHT_CONFIG,
  maxFrames = 60000,
): FlightRunResult => {
  let state = createFlightState(startY, config);
  let memoryFrame: number | null = null;
  let terminalFrame: number | null = null;
  let completeFrame: number | null = null;
  const flapFrames: number[] = [];

  for (let i = 0; i < maxFrames && !state.completed; i += 1) {
    const { state: nextState, events } = stepFlight(state, config);
    state = nextState;
    if (events.includes('flap')) flapFrames.push(state.frame);
    if (memoryFrame === null && events.includes('memory-184')) memoryFrame = state.frame;
    if (terminalFrame === null && events.includes('terminal-256')) terminalFrame = state.frame;
    if (completeFrame === null && events.includes('complete')) completeFrame = state.frame;
  }

  return {
    frames: state.frame,
    flaps: state.flaps,
    finalState: state,
    memoryFrame,
    terminalFrame,
    completeFrame,
    flapFrames,
  };
};

/** Distance-to-end readout shown from score 185 onward. */
export const distanceToEnd = (score: number): number =>
  Math.max(0, CHAPTER_TEN_NODES.terminal - score);
