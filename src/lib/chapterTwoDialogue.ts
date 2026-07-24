import type { ActiveApp } from '../types';
import type { DialogueLines } from './chapterOneDialogue';

export type ChapterTwoArchiveFormat = 'ipa' | 'apk' | 'jar' | 'sis' | 'zip';

export type ChapterTwoPortalDistraction =
  | 'trending'
  | 'news'
  | 'weather'
  | 'market'
  | 'community'
  | 'sponsored'
  | 'archive_noise';

export const CHAPTER_TWO_DIALOGUE = {
  entry: [
    'Gate forty was not always the end. The Legacy build proves that much.',
    'The filename survived. Now I need to find out what kind of thing it is.',
  ],
  homeReturned: [
    'Old software leaves traces.',
    'Mirrors, backups, forgotten download pages.',
  ],
  browserOpened: [
    'Start broad. I am looking for an old game file, not the whole story.',
  ],
  searchFinderVisible: [
    'The modern web, helpfully burying the past under shopping advice.',
  ],
  archiveLeadSelected: [
    "An actual file index. That's better than another article about nostalgia.",
    'Most of these mirrors are dead. The filenames may still tell me what survived.',
  ],
  archiveSearchFocused: [
    'The comment gave me a filename.',
    'Now I need the package category that actually contains it.',
  ],
  fileOpened: [
    'Skyline 256.',
    'LAOS 4.1, indexed in 2014. This could be his build.',
  ],
  compatibilityBlocked: [
    'The file survived. This device just cannot understand it.',
    'Lumen Arc. Of course.',
  ],
  maternalMemory: [
    'Mom had one. I remember the silver edge beside the kitchen sink.',
    'I do not know where it went. I need another way to find one.',
  ],
} as const satisfies Record<string, DialogueLines>;

const FORMAT_DIALOGUE: Readonly<Record<ChapterTwoArchiveFormat, DialogueLines>> = {
  zip: [
    'Press kits, scans, mixed backups.',
    'Useful evidence, maybe. Not a runnable build.',
  ],
  apk: [
    'Android packages.',
    'Reasonable guess. Wrong operating system.',
  ],
  jar: [
    'Old enough, but built for Java phones.',
    'ARC_184 said LAOS.',
  ],
  sis: [
    'Another dead mobile platform.',
    'Not the one from the video.',
  ],
  ipa: [
    'Application packages.',
    "Let's read the records before deciding anything.",
  ],
};

const WRONG_APP_DIALOGUE: Partial<Record<ActiveApp, DialogueLines>> = {
  flappy: ['The current version will keep killing me at forty. That is the problem.'],
  viewtube: ['I have squeezed everything useful out of that video for now.'],
  amazemart: ['Buying random dead hardware before I know the required build seems expensive.'],
  social: ['I do not have a person to search for.'],
  messages: ['Nobody in my messages sent me a twelve-year-old game build.'],
  screenshots: ['Still empty. Apparently the past did not organize itself for me.'],
  about: ['Preservation is the point. This is not the evidence.'],
};

const COMPANION_DIALOGUE = [
  'The file existed once. That is enough to leave a trail.',
  'I am not stuck. I am reading very slowly on purpose.',
  'Old platform. Old build. One step at a time.',
  'The answer should look like a file, not a prophecy.',
] as const;

const PORTAL_DISTRACTION_DIALOGUE: Readonly<Record<ChapterTwoPortalDistraction, readonly string[]>> = {
  trending: [
    'The browser has plenty of ideas. None of them are mine.',
    'Interesting to somebody, probably. Not useful to me.',
  ],
  news: [
    'The headlines can wait. Dead software usually cannot.',
    'Another article explaining the present. I need something the present forgot.',
  ],
  weather: [
    'Cold outside. Still not a filename.',
    'The forecast is more certain than this archive trail.',
  ],
  market: [
    'Numbers moving for reasons nobody can explain. Familiar, but irrelevant.',
    'The market is alive. The platform I need is not.',
  ],
  community: [
    'Everyone is posting. Nobody is preserving the useful part.',
    'A lot of activity. Very little evidence.',
  ],
  sponsored: [
    'A free trial is not a lead.',
    'The advertisement found me before the file did.',
  ],
  archive_noise: [
    'Useful to someone cataloguing the catalog. Not to me.',
    'More preservation paperwork. I need the package itself.',
  ],
};

const rotate = <T>(items: readonly T[], index: number): T =>
  items[Math.abs(Math.floor(index)) % items.length];

export const getChapterTwoFormatDialogue = (format: ChapterTwoArchiveFormat): DialogueLines =>
  FORMAT_DIALOGUE[format];

export const getChapterTwoWrongAppDialogue = (
  app: ActiveApp,
  attempt: number,
): DialogueLines => WRONG_APP_DIALOGUE[app] ?? [rotate(COMPANION_DIALOGUE, attempt)];

export const getChapterTwoCompanionDialogue = (attempt: number): DialogueLines => [
  rotate(COMPANION_DIALOGUE, attempt),
];

export const getChapterTwoPortalDistractionDialogue = (
  kind: ChapterTwoPortalDistraction,
  attempt: number,
): DialogueLines => [rotate(PORTAL_DISTRACTION_DIALOGUE[kind], attempt)];

export type ChapterTwoSearchKind =
  | 'empty'
  | 'known_filename'
  | 'lumen_arc'
  | 'future_company'
  | 'future_person'
  | 'gate_40'
  | 'irrelevant';

export interface ChapterTwoSearchResponse {
  kind: ChapterTwoSearchKind;
  lines: DialogueLines;
}

const compactSearch = (query: string): string => query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

export const getChapterTwoSearchResponse = (
  query: string,
  attempt = 0,
): ChapterTwoSearchResponse => {
  const normalized = query.trim().toLowerCase();
  const compact = compactSearch(query);

  if (!normalized) {
    return { kind: 'empty', lines: ['Searching for nothing. Technically efficient.'] };
  }

  if (compact === 'skyline256laosfinalipa') {
    return {
      kind: 'known_filename',
      lines: [
        'That is the filename from the comment.',
        'I still need the archive category that contains it.',
      ],
    };
  }

  if (normalized.includes('lumen arc') || compact === 'lumenarc') {
    return {
      kind: 'lumen_arc',
      lines: ['I know the device name.', 'I still need to know what it was running.'],
    };
  }

  if (normalized.includes('skg') || normalized.includes('silver kite')) {
    return {
      kind: 'future_company',
      lines: ['Three letters and no context.', 'That is not a lead yet.'],
    };
  }

  if (/\b(noah|mara|elias)(?:\s+(?:kade|vale))?\b/.test(normalized)) {
    return { kind: 'future_person', lines: ['That name has not appeared anywhere.'] };
  }

  if (normalized.includes('gate 40') || compact === 'gate40') {
    return {
      kind: 'gate_40',
      lines: ['I know where the trick happened.', 'Now I need the software that allowed it.'],
    };
  }

  return {
    kind: 'irrelevant',
    lines: [
      'Another game that almost disappeared.',
      rotate(COMPANION_DIALOGUE, attempt),
    ],
  };
};
