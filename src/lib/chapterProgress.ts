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
      'Select ARC_184\'s highlighted reply beneath the video.',
    ],
    completion: 'The Lumen Arc hardware lead is confirmed.',
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
      'Use the first-place hint; let the ARC_184 misread reveal Arken Kade, then enter Arken as the password.',
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

export const DEBUG_CHAPTERS: readonly DebugChapter[] = [
  { id: 1, shortTitle: '尋找第一名', title: '謎題 1：尋找第一名', description: '排行榜指出 ARC_184 是唯一明顯突破 40 的玩家。', targetApp: 'viewtube' },
  { id: 2, shortTitle: '尋找舊版本', title: '謎題 2：尋找舊版本', description: '影片與留言把調查方向帶向 Archive 與 Lumen Arc。', targetApp: 'browser' },
  { id: 3, shortTitle: '購買舊裝置', title: '謎題 3：購買舊裝置', description: '舊版需要已被回收的 Lumen Arc，尋找殘存裝置。', targetApp: 'amazemart' },
  { id: 4, shortTitle: '解讀 SKG', title: '謎題 4：解讀 SKG', description: '收到的截圖揭露舊名稱與 SilverKite_Games。', targetApp: 'screenshots' },
  { id: 5, shortTitle: '被覆蓋的公司', title: '謎題 5：被機器覆蓋的公司', description: '回溯 SKG Automation，追查被覆蓋的公司歷史。', targetApp: 'browser' },
  { id: 6, shortTitle: '開發者帳號', title: '謎題 6：開發者的社群帳號', description: 'Silver Kite Games 的舊資料指向設計師 Noah Kade。', targetApp: 'social' },
  { id: 7, shortTitle: '最喜歡的數字', title: '謎題 7：最喜歡的數字', description: 'Mara 的生活貼文分別留下三個座標數字。', targetApp: 'social' },
  { id: 8, shortTitle: '尋回母親', title: '謎題 8：母親的舊帳號', description: '從 Mara 的生活對話尋回記憶，修復她與 Noah 的損壞訊息。', targetApp: 'messages' },
  { id: 9, shortTitle: '認出自己的紀錄', title: '謎題 9：認出自己的紀錄', description: '開啟十二年前的 Child Profile，認出 ARC_184 是童年暱稱並使用 Arken 下載舊資料。', targetApp: 'messages' },
  { id: 10, shortTitle: '只剩下遊戲', title: '謎題 10：只剩下遊戲', description: '空白首頁只留下 Flappy Something；Arcane 已不再回應玩家。', targetApp: 'home' },
] as const;

const CHAPTER_OVERRIDES: Record<PuzzleChapter, Partial<GameProgress>> = {
  1: {},
  2: { viewTubeSearchedArc: true, watchedVideo: true },
  3: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true },
  4: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true },
  5: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true },
  6: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true },
  7: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredMotherComment: true },
  8: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, discoveredMaraAltitude184: true, discoveredMaraGate40: true, discoveredMaraEnd256: true, unlockedAdminLogin: true, loggedIntoAdmin: true },
  9: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, discoveredMaraAltitude184: true, discoveredMaraGate40: true, discoveredMaraEnd256: true, unlockedAdminLogin: true, loggedIntoAdmin: true, chapterNineRestorePhase: 'idle', chapterNineProfileChoice: null, chapterNinePasswordVerified: false, chapterNineDownloadState: 'idle', chapterNineDeletedAppIds: [], chapterNineMessageAttempts: 0, chapterNineArcaneSilent: false },
  10: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, discoveredMaraAltitude184: true, discoveredMaraGate40: true, discoveredMaraEnd256: true, unlockedAdminLogin: true, loggedIntoAdmin: true, chapterNineRestorePhase: 'rebooted', chapterNineProfileChoice: 'child', chapterNinePasswordVerified: true, chapterNineDownloadState: 'storage-error', chapterNineDeletedAppIds: [...CHAPTER_NINE_DELETABLE_APPS], chapterNineMessageAttempts: 3, chapterNineArcaneSilent: true, unlockedCodeRoute: true },
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
