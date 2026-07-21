import type { PuzzleChapter } from '../types';
import { getChapterEnvironment } from './chapterEnvironment';

/**
 * The chapter-advance transition ("evidence collected" cinematic).
 *
 * When the player obtains a chapter's evidence, `currentChapter` steps forward
 * by exactly one. The transition commemorates the chapter that was just
 * completed: EVIDENCE 0N over that chapter's case title. Because it only ever
 * shows a chapter the player has finished, it can never leak a title ahead of
 * its puzzle (docs constraint). The English titles reuse the curated
 * `caseLabel` values (the English realisation of the Chinese debug titles), so
 * there is one source of truth for a chapter's name.
 */

export interface ChapterTransitionData {
  /** The chapter that was just completed (1–10); also the evidence number. */
  completedChapter: PuzzleChapter;
  /** Big label, e.g. "EVIDENCE 01". */
  evidenceLabel: string;
  /** The case title shown beneath the label, e.g. "FIND THE FIRST PLACE". */
  title: string;
}

export function getChapterTransition(completedChapter: PuzzleChapter): ChapterTransitionData {
  return {
    completedChapter,
    evidenceLabel: `EVIDENCE ${completedChapter.toString().padStart(2, '0')}`,
    title: getChapterEnvironment(completedChapter).caseLabel,
  };
}

/**
 * The first return to the Chapter 1 home screen is not evidence completion:
 * it is the player entering the investigation for the first time. Give that
 * arrival its own case-file label so it has the same visual hand-off without
 * falsely claiming that Chapter 1 was already solved.
 */
export function getChapterEntryTransition(chapter: PuzzleChapter): ChapterTransitionData {
  return {
    completedChapter: chapter,
    evidenceLabel: `CASE ${chapter.toString().padStart(2, '0')}`,
    title: getChapterEnvironment(chapter).caseLabel,
  };
}

/**
 * Given the chapter before and after a progress change, return the transition
 * to play — but only for a genuine one-step advance (evidence obtained →
 * next chapter unlocked). First mount (no change), debug multi-jumps, and a
 * restart-loop reset all return null so the cinematic never misfires.
 */
export function getAdvancedChapterTransition(
  previousChapter: PuzzleChapter,
  nextChapter: PuzzleChapter,
): ChapterTransitionData | null {
  if (nextChapter !== previousChapter + 1) return null;
  return getChapterTransition(previousChapter);
}
