export const EASY_FLAPPY_SETTINGS = {
  // Gates arrive twice as often while their on-screen separation stays about
  // the same. This halves time-to-score without turning the screen into a
  // wall of pipes.
  pipeSpeed: 6.4,
  openingSize: 130,
  spawnIntervalFrames: 32,
  maxFallSpeed: 3.2,
} as const;

export type FlappyDeathCause = 'gate37' | 'collision' | 'boundary' | 'sequence';

export const nextGate37DeathCount = (
  currentCount: number,
  cause: FlappyDeathCause,
): number => cause === 'gate37' ? currentCount + 1 : currentCount;

const GATE_EDGE_MARGIN = 24;

export interface GateHeights {
  topHeight: number;
  bottomHeight: number;
}

export interface GateOpeningBounds {
  top: number;
  bottom: number;
}

/**
 * Gate 36 forces the bird through a high opening; Gate 37 immediately moves
 * the only normal opening to the floor. The secret bypass intentionally does
 * not use this normal opening.
 */
export const getGateHeights = (
  gateIndex: number,
  canvasHeight: number,
  randomTopHeight: number,
): GateHeights => {
  if (gateIndex === 36) {
    return {
      topHeight: GATE_EDGE_MARGIN,
      bottomHeight: canvasHeight - EASY_FLAPPY_SETTINGS.openingSize - GATE_EDGE_MARGIN,
    };
  }

  if (gateIndex === 37) {
    return {
      topHeight: canvasHeight - EASY_FLAPPY_SETTINGS.openingSize - GATE_EDGE_MARGIN,
      bottomHeight: GATE_EDGE_MARGIN,
    };
  }

  return {
    topHeight: randomTopHeight,
    bottomHeight: canvasHeight - EASY_FLAPPY_SETTINGS.openingSize - randomTopHeight,
  };
};

export const getGateOpeningBounds = (
  heights: GateHeights,
  canvasHeight: number,
  birdRadius: number,
): GateOpeningBounds => ({
  top: heights.topHeight + birdRadius,
  bottom: canvasHeight - heights.bottomHeight - birdRadius,
});

/**
 * Static proof for the intended normal-player failure at Gate 37. Even at
 * terminal fall speed, the bird cannot descend from the lowest legal point of
 * Gate 36's high opening to the highest legal point of Gate 37's low opening
 * before the next gate reaches it.
 */
export const isGate37NormalRouteImpossible = (
  canvasHeight: number,
  birdRadius: number,
): boolean => {
  const gate36 = getGateOpeningBounds(
    getGateHeights(36, canvasHeight, 0),
    canvasHeight,
    birdRadius,
  );
  const gate37 = getGateOpeningBounds(
    getGateHeights(37, canvasHeight, 0),
    canvasHeight,
    birdRadius,
  );
  const requiredFall = gate37.top - gate36.bottom;
  const maximumFall = EASY_FLAPPY_SETTINGS.maxFallSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;

  return requiredFall > maximumFall;
};

export type PipeCollisionKind = 'none' | 'side' | 'land' | 'ceiling';

export interface PipeCollisionInput {
  x: number;
  radius: number;
  previousY: number;
  currentY: number;
  velocityY: number;
  pipeX: number;
  pipeWidth: number;
  topHeight: number;
  bottomHeight: number;
  canvasHeight: number;
}

export interface PipeCollisionResult {
  kind: PipeCollisionKind;
  fatal: boolean;
  y: number;
  velocityY: number;
}

/**
 * Resolves collision by approach direction rather than treating every overlap
 * as a fatal hit. Vertical surfaces remain dangerous, while horizontal pipe
 * surfaces act as platforms/ceilings that stop the bird without killing it.
 */
export const resolvePipeCollision = ({
  x,
  radius,
  previousY,
  currentY,
  velocityY,
  pipeX,
  pipeWidth,
  topHeight,
  bottomHeight,
  canvasHeight,
}: PipeCollisionInput): PipeCollisionResult => {
  const noCollision: PipeCollisionResult = {
    kind: 'none',
    fatal: false,
    y: currentY,
    velocityY,
  };

  const overlapsHorizontally = x + radius >= pipeX && x - radius <= pipeX + pipeWidth;
  if (!overlapsHorizontally) return noCollision;

  const lowerPipeTop = canvasHeight - bottomHeight;
  const previousBottom = previousY + radius;
  const currentBottom = currentY + radius;
  const previousTop = previousY - radius;
  const currentTop = currentY - radius;

  // A downward crossing of the lower platform always wins over side-impact
  // detection. This prevents a bird edge from being killed just before its
  // centre enters the pipe's X range.
  if (velocityY >= 0 && previousBottom <= lowerPipeTop && currentBottom >= lowerPipeTop) {
    return {
      kind: 'land',
      fatal: false,
      y: lowerPipeTop - radius,
      velocityY: 0,
    };
  }

  // Keep a supported bird stable instead of letting gravity push it into the
  // pipe on the following frame.
  const restingOnLowerPipe =
    velocityY >= 0 &&
    Math.abs(previousBottom - lowerPipeTop) <= 2 &&
    currentBottom >= lowerPipeTop;
  if (restingOnLowerPipe) {
    return {
      kind: 'land',
      fatal: false,
      y: lowerPipeTop - radius,
      velocityY: 0,
    };
  }

  // Upward contact with the underside of the top pipe is non-fatal and pushes
  // the bird gently back into the opening.
  if (velocityY < 0 && previousTop >= topHeight && currentTop <= topHeight) {
    return {
      kind: 'ceiling',
      fatal: false,
      y: topHeight + radius,
      velocityY: 0.5,
    };
  }

  const insideOpening = currentTop >= topHeight && currentBottom <= lowerPipeTop;
  if (insideOpening) return noCollision;

  return {
    kind: 'side',
    fatal: true,
    y: currentY,
    velocityY,
  };
};
