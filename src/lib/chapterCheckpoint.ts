import type { GameProgress, PuzzleChapter } from '../types';

const CHAPTER_CHECKPOINT_STORAGE_KEY = 'game-questing.chapter-checkpoint';
const CHAPTER_CHECKPOINT_VERSION = 1;

interface CheckpointStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ChapterCheckpoint {
  version: typeof CHAPTER_CHECKPOINT_VERSION;
  savedAt: string;
  progress: GameProgress;
}

const getDefaultStorage = (): CheckpointStorage | null => (
  typeof window === 'undefined' ? null : window.localStorage
);

const isPuzzleChapter = (value: unknown): value is PuzzleChapter => (
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10
);

export const saveChapterCheckpoint = (
  progress: GameProgress,
  storage: CheckpointStorage | null = getDefaultStorage(),
): ChapterCheckpoint | null => {
  if (!storage) return null;

  const checkpoint: ChapterCheckpoint = {
    version: CHAPTER_CHECKPOINT_VERSION,
    savedAt: new Date().toISOString(),
    progress,
  };

  storage.setItem(CHAPTER_CHECKPOINT_STORAGE_KEY, JSON.stringify(checkpoint));
  return checkpoint;
};

export const loadChapterCheckpoint = (
  fallback: GameProgress,
  storage: CheckpointStorage | null = getDefaultStorage(),
): ChapterCheckpoint | null => {
  if (!storage) return null;

  try {
    const raw = storage.getItem(CHAPTER_CHECKPOINT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ChapterCheckpoint>;
    if (
      parsed.version !== CHAPTER_CHECKPOINT_VERSION
      || typeof parsed.savedAt !== 'string'
      || !parsed.progress
      || !isPuzzleChapter(parsed.progress.currentChapter)
    ) {
      return null;
    }

    return {
      version: CHAPTER_CHECKPOINT_VERSION,
      savedAt: parsed.savedAt,
      progress: {
        ...fallback,
        ...parsed.progress,
        chapterEightMemoryIds: [...(parsed.progress.chapterEightMemoryIds ?? [])],
        chapterEightRestoredMessageIds: [...(parsed.progress.chapterEightRestoredMessageIds ?? [])],
        chapterNineDeletedAppIds: [...(parsed.progress.chapterNineDeletedAppIds ?? [])],
      },
    };
  } catch {
    return null;
  }
};

export const formatCheckpointTimestamp = (savedAt: string): string => {
  const timestamp = new Date(savedAt);
  if (Number.isNaN(timestamp.getTime())) return 'UNKNOWN';
  return timestamp.toISOString().replace('T', ' ').slice(0, 16);
};
