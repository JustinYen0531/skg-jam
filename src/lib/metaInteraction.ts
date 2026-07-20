export const META_TAP_TIMING = {
  unfoldMs: 180,
  travelMs: 320,
  pressMs: 110,
  releaseMs: 140,
  settleMs: 260,
} as const;

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
): boolean => metaViewUnlocked || developerToolsOpen;

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
