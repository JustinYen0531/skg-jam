import { getFlappyNightMix, getGateHeights } from './flappyPhysics';

export const ARC_RUN_REPLAY_DURATION_MS = 21_500;
export const ARC_RUN_GATE_40_BARRAGE_MS = 18_550;
export const ARC_RUN_AUTO_PAUSE_MS = 20_200;

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

const CANVAS_HEIGHT = 360;
const BIRD_X = 96;
const FINALE_START_MS = 15_600;
const GATE_SPEED_PX_PER_MS = 0.15;
const PIPE_SPACING = 190;

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

const createContinuousPipeStream = (gateProgress: number): ArcRunReplayPipe[] => {
  const passedGates = Math.floor(gateProgress);
  const fractionalProgress = gateProgress - passedGates;

  // Keep two already-passed gates alive behind the bird. The old replay built
  // a fresh array from the current score, so a pipe vanished exactly when it
  // reached the bird and its replacement appeared at a different height.
  return [-2, -1, 0, 1, 2, 3, 4]
    .map((offset) => {
      const index = passedGates + offset;
      if (index < 0) return null;
      const x = BIRD_X + (offset + 1 - fractionalProgress) * PIPE_SPACING;
      return createPipe(index, x);
    })
    .filter((pipe): pipe is ArcRunReplayPipe => pipe !== null && pipe.x > -PIPE_SPACING);
};

export const getArcRunReplayFrame = (unboundedElapsedMs: number): ArcRunReplayFrame => {
  const elapsedMs = Math.max(0, unboundedElapsedMs) % ARC_RUN_REPLAY_DURATION_MS;
  const finaleElapsed = Math.max(0, elapsedMs - FINALE_START_MS);

  let score: number;
  let pipes: ArcRunReplayPipe[];

  if (elapsedMs < FINALE_START_MS) {
    const gateProgress = (elapsedMs / FINALE_START_MS) * 39;
    score = Math.floor(gateProgress);
    pipes = createContinuousPipeStream(gateProgress);
  } else {
    const gate39X = 430 - finaleElapsed * GATE_SPEED_PX_PER_MS;
    const gate40X = 530 - finaleElapsed * GATE_SPEED_PX_PER_MS;
    const gate41X = 760 - finaleElapsed * GATE_SPEED_PX_PER_MS;
    pipes = [createPipe(39, gate39X), createPipe(40, gate40X), createPipe(41, gate41X)];

    if (gate41X < BIRD_X) score = 42;
    else if (gate40X < BIRD_X) score = 41;
    else if (gate39X < BIRD_X) score = 40;
    else score = 39;
  }

  const ordinaryY = 176 + Math.sin(elapsedMs / 230) * 36 + Math.sin(elapsedMs / 71) * 7;
  const riseToGate39 = easeInOut((elapsedMs - 15_600) / 1_400);
  const highRouteY = ordinaryY + (73 - ordinaryY) * riseToGate39;
  const impossibleDrop = easeInOut((elapsedMs - 17_500) / 1_400);
  const gate40BirdY = highRouteY + (286 - highRouteY) * impossibleDrop;
  const birdY = gate40BirdY;
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
