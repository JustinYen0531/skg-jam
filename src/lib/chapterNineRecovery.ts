export type ChapterNineProfileChoice = 'child';
export type ChapterNineDownloadState = 'idle' | 'downloading' | 'storage-error';

export interface ChapterNineRecoveryProfile {
  owner: string;
  title: string;
  age: string;
  detail: string;
  score: number;
  packageSize: string;
  signature: string;
}

export const CHAPTER_NINE_CHILD_PROFILE: ChapterNineRecoveryProfile = {
  owner: 'UNRESOLVED CHILD ACCOUNT',
  title: 'Original local player profile',
  age: 'Created 12 years ago',
  detail: 'Preserved before the Silver Kite service migration',
  score: 184,
  packageSize: '18.0 GB',
  signature: 'LUMEN ARC · DEVICE VERIFIED',
};

export const CHAPTER_NINE_PLAYER_PASSWORD = 'ARCANE';
export const CHAPTER_NINE_RECORD_ALIAS = 'ARC184';

export const normalizeChapterNinePassword = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export type ChapterNinePasswordResult = 'accepted' | 'record-alias' | 'rejected';

export const getChapterNinePasswordResult = (password: string): ChapterNinePasswordResult => {
  const normalized = normalizeChapterNinePassword(password);
  if (normalized === CHAPTER_NINE_PLAYER_PASSWORD) return 'accepted';
  if (normalized === CHAPTER_NINE_RECORD_ALIAS) return 'record-alias';
  return 'rejected';
};

export const canRecoverChapterNineChildProfile = (password: string): boolean =>
  getChapterNinePasswordResult(password) === 'accepted';
