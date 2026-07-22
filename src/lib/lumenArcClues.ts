// Chapter 4 "extracted screenshots" puzzle. The seller dumped a folder of
// screenshots off a used Lumen Arc handheld; three of them quietly carry the
// pieces the player needs (the original title, the three flight parameters, and
// the developer's number set). The player has to read the pile, notice the
// three that hide a clickable detail, and click all three. Nothing here knows
// which screenshots matter — that judgement is the puzzle.

export type LumenArcClueId = 'title' | 'params' | 'numbers';

export const REQUIRED_CLUE_IDS: readonly LumenArcClueId[] = ['title', 'params', 'numbers'];

/** The case is only "assembled" once every required detail has been found. */
export const hasAssembledCase = (found: ReadonlySet<LumenArcClueId>): boolean =>
  REQUIRED_CLUE_IDS.every((id) => found.has(id));

/** How many required details are still missing (for the n / 3 counter). */
export const cluesRemaining = (found: ReadonlySet<LumenArcClueId>): number =>
  REQUIRED_CLUE_IDS.filter((id) => !found.has(id)).length;
