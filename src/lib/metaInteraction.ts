export const META_TAP_TIMING = {
  travelMs: 260,
  pressMs: 110,
  releaseMs: 180,
} as const;

export interface VirtualKeyResult {
  value: string;
  submit: boolean;
}

export const shouldRevealMetaView = (
  deathsAt37: number,
  leaderboardActuallyOpened: boolean,
): boolean => deathsAt37 >= 2 && leaderboardActuallyOpened;

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
