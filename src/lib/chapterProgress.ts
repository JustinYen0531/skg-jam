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

const BASE_PROGRESS: GameProgress = {
  currentChapter: 1,
  phase: 'os_unlocked',
  deathsAt37: 3,
  seenLeaderboard: true,
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
  { id: 1, shortTitle: '尋找第一名', title: '謎題 1：尋找第一名', description: '排行榜指出 ARC_184 是唯一明顯突破 37 的玩家。', targetApp: 'viewtube' },
  { id: 2, shortTitle: '尋找舊版本', title: '謎題 2：尋找舊版本', description: '影片與留言把調查方向帶向 Archive 與 Lumen Arc。', targetApp: 'browser' },
  { id: 3, shortTitle: '購買舊裝置', title: '謎題 3：購買舊裝置', description: '舊版需要已被回收的 Lumen Arc，尋找殘存裝置。', targetApp: 'amazemart' },
  { id: 4, shortTitle: '解讀 SKG', title: '謎題 4：解讀 SKG', description: '收到的截圖揭露舊名稱與 SilverKite_Games。', targetApp: 'screenshots' },
  { id: 5, shortTitle: '被覆蓋的公司', title: '謎題 5：被機器覆蓋的公司', description: '回溯 SKG Automation，追查被覆蓋的公司歷史。', targetApp: 'browser' },
  { id: 6, shortTitle: '開發者帳號', title: '謎題 6：開發者的社群帳號', description: 'Silver Kite Games 的舊資料指向設計師 Noah Kade。', targetApp: 'social' },
  { id: 7, shortTitle: '最喜歡的數字', title: '謎題 7：最喜歡的數字', description: 'Noah 的舊 Q&A 與 Mara 的訊息留下數字線索。', targetApp: 'messages' },
  { id: 8, shortTitle: '登入舊帳號', title: '謎題 8：登入母親的舊帳號', description: '把數字理解為 ALT、GATE 與 END，而不是分數。', targetApp: 'messages' },
  { id: 9, shortTitle: '母親與 Noah', title: '謎題 9：母親與 Noah 的對話', description: '登入舊帳號，讀取關於最後更新與秘密路線的對話。', targetApp: 'messages' },
  { id: 10, shortTitle: '名字中的路線', title: '謎題 10：找到名字中的路線', description: '從開發者帳號辨識八個高度，準備返回遊戲驗證。', targetApp: 'flappy' },
] as const;

const CHAPTER_OVERRIDES: Record<PuzzleChapter, Partial<GameProgress>> = {
  1: {},
  2: { viewTubeSearchedArc: true, watchedVideo: true },
  3: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true },
  4: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true },
  5: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true },
  6: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true },
  7: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true },
  8: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, unlockedAdminLogin: true },
  9: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, unlockedAdminLogin: true, loggedIntoAdmin: true },
  10: { viewTubeSearchedArc: true, watchedVideo: true, archiveDownloaded: true, orderedPhone: true, deliveredPhone: true, discoveredOriginalTitle: true, discoveredSKGHistory: true, discoveredNoahQA: true, discoveredMotherComment: true, unlockedAdminLogin: true, loggedIntoAdmin: true, unlockedCodeRoute: true },
};

export function getChapterById(chapter: PuzzleChapter): DebugChapter {
  const result = DEBUG_CHAPTERS.find((entry) => entry.id === chapter);
  if (!result) throw new Error(`Unknown puzzle chapter: ${chapter}`);
  return result;
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

export function canUseProgressionAction(action: ProgressionAction, progress: GameProgress): boolean {
  const requirements: Record<ProgressionAction, boolean> = {
    'viewtube-arc-search': progress.seenLeaderboard,
    'amazemart-lumen-search': progress.watchedVideo,
    'browser-skg-history': progress.discoveredOriginalTitle,
    'social-noah-search': progress.discoveredSKGHistory,
    'admin-login': progress.unlockedAdminLogin,
  };

  return requirements[action];
}
