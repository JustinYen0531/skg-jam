import type { ActiveApp, PuzzleChapter } from '../types';

export type HomeLauncherApp = Exclude<ActiveApp, 'home'>;

export interface ChapterHomeScreenState {
  primaryApp: HomeLauncherApp | null;
  secondaryApp: HomeLauncherApp | null;
  primaryHint: string;
  launcherOrder: readonly HomeLauncherApp[];
  fileBoxStatus: boolean;
  screenshotsCount: number;
  overOrdered: boolean;
}

const DEFAULT_ORDER: readonly HomeLauncherApp[] = [
  'flappy',
  'viewtube',
  'amazemart',
  'browser',
  'social',
  'messages',
  'screenshots',
  'about',
];

const CHAPTER_HOME_SCREEN: Record<1 | 2 | 3 | 4 | 5, ChapterHomeScreenState> = {
  1: {
    primaryApp: 'viewtube',
    secondaryApp: null,
    primaryHint: 'Recommended',
    launcherOrder: ['viewtube', 'flappy', 'social', 'messages', 'amazemart', 'browser', 'screenshots', 'about'],
    fileBoxStatus: false,
    screenshotsCount: 0,
    overOrdered: false,
  },
  2: {
    primaryApp: 'browser',
    secondaryApp: 'viewtube',
    primaryHint: 'Continue search',
    launcherOrder: ['browser', 'flappy', 'viewtube', 'social', 'amazemart', 'messages', 'screenshots', 'about'],
    fileBoxStatus: true,
    screenshotsCount: 0,
    overOrdered: false,
  },
  3: {
    primaryApp: 'amazemart',
    secondaryApp: null,
    primaryHint: 'Continue shopping',
    launcherOrder: ['amazemart', 'flappy', 'browser', 'viewtube', 'social', 'messages', 'screenshots', 'about'],
    fileBoxStatus: false,
    screenshotsCount: 0,
    overOrdered: false,
  },
  4: {
    primaryApp: 'screenshots',
    secondaryApp: 'browser',
    primaryHint: '1 new file',
    launcherOrder: ['screenshots', 'browser', 'flappy', 'viewtube', 'amazemart', 'social', 'messages', 'about'],
    fileBoxStatus: false,
    screenshotsCount: 1,
    overOrdered: false,
  },
  5: {
    primaryApp: 'browser',
    secondaryApp: 'screenshots',
    primaryHint: 'Archive snapshots',
    launcherOrder: ['browser', 'screenshots', 'flappy', 'viewtube', 'amazemart', 'social', 'messages', 'about'],
    fileBoxStatus: false,
    screenshotsCount: 0,
    overOrdered: true,
  },
};

export function getChapterHomeScreenState(chapter: PuzzleChapter): ChapterHomeScreenState {
  if (chapter <= 5) return CHAPTER_HOME_SCREEN[chapter];

  return {
    primaryApp: null,
    secondaryApp: null,
    primaryHint: '',
    launcherOrder: DEFAULT_ORDER,
    fileBoxStatus: false,
    screenshotsCount: 0,
    overOrdered: false,
  };
}

export function getHomeLauncherOrder(
  state: ChapterHomeScreenState,
  app: HomeLauncherApp,
): number {
  const index = state.launcherOrder.indexOf(app);
  return index === -1 ? state.launcherOrder.length : index;
}
