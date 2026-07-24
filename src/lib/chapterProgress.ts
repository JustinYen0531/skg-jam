import type { ActiveApp, GameProgress, PuzzleChapter } from '../types';
import { getChapterEightMemory, NOAH_ARCHIVE_FRAGMENTS } from './chapterEightArchive';
import { CHAPTER_NINE_DELETABLE_APPS } from './chapterNineDeletion';
import { hasAllMaraNumberClues } from './chapterSevenSocial';

export type ProgressionAction =
  | 'viewtube-arc-search'
  | 'amazemart-lumen-search'
  | 'browser-skg-history'
  | 'social-noah-search'
  | 'admin-login';

export interface DebugChapter {
  id: PuzzleChapter;
  title: string;
  shortTitle: string;
  description: string;
  targetApp: ActiveApp;
}

export interface ChapterAdvanceGuide {
  chapter: PuzzleChapter;
  nextLabel: string;
  objective: string;
  steps: readonly string[];
  answers?: readonly {
    question: string;
    answer: string;
  }[];
  completion: string;
}

const CHAPTER_ADVANCE_GUIDES: Record<PuzzleChapter, ChapterAdvanceGuide> = {
  1: {
    chapter: 1,
    nextLabel: 'CHAPTER 02',
    objective: 'Identify how ARC_184 crossed Gate 40.',
    steps: [
      'Open ViewTube and search for ARC_184.',
      'Open the controversial Gate 40 run and let the evidence clip play.',
      'Collect ARC_184\'s highlighted reply about the old Legacy build.',
      'Scroll to the bottom and collect the preserved Skyline256_LAOS_Final.ipa filename.',
    ],
    completion: 'Both the passable Legacy build and its archived IPA filename are confirmed.',
  },
  2: {
    chapter: 2,
    nextLabel: 'CHAPTER 03',
    objective: 'Recover the archived version built for the old device.',
    steps: [
      'Open Browser and locate the archived Skyline 256 download page.',
      'Review the LAOS compatibility and native altitude sensor requirements.',
      'Download Skyline256_LAOS_Final.ipa.',
    ],
    completion: 'The archived build is downloaded.',
  },
  3: {
    chapter: 3,
    nextLabel: 'CHAPTER 04',
    objective: 'Obtain a Lumen Arc that can run the archived build.',
    steps: [
      'Search AmazeMart for Lumen Arc, then scroll to and expand the suppressed seller.',
      'Accept the scam warning, open Messages, and reply to coldboot_17 with ARC_184\'s impossible score: 184.',
    ],
    completion: 'The accepted score reply delivers and unlocks the screenshot bundle.',
  },
  4: {
    chapter: 4,
    nextLabel: 'CHAPTER 05',
    objective: 'Identify the original game and its developer.',
    steps: [
      'Open Deliveries and inspect the signed purchase history.',
      'Find the Lumen Arc Recovery Lot, then open its image packet.',
      'Collect all three key details hidden across the attached screenshots.',
    ],
    completion: 'The three details assemble the Skyline 256 case.',
  },
  5: {
    chapter: 5,
    nextLabel: 'CHAPTER 06',
    objective: 'Trace SKG Automation back to the company it replaced.',
    steps: [
      'Open Browser and search for SKG.',
      'Review the current SKG Automation page.',
      'Switch the Snapshot control from 2026 to 2014.',
      'Find and select all three highlighted Noah Kade references in the preserved page body.',
    ],
    completion: 'All three Noah Kade references in the Silver Kite Games archive are recovered.',
  },
  6: {
    chapter: 6,
    nextLabel: 'CHAPTER 07',
    objective: 'Connect Noah Kade\'s oldest posts to the restored phone owner.',
    steps: [
      'Open FaceSpace and search for Noah Kade.',
      'Change the noisy sponsored timeline to Oldest First.',
      'Read down through the early hopeful posts and expand their comments.',
      'Select Mara Kade\'s comment in the eighth oldest post.',
      'Return Home, swipe to the second page, and open Arcane Kade\'s linked accounts.',
      'Confirm the related Mara Kade account.',
    ],
    completion: 'Arcane confirms that Mara Kade is the mother linked to this restored profile.',
  },
  7: {
    chapter: 7,
    nextLabel: 'CHAPTER 08',
    objective: 'Recover Mara\'s three favorite numbers and enter her preserved account.',
    steps: [
      'Open FaceSpace and use Recently viewed to open Mara Kade.',
      'Read her timeline and select the three posts that preserve a coordinate value.',
      'Return to Messages and open SILVER_KITE_ARCHIVE.',
      'Use the coordinate hint to enter Mara\'s archive password.',
    ],
    completion: 'Mara\'s preserved Silver Kite account accepts the coordinate password.',
  },
  8: {
    chapter: 8,
    nextLabel: 'CHAPTER 09',
    objective: 'Learn Mara\'s life and restore the damaged human record she kept with Noah.',
    steps: [
      'Open Messages and select SILVER_KITE_ARCHIVE.',
      'Read Mara\'s eight ordinary conversations and collect the underlined memory in each.',
      'Open the damaged Noah thread at the bottom of the archive.',
      'Use the recovered-memory drawer to restore all eight missing messages.',
      'Open the legacy child profile attachment revealed beneath the final message.',
    ],
    answers: NOAH_ARCHIVE_FRAGMENTS.map((fragment) => ({
      question: fragment.prompt,
      answer: getChapterEightMemory(fragment.memoryId)?.label ?? fragment.memoryId,
    })),
    completion: 'The eighth message is restored and the locked legacy child profile attachment is opened.',
  },
  9: {
    chapter: 9,
    nextLabel: 'CHAPTER 10',
    objective: 'Make enough room to restore the legacy profile without losing Arcane\'s trust.',
    steps: [
      'Open the twelve-year-old local child profile and inspect its preserved record.',
      'Use the first-place hint; let the ARC_184 misread reveal Arcane Kade, then enter Arcane as the password.',
      'Wait until the download stops with a storage error, then return home.',
      'Press and hold the familiar app grid until the delete marks appear.',
      'Remove Concept first, then the replaceable services, then Wayback and FaceSpace.',
      'Keep trying to remove Messages until the phone loses power.',
      'Put the dead phone down and wait for its interrupted cleanup to resume.',
    ],
    completion: 'The phone reboots with the legacy profile restored and only Flappy Something remaining.',
  },
  10: {
    chapter: 10,
    nextLabel: 'ENDING',
    objective: 'Use Noah\'s route to finish the game he left behind.',
    steps: [
      'Open the only remaining app: Flappy Something.',
      'Collect every visible guidance point before Gate 40.',
      'At Gate 40, Arcane takes control without speaking.',
      'Watch him follow the restored route to Gate 256.',
    ],
    completion: 'Reaching the true ending unlocks the final choice.',
  },
};

type ChapterEvidence = Partial<Pick<GameProgress,
  | 'viewTubeSearchedArc'
  | 'watchedVideo'
  | 'discoveredLegacyPassage'
  | 'discoveredLegacyIpa'
  | 'archiveDownloaded'
  | 'orderedPhone'
  | 'deliveredPhone'
  | 'discoveredOriginalTitle'
  | 'discoveredSKGHistory'
  | 'discoveredNoahQA'
  | 'discoveredMotherComment'
  | 'discoveredMaraAltitude184'
  | 'discoveredMaraGate40'
  | 'discoveredMaraEnd256'
  | 'unlockedAdminLogin'
  | 'loggedIntoAdmin'
  | 'unlockedCodeRoute'
>>;

const BASE_PROGRESS: GameProgress = {
  currentChapter: 1,
  phase: 'os_unlocked',
  deathsAt40: 1,
  seenLeaderboard: true,
  bestScore: 40,
  viewTubeSearchedArc: false,
  watchedVideo: false,
  discoveredLegacyPassage: false,
  discoveredLegacyIpa: false,
  archiveDownloaded: false,
  orderedPhone: false,
  deliveredPhone: false,
  discoveredOriginalTitle: false,
  discoveredSKGHistory: false,
  discoveredNoahQA: false,
  discoveredMotherComment: false,
  discoveredMaraAltitude184: false,
  discoveredMaraGate40: false,
  discoveredMaraEnd256: false,
  unlockedAdminLogin: false,
  loggedIntoAdmin: false,
  chapterEightMemoryIds: [],
  chapterEightRestoredMessageIds: [],
  chapterNineRestorePhase: 'idle',
  chapterNineProfileChoice: null,
  chapterNinePasswordVerified: false,
  chapterNineDownloadState: 'idle',
  chapterNineDeletedAppIds: [],
  chapterNineMessageAttempts: 0,
  chapterNineArcaneSilent: false,
  unlockedCodeRoute: false,
  completedGame: false,
  selectedEnding: null,
};

// Developer Chapter 9+ snapshots begin after the private Noah thread is fully
// repaired. They must not recreate Chapter 8's eight-message restoration gate.
const COMPLETED_CHAPTER_EIGHT_MEMORY_IDS = NOAH_ARCHIVE_FRAGMENTS.map((fragment) => fragment.memoryId);
const COMPLETED_CHAPTER_EIGHT_MESSAGE_IDS = NOAH_ARCHIVE_FRAGMENTS.map((fragment) => fragment.id);

export const DEBUG_CHAPTERS: readonly DebugChapter[] = [
  { id: 1, shortTitle: 'Find First Place', title: 'Puzzle 1: Find First Place', description: 'The leaderboard marks ARC_184 as the only player who clearly broke past 40.', targetApp: 'viewtube' },
  { id: 2, shortTitle: 'Find the Legacy Build', title: 'Puzzle 2: Find the Legacy Build', description: 'The video and its comments lead the investigation toward the Archive and Lumen Arc.', targetApp: 'browser' },
  { id: 3, shortTitle: 'Obtain an Old Device', title: 'Puzzle 3: Obtain an Old Device', description: 'The Legacy build requires the recalled Lumen Arc. Find a surviving device.', targetApp: 'amazemart' },
  { id: 4, shortTitle: 'Decode SKG', title: 'Puzzle 4: Decode SKG', description: 'The delivered screenshots reveal an old name and SilverKite_Games.', targetApp: 'screenshots' },
  { id: 5, shortTitle: 'The Overwritten Company', title: 'Puzzle 5: The Overwritten Company', description: 'Rewind SKG Automation and trace the history of the company it replaced.', targetApp: 'browser' },
  { id: 6, shortTitle: 'The Developer Account', title: 'Puzzle 6: The Developer Account', description: 'The old Silver Kite Games records point to designer Noah Kade.', targetApp: 'social' },
  { id: 7, shortTitle: 'Her Favorite Numbers', title: 'Puzzle 7: Her Favorite Numbers', description: 'Three of Mara’s ordinary posts preserve three coordinate numbers.', targetApp: 'social' },
  { id: 8, shortTitle: 'Recover Mara', title: 'Puzzle 8: Recover Mara’s Account', description: 'Recover memories from Mara’s conversations and restore her damaged messages with Noah.', targetApp: 'messages' },
  { id: 9, shortTitle: 'Recognize My Record', title: 'Puzzle 9: Recognize My Record', description: 'Open the twelve-year-old Child Profile, recognize ARC_184 as a childhood alias, and restore the package as Arcane.', targetApp: 'messages' },
  { id: 10, shortTitle: 'Only the Game Remains', title: 'Puzzle 10: Only the Game Remains', description: 'The empty home screen leaves only Flappy Something. Arcane no longer answers the player.', targetApp: 'home' },
] as const;

const CHAPTER_OVERRIDES: Record<PuzzleChapter, Partial<GameProgress>> = {
  1: {},
  2: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true },
  3: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true },
  4: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true },
  5: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true },
  6: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true },
  7: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredMotherComment: true },
  8: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, discoveredMaraAltitude184: true, discoveredMaraGate40: true, discoveredMaraEnd256: true, unlockedAdminLogin: true, loggedIntoAdmin: true },
  9: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, discoveredMaraAltitude184: true, discoveredMaraGate40: true, discoveredMaraEnd256: true, unlockedAdminLogin: true, loggedIntoAdmin: true, chapterEightMemoryIds: COMPLETED_CHAPTER_EIGHT_MEMORY_IDS, chapterEightRestoredMessageIds: COMPLETED_CHAPTER_EIGHT_MESSAGE_IDS, chapterNineRestorePhase: 'idle', chapterNineProfileChoice: null, chapterNinePasswordVerified: false, chapterNineDownloadState: 'idle', chapterNineDeletedAppIds: [], chapterNineMessageAttempts: 0, chapterNineArcaneSilent: false },
  10: { viewTubeSearchedArc: true, watchedVideo: true, discoveredLegacyPassage: true, discoveredLegacyIpa: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, discoveredMaraAltitude184: true, discoveredMaraGate40: true, discoveredMaraEnd256: true, unlockedAdminLogin: true, loggedIntoAdmin: true, chapterEightMemoryIds: COMPLETED_CHAPTER_EIGHT_MEMORY_IDS, chapterEightRestoredMessageIds: COMPLETED_CHAPTER_EIGHT_MESSAGE_IDS, chapterNineRestorePhase: 'rebooted', chapterNineProfileChoice: 'child', chapterNinePasswordVerified: true, chapterNineDownloadState: 'storage-error', chapterNineDeletedAppIds: [...CHAPTER_NINE_DELETABLE_APPS], chapterNineMessageAttempts: 3, chapterNineArcaneSilent: true, unlockedCodeRoute: true },
};

export function getChapterById(chapter: PuzzleChapter): DebugChapter {
  const result = DEBUG_CHAPTERS.find((entry) => entry.id === chapter);
  if (!result) throw new Error(`Unknown puzzle chapter: ${chapter}`);
  return result;
}

export function getChapterAdvanceGuide(chapter: PuzzleChapter): ChapterAdvanceGuide {
  return CHAPTER_ADVANCE_GUIDES[chapter];
}

export function getChapterSnapshot(chapter: PuzzleChapter): GameProgress {
  return {
    ...BASE_PROGRESS,
    ...CHAPTER_OVERRIDES[chapter],
    currentChapter: chapter,
    completedGame: false,
    selectedEnding: null,
  };
}

export function completePuzzleChapter(
  progress: GameProgress,
  completedChapter: PuzzleChapter,
  evidence: ChapterEvidence = {},
): GameProgress {
  if (progress.currentChapter !== completedChapter) return progress;

  return {
    ...progress,
    ...evidence,
    currentChapter: Math.min(10, completedChapter + 1) as PuzzleChapter,
  };
}

export function canUseProgressionAction(action: ProgressionAction, progress: GameProgress): boolean {
  const requirements: Record<ProgressionAction, boolean> = {
    // Chapter 1 begins once the intro run has handed control to the restored
    // phone. Developer snapshots enter at the same phase, so they must not be
    // mistaken for an intro player trying to guess ARC_184 early.
    'viewtube-arc-search': progress.seenLeaderboard || progress.phase !== 'intro_game',
    'amazemart-lumen-search': progress.watchedVideo,
    'browser-skg-history': progress.discoveredOriginalTitle,
    'social-noah-search': progress.discoveredSKGHistory,
    'admin-login': hasAllMaraNumberClues(progress) && progress.unlockedAdminLogin,
  };

  return requirements[action];
}
