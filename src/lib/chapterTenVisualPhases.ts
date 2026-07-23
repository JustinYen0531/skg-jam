/**
 * Chapter 10 — visual peeling & abstraction (presentation only)
 * =============================================================
 *
 * Everything here decides how the final flight *looks* as the twelve years of
 * cheap AI packaging peel away to reveal the 2013 Skyline 256 build, and then
 * how that pixel game abstracts into preserved motion data on the way to 256.
 *
 * Hard rule: none of these functions touch collision. `getCollisionGeometry`
 * returns the same box for every score and phase, and the peeling/geometry
 * curves feed rendering only. A test pins this so an art change can never
 * silently move a hitbox.
 */

import { CHAPTER_TEN_NODES, ChapterTenPhase } from './chapterTenFlight';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

// ---------------------------------------------------------------------------
// Canonical readouts (locked text)
// ---------------------------------------------------------------------------

/** The restrained 184 identity check. Order is part of the beat. */
export const CHAPTER_TEN_MEMORY_LINES: readonly string[] = [
  'LOCAL RECORD MATCH',
  'ARC_184',
  'ARCANE KADE',
  '12 YEARS AGO',
];

/** The preserved finish screen, kept verbatim. */
export const CHAPTER_TEN_COMPLETE_LINES: readonly string[] = [
  'SKYLINE COMPLETE',
  'THANK YOU FOR PLAYING',
];

/** Label on the final black structure at 256. */
export const CHAPTER_TEN_TERMINAL_LABEL = 'SERVICE TERMINATED';

/** Faint developer residue that surfaces as 184 approaches (never a wall of text). */
export const CHAPTER_TEN_DEV_RESIDUE: readonly string[] = [
  'PIPE_A_040',
  'COLLIDER: TRUE',
  'LEGACY_ASSET_MISSING',
];

// ---------------------------------------------------------------------------
// Continuous progress curves
// ---------------------------------------------------------------------------

/** 0 at Gate 40, 1 at the 184 memory node — drives the whole peel. */
export const getPeelProgress = (score: number): number =>
  clamp01((score - CHAPTER_TEN_NODES.takeover) / (CHAPTER_TEN_NODES.memory - CHAPTER_TEN_NODES.takeover));

export type PeelStage = 'shell-cracking' | 'restored-2013' | 'dev-residue';

/**
 * The three continuous peel bands of 40→184:
 *   A shell-cracking — cheap layer still present but failing.
 *   B restored-2013  — the original pixel build is the main image (the longest,
 *                      most complete nostalgia dwell).
 *   C dev-residue    — preservation layer and developer marks surface near 184.
 */
export const getPeelStage = (score: number): PeelStage => {
  const p = getPeelProgress(score);
  if (p < 0.33) return 'shell-cracking';
  if (p < 0.82) return 'restored-2013';
  return 'dev-residue';
};

/** How much of the cheap AI shell is still visible (1 at Gate 40 → 0 by ~mid). */
export const getShellOpacity = (score: number): number => {
  const p = getPeelProgress(score);
  // Stickers peel gradually; the shell is essentially gone by the restored dwell.
  return clamp01(1 - p / 0.45);
};

/** How present the original 2013 pixel build is (0 at Gate 40 → 1 by mid). */
export const getPixelPresence = (score: number): number => {
  const p = getPeelProgress(score);
  return clamp01((p - 0.12) / 0.4);
};

/** 0 before 184, 1 at the terminal — drives bird→data-point abstraction. */
export const getGeometryProgress = (score: number): number =>
  clamp01((score - CHAPTER_TEN_NODES.memory) / (CHAPTER_TEN_NODES.terminal - CHAPTER_TEN_NODES.memory));

export type BirdForm = 'pixel-bird' | 'outlined-bird' | 'outline' | 'data-point' | 'coordinate';

/** The bird's continuous simplification from pixel sprite to a coordinate. */
export const getBirdForm = (score: number): BirdForm => {
  if (score < CHAPTER_TEN_NODES.memory) return 'pixel-bird';
  const g = getGeometryProgress(score);
  if (g < 0.2) return 'pixel-bird';
  if (g < 0.45) return 'outlined-bird';
  if (g < 0.7) return 'outline';
  if (g < 0.95) return 'data-point';
  return 'coordinate';
};

export type ObstacleForm = 'pixel' | 'pixel-with-box' | 'outline' | 'data-boundary';

/** Obstacles fade from pixel structures to bare data boundaries in step. */
export const getObstacleForm = (score: number): ObstacleForm => {
  if (score < CHAPTER_TEN_NODES.memory) {
    return getPeelStage(score) === 'dev-residue' ? 'pixel-with-box' : 'pixel';
  }
  const g = getGeometryProgress(score);
  if (g < 0.35) return 'pixel-with-box';
  if (g < 0.75) return 'outline';
  return 'data-boundary';
};

export type HudMode = 'rank' | 'distance-to-end';

/**
 * Before 185 the HUD can still show ranking; from 185 the board rank is gone
 * and only DISTANCE TO END remains.
 */
export const getHudMode = (score: number): HudMode =>
  score >= CHAPTER_TEN_NODES.distanceHudFrom ? 'distance-to-end' : 'rank';

/**
 * As 256 nears, colour drains toward black / grey / old white plus a single
 * low-saturation warning accent. 0 well before the terminal, 1 at 256.
 */
export const getTerminalDrain = (score: number): number =>
  clamp01((score - (CHAPTER_TEN_NODES.terminal - 40)) / 40);

// ---------------------------------------------------------------------------
// Collision invariance
// ---------------------------------------------------------------------------

export interface CollisionGeometry {
  birdRadius: number;
  pipeWidth: number;
}

/**
 * The collision box the whole chapter uses. It takes `score` only to prove, by
 * signature, that it *could* have varied it and deliberately does not: the
 * return value is identical for every score and every visual phase. Rendering
 * peels; the hitbox never moves.
 */
export const getCollisionGeometry = (_score: number): CollisionGeometry => ({
  birdRadius: 12,
  pipeWidth: 50,
});

/** Convenience: is this phase one where the player may still steer? */
export const isAutonomousPhase = (phase: ChapterTenPhase): boolean =>
  phase !== 'player-route';
