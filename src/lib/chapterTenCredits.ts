export interface ArcaneFlightReflection {
  score: number;
  lines: readonly string[];
}

export const ARCANE_FLIGHT_REFLECTIONS: readonly ArcaneFlightReflection[] = [
  { score: 58, lines: ['I thought I wanted proof.'] },
  { score: 88, lines: ['Then I thought I wanted the score.'] },
  { score: 120, lines: ['I deleted everything that remembered them.', 'Just to reach this.'] },
  { score: 150, lines: ['No. Not everything.', 'I remember.'] },
  { score: 174, lines: ['You left me a route, Dad.', 'You still made me fly it.'] },
];

export interface FlightCredit {
  startScore: number;
  endScore: number;
  text: string;
  lane: 'upper' | 'lower';
}

export const CHAPTER_TEN_FLIGHT_CREDITS: readonly FlightCredit[] = [
  { startScore: 50, endScore: 72, text: 'ORIGINAL GAME DIRECTION · NOAH KADE', lane: 'upper' },
  { startScore: 76, endScore: 98, text: 'WORLD & ENDING · MARA KADE', lane: 'lower' },
  { startScore: 104, endScore: 126, text: 'STUDIO CO-FOUNDER · ELIAS VALE', lane: 'upper' },
  { startScore: 132, endScore: 154, text: 'FOR THE LUMEN ARC PLAYERS', lane: 'lower' },
  { startScore: 160, endScore: 178, text: 'FOR EVERYONE WHO KEPT A COPY', lane: 'upper' },
  { startScore: 188, endScore: 202, text: 'ORIGINAL BUILD · SILVER KITE GAMES', lane: 'lower' },
  { startScore: 204, endScore: 218, text: 'FIRST HUMAN RECORD · ARC_184', lane: 'upper' },
  { startScore: 220, endScore: 234, text: 'LOCAL PLAYER · ARCANE KADE', lane: 'lower' },
  { startScore: 236, endScore: 248, text: 'ARCHIVE WITNESS · YOU', lane: 'upper' },
  { startScore: 250, endScore: 255, text: 'THANK YOU FOR FOLLOWING THE ROUTE', lane: 'lower' },
];

export const getFlightCreditsAtScore = (score: number): readonly FlightCredit[] =>
  CHAPTER_TEN_FLIGHT_CREDITS.filter(
    (credit) => score >= credit.startScore && score <= credit.endScore,
  );

export const getCompletionScoreAtFrame = (frame: number): number => {
  if (frame < 24) return 256;
  if (frame < 144) {
    const progress = (frame - 24) / 120;
    return Math.round(256 + (65535 - 256) * progress * progress);
  }
  if (frame < 156) return 65535;
  return -65535;
};

export const NOAH_FINAL_TRANSMISSION: readonly string[] = [
  'Arcane—',
  'If this page opened, you found the route without me giving you the answer.',
  'Mara chose 184, 40, and 256. I only turned the places she loved into rules the game could remember.',
  'The negative record was never a failure. The counter overflowed because I reached an ending the leaderboard was not built to hold.',
  'I hid the last route because an ending should still belong to the person who reaches it.',
  'Devices stop working. Stores close. Servers disappear. None of that means the people who played were imaginary.',
  'You reached the end. For a little while longer, the game exists.',
  '— Noah Kade',
];
