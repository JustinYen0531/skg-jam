import type { PuzzleChapter } from '../types';
import { getChapterNineBatteryPercent, type ChapterNineRestorePhase } from './chapterNineDeletion';

const CHAPTER_BATTERY: Readonly<Record<PuzzleChapter, number>> = {
  1: 100,
  2: 91,
  3: 82,
  4: 73,
  5: 64,
  6: 54,
  7: 44,
  8: 31,
  9: 6,
  10: 100,
};

export const getChapterPhoneBatteryPercent = (
  chapter: PuzzleChapter,
  chapterNineRestorePhase: ChapterNineRestorePhase = 'idle',
  deletedIds: readonly string[] = [],
  messageAttempts = 0,
): number => {
  if (chapter !== 9) return CHAPTER_BATTERY[chapter];
  if (chapterNineRestorePhase === 'idle') return CHAPTER_BATTERY[9];
  return getChapterNineBatteryPercent(deletedIds, messageAttempts);
};
