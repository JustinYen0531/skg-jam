import type { ActiveApp } from '../types';
import type { DialogueLines } from './chapterOneDialogue';

export type ChapterFiveSearchResultId =
  | 'smart-kitchen'
  | 'secure-key'
  | 'knowledge-grid'
  | 'kinetic-goods'
  | 'skg-automation'
  | 'slang'
  | 'airport'
  | 'mirror';

export type ChapterFiveDecoyResultId = Exclude<ChapterFiveSearchResultId, 'skg-automation'>;
export type ChapterFiveBotTopic = 'ownership' | 'creator' | 'restore' | 'freeform';
export type ChapterFiveNoahTraceId = 'studio-credit' | 'developer-note' | 'cofounder-credit';
export type ChapterFiveCorporateDetailId = 'stats' | 'leadership' | 'footer';
export type ChapterFiveArchiveDetailId = 'lumen-arc' | 'why-256' | 'hidden-route' | 'recall' | 'guestbook-warning';

export const CHAPTER_FIVE_DIALOGUE = {
  entry: [
    'SKG is a name now, not just three letters.',
    'Time to find out what it turned into.',
  ],
  homeReturned: [
    'I have a name. Now I need its history.',
  ],
  browserOpened: [
    'A searchable name deserves a search engine.',
  ],
  searchFinderVisible: [
    'SearchFinder. The web, arranged by whoever paid the most for it.',
  ],
  searchFocused: [
    'One word: SKG. Let us see how far the ads let me get.',
  ],
  relatedSearch: [
    'Eight results, and the engine is trying very hard to make those letters mean anything else.',
  ],
  bridgeOpened: [
    'Formerly a games studio. Two thousand nine to two thousand fourteen.',
    'Something happened to it the year it stopped.',
  ],
  corporateVisible: [
    'A whole company, and not one human name anywhere on it.',
    'They kept the assets. The people are harder to find.',
  ],
  botOpened: [
    'No staff, but the support bot is immortal. Of course it is.',
  ],
  snapshotNoticed: [
    'This page is all present tense. The studio lived in an earlier one.',
    'The reel goes back further than 2026.',
  ],
  archiveLoaded: [
    'There. Before the automation buried it.',
    'Silver Kite Games. A person actually made this.',
  ],
  studioCreditFound: [
    'Noah Kade. Studio design and code.',
    'One name, finally.',
  ],
  developerNoteFound: [
    'Noah Kade again. He maintained the completion build.',
    'Two references. Not a stray byline.',
  ],
  cofounderCreditFound: [
    'Co-founder and lead designer. Noah Kade.',
  ],
  completed: [
    'Co-founder and lead designer. Every surviving credit points to Noah Kade.',
    'Noah Kade. That is where I go next.',
  ],
  completedRevisit: [
    'I already have the name that survived this page.',
  ],
} as const satisfies Record<string, DialogueLines>;

const DECOY_DIALOGUE: Readonly<Record<ChapterFiveDecoyResultId, DialogueLines>> = {
  'smart-kitchen': ['A fridge with a subscription plan. Not the SKG I am looking for, thankfully.'],
  'secure-key': ['Enterprise auth middleware. Three letters, zero relevance, last updated never.'],
  'knowledge-grid': ['It has the word Skyline in it and still manages to mean absolutely nothing.'],
  'kinetic-goods': ['Carbon-neutral since last Tuesday. I believe every word of that.'],
  slang: ['Four definitions and three are typos. The fourth is not helping.'],
  airport: ['Two gates and one delay. Wrong kind of flight.'],
  mirror: ['One file, permission denied. At least this dead end is honest.'],
};

const OFF_TOPIC_DIALOGUE = [
  'Plenty of results. None of them are the name I brought here.',
  'The search engine is working. My search is not.',
  'I can wander later. SKG first.',
] as const;

const PORTAL_DIALOGUE = [
  'That is an advertisement wearing a doorway costume.',
  'Another route to nowhere, sponsored this time.',
  'The useful result is still in the middle of all this noise.',
] as const;

const EMPTY_YEAR_DIALOGUE = {
  newer: [
    'Newer snapshots. Same automated nothing, just fresher.',
    'Still the company shell. I need the part before it.',
  ],
  earlier: [
    'Nothing saved here. The studio left no page in this year.',
    'An empty year. Keep looking for the one somebody preserved.',
  ],
  earliest: [
    'The reel bottoms out on an empty year. Too early to have left a trace.',
  ],
} as const satisfies Record<string, DialogueLines>;

const BOT_DIALOGUE: Readonly<Record<ChapterFiveBotTopic, DialogueLines>> = {
  ownership: ['Ownership is a legacy concept, says the company that owns fourteen thousand things it did not make.'],
  creator: ['No creator on record. They kept the game and misplaced the person.'],
  restore: ['Upgrade your expectations. I will treasure that one.'],
  freeform: ['Escalated to a human specialist who is never scheduled. Naturally.'],
};

const CORPORATE_DETAIL_DIALOGUE: Readonly<Record<ChapterFiveCorporateDetailId, DialogueLines>> = {
  stats: ['One point two million apps. Zero people required to remember who made them.'],
  leadership: ['Generated portraits and no personnel records. A company-shaped absence.'],
  footer: ['Reinvented. That is a generous word for whatever this replaced.'],
};

const ARCHIVE_DETAIL_DIALOGUE: Readonly<Record<ChapterFiveArchiveDetailId, DialogueLines>> = {
  'lumen-arc': ['The same handheld Mom kept. This studio put the game on it.'],
  'why-256': ['Two hundred fifty-six gates, then you are done. He built the ending on purpose.'],
  'hidden-route': ['He left something in the final build. He will not say what. Not yet.'],
  recall: ['A recall killed the hardware. A partner turned what remained into a catalog.'],
  'guestbook-warning': ['One entry survived as a warning: do not submit it. Submit what?'],
};

const DEAD_FRAGMENT_DIALOGUE = [
  'The archive kept the sentence and lost the thing it pointed to.',
  'Another missing image. Preservation has holes in it.',
  'The link is dead. The trace around it is not.',
] as const;

const TRACE_ROLE_LINE: Readonly<Record<ChapterFiveNoahTraceId, string>> = {
  'studio-credit': 'Noah Kade. Studio design and code.',
  'developer-note': 'Noah Kade. Completion build maintainer.',
  'cofounder-credit': 'Noah Kade. Co-founder and lead designer.',
};

const REPEATED_TRACE_DIALOGUE: Readonly<Record<ChapterFiveNoahTraceId, DialogueLines>> = {
  'studio-credit': ['Already marked. Studio design and code.'],
  'developer-note': ['Already marked. Completion build maintainer.'],
  'cofounder-credit': ['Already marked. Co-founder and lead designer.'],
};

const WRONG_APP_DIALOGUE: Partial<Record<ActiveApp, DialogueLines>> = {
  flappy: ['The score is evidence. The name behind it is in the Browser.'],
  viewtube: ['The recording gave me SKG. It cannot tell me what SKG became.'],
  amazemart: ['The purchase is finished. I am tracing the company now.'],
  social: ['No person to look up yet. First I need the company history.'],
  messages: ['The seller answered the last question. This one belongs to the web.'],
  screenshots: ['The screenshots gave me the name. Now I have to follow it.'],
  about: ['The device can identify itself. The company will take more work.'],
};

const COMPANION_DIALOGUE = [
  'Search SKG, then separate the company from the noise around it.',
  'The current company page is too clean. Old pages usually are not.',
  'A preserved page can keep a person after a company forgets them.',
] as const;

const rotate = <T>(items: readonly T[], attempt: number): T =>
  items[Math.abs(Math.floor(attempt)) % items.length];

export const getChapterFiveDecoyDialogue = (
  id: ChapterFiveDecoyResultId,
  attempt: number,
): DialogueLines => attempt === 0 ? DECOY_DIALOGUE[id] : [];

export const getChapterFiveOffTopicDialogue = (attempt: number): DialogueLines => [
  rotate(OFF_TOPIC_DIALOGUE, attempt),
];

export const getChapterFivePortalDialogue = (attempt: number): DialogueLines => [
  rotate(PORTAL_DIALOGUE, attempt),
];

export const getChapterFiveEmptyYearDialogue = (year: number, attempt: number): DialogueLines => {
  if (year <= 2009) return EMPTY_YEAR_DIALOGUE.earliest;
  return year > 2014
    ? [rotate(EMPTY_YEAR_DIALOGUE.newer, attempt)]
    : [rotate(EMPTY_YEAR_DIALOGUE.earlier, attempt)];
};

export const getChapterFiveBotDialogue = (topic: ChapterFiveBotTopic): DialogueLines => BOT_DIALOGUE[topic];

export const getChapterFiveCorporateDetailDialogue = (
  id: ChapterFiveCorporateDetailId,
  attempt: number,
): DialogueLines => attempt === 0 ? CORPORATE_DETAIL_DIALOGUE[id] : [];

export const getChapterFiveArchiveDetailDialogue = (
  id: ChapterFiveArchiveDetailId,
  attempt: number,
): DialogueLines => attempt === 0 ? ARCHIVE_DETAIL_DIALOGUE[id] : [];

export const getChapterFiveDeadFragmentDialogue = (attempt: number): DialogueLines =>
  attempt < DEAD_FRAGMENT_DIALOGUE.length ? [DEAD_FRAGMENT_DIALOGUE[attempt]] : [];

export const getChapterFiveTraceDialogue = (
  traceId: ChapterFiveNoahTraceId,
  discoveryIndex: number,
): DialogueLines => [
  TRACE_ROLE_LINE[traceId],
  discoveryIndex === 0 ? 'One name, finally.' : 'Noah Kade again. Two references. Not a stray byline.',
];

export const getChapterFiveRepeatedTraceDialogue = (
  traceId: ChapterFiveNoahTraceId,
  repeatAttempt: number,
): DialogueLines => repeatAttempt === 0 ? REPEATED_TRACE_DIALOGUE[traceId] : [];

export const getChapterFiveWrongAppDialogue = (app: ActiveApp, attempt: number): DialogueLines =>
  WRONG_APP_DIALOGUE[app] ?? [rotate(COMPANION_DIALOGUE, attempt)];

export const getChapterFiveCompanionDialogue = (attempt: number): DialogueLines => [
  rotate(COMPANION_DIALOGUE, attempt),
];
