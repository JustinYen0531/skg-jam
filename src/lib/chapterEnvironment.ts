import type { PuzzleChapter } from '../types';

export type EnvironmentChapter = 0 | PuzzleChapter;
export type MetaWallStage = 0 | 1 | 2 | 3 | 4 | 5;
export type MetaFloorStage = MetaWallStage;
export type DeskLighting = 'hidden' | 'cool' | 'focused' | 'still' | 'ready';
export type CoffeeState = 'none' | 'fresh' | 'sipped' | 'half' | 'near-empty' | 'empty' | 'tipped-empty' | 'pushed-away';
export type CableState = 'none' | 'loose' | 'connected';
export type NotebookState = 'none' | 'closed' | 'blank' | 'skg' | 'company' | 'noah' | 'mara' | 'numbers' | 'password' | 'quiet' | 'route';
export type PenState = 'none' | 'neat' | 'working' | 'crossed' | 'resting' | 'route';
export type DeskOrder = 'hidden' | 'clean' | 'gathering' | 'cluttered' | 'quiet' | 'organized';

export interface ChapterEnvironmentState {
  chapter: EnvironmentChapter;
  caseLabel: string;
  lighting: DeskLighting;
  coffee: CoffeeState;
  coffeeRing: boolean;
  coffeeSteam: boolean;
  coffeeDrip: boolean;
  coffeeSpill: boolean;
  teaService: boolean;
  paperBalls: boolean;
  cable: CableState;
  notebook: NotebookState;
  notebookPosition: 'default' | 'lowered';
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
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'none',
    notebook: 'none',
    notebookPosition: 'default',
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
    coffeeSteam: true,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'none',
    notebook: 'none',
    notebookPosition: 'default',
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
    coffeeSteam: true,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'loose',
    notebook: 'none',
    notebookPosition: 'default',
    pen: 'none',
    stickyNote: null,
    deskOrder: 'gathering',
  },
  3: {
    chapter: 3,
    caseLabel: 'FIND THE DEVICE',
    lighting: 'cool',
    coffee: 'empty',
    coffeeRing: true,
    coffeeSteam: false,
    coffeeDrip: true,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'connected',
    notebook: 'closed',
    notebookPosition: 'default',
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
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'connected',
    notebook: 'blank',
    notebookPosition: 'default',
    pen: 'working',
    stickyNote: null,
    deskOrder: 'gathering',
  },
  5: {
    chapter: 5,
    caseLabel: 'THE COMPANY UNDERNEATH',
    lighting: 'focused',
    coffee: 'tipped-empty',
    coffeeRing: false,
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: true,
    teaService: false,
    paperBalls: false,
    cable: 'connected',
    notebook: 'company',
    notebookPosition: 'lowered',
    pen: 'working',
    stickyNote: '',
    deskOrder: 'cluttered',
  },
  6: {
    chapter: 6,
    caseLabel: 'FIND THE DEVELOPER',
    lighting: 'focused',
    coffee: 'tipped-empty',
    coffeeRing: false,
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: true,
    paperBalls: true,
    cable: 'connected',
    notebook: 'noah',
    notebookPosition: 'default',
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
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'connected',
    notebook: 'mara',
    notebookPosition: 'default',
    pen: 'working',
    stickyNote: 'RECENTLY VIEWED',
    deskOrder: 'cluttered',
  },
  8: {
    chapter: 8,
    caseLabel: 'THE OLD ACCOUNT',
    lighting: 'focused',
    coffee: 'empty',
    coffeeRing: true,
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'connected',
    notebook: 'password',
    notebookPosition: 'default',
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
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'connected',
    notebook: 'quiet',
    notebookPosition: 'default',
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
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'connected',
    notebook: 'route',
    notebookPosition: 'default',
    pen: 'route',
    stickyNote: null,
    deskOrder: 'organized',
  },
};

export const getChapterEnvironment = (chapter: EnvironmentChapter): ChapterEnvironmentState =>
  CHAPTER_ENVIRONMENTS[chapter];

/** Two chapters share each supplied wall state so the room ages in five
 * deliberate steps without leaking the generated floor into the desk layer. */
export const getMetaWallStage = (chapter: EnvironmentChapter): MetaWallStage =>
  chapter === 0 ? 0 : Math.ceil(chapter / 2) as MetaWallStage;

/** Match each supplied floor state to the same two-chapter room-aging beat as
 * its corresponding wall state. */
export const getMetaFloorStage = (chapter: EnvironmentChapter): MetaFloorStage =>
  chapter === 0 ? 0 : Math.ceil(chapter / 2) as MetaFloorStage;
