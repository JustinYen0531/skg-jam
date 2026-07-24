import type { ActiveApp } from '../types';
import type { DialogueLines } from './chapterOneDialogue';
import type { MaraNumberClue } from './chapterSevenSocial';

export type ChapterSevenNoiseKind =
  | 'home-feed'
  | 'left-sidebar'
  | 'right-sidebar'
  | 'sidebar-ad'
  | 'noah-profile'
  | 'search';

export type ChapterSevenLoginKind =
  | 'empty'
  | 'clues-missing'
  | 'mapping-unread'
  | 'wrong-order'
  | 'wrong'
  | 'repeated';

export const CHAPTER_SEVEN_DIALOGUE = {
  entry: [
    'This phone still carries an old Lumen Arc family backup.',
    'One part of it is still sealed.',
    'Three numbers I know by heart, and no idea which memory belongs to which label.',
  ],
  homeReturned: [
    'Three numbers I know by heart, and three places I never knew.',
  ],
  socialOpened: [
    'Her profile, not his. The key is in what she loved.',
  ],
  messagesOpened: [
    'Mom called them little places. I should hear what she meant before I treat them like a code.',
  ],
  momPlacesRead: [
    '"Places," she calls them. Not passwords.',
    'She used them so she would never forget the numbers.',
  ],
  momMappingRead: [
    'Arc, gate, end. Her three places, in their order.',
    'The old Silver Kite account is still waiting in the corner.',
  ],
  maraProfileOpened: [
    'Her profile is still up. Twelve years of an ordinary life, left running.',
  ],
  archiveAccountOpened: [
    'MARA_KADE. A preserved node is a strange place to knock.',
  ],
  mappingRejected: [
    'Those are the right memories under the wrong labels.',
    'The archive wants meaning, not just three familiar numbers.',
  ],
  mappingCompleted: [
    'A view, a gate, an ending. Now the memories have an order.',
    'It still wants the key typed by hand.',
  ],
  completed: [
    'Her lookout, their gate, her ending.',
    'No obituary. No goodbye. His record simply stops.',
    'Twelve years, and the door still knows them.',
  ],
  completedRevisit: [
    'The old node already knows the path.',
  ],
} as const satisfies Record<string, DialogueLines>;

const CLUE_DIALOGUE: Readonly<Record<MaraNumberClue, DialogueLines>> = {
  arc: [
    'The harbor lookout. ARC 184, in Dad\'s old notebook.',
    'The score I kept chasing was already written beside her favorite view.',
  ],
  gate: [
    'Gate 40. Their anniversary spot, in a station the trains gave up on.',
    'The wall in the game is where my parents kept meeting.',
  ],
  end: [
    'Page 256. "Everyone finally chooses to go home."',
    'That is the ending he built. She had already named it.',
  ],
};

const MARA_POST_DIALOGUE: Readonly<Record<string, readonly string[]>> = {
  'mara-2014-09': [
    'A blue scarf, found exactly where she had already looked. Her memory was slipping even then.',
    'She wrote the missing thing down after finding it. A small insurance policy against tomorrow.',
  ],
  'mara-2014-07': [
    '"Tea cannot count as dinner." She is arguing with my father, in 2014.',
    'One domestic disagreement, preserved more faithfully than the company that hosted it.',
  ],
  'mara-2014-06': [
    'Hundreds of paper kites for a school fair. Silver Kite, even at the kitchen table.',
    'Her fingers resigned. The kites apparently rejected the resignation.',
  ],
  'mara-2014-04': [
    'She was proud of the last build before I knew it was ours.',
    'A game should be allowed to finish. She understood his argument before I did.',
  ],
  'mara-2014-03': [
    'A repaired radio and no reason to check work mail. That counted as a good day.',
    'Quiet morning. Working radio. No company emergency. Practically a holiday.',
  ],
  'mara-2014-02': [
    'He remembered the flowers, she remembered the charger. One competent adult between them.',
    'Romance, according to my parents: flowers, spare power, and shared quality control.',
  ],
};

const NOISE_DIALOGUE: Readonly<Record<ChapterSevenNoiseKind, readonly string[]>> = {
  'home-feed': [
    'Everyone else is still posting. I am trying to read the life that stopped.',
    'A loud feed around nine quiet posts.',
  ],
  'left-sidebar': [
    'Notifications, groups, people I may know. None of them knew her like these posts did.',
    'The platform has many ideas about where I should look. It has not earned that confidence.',
  ],
  'right-sidebar': [
    'Recently viewed: her, him, and a retro-tech page. The algorithm kept better track than I did.',
    'Trending nonsense. My mother\'s twelve years are quieter than any of it.',
  ],
  'sidebar-ad': [
    '"Never remember a birthday either." She would have hated this ad.',
    'Automated affection. Convenient, hollow, and blocking the useful column.',
  ],
  'noah-profile': [
    'His page is public and empty of this. The numbers are on hers.',
    'I know what he built. I am here to learn what she remembered.',
  ],
  search: [
    'A search box cannot tell me which ordinary day mattered to her.',
    'Wrong trail. Her profile is already in the recently viewed list.',
  ],
};

const WRONG_APP_DIALOGUE: Partial<Record<ActiveApp, DialogueLines>> = {
  browser: ['The web gave me the studio. This key is more personal than a search.'],
  viewtube: ['The recording started this. It does not know where my mother liked to stand.'],
  amazemart: ['The device is here. What I need now is what my parents put inside it.'],
  screenshots: ['The screenshots named him. Her profile is where the numbers actually live.'],
  flappy: ['184, 40, 256. I have been flying through my parents\' life this whole time.'],
  about: ['Preservation, again. Her profile is the only thing that kept these places safe.'],
};

const COMPANION_DIALOGUE = [
  'Her profile, not his. The key is in what she loved.',
  'Three places. Label each one only after I know what it meant to her.',
  'A view, a gate, an ending. Ordinary enough to survive as memories.',
] as const;

const rotate = <T>(items: readonly T[], attempt: number): T =>
  items[Math.abs(Math.floor(attempt)) % items.length];

export const getChapterSevenClueDialogue = (clue: MaraNumberClue): DialogueLines =>
  CLUE_DIALOGUE[clue];

export const getChapterSevenMaraPostDialogue = (postId: string, attempt: number): DialogueLines => {
  const lines = MARA_POST_DIALOGUE[postId] ?? Object.values(MARA_POST_DIALOGUE).flat();
  return [rotate(lines, attempt)];
};

export const getChapterSevenNoiseDialogue = (
  kind: ChapterSevenNoiseKind,
  attempt: number,
): DialogueLines => [rotate(NOISE_DIALOGUE[kind], attempt)];

export const getChapterSevenWrongAppDialogue = (
  app: ActiveApp,
  attempt: number,
): DialogueLines => WRONG_APP_DIALOGUE[app] ?? [rotate(COMPANION_DIALOGUE, attempt)];

export const getChapterSevenCompanionDialogue = (attempt: number): DialogueLines => [
  rotate(COMPANION_DIALOGUE, attempt),
];

export const classifyChapterSevenLogin = (
  input: string,
  hasAllClues: boolean,
  mappingRead: boolean,
  failCount: number,
): ChapterSevenLoginKind => {
  const normalized = input.toUpperCase().replace(/\s+/g, '');
  if (!normalized) return 'empty';
  if (!hasAllClues) return 'clues-missing';
  if (!mappingRead) return 'mapping-unread';
  const containsAllNumbers = ['184', '40', '256'].every((value) => normalized.includes(value));
  if (containsAllNumbers) return 'wrong-order';
  if (failCount >= 2) return 'repeated';
  return 'wrong';
};

const LOGIN_DIALOGUE: Readonly<Record<ChapterSevenLoginKind, DialogueLines>> = {
  empty: ['Sending an empty key to a twelve-year-old lock. Optimistic.'],
  'clues-missing': ['I know the numbers. I do not know which is which yet.', 'Her places first. Then the door.'],
  'mapping-unread': ['I found the places. I should ask Mom how the old login named them.'],
  'wrong-order': ['Right memories, wrong arrangement. Arc, gate, end—her order, not mine.'],
  wrong: ['That is not one of her places. Guessing makes the archive less personal, not more open.'],
  repeated: ['He left this for someone who walked it, not someone who guessed.'],
};

export const getChapterSevenLoginDialogue = (
  input: string,
  hasAllClues: boolean,
  mappingRead: boolean,
  failCount: number,
): DialogueLines => LOGIN_DIALOGUE[classifyChapterSevenLogin(input, hasAllClues, mappingRead, failCount)];
