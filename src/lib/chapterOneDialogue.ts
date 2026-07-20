import type { ActiveApp } from '../types';

export type DialogueLines = readonly string[];

export const CHAPTER_ONE_DIALOGUE = {
  entry: [
    "That isn't a record.",
    "That's cheating.",
  ],
  leaderboardRead: [
    'Everyone else stops at forty. ARC_184 made it to 184.',
    "He didn't just beat the wall. He knew how it worked.",
  ],
  homeReturned: [
    'People upload everything. Maybe he posted the run somewhere.',
    "If there's footage, it's probably on a video platform.",
  ],
  viewTubeOpened: [
    'ViewTube. Let’s see whether ARC_184 wanted an audience.',
    'Start with the only name I have: ARC_184.',
  ],
  searchFocused: [
    'ARC_184. No theories yet. Just evidence.',
  ],
  rumorSelected: [
    'An erased record run. That sounds like my problem.',
    'The name at the top again: ARC_184.',
  ],
  arcSearchFound: [
    'There you are.',
    '“I BROKE THE UNBEATABLE FLAPPY GAME.” Subtle.',
  ],
  videoReady: [
    '184 points. If this is edited, I want to see where.',
  ],
  videoStarted: [
    'All right. Show me the trick.',
    'Wait. He goes low at Gate 40.',
  ],
  videoEvidence: [
    'That should have killed him.',
    'No cut. No jump. So what changed?',
  ],
  videoPaused: [
    "I've seen enough. He's pulling some kind of cheating trick.",
    'What I need is the exact moment forty becomes forty-one.',
  ],
  lumenLead: [
    "Fine. Maybe he didn't fake the score.",
    'Lumen Arc… I’ve never heard of it.',
  ],
} as const satisfies Record<string, DialogueLines>;

const IRRELEVANT_VIDEO_LINES = [
  "I'm not interested in this video right now.",
  'Tempting. Completely irrelevant.',
  'I can procrastinate after I explain the impossible score.',
  "No. I'm looking for one specific run.",
  'The algorithm can wait.',
  'Cute bird. Wrong mystery.',
  'I refuse to get distracted by another list video.',
] as const;

const REPEATED_SEARCH_LINES = [
  'I have one useful name. I should probably use it.',
  "We're investigating a score, not testing the search engine.",
  'Evidence first. Conspiracy board later.',
  "I don't need the whole answer yet. Just the next piece.",
] as const;

const COMPANION_LINES = [
  'Still here.',
  "I'm thinking.",
  "Let's follow what we actually know.",
  "I'm curious too. That's becoming a problem.",
] as const;

const WRONG_APP_LINES: Partial<Record<ActiveApp, DialogueLines>> = {
  flappy: ["I can hit Gate 40 again, but that won't explain how he passed it."],
  amazemart: ["I'm investigating cheating, not shopping."],
  browser: ["An archive of what? I don't even know what I'm looking for yet."],
  social: ["I don't have a person to search for."],
  messages: ["My messages aren't going to explain ARC_184's score."],
  screenshots: ['Nothing here yet. Just an impressively empty folder.'],
  about: ['Interesting cause. Wrong tab.'],
};

const rotate = <T>(items: readonly T[], index: number): T =>
  items[Math.abs(Math.floor(index)) % items.length];

export const getChapterOneIrrelevantVideoDialogue = (attempt: number): DialogueLines => [
  rotate(IRRELEVANT_VIDEO_LINES, attempt),
];

export const getChapterOneCompanionDialogue = (attempt: number): DialogueLines => [
  rotate(COMPANION_LINES, attempt),
];

export const getChapterOneWrongAppDialogue = (
  app: ActiveApp,
  attempt: number,
): DialogueLines => WRONG_APP_LINES[app] ?? [rotate(COMPANION_LINES, attempt)];

export type ChapterOneSearchKind =
  | 'arc_184'
  | 'empty'
  | 'gate_40'
  | 'self'
  | 'future_person'
  | 'lumen_arc'
  | 'silver_kite'
  | 'future_password'
  | 'future_altitudes'
  | 'irrelevant';

export interface ChapterOneSearchResponse {
  kind: ChapterOneSearchKind;
  lines: DialogueLines;
  isArcSearch: boolean;
}

const normalizeSearch = (query: string): string => query.trim().toLowerCase();
const compactSearch = (query: string): string => normalizeSearch(query).replace(/[^a-z0-9]/g, '');

export const getChapterOneSearchResponse = (
  query: string,
  attempt = 0,
): ChapterOneSearchResponse => {
  const normalized = normalizeSearch(query);
  const compact = compactSearch(query);

  if (!normalized) {
    return { kind: 'empty', lines: ['Searching for nothing. Bold strategy.'], isArcSearch: false };
  }

  if (compact.includes('alt184gate40end256')) {
    return {
      kind: 'future_password',
      lines: [
        'That is either a password or someone fell asleep on the keyboard.',
        "Let's pretend I didn't just receive information from the future.",
      ],
      isArcSearch: false,
    };
  }

  if (/184\D+172\D+149\D+133/.test(normalized) || compact.includes('184172149133121118126143')) {
    return {
      kind: 'future_altitudes',
      lines: [
        'Those are numbers. Congratulations to us both.',
        'Evidence first. Mysterious number ritual later.',
      ],
      isArcSearch: false,
    };
  }

  if (/\b(noah|mara|elias)(?:\s+(?:kade|vale))?\b/.test(normalized)) {
    return {
      kind: 'future_person',
      lines: [
        'That name means nothing to me yet.',
        'Suspiciously specific. Where did I supposedly learn it?',
      ],
      isArcSearch: false,
    };
  }

  if (normalized.includes('lumen arc') || compact === 'lumenarc') {
    return {
      kind: 'lumen_arc',
      lines: [
        "I don't know what that is yet.",
        'That sounds like an answer without a question.',
      ],
      isArcSearch: false,
    };
  }

  if (normalized.includes('silver kite') || normalized === 'skg' || compact === 'silverkitegames') {
    return {
      kind: 'silver_kite',
      lines: [
        'I have three letters and no context.',
        "I'm several conclusions ahead of the evidence.",
      ],
      isArcSearch: false,
    };
  }

  if (normalized.includes('gate 40') || compact === 'gate40') {
    return {
      kind: 'gate_40',
      lines: [
        'I already know the wall exists.',
        'I need to know how ARC_184 crossed it.',
      ],
      isArcSearch: false,
    };
  }

  if (normalized === 'you' || normalized === 'me' || normalized.includes('local player')) {
    return { kind: 'self', lines: ["Yes, that's me. Very informative."], isArcSearch: false };
  }

  if (compact === 'arc184') {
    return { kind: 'arc_184', lines: CHAPTER_ONE_DIALOGUE.arcSearchFound, isArcSearch: true };
  }

  return {
    kind: 'irrelevant',
    lines: [
      "That won't explain how someone passed Gate 40.",
      rotate(REPEATED_SEARCH_LINES, attempt),
    ],
    isArcSearch: false,
  };
};
