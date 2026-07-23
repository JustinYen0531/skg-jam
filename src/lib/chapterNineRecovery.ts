export type ChapterNineProfileChoice = 'noah' | 'impostor' | 'child';
export type ChapterNineDownloadState = 'idle' | 'downloading' | 'storage-error';

export interface ChapterNineRecoveryProfile {
  id: ChapterNineProfileChoice;
  owner: string;
  title: string;
  age: string;
  detail: string;
}

export const CHAPTER_NINE_RECOVERY_PROFILES: readonly ChapterNineRecoveryProfile[] = [
  {
    id: 'noah',
    owner: 'NOAH_KADE',
    title: 'Developer profile',
    age: 'Last signed 12 years ago',
    detail: 'Build authority · Silver Kite Games',
  },
  {
    id: 'impostor',
    owner: 'ARC_184',
    title: 'Public capture mirror',
    age: 'Created after the original record',
    detail: 'ViewTube-linked alias · no device signature',
  },
  {
    id: 'child',
    owner: 'UNKNOWN CHILD',
    title: 'Local player record',
    age: 'Created 12 years ago',
    detail: 'Lumen Arc device signature · score 184',
  },
] as const;

export const CHAPTER_NINE_PLAYER_PASSWORD = 'ARCANE184';

export const normalizeChapterNinePassword = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const canRecoverChapterNineChildProfile = (
  profile: ChapterNineProfileChoice | null | undefined,
  password: string,
): boolean =>
  profile === 'child'
  && normalizeChapterNinePassword(password) === CHAPTER_NINE_PLAYER_PASSWORD;
