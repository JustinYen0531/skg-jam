import { getFlappyNightMix, getGateHeights } from './flappyPhysics';

export const ARC_RUN_REPLAY_DURATION_MS = 14_500;
export const ARC_RUN_GATE_40_BARRAGE_MS = 10_700;

export interface ArcRunReplayPipe {
  index: number;
  x: number;
  topHeight: number;
  bottomHeight: number;
}

export interface ArcRunReplayFrame {
  elapsedMs: number;
  score: number;
  birdY: number;
  birdAngle: number;
  nightMix: number;
  barrageActive: boolean;
  pipes: ArcRunReplayPipe[];
}

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const BIRD_X = 96;
const FINALE_START_MS = 7_500;
const GATE_SPEED_PX_PER_MS = 0.15;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const easeInOut = (value: number): number => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const createPipe = (index: number, x: number): ArcRunReplayPipe => ({
  index,
  x,
  ...getGateHeights(index, CANVAS_HEIGHT),
});

export const getArcRunReplayFrame = (unboundedElapsedMs: number): ArcRunReplayFrame => {
  const elapsedMs = Math.max(0, unboundedElapsedMs) % ARC_RUN_REPLAY_DURATION_MS;
  const finaleElapsed = Math.max(0, elapsedMs - FINALE_START_MS);

  let score: number;
  let pipes: ArcRunReplayPipe[];

  if (elapsedMs < FINALE_START_MS) {
    score = Math.min(37, Math.floor((elapsedMs / FINALE_START_MS) * 38));
    const spacing = 190;
    const offset = (elapsedMs * 0.24) % spacing;
    pipes = [0, 1, 2, 3].map((slot) => {
      const index = Math.min(38, score + slot);
      return createPipe(index, CANVAS_WIDTH - offset + (slot - 1) * spacing);
    });
  } else {
    const gate39X = 520 - finaleElapsed * GATE_SPEED_PX_PER_MS;
    const gate40X = 620 - finaleElapsed * GATE_SPEED_PX_PER_MS;
    const gate41X = 850 - finaleElapsed * GATE_SPEED_PX_PER_MS;
    pipes = [createPipe(39, gate39X), createPipe(40, gate40X), createPipe(41, gate41X)];

    if (gate41X < BIRD_X) score = 42;
    else if (gate40X < BIRD_X) score = 41;
    else if (gate39X < BIRD_X) score = 40;
    else score = elapsedMs < 9_000 ? 38 : 39;
  }

  const ordinaryY = 176 + Math.sin(elapsedMs / 230) * 36 + Math.sin(elapsedMs / 71) * 7;
  const riseToGate39 = easeInOut((elapsedMs - 7_500) / 1_900);
  const highRouteY = ordinaryY + (73 - ordinaryY) * riseToGate39;
  const impossibleDrop = easeInOut((elapsedMs - 10_250) / 1_050);
  const birdY = highRouteY + (286 - highRouteY) * impossibleDrop;
  const birdAngle = impossibleDrop > 0 && impossibleDrop < 1
    ? 0.58
    : Math.sin(elapsedMs / 180) * 0.08;

  return {
    elapsedMs,
    score,
    birdY,
    birdAngle,
    nightMix: getFlappyNightMix(score),
    barrageActive: elapsedMs >= ARC_RUN_GATE_40_BARRAGE_MS,
    pipes,
  };
};
