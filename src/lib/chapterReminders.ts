import type { GameProgress, PuzzleChapter } from '../types';
import { DEBUG_CHAPTERS, getChapterAdvanceGuide } from './chapterProgress';

export type ReminderChapter = 0 | PuzzleChapter;
export type ChapterReminderStatus = 'completed' | 'current' | 'future';

export interface ChapterReminderRow {
  chapter: ReminderChapter;
  label: string;
  status: ChapterReminderStatus;
  blurPx: number;
}

const INTRO_REMINDER = 'Reach Gate 37 and restore the phone.';

export function getChapterReminderRows(
  progress: Pick<GameProgress, 'currentChapter' | 'completedGame'>,
): readonly ChapterReminderRow[] {
  const rows: Array<{ chapter: ReminderChapter; label: string }> = [
    { chapter: 0, label: INTRO_REMINDER },
    ...DEBUG_CHAPTERS.map(({ id }) => ({
      chapter: id,
      label: getChapterAdvanceGuide(id).objective,
    })),
  ];

  return rows.map((row) => {
    const finalChapterComplete = row.chapter === 10 && progress.completedGame;
    const status: ChapterReminderStatus = row.chapter < progress.currentChapter || finalChapterComplete
      ? 'completed'
      : row.chapter === progress.currentChapter
        ? 'current'
        : 'future';
    const futureDistance = Math.max(0, row.chapter - progress.currentChapter);

    return {
      ...row,
      status,
      blurPx: status === 'future' ? Math.min(2.25, 0.25 + futureDistance * 0.5) : 0,
    };
  });
}
