export type ChapterNineDeletableApp =
  | 'amazemart'
  | 'screenshots'
  | 'viewtube'
  | 'about'
  | 'browser'
  | 'social'
  | 'messages';

export type ChapterNineRestorePhase = 'idle' | 'cleanup' | 'blackout' | 'rebooted';

export interface ChapterNineDeletionStage {
  id: 'disposable' | 'evidence' | 'memory';
  label: string;
  apps: readonly ChapterNineDeletableApp[];
}

export const CHAPTER_NINE_DELETION_STAGES: readonly ChapterNineDeletionStage[] = [
  {
    id: 'disposable',
    label: 'Replaceable services',
    apps: ['amazemart', 'screenshots', 'viewtube'],
  },
  {
    id: 'evidence',
    label: 'Investigation records',
    apps: ['about', 'browser'],
  },
  {
    id: 'memory',
    label: 'Personal memory',
    apps: ['social', 'messages'],
  },
] as const;

export const CHAPTER_NINE_DELETABLE_APPS = CHAPTER_NINE_DELETION_STAGES.flatMap(({ apps }) => apps);
export const CHAPTER_NINE_PRE_MESSAGES_APPS = CHAPTER_NINE_DELETABLE_APPS.filter((app) => app !== 'messages');

const RESTORE_PROGRESS: Readonly<Record<number, number>> = {
  0: 8,
  1: 21,
  2: 34,
  3: 47,
  4: 63,
  5: 78,
  6: 96,
  7: 100,
};

export const getChapterNineDeletionStage = (
  deletedIds: readonly string[],
): ChapterNineDeletionStage =>
  CHAPTER_NINE_DELETION_STAGES.find(({ apps }) => apps.some((app) => !deletedIds.includes(app)))
  ?? CHAPTER_NINE_DELETION_STAGES[CHAPTER_NINE_DELETION_STAGES.length - 1];

export const canDeleteChapterNineApp = (
  app: ChapterNineDeletableApp,
  deletedIds: readonly string[],
): boolean => {
  if (deletedIds.includes(app)) return false;
  if (app === 'messages') return isChapterNineMessagesStandoffReady(deletedIds);
  const activeStage = getChapterNineDeletionStage(deletedIds);
  return activeStage.apps.includes(app);
};

export const addDeletedChapterNineApp = (
  deletedIds: readonly string[],
  app: ChapterNineDeletableApp,
): ChapterNineDeletableApp[] =>
  deletedIds.includes(app)
    ? deletedIds.filter((id): id is ChapterNineDeletableApp => CHAPTER_NINE_DELETABLE_APPS.includes(id as ChapterNineDeletableApp))
    : [...deletedIds, app].filter((id): id is ChapterNineDeletableApp => CHAPTER_NINE_DELETABLE_APPS.includes(id as ChapterNineDeletableApp));

export const getChapterNineRestorePercent = (deletedIds: readonly string[]): number =>
  RESTORE_PROGRESS[Math.min(CHAPTER_NINE_DELETABLE_APPS.length, new Set(deletedIds).size)] ?? 8;

export const getChapterNineBatteryPercent = (
  deletedIds: readonly string[],
  messageAttempts = 0,
): number => {
  const deletedCount = new Set(deletedIds).size;
  if (deletedCount >= CHAPTER_NINE_PRE_MESSAGES_APPS.length) return Math.max(0, 1 - Math.max(0, messageAttempts - 2));
  return Math.max(1, 6 - deletedCount);
};

export const hasDeletedChapterNineStage = (
  stageId: ChapterNineDeletionStage['id'],
  deletedIds: readonly string[],
): boolean => {
  const stage = CHAPTER_NINE_DELETION_STAGES.find(({ id }) => id === stageId);
  return stage ? stage.apps.every((app) => deletedIds.includes(app)) : false;
};

export const isChapterNineMessagesStandoffReady = (deletedIds: readonly string[]): boolean =>
  CHAPTER_NINE_PRE_MESSAGES_APPS.every((app) => deletedIds.includes(app));
