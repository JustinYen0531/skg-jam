// Chapter 4 signed-parcel puzzle. A normal-looking delivery archive contains a
// Lumen Arc Recovery Lot whose signed image packet holds the evidence. Three
// screenshots quietly carry the pieces the player needs (the original title,
// the three flight parameters, and the old archive account label). The player has
// to read the pile, notice the three hidden clickable details, and collect all
// three. Nothing marks the right screenshots in advance — that judgement is
// the puzzle.

export type LumenArcClueId = 'title' | 'params' | 'archive';

export const REQUIRED_CLUE_IDS: readonly LumenArcClueId[] = ['title', 'params', 'archive'];

/** The case is only "assembled" once every required detail has been found. */
export const hasAssembledCase = (found: ReadonlySet<LumenArcClueId>): boolean =>
  REQUIRED_CLUE_IDS.every((id) => found.has(id));

/** How many required details are still missing (for the n / 3 counter). */
export const cluesRemaining = (found: ReadonlySet<LumenArcClueId>): number =>
  REQUIRED_CLUE_IDS.filter((id) => !found.has(id)).length;
