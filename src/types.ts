export type PuzzleChapter = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface GameProgress {
  currentChapter: PuzzleChapter;
  phase: 'intro_game' | 'os_unlocked' | 'passed_37' | 'credits' | 'ending_choice';
  deathsAt37: number;
  seenLeaderboard: boolean;
  
  // Investigation state
  viewTubeSearchedArc: boolean;
  watchedVideo: boolean;
  archiveDownloaded: boolean;
  orderedPhone: boolean;
  deliveredPhone: boolean; // Triggers "Printed Screenshots" box
  discoveredOriginalTitle: boolean; // "SKG: Skyline 256"
  discoveredSKGHistory: boolean;    // "Silver Kite Games" old site
  discoveredNoahQA: boolean;        // "184-37-256" favorite number
  discoveredMotherComment: boolean; // "Bought hundreds of keys... kept one for our child"
  unlockedAdminLogin: boolean;      // knows ALT184GATE37END256
  loggedIntoAdmin: boolean;         // logged into Mother's old Silver Kite account
  unlockedCodeRoute: boolean;       // knows the exact sequence NK_184.172.149.133.121.118.126.143
  
  // Game completion state
  completedGame: boolean;
  selectedEnding: 'submit' | 'publicize' | 'preserve' | null;
}

export type ActiveApp = 'home' | 'flappy' | 'viewtube' | 'amazemart' | 'browser' | 'social' | 'messages' | 'screenshots' | 'about';

export interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  author: string;
  content: string;
  time: string;
}

export interface ChatMessage {
  sender: 'mom' | 'me' | 'system';
  time: string;
  content: string;
  isUnlockedCode?: boolean;
}
