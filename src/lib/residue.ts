import type { GameProgress } from '../types';

/**
 * Visual permeation model — how far the old system has leaked back into the
 * modern phone. Purely presentational: nothing reads this to gate progress,
 * and it must never be used in unlock logic.
 *
 * Level 0 — a clean modern phone with a few details that are "not quite
 *           right" (one app icon from another era, a font that does not
 *           belong, a stray migration record).
 * Level 1 — the player has seen the old hardware exist; the residue starts
 *           announcing itself (an old-system notification, a second icon).
 * Level 2 — legacy material has physically arrived; whole widgets and the
 *           dock begin rendering in the dead system's language.
 * Level 3 — the old account is open; the old system quietly reclaims
 *           display authority over parts of the home screen.
 */
export type ResidueLevel = 0 | 1 | 2 | 3;

export function getResidueLevel(progress: GameProgress): ResidueLevel {
  if (progress.loggedIntoAdmin || progress.unlockedCodeRoute) return 3;
  if (progress.deliveredPhone || progress.discoveredSKGHistory) return 2;
  if (progress.watchedVideo) return 1;
  return 0;
}

/** Apps whose data survived the old-device migration. Opening them lets the
 *  old runtime hold the display for a moment (the restore flash). */
export function isMigratedApp(app: string, level: ResidueLevel): boolean {
  if (app === 'flappy') return true;
  if (app === 'screenshots') return level >= 2;
  if (app === 'messages') return level >= 3;
  return false;
}
