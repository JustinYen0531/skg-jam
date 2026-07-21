export const META_TAP_TIMING = {
  unfoldMs: 180,
  travelMs: 320,
  pressMs: 110,
  releaseMs: 140,
  settleMs: 260,
} as const;

export const META_CAMERA_PITCH = {
  topDeg: 14,
  bottomDeg: 2,
  restDeg: 5.5,
} as const;

export interface ProjectivePoint {
  x: number;
  y: number;
}

export type ProjectiveQuad = readonly [ProjectivePoint, ProjectivePoint, ProjectivePoint, ProjectivePoint];

export const scaleProjectiveQuad = (quad: ProjectiveQuad, scale: number): ProjectiveQuad => {
  const center = quad.reduce(
    (sum, point) => ({ x: sum.x + point.x / quad.length, y: sum.y + point.y / quad.length }),
    { x: 0, y: 0 },
  );

  return quad.map((point) => ({
    x: center.x + (point.x - center.x) * scale,
    y: center.y + (point.y - center.y) * scale,
  })) as unknown as ProjectiveQuad;
};

export const getProjectiveTransformMatrix = (
  source: ProjectiveQuad,
  target: ProjectiveQuad,
): readonly number[] => {
  const rows: number[][] = [];

  source.forEach((point, index) => {
    const destination = target[index];
    rows.push([
      point.x, 0, point.y, 0, 1, 0,
      -destination.x * point.x, -destination.x * point.y,
      destination.x,
    ]);
    rows.push([
      0, point.x, 0, point.y, 0, 1,
      -destination.y * point.x, -destination.y * point.y,
      destination.y,
    ]);
  });

  for (let column = 0; column < 8; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < 8; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    if (Math.abs(divisor) < 1e-9) throw new Error('Projective quad is degenerate.');
    for (let cell = column; cell < 9; cell += 1) rows[column][cell] /= divisor;
    for (let row = 0; row < 8; row += 1) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let cell = column; cell < 9; cell += 1) rows[row][cell] -= factor * rows[column][cell];
    }
  }

  const [a, b, c, d, e, f, g, h] = rows.map((row) => row[8]);
  return [
    a, b, 0, g,
    c, d, 0, h,
    0, 0, 1, 0,
    e, f, 0, 1,
  ];
};

export const formatProjectiveMatrix3d = (matrix: readonly number[]): string =>
  `matrix3d(${matrix.map((value) => Number(value.toFixed(10))).join(',')})`;

export type MetaDevicePostureAction = 'rest' | 'wake' | null;

export const getMetaDevicePostureAction = (
  metaViewActive: boolean,
  interactionPending: boolean,
  targetInsidePhone: boolean,
  deviceResting: boolean,
): MetaDevicePostureAction => {
  if (!metaViewActive || interactionPending) return null;
  if (deviceResting) return targetInsidePhone ? 'wake' : null;
  return targetInsidePhone ? null : 'rest';
};

export const getMetaCameraPitch = (pointerY: number, sceneHeight: number): number => {
  if (!Number.isFinite(pointerY) || !Number.isFinite(sceneHeight) || sceneHeight <= 0) {
    return META_CAMERA_PITCH.restDeg;
  }

  const normalizedY = Math.min(1, Math.max(0, pointerY / sceneHeight));
  return META_CAMERA_PITCH.topDeg
    + (META_CAMERA_PITCH.bottomDeg - META_CAMERA_PITCH.topDeg) * normalizedY;
};

export interface VirtualKeyResult {
  value: string;
  submit: boolean;
}

export const shouldRevealMetaView = (
  deathsAt40: number,
  leaderboardActuallyOpened: boolean,
): boolean => deathsAt40 >= 2 && leaderboardActuallyOpened;

export const shouldShowMetaScene = (
  metaViewUnlocked: boolean,
  developerToolsOpen: boolean,
  phase: GameProgress['phase'],
): boolean => metaViewUnlocked || developerToolsOpen || phase !== 'intro_game';

export const shouldPersistDeveloperMetaView = (
  developerToolsOpen: boolean,
  currentChapter: number,
): boolean => developerToolsOpen && currentChapter >= 1;

export const canStartMetaInteraction = (
  metaViewActive: boolean,
  interactionPending: boolean,
  reducedMotion: boolean,
): boolean => metaViewActive && !interactionPending && !reducedMotion;

export const applyVirtualKey = (
  currentValue: string,
  key: string,
  maxLength = 64,
): VirtualKeyResult => {
  if (key === 'Enter') return { value: currentValue, submit: true };
  if (key === 'Backspace') return { value: currentValue.slice(0, -1), submit: false };
  if (key.length !== 1 || currentValue.length >= maxLength) {
    return { value: currentValue, submit: false };
  }

  return { value: currentValue + key, submit: false };
};

export const normalizeVirtualKey = (key: string): string | null => {
  if (key === 'Enter' || key === 'Backspace') return key;
  if (key.length !== 1) return null;
  return key;
};

/** Wheel-down reveals lower content, so a touchscreen finger travels upward. */
export const getScrollFingerTravel = (deltaY: number): number => {
  if (deltaY === 0) return 0;
  return deltaY > 0 ? -58 : 58;
};
import type { GameProgress } from '../types';
