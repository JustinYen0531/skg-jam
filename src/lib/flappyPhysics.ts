export const EASY_FLAPPY_SETTINGS = {
  // The world scrolls 25% slower than the previous 6.4 setting. Gates also
  // arrive 25% less often, preserving breathing room instead of crowding them.
  pipeSpeed: 4.8,
  openingSize: 130,
  spawnIntervalFrames: 40,
  maxFallSpeed: 3.2,
} as const;

export const SCORE_PER_PIPE = 2;
export const GATE_40_INDEX = 20;

const FIXED_GATE_HEIGHT_RATIOS = [
  0.32, 0.48, 0.25, 0.58, 0.4, 0.68,
  0.52, 0.3, 0.62, 0.44, 0.22, 0.55,
] as const;

export type FlappyDeathCause = 'gate40' | 'collision' | 'boundary' | 'sequence';

export const nextGate40DeathCount = (
  currentCount: number,
  cause: FlappyDeathCause,
): number => cause === 'gate40' ? currentCount + 1 : currentCount;

const GATE_EDGE_MARGIN = 8;
export const FLAPPY_PIPE_WIDTH = 50;
export const GATE_40_CLEAR_GAP = 50;
const GATE_40_PIPE_SPACING = FLAPPY_PIPE_WIDTH + GATE_40_CLEAR_GAP;

/**
 * Gate 40 is closer to Gate 39 than ordinary gates, but the pipes remain
 * visibly separate. The short runway makes the high-to-low transition
 * impossible at the configured fall speed without pretending they are one wall.
 */
export const getGateSpawnX = (gateIndex: number, canvasWidth: number): number => {
  if (gateIndex !== GATE_40_INDEX) return canvasWidth;

  const ordinarySpacing =
    EASY_FLAPPY_SETTINGS.pipeSpeed * EASY_FLAPPY_SETTINGS.spawnIntervalFrames;
  return canvasWidth - (ordinarySpacing - GATE_40_PIPE_SPACING);
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
  if (score <= 37) return 0;
  if (score >= 40) return 1;
  return (score - 37) / 3;
};

export const getScoreAfterPassingGate = (gateIndex: number): number =>
  (gateIndex + 1) * SCORE_PER_PIPE;

export interface CheapTelemetry {
  neuralSync: string;
  flapAccuracy: string;
  birdConfidence: string;
}

/** Decorative fake analytics. They drift deterministically and never affect play. */
export const getCheapTelemetry = (frameCount: number): CheapTelemetry => {
  const tick = Math.floor(Math.max(0, frameCount) / 12);
  const neuralSync = 91.5 + Math.sin(tick * 0.61) * 6.8;
  const flapAccuracy = 18 + Math.sin(tick * 0.43 + 1.7) * 15;
  const birdConfidence = 79 + Math.sin(tick * 0.79 + 0.4) * 18;

  return {
    neuralSync: `${neuralSync.toFixed(1)}%`,
    flapAccuracy: `${flapAccuracy >= 0 ? '+' : ''}${Math.round(flapAccuracy)}%`,
    birdConfidence: `${Math.round(birdConfidence)}%`,
  };
};

export interface GateVisualStyle {
  variant: 'level1' | 'level2-preview';
  spikeCount: number;
  showRedWarning: boolean;
}

export const getGateVisualStyle = (gateIndex: number): GateVisualStyle => ({
  variant: gateIndex >= GATE_40_INDEX ? 'level2-preview' : 'level1',
  spikeCount: gateIndex === GATE_40_INDEX ? 4 : 0,
  showRedWarning: false,
});

/**
 * Every ordinary gate uses a fixed height sequence, so retries are learnable
 * and identical. Gate 39 forces the bird through a high opening; Gate 40
 * immediately moves the only normal opening to the floor. The secret bypass
 * intentionally does not use this normal opening.
 */
export const getGateHeights = (
  gateIndex: number,
  canvasHeight: number,
): GateHeights => {
  if (gateIndex === GATE_40_INDEX - 1) {
    return {
      topHeight: GATE_EDGE_MARGIN,
      bottomHeight: canvasHeight - EASY_FLAPPY_SETTINGS.openingSize - GATE_EDGE_MARGIN,
    };
  }

  if (gateIndex === GATE_40_INDEX) {
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
 * Proves that the visible gap is real, but too short for the maximum configured
 * fall speed to carry the bird from Gate 39's high opening to Gate 40's low one.
 */
export const isGate40NormalRouteImpossible = (
  canvasHeight: number,
  birdRadius: number,
): boolean => {
  const gate39 = getGateOpeningBounds(getGateHeights(GATE_40_INDEX - 1, canvasHeight), canvasHeight, birdRadius);
  const gate40 = getGateOpeningBounds(getGateHeights(GATE_40_INDEX, canvasHeight), canvasHeight, birdRadius);
  const availableFrames = GATE_40_CLEAR_GAP / EASY_FLAPPY_SETTINGS.pipeSpeed;
  const maximumDrop = availableFrames * EASY_FLAPPY_SETTINGS.maxFallSpeed;
  const requiredDrop = gate40.top - gate39.bottom;

  return requiredDrop > maximumDrop;
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
