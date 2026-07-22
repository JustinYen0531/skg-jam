import type { ActiveApp, GameProgress, PuzzleChapter } from '../types';

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
    objective: 'Turn Noah\'s favorite numbers into an archive key.',
    steps: [
      'Open Noah Kade\'s About tab in FaceSpace.',
      'Find the number sequence 184-40-256.',
      'Open Messages, return to Mom, and select ASSEMBLE COORDINATE KEY.',
    ],
    completion: 'The Silver Kite archive login is unlocked.',
  },
  8: {
    chapter: 8,
    nextLabel: 'CHAPTER 09',
    objective: 'Log in to Mara\'s preserved Silver Kite account.',
    steps: [
      'Open Messages and select SILVER_KITE_ARCHIVE.',
      'Enter ALT184GATE40END256 as the coordinate password.',
      'Submit the archive login form.',
    ],
    completion: 'The private 2014 message archive opens.',
  },
  9: {
    chapter: 9,
    nextLabel: 'CHAPTER 10',
    objective: 'Recover the hidden flight route from Noah\'s messages.',
    steps: [
      'Read the private Mara and Noah archive conversation.',
      'Scroll to the attachment beneath the final route message.',
      'Select RECOVER ATTACHED FLIGHT SEQUENCE.',
    ],
    completion: 'The eight altitude targets are added to Flappy.',
  },
  10: {
    chapter: 10,
    nextLabel: 'ENDING',
    objective: 'Use Noah\'s route to finish the game he left behind.',
    steps: [
      'Open Flappy and start a new run.',
      'At Gates 40–47, match 184, 172, 149, 133, 121, 118, 126, and 143.',
      'Continue through the restored game until Gate 256.',
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
  | 'unlockedAdminLogin'
  | 'loggedIntoAdmin'
  | 'unlockedCodeRoute'
>>;

const BASE_PROGRESS: GameProgress = {
  currentChapter: 1,
  phase: 'os_unlocked',
  deathsAt40: 2,
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
  unlockedAdminLogin: false,
  loggedIntoAdmin: false,
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
  { id: 7, shortTitle: '最喜歡的數字', title: '謎題 7：最喜歡的數字', description: 'Noah 的舊 Q&A 與 Mara 的訊息留下數字線索。', targetApp: 'social' },
  { id: 8, shortTitle: '登入舊帳號', title: '謎題 8：登入母親的舊帳號', description: '把數字理解為 ALT、GATE 與 END，而不是分數。', targetApp: 'messages' },
  { id: 9, shortTitle: '母親與 Noah', title: '謎題 9：母親與 Noah 的對話', description: '登入舊帳號，讀取關於最後更新與秘密路線的對話。', targetApp: 'messages' },
  { id: 10, shortTitle: '名字中的路線', title: '謎題 10：找到名字中的路線', description: '從開發者帳號辨識八個高度，準備返回遊戲驗證。', targetApp: 'flappy' },
] as const;

const CHAPTER_OVERRIDES: Record<PuzzleChapter, Partial<GameProgress>> = {
  1: {},
  2: { viewTubeSearchedArc: true, watchedVideo: true },
  3: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true },
  4: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true },
  5: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true },
  6: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true },
  7: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredMotherComment: true },
  8: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, unlockedAdminLogin: true },
  9: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, unlockedAdminLogin: true, loggedIntoAdmin: true },
  10: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, unlockedAdminLogin: true, loggedIntoAdmin: true, unlockedCodeRoute: true },
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
    'admin-login': progress.unlockedAdminLogin,
  };

  return requirements[action];
}
