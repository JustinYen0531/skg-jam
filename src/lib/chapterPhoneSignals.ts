import type { ActiveApp, PuzzleChapter } from '../types';

export type PhoneLauncherApp = Exclude<ActiveApp, 'home'>;
export type NotificationTone = 'unread' | 'quiet';

export interface PhoneNotificationSignal {
  app: PhoneLauncherApp;
  label: string;
  tone: NotificationTone;
  accessibleLabel: string;
}

export interface ChapterPhoneSignals {
  notification: PhoneNotificationSignal | null;
  recentApp: PhoneLauncherApp | null;
  fileBoxDownload: boolean;
}

const NO_SIGNALS: ChapterPhoneSignals = {
  notification: null,
  recentApp: null,
  fileBoxDownload: false,
};

const CHAPTER_SIGNALS: Record<1 | 2 | 3 | 4 | 5, ChapterPhoneSignals> = {
  1: {
    notification: {
      app: 'viewtube',
      label: '1',
      tone: 'unread',
      accessibleLabel: 'ViewTube has one unread update',
    },
    recentApp: null,
    fileBoxDownload: false,
  },
  2: {
    notification: null,
    recentApp: 'viewtube',
    fileBoxDownload: true,
  },
  3: {
    notification: {
      app: 'amazemart',
      label: '1',
      tone: 'unread',
      accessibleLabel: 'AmazeMart has one unread order update',
    },
    recentApp: 'browser',
    fileBoxDownload: false,
  },
  4: {
    notification: {
      app: 'screenshots',
      label: '1',
      tone: 'unread',
      accessibleLabel: 'Schematics has one new file',
    },
    recentApp: 'amazemart',
    fileBoxDownload: false,
  },
  5: {
    notification: {
      app: 'browser',
      label: '3',
      tone: 'quiet',
      accessibleLabel: 'Wayback has three restored archive tabs',
    },
    recentApp: 'screenshots',
    fileBoxDownload: false,
  },
};

export function getChapterPhoneSignals(chapter: PuzzleChapter): ChapterPhoneSignals {
  return chapter <= 5 ? CHAPTER_SIGNALS[chapter] : NO_SIGNALS;
}
