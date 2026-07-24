import type { ActiveApp } from '../types';
import type { DialogueLines } from './chapterOneDialogue';
import type { LumenArcClueId } from './lumenArcClues';

export type ChapterFourDeliveryId = 'tea' | 'bulb' | 'lumen-arc' | 'notebook' | 'cable' | 'filters' | 'tape';
export type ChapterFourWrongDeliveryId = Exclude<ChapterFourDeliveryId, 'lumen-arc'>;
export type ChapterFourSheetId = 'battery' | 'home' | 'storage' | 'calibration' | 'box' | 'network' | 'notes' | 'othergame' | 'lockscreen' | 'about';
export type ChapterFourDecoySheetId = Exclude<ChapterFourSheetId, 'home' | 'calibration' | 'notes'>;

export const CHAPTER_FOUR_DIALOGUE = {
  entry: [
    'A delivery archive. Tea, lightbulbs, a notebook.',
    "The device I paid for is filed somewhere in a stranger's shopping history.",
  ],
  homeReturned: [
    'The order is here somewhere.',
    'Apparently receiving it was the easy part.',
  ],
  deliveriesOpened: [
    'Seven signed deliveries.',
    'Only one of them cost exactly one dollar and eighty-four cents.',
  ],
  packageOpened: [
    "Wait. No—no, that's not a phone.",
    'Those are screenshots. He sent me screenshots.',
  ],
  packageAnger: [
    'You sold me a stack of pictures and called it a device.',
    'Come on. Open. Do something.',
  ],
  packageDespair: [
    "There's nothing underneath.",
    "I paid for somebody else's leftovers.",
  ],
  packageResolve: [
    'Fine. Fine.',
    'If this is all we have, then this is what we use.',
    "Let's see what these screenshots still know.",
  ],
  titleFound: [
    'Skyline 256. So Flappy was never the real name.',
  ],
  paramsFound: [
    'Altitude. Gate. End. Three labels, in that order.',
  ],
  archiveFound: [
    'SilverKite_Games. An old backup account, not a product label.',
  ],
  caseAssembled: [
    'Different screenshots. Same structure.',
    "This wasn't random.",
  ],
  completed: [
    'SKG: Skyline 256.',
    'Now I have something I can actually search.',
  ],
  packetReentered: [
    'The packet is still here. So is the mess.',
  ],
  completedRevisit: [
    "I've already taken what matters from this folder.",
  ],
} as const satisfies Record<string, DialogueLines>;

const WRONG_DELIVERY_DIALOGUE: Readonly<Record<ChapterFourWrongDeliveryId, DialogueLines>> = {
  tea: ['Cedar mint tea. Not the delivery I ruined my week for.'],
  bulb: ["Lightbulbs. Someone's home still runs on normal purchases."],
  notebook: ['A grid notebook. Useful somewhere else, probably.'],
  cable: ['A charging cable for a device that actually arrived.'],
  filters: ['Coffee filters. The archive is more organized than the case.'],
  tape: ['Archival tape. Preservation supplies, without the thing being preserved.'],
};

const REPEATED_WRONG_DELIVERY = [
  'Still ordinary. Still not mine.',
  'Same parcel. Same lack of evidence.',
] as const;

const DECOY_DIALOGUE: Readonly<Record<ChapterFourDecoySheetId, DialogueLines>> = {
  battery: ['Battery health, eighty-four percent. Thrilling.'],
  storage: ['Storage breakdown. Their photos, their games, none of it mine.'],
  box: ['Just a photo of the box. Charger, frayed cable, no receipt.'],
  network: ['A home Wi-Fi called HOME-2F. Congratulations to them.'],
  othergame: ['A high score in a completely different game. Different obsession.'],
  lockscreen: ['A lock screen. The clock stopped mattering years ago.'],
  about: ['Model, system, and a serial they blurred a moment too late.'],
};

const REPEATED_DECOY = [
  "Nothing changed. Just another piece of someone else's day.",
  'I already read this surface. It is still residue.',
] as const;

const REPEATED_CLUE: Readonly<Record<LumenArcClueId, DialogueLines>> = {
  title: ['Already marked. Skyline 256.'],
  params: ['Already marked. Altitude, gate, end.'],
  archive: ['Already marked. SilverKite_Games.'],
};

const STALLED_DIALOGUE = [
  'Most of this is residue. The details that repeat are the ones worth keeping.',
  'The useful pieces do not look important. They only look familiar.',
] as const;

const WRONG_APP_DIALOGUE: Partial<Record<ActiveApp, DialogueLines>> = {
  browser: ['A search box is useless until I know the word to type.'],
  viewtube: ['The recording finished talking. The delivery has not.'],
  amazemart: ['The purchase already happened. I need to inspect what arrived.'],
  flappy: ["It still dies at forty. That's why I am reading these deliveries."],
  social: ['No name to look up yet. Just an order with the wrong kind of contents.'],
  messages: ['The seller sent a delivery, not an explanation.'],
  about: ['I am holding the evidence, not the preservation notice.'],
};

const COMPANION_DIALOGUE = [
  'Seven deliveries. One bad purchase. Start there.',
  'A stranger kept the surface of a device they did not keep.',
  'The useful detail will look ordinary until it repeats.',
] as const;

const rotate = <T>(items: readonly T[], attempt: number): T =>
  items[Math.abs(Math.floor(attempt)) % items.length];

export const getChapterFourWrongDeliveryDialogue = (
  id: ChapterFourWrongDeliveryId,
  attempt: number,
): DialogueLines => attempt === 0
  ? WRONG_DELIVERY_DIALOGUE[id]
  : attempt === 1
    ? [rotate(REPEATED_WRONG_DELIVERY, attempt - 1)]
    : [];

export const getChapterFourDecoyDialogue = (
  id: ChapterFourDecoySheetId,
  attempt: number,
): DialogueLines => attempt === 0
  ? DECOY_DIALOGUE[id]
  : attempt === 1
    ? [rotate(REPEATED_DECOY, attempt - 1)]
    : [];

export const getChapterFourClueDialogue = (
  clueId: LumenArcClueId,
  repeatAttempt?: number,
): DialogueLines => {
  if (repeatAttempt !== undefined) return repeatAttempt === 0 ? REPEATED_CLUE[clueId] : [];
  if (clueId === 'title') return CHAPTER_FOUR_DIALOGUE.titleFound;
  if (clueId === 'params') return CHAPTER_FOUR_DIALOGUE.paramsFound;
  return CHAPTER_FOUR_DIALOGUE.archiveFound;
};

export const getChapterFourStalledDialogue = (attempt: number): DialogueLines => [
  rotate(STALLED_DIALOGUE, attempt),
];

export const getChapterFourWrongAppDialogue = (app: ActiveApp, attempt: number): DialogueLines =>
  WRONG_APP_DIALOGUE[app] ?? [rotate(COMPANION_DIALOGUE, attempt)];

export const getChapterFourCompanionDialogue = (attempt: number): DialogueLines => [
  rotate(COMPANION_DIALOGUE, attempt),
];
