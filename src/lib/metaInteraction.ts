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
  tableDeg: 68,
} as const;

export type MetaDevicePostureAction = 'rest' | 'wake' | null;

export const getMetaDevicePostureAction = (
  metaViewActive: boolean,
  interactionPending: boolean,
  targetInsidePhone: boolean,
  deviceResting: boolean,
): MetaDevicePostureAction => {
  if (!metaViewActive || interactionPending) return null;
  if (deviceResting) return 'wake';
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
