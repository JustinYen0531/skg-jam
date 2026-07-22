export type PublicLeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  kind: 'featured' | 'named' | 'anonymous' | 'player';
  rank: number;
};

const NAMED_PLAYERS = [
  { id: 'arc-184', name: 'ARC_184', score: 184, kind: 'featured' as const },
  { id: 'neon-nimbus', name: 'NeonNimbus', score: 62, kind: 'named' as const },
  { id: 'pipe-dreamer', name: 'PipeDreamer', score: 51, kind: 'named' as const },
  { id: 'glitch-gull', name: 'GlitchGull', score: 44, kind: 'named' as const },
  { id: 'modded-flap', name: 'Modded_Flap', score: 43, kind: 'named' as const },
  { id: 'lumen-hacker', name: 'LumenHacker', score: 41, kind: 'named' as const },
] as const;

const ANONYMOUS_LABELS = ['Anonymous Visitor', 'Guest Player', 'Unnamed Flyer'] as const;

const getAnonymousScore = (index: number): number => {
  if (index < 3) return 40;
  if (index < 33) return 39;
  return index % 3 === 0 ? 37 : 38;
};

export const createPublicLeaderboard = (
  playerBestScore: number,
  anonymousCount = 48,
): PublicLeaderboardEntry[] => {
  const safePlayerScore = Math.max(0, Math.floor(playerBestScore));
  const anonymousEntries = Array.from({ length: anonymousCount }, (_, index) => ({
    id: `anonymous-${index + 1}`,
    name: `${ANONYMOUS_LABELS[index % ANONYMOUS_LABELS.length]} ${String(index + 1).padStart(4, '0')}`,
    score: getAnonymousScore(index),
    kind: 'anonymous' as const,
  }));

  return [
    ...NAMED_PLAYERS,
    { id: 'current-player', name: 'YOU · LOCAL PLAYER', score: safePlayerScore, kind: 'player' as const },
    ...anonymousEntries,
  ]
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
};

export const calculateBeatPercentage = (playerBestScore: number): number => {
  const score = Math.max(0, playerBestScore);
  if (score === 0) return 1;
  if (score < 40) return Number((15 + (score / 40) * 78).toFixed(1));
  if (score === 40) return 96.8;
  if (score < 184) return Number((97 + ((score - 40) / 144) * 2.8).toFixed(1));
  return 99.99;
};

export const isSuspiciousLeaderboardEntry = (entry: PublicLeaderboardEntry): boolean =>
  entry.rank <= 6 && entry.kind !== 'player';
