export const EASY_FLAPPY_SETTINGS = {
  pipeSpeed: 3.2,
  openingSize: 130,
  spawnIntervalFrames: 64,
} as const;

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
