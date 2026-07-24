import type { GameProgress, PuzzleChapter } from '../types';

const CHAPTER_CHECKPOINT_STORAGE_KEY = 'game-questing.chapter-checkpoint';
const MANUAL_CHECKPOINT_STORAGE_KEY = 'game-questing.manual-checkpoint';
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
  return saveCheckpoint(progress, CHAPTER_CHECKPOINT_STORAGE_KEY, storage);
};

export const saveManualCheckpoint = (
  progress: GameProgress,
  storage: CheckpointStorage | null = getDefaultStorage(),
): ChapterCheckpoint | null => {
  return saveCheckpoint(progress, MANUAL_CHECKPOINT_STORAGE_KEY, storage);
};

const saveCheckpoint = (
  progress: GameProgress,
  storageKey: string,
  storage: CheckpointStorage | null,
): ChapterCheckpoint | null => {
  if (!storage) return null;

  const checkpoint: ChapterCheckpoint = {
    version: CHAPTER_CHECKPOINT_VERSION,
    savedAt: new Date().toISOString(),
    progress,
  };

  try {
    storage.setItem(storageKey, JSON.stringify(checkpoint));
    return checkpoint;
  } catch {
    return null;
  }
};

export const loadChapterCheckpoint = (
  fallback: GameProgress,
  storage: CheckpointStorage | null = getDefaultStorage(),
): ChapterCheckpoint | null => {
  return loadCheckpoint(fallback, CHAPTER_CHECKPOINT_STORAGE_KEY, storage);
};

export const loadManualCheckpoint = (
  fallback: GameProgress,
  storage: CheckpointStorage | null = getDefaultStorage(),
): ChapterCheckpoint | null => {
  return loadCheckpoint(fallback, MANUAL_CHECKPOINT_STORAGE_KEY, storage);
};

const loadCheckpoint = (
  fallback: GameProgress,
  storageKey: string,
  storage: CheckpointStorage | null,
): ChapterCheckpoint | null => {
  if (!storage) return null;

  try {
    const raw = storage.getItem(storageKey);
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
