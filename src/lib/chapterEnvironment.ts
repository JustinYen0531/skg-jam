import type { PuzzleChapter } from '../types';

export type EnvironmentChapter = 0 | PuzzleChapter;
export type DeskLighting = 'hidden' | 'cool' | 'focused' | 'still' | 'ready';
export type CoffeeState = 'none' | 'fresh' | 'sipped' | 'half' | 'near-empty' | 'empty' | 'pushed-away';
export type CableState = 'none' | 'loose' | 'connected';
export type NotebookState = 'none' | 'closed' | 'blank' | 'skg' | 'company' | 'noah' | 'numbers' | 'password' | 'quiet' | 'route';
export type PenState = 'none' | 'neat' | 'working' | 'crossed' | 'resting' | 'route';
export type DeskOrder = 'hidden' | 'clean' | 'gathering' | 'cluttered' | 'quiet' | 'organized';

export interface ChapterEnvironmentState {
  chapter: EnvironmentChapter;
  caseLabel: string;
  lighting: DeskLighting;
  coffee: CoffeeState;
  coffeeRing: boolean;
  cable: CableState;
  notebook: NotebookState;
  pen: PenState;
  stickyNote: string | null;
  deskOrder: DeskOrder;
}

export const CHAPTER_ENVIRONMENTS: Readonly<Record<EnvironmentChapter, ChapterEnvironmentState>> = {
  0: {
    chapter: 0,
    caseLabel: 'CHEAP GAME',
    lighting: 'hidden',
    coffee: 'none',
    coffeeRing: false,
    cable: 'none',
    notebook: 'none',
    pen: 'none',
    stickyNote: null,
    deskOrder: 'hidden',
  },
  1: {
    chapter: 1,
    caseLabel: 'FIND THE FIRST PLACE',
    lighting: 'cool',
    coffee: 'fresh',
    coffeeRing: false,
    cable: 'none',
    notebook: 'none',
    pen: 'none',
    stickyNote: null,
    deskOrder: 'clean',
  },
  2: {
    chapter: 2,
    caseLabel: 'FIND THE OLD BUILD',
    lighting: 'cool',
    coffee: 'sipped',
    coffeeRing: true,
    cable: 'loose',
    notebook: 'none',
    pen: 'none',
    stickyNote: null,
    deskOrder: 'gathering',
  },
  3: {
    chapter: 3,
    caseLabel: 'FIND THE DEVICE',
    lighting: 'cool',
    coffee: 'half',
    coffeeRing: true,
    cable: 'connected',
    notebook: 'closed',
    pen: 'neat',
    stickyNote: null,
    deskOrder: 'gathering',
  },
  4: {
    chapter: 4,
    caseLabel: 'WHAT WAS SKG?',
    lighting: 'focused',
    coffee: 'half',
    coffeeRing: true,
    cable: 'connected',
    notebook: 'skg',
    pen: 'working',
    stickyNote: null,
    deskOrder: 'gathering',
  },
  5: {
    chapter: 5,
    caseLabel: 'THE COMPANY UNDERNEATH',
    lighting: 'focused',
    coffee: 'near-empty',
    coffeeRing: true,
    cable: 'connected',
    notebook: 'company',
    pen: 'working',
    stickyNote: '',
    deskOrder: 'cluttered',
  },
  6: {
    chapter: 6,
    caseLabel: 'FIND THE DEVELOPER',
    lighting: 'focused',
    coffee: 'empty',
    coffeeRing: true,
    cable: 'connected',
    notebook: 'noah',
    pen: 'working',
    stickyNote: 'NOAH KADE?',
    deskOrder: 'cluttered',
  },
  7: {
    chapter: 7,
    caseLabel: 'NUMBERS ARE A ROAD',
    lighting: 'focused',
    coffee: 'empty',
    coffeeRing: true,
    cable: 'connected',
    notebook: 'numbers',
    pen: 'working',
    stickyNote: 'NOT A SCORE',
    deskOrder: 'cluttered',
  },
  8: {
    chapter: 8,
    caseLabel: 'THE OLD ACCOUNT',
    lighting: 'focused',
    coffee: 'empty',
    coffeeRing: true,
    cable: 'connected',
    notebook: 'password',
    pen: 'crossed',
    stickyNote: 'ALT / GATE / END',
    deskOrder: 'cluttered',
  },
  9: {
    chapter: 9,
    caseLabel: 'MARA AND NOAH',
    lighting: 'still',
    coffee: 'pushed-away',
    coffeeRing: true,
    cable: 'connected',
    notebook: 'quiet',
    pen: 'resting',
    stickyNote: null,
    deskOrder: 'quiet',
  },
  10: {
    chapter: 10,
    caseLabel: 'THE ROUTE IN THE NAME',
    lighting: 'ready',
    coffee: 'pushed-away',
    coffeeRing: false,
    cable: 'connected',
    notebook: 'route',
    pen: 'route',
    stickyNote: null,
    deskOrder: 'organized',
  },
};

export const getChapterEnvironment = (chapter: EnvironmentChapter): ChapterEnvironmentState =>
  CHAPTER_ENVIRONMENTS[chapter];
