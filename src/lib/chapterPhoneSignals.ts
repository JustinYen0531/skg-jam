import type { ActiveApp, PuzzleChapter } from '../types';

export type PhoneLauncherApp = Exclude<ActiveApp, 'home'>;

export interface PhoneNotificationSignal {
  app: PhoneLauncherApp;
  label: string;
  accessibleLabel: string;
}

export interface ChapterPhoneSignals {
  notification: PhoneNotificationSignal;
  recentApp: PhoneLauncherApp | null;
}

const CHAPTER_SIGNALS: Record<PuzzleChapter, ChapterPhoneSignals> = {
  1: {
    notification: {
      app: 'viewtube',
      label: '1',
      accessibleLabel: 'ViewTube has one unread update',
    },
    recentApp: null,
  },
  2: {
    notification: {
      app: 'browser',
      label: '1',
      accessibleLabel: 'Wayback has one unread archive update',
    },
    recentApp: 'viewtube',
  },
  3: {
    notification: {
      app: 'amazemart',
      label: '1',
      accessibleLabel: 'AmazeMart has one unread order update',
    },
    recentApp: 'browser',
  },
  4: {
    notification: {
      app: 'screenshots',
      label: '1',
      accessibleLabel: 'Schematics has one new file',
    },
    recentApp: 'amazemart',
  },
  5: {
    notification: {
      app: 'browser',
      label: '1',
      accessibleLabel: 'Wayback has one unread archive update',
    },
    recentApp: 'screenshots',
  },
  6: {
    notification: {
      app: 'social',
      label: '1',
      accessibleLabel: 'FaceSpace has one unread update',
    },
    recentApp: 'browser',
  },
  7: {
    notification: {
      app: 'social',
      label: '1',
      accessibleLabel: 'FaceSpace has one unread update',
    },
    recentApp: 'social',
  },
  8: {
    notification: {
      app: 'messages',
      label: '1',
      accessibleLabel: 'Messages has one unread update',
    },
    recentApp: 'social',
  },
  9: {
    notification: {
      app: 'messages',
      label: '1',
      accessibleLabel: 'Messages has one unread update',
    },
    recentApp: 'messages',
  },
  10: {
    notification: {
      app: 'flappy',
      label: '1',
      accessibleLabel: 'Flappy Something has one unread update',
    },
    recentApp: 'messages',
  },
};

export function getChapterPhoneSignals(chapter: PuzzleChapter): ChapterPhoneSignals {
  return CHAPTER_SIGNALS[chapter];
}
