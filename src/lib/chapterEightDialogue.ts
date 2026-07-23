import type { DialogueLines } from './chapterOneDialogue';
import {
  getChapterEightMemory,
  getNoahArchiveFragment,
  isCorrectNoahMemory,
  type ChapterEightMemoryId,
  type MaraArchiveThreadId,
  type NoahArchiveFragmentId,
} from './chapterEightArchive';

export type ChapterEightMemorySelectionKind =
  | 'correct'
  | 'wrong'
  | 'wrong-repeated'
  | 'already-restored';

export const CHAPTER_EIGHT_DIALOGUE = {
  entry: [
    'MARA_KADE. Not a profile this time. Her actual account.',
    'Noah is at the bottom, under everything she kept living after him.',
  ],
  archiveOpened: [
    'Years of appointments, neighbors, ordinary arguments, and things she refused to throw away.',
    'If Noah\'s thread is damaged, the rest of her life may be the index.',
  ],
  firstMemoryCollected: [
    'The archive marked that as a recovered memory.',
    'Not a password. A piece of context the damaged thread may still recognize.',
  ],
  firstNoahFragment: [
    'Eight messages, each stripped down to a question.',
    'It does not want a key. It wants proof that I read the life around it.',
  ],
  noahOpenedTooEarly: [
    'I have questions and no context. That is how people turn lives into trivia.',
    'Read her conversations first. Then come back.',
  ],
  allMemoriesCollected: [
    'Eight ordinary things. A seat, a date, a gate, a view, an ending, a name, sea glass, and a stack of obsolete phones.',
    'Together, apparently, they are enough to make a person legible again.',
  ],
  allFragmentsRestored: [
    'That is the whole conversation.',
    'He built the ending. She kept it alive. Neither of them left me a shortcut.',
  ],
  chapterNineAttachmentLocked: [
    'A device-bound child profile. Still locked.',
    'The final message restored its index. Opening the recovery record is the only way forward.',
  ],
  completedRevisit: [
    'Her life supplied the keys. Their conversation supplied the reason.',
  ],
} as const satisfies Record<string, DialogueLines>;

const THREAD_DIALOGUE: Readonly<Record<MaraArchiveThreadId, DialogueLines>> = {
  son: [
    'She saved the window seat even when names started slipping.',
    'A place can remember someone when a person cannot. Cruel little advantage.',
  ],
  clinic: [
    'First review in 2019. She still found time to argue with the doctor.',
    'The decline has a date. Mara still sounds like Mara.',
  ],
  pharmacy: [
    'Gate 40 was not an abstract number to her. It was where she knew to stand.',
    'Even the pharmacy learned to route itself around a memory.',
  ],
  iris: [
    'One hundred eighty-four stone steps, counted until the city held still.',
    'I knew the number. I did not know it was her view.',
  ],
  bookclub: [
    'Page 256. Everyone chooses to go home, and she calls that enough.',
    'No twist. No endlessness. Just an open door.',
  ],
  coworker: [
    'Silver Kite belonged to Mara before it belonged to a company.',
    'Elias wanted scale. She gave Noah a name that could still mean something.',
  ],
  harbor: [
    'Sea glass: worth keeping because the water returned it.',
    'That explains more about this archive than any preservation policy could.',
  ],
  memo: [
    'She bought the recalled devices herself and hid one for a child she had not met.',
    'A whole inheritance filed under a shopping reminder.',
  ],
  noah: CHAPTER_EIGHT_DIALOGUE.firstNoahFragment,
};

const MEMORY_DIALOGUE: Readonly<Record<ChapterEightMemoryId, DialogueLines>> = {
  'window-seat': [
    'Recovered: the window seat.',
    'She kept a place for me before I knew I was missing from it.',
  ],
  'clinic-2019': [
    'Recovered: her first clinic review, 2019.',
    'A later date, still unmistakably her voice.',
  ],
  'gate-40': [
    'Recovered: the old station gate, 40.',
    'The number was a place before it was a wall.',
  ],
  'lookout-184': [
    'Recovered: the harbor lookout, 184 steps.',
    'A favorite view, reduced to a score until now.',
  ],
  'ending-256': [
    'Recovered: page 256, the open door.',
    'Her idea of an ending was not defeat. It was permission to leave.',
  ],
  'silver-kite': [
    'Recovered: Silver Kite.',
    'Her ridiculous harbor-fair name. His company borrowed it.',
  ],
  'sea-glass': [
    'Recovered: sea glass.',
    'She kept what came back. Apparently that included people, too.',
  ],
  'lumen-stack': [
    'Recovered: the Lumen Arc stack.',
    'She did not preserve one device by accident. She planned this.',
  ],
};

const REPEATED_MEMORY_DIALOGUE: Readonly<Record<ChapterEightMemoryId, readonly string[]>> = {
  'window-seat': [
    'The seat is already in recovered memories. Still saved.',
    'I remember the window seat. The archive does too.',
  ],
  'clinic-2019': [
    '2019 is already recorded. Reopening the appointment will not make it kinder.',
    'First review: 2019. I have it.',
  ],
  'gate-40': [
    'Gate 40 is already collected. It was a place before it was an obstacle.',
    'The old station gate is in the drawer. No need to make her repeat herself.',
  ],
  'lookout-184': [
    'One hundred eighty-four steps. Already recovered.',
    'I have her lookout. Counting it again will not improve the view.',
  ],
  'ending-256': [
    'Page 256 is already marked. The door remains open.',
    'I remember her ending. It did not need a sequel.',
  ],
  'silver-kite': [
    'Silver Kite is already recovered. Her name, before their company.',
    'I have the name. I am trying not to turn her whole life into labels.',
  ],
  'sea-glass': [
    'Sea glass is already recorded. Kept because it came back.',
    'I have this one. Even returned things do not need collecting twice.',
  ],
  'lumen-stack': [
    'The recalled devices are already in recovered memories.',
    'A hidden stack of obsolete phones is difficult to forget once found.',
  ],
};

const RESTORED_FRAGMENT_DIALOGUE: Readonly<Record<NoahArchiveFragmentId, DialogueLines>> = {
  name: [
    'Silver Kite was hers first.',
    'He protected the name from Elias even while the company wore it.',
  ],
  ending: [
    'An ending as an open door. That was Mara before it was game design.',
    'Noah built her argument into the structure.',
  ],
  ceiling: [
    'He turned her lookout into an honest human limit.',
    'Not a signature. Not a claim. A line drawn around what skill alone could reach.',
  ],
  gate: [
    'Gate 40 was deliberate. The automation kept the collision and lost the meaning.',
    'Twelve years of players hitting a door whose key had been scraped away.',
  ],
  preserver: [
    'SEC_PARTNER was Mara. Not honorary. Not incidental.',
    'She kept the builds, accounts, and ledgers while everyone else kept the brand.',
  ],
  meeting: [
    'Spilled tea at a kite fair. That was how they met.',
    'Of course their origin story includes a bad build and a minor domestic disaster.',
  ],
  device: [
    'The recall did not spare this phone. Mara did.',
    'She bought a future object for a child who did not exist yet.',
  ],
  farewell: [
    'He asked her not to give me the answer.',
    'Just a seat by the window, and enough left behind to walk the rest myself.',
  ],
};

const WRONG_MEMORY_DIALOGUE = [
  [
    'That memory belongs to her, but not to this sentence.',
    'The damaged message is asking for a specific part of her life.',
  ],
  [
    'Close enough to be tempting. Still wrong.',
    'Read the question literally, then match the place, object, or date it names.',
  ],
  [
    'Stop treating her memories like interchangeable keys.',
    'The source conversation says exactly why each one mattered.',
  ],
] as const satisfies readonly DialogueLines[];

const WRONG_OR_REPEAT_CLUE_DIALOGUE = [
  'Interesting, but the archive did not mark that as one of the eight recoverable memories.',
  'Not every sentence is a key. Some of this is simply her life.',
  'No underline, no recovered record. I can let an ordinary detail remain ordinary.',
] as const;

const rotate = <T>(items: readonly T[], attempt: number): T =>
  items[Math.abs(Math.floor(attempt)) % items.length];

export const getChapterEightThreadDialogue = (
  threadId: MaraArchiveThreadId,
): DialogueLines => THREAD_DIALOGUE[threadId];

export const getChapterEightMemoryDialogue = (
  memoryId: ChapterEightMemoryId,
  alreadyCollected = false,
  attempt = 0,
): DialogueLines => alreadyCollected
  ? [rotate(REPEATED_MEMORY_DIALOGUE[memoryId], attempt)]
  : MEMORY_DIALOGUE[memoryId];

export const getChapterEightClueMissDialogue = (attempt: number): DialogueLines => [
  rotate(WRONG_OR_REPEAT_CLUE_DIALOGUE, attempt),
];

export const classifyChapterEightMemorySelection = (
  fragmentId: NoahArchiveFragmentId,
  memoryId: ChapterEightMemoryId,
  alreadyRestored: boolean,
  failureCount: number,
): ChapterEightMemorySelectionKind => {
  if (alreadyRestored) return 'already-restored';
  if (isCorrectNoahMemory(fragmentId, memoryId)) return 'correct';
  return failureCount >= 2 ? 'wrong-repeated' : 'wrong';
};

export const getChapterEightMemorySelectionDialogue = (
  fragmentId: NoahArchiveFragmentId,
  memoryId: ChapterEightMemoryId,
  alreadyRestored: boolean,
  failureCount: number,
): DialogueLines => {
  const kind = classifyChapterEightMemorySelection(
    fragmentId,
    memoryId,
    alreadyRestored,
    failureCount,
  );

  if (kind === 'correct') return RESTORED_FRAGMENT_DIALOGUE[fragmentId];
  if (kind === 'already-restored') {
    return ['This message is already human again. I should leave it that way.'];
  }

  const stage = Math.min(Math.max(Math.floor(failureCount), 0), WRONG_MEMORY_DIALOGUE.length - 1);
  if (kind === 'wrong-repeated') {
    const fragment = getNoahArchiveFragment(fragmentId);
    const selected = getChapterEightMemory(memoryId);
    return [
      WRONG_MEMORY_DIALOGUE[stage][0],
      fragment?.hint
        ?? `The answer is not ${selected?.label.toLowerCase() ?? 'that memory'}. Read its source thread again.`,
    ];
  }

  return WRONG_MEMORY_DIALOGUE[stage];
};

export const getChapterEightFragmentRestoredDialogue = (
  fragmentId: NoahArchiveFragmentId,
): DialogueLines => RESTORED_FRAGMENT_DIALOGUE[fragmentId];
