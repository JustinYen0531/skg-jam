import type { GameProgress } from '../types';
import { completePuzzleChapter } from './chapterProgress';

export type ChapterOneEvidenceKind = 'legacy-passage' | 'legacy-ipa';

export const getChapterOneEvidenceCount = (progress: GameProgress): number =>
  Number(progress.discoveredLegacyPassage) + Number(progress.discoveredLegacyIpa);

export const collectChapterOneEvidence = (
  progress: GameProgress,
  kind: ChapterOneEvidenceKind,
): GameProgress => {
  if (progress.currentChapter !== 1) return progress;

  const next: GameProgress = kind === 'legacy-passage'
    ? { ...progress, discoveredLegacyPassage: true }
    : { ...progress, discoveredLegacyIpa: true };

  if (!next.discoveredLegacyPassage || !next.discoveredLegacyIpa) return next;

  return completePuzzleChapter(next, 1, {
    watchedVideo: true,
    discoveredLegacyPassage: true,
    discoveredLegacyIpa: true,
  });
};
