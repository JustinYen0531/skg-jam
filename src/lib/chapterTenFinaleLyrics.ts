export interface FinaleLyricCue {
  startSeconds: number;
  endSeconds: number;
  line: string;
}

const parseSrtTime = (value: string): number => {
  const match = value.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!match) return Number.NaN;
  const [, hours, minutes, seconds, milliseconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000;
};

export const parseChapterTenFinaleSrt = (srt: string): readonly FinaleLyricCue[] => (
  srt
    .trim()
    .split(/\r?\n\r?\n/)
    .flatMap((block) => {
      const lines = block.split(/\r?\n/);
      const timing = lines[1]?.match(/^(.+?)\s+-->\s+(.+)$/);
      if (!timing || lines.length < 3) return [];
      const startSeconds = parseSrtTime(timing[1]);
      const endSeconds = parseSrtTime(timing[2]);
      if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) return [];
      return [{ startSeconds, endSeconds, line: lines.slice(2).join(' ') }];
    })
);

export const getChapterTenFinaleLyric = (
  currentTime: number,
  cues: readonly FinaleLyricCue[],
): FinaleLyricCue | null => (
  cues.find((cue) => currentTime >= cue.startSeconds && currentTime < cue.endSeconds) ?? null
);

export const getFinaleLyricWordIndex = (
  currentTime: number,
  cue: FinaleLyricCue | null,
  wordCount: number,
): number => {
  if (!cue || wordCount <= 0 || currentTime < cue.startSeconds || currentTime >= cue.endSeconds) return -1;
  const duration = Math.max(0.001, cue.endSeconds - cue.startSeconds);
  const progress = Math.max(0, Math.min(1, (currentTime - cue.startSeconds) / duration));
  return Math.min(wordCount - 1, Math.floor(progress * wordCount));
};
