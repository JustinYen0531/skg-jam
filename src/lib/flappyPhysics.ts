export const EASY_FLAPPY_SETTINGS = {
  // The world scrolls 25% slower than the previous 6.4 setting. Gates also
  // arrive 25% less often, preserving breathing room instead of crowding them.
  pipeSpeed: 4.8,
  openingSize: 130,
  spawnIntervalFrames: 40,
  maxFallSpeed: 3.2,
} as const;

const FIXED_GATE_HEIGHT_RATIOS = [
  0.32, 0.48, 0.25, 0.58, 0.4, 0.68,
  0.52, 0.3, 0.62, 0.44, 0.22, 0.55,
] as const;

export type FlappyDeathCause = 'gate37' | 'collision' | 'boundary' | 'sequence';

export const nextGate37DeathCount = (
  currentCount: number,
  cause: FlappyDeathCause,
): number => cause === 'gate37' ? currentCount + 1 : currentCount;

const GATE_EDGE_MARGIN = 8;
export const FLAPPY_PIPE_WIDTH = 50;
const GATE_37_PIPE_SPACING = FLAPPY_PIPE_WIDTH + 6;

/**
 * Gate 37 is spawned closer to Gate 36 than ordinary gates. Their visible
 * upper/lower pipe bodies overlap vertically, while the horizontal seam is
 * narrower than the bird, creating a real zig-zag seal instead of an air wall.
 */
export const getGateSpawnX = (gateIndex: number, canvasWidth: number): number => {
  if (gateIndex !== 37) return canvasWidth;

  const ordinarySpacing =
    EASY_FLAPPY_SETTINGS.pipeSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
  return canvasWidth - (ordinarySpacing - GATE_37_PIPE_SPACING);
};

export interface GateHeights {
  topHeight: number;
  bottomHeight: number;
}

export interface GateOpeningBounds {
  top: number;
  bottom: number;
}

export const getFlappyNightMix = (score: number): number => {
  if (score <= 35) return 0;
  if (score >= 37) return 1;
  return (score - 35) / 2;
};

export interface GateVisualStyle {
  variant: 'level1' | 'level2-preview';
  spikeCount: number;
  showRedWarning: boolean;
}

export const getGateVisualStyle = (gateIndex: number): GateVisualStyle => ({
  variant: gateIndex >= 37 ? 'level2-preview' : 'level1',
  spikeCount: gateIndex === 37 ? 4 : 0,
  showRedWarning: false,
});

/**
 * Every ordinary gate uses a fixed height sequence, so retries are learnable
 * and identical. Gate 36 forces the bird through a high opening; Gate 37
 * immediately moves the only normal opening to the floor. The secret bypass
 * intentionally does not use this normal opening.
 */
export const getGateHeights = (
  gateIndex: number,
  canvasHeight: number,
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

  const minPipeHeight = 40;
  const maxPipeHeight = canvasHeight - EASY_FLAPPY_SETTINGS.openingSize - minPipeHeight;
  const ratio = FIXED_GATE_HEIGHT_RATIOS[gateIndex % FIXED_GATE_HEIGHT_RATIOS.length];
  const topHeight = Math.round(minPipeHeight + ratio * (maxPipeHeight - minPipeHeight));

  return {
    topHeight,
    bottomHeight: canvasHeight - EASY_FLAPPY_SETTINGS.openingSize - topHeight,
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
 * Proves that the visible Gate 36 lower pipe and Gate 37 upper pipe form a
 * continuous physical seal in the real canvas. Their vertical bodies overlap,
 * and the horizontal seam between them is narrower than the bird's diameter.
 */
export const isGate37PhysicalBarrierSealed = (
  canvasHeight: number,
  birdRadius: number,
): boolean => {
  const gate36 = getGateHeights(36, canvasHeight);
  const gate37 = getGateHeights(37, canvasHeight);
  const gate36LowerPipeTop = canvasHeight - gate36.bottomHeight;
  const verticalBodiesOverlap = gate36LowerPipeTop < gate37.topHeight;
  const horizontalSeam = GATE_37_PIPE_SPACING - FLAPPY_PIPE_WIDTH;

  return verticalBodiesOverlap && horizontalSeam < birdRadius * 2;
};

/**
 * Normal entry is impossible because the visible geometry is sealed, not
 * because an invisible collider waits inside Gate 37's opening.
 */
export const isGate37NormalRouteImpossible = (
  canvasHeight: number,
  birdRadius: number,
): boolean => isGate37PhysicalBarrierSealed(canvasHeight, birdRadius);

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
