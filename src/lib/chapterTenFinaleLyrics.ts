export interface FinaleLyricCue {
  start: number;
  end: number;
  line: string;
}

const FINALE_LYRIC_LINES = [
  'I made a little world one afternoon',
  'Just squares and skies of painted blue',
  'A bird that never asked to fly',
  'Until somebody pressed “Retry”',
  'I thought a score would make it last',
  'A number no one could surpass',
  'But numbers only learned to grow',
  'While all the names were left below',
  'If every update hides a trace',
  'Would someone still remember this place?',
  'If every version fades away',
  'Will anybody choose to stay?',
  'Don’t chase the highest score tonight',
  'Follow where the echoes hide',
  'Some stories never reach “The End”',
  'Until somebody plays again',
  'If one more heart can hear this song',
  'Then maybe nothing’s truly gone',
  'The sky was never made to keep',
  'Only those who dared to leap',
  'The world moved on to brighter screens',
  'To faster dreams and newer things',
  'But somewhere underneath the code',
  'The little road still waits alone',
  'The final notes were always there',
  'Just no one stayed to hear them end',
  'You found the path',
  'They couldn’t see',
  'The missing line',
  'Inside of me',
  'No cheats',
  'No myths',
  'No perfect run',
  'Just someone',
  'Who finally listened',
] as const;

const CUE_DURATION = 1 / (FINALE_LYRIC_LINES.length + 1);

export const CHAPTER_TEN_FINALE_LYRICS: readonly FinaleLyricCue[] = FINALE_LYRIC_LINES.map((line, index) => ({
  start: index * CUE_DURATION,
  end: (index + 1) * CUE_DURATION,
  line,
}));

export const getChapterTenFinaleLyric = (progress: number | null): FinaleLyricCue | null => {
  if (progress === null || progress < 0 || progress >= 1) return null;
  return CHAPTER_TEN_FINALE_LYRICS.find((cue) => progress >= cue.start && progress < cue.end) ?? null;
};
