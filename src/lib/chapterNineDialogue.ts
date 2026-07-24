import type { DialogueLines } from './chapterOneDialogue';
import type { ChapterNineDeletableApp } from './chapterNineDeletion';

export const CHAPTER_NINE_DIALOGUE = {
  authorizationLocated: [
    'This is not a player account.',
    'It is an official assistant tool. It still recognizes ARC-184, but not the person it was licensed to help.',
  ],
  recordClarified: [
    'When was I ARC-184?',
    'That has to be a coincidence.',
  ],
  operatorNameRejected: [
    'It has the score. It has the device.',
    'It just does not know whose name belongs with them.',
  ],
  operatorIdentityRestored: [
    'Arcane.',
    'The score and the name belonged to the same person.',
  ],
  storageBlocked: [
    'It found him, and now it cannot finish waking up.',
    'The authorization is intact. The phone is not.',
    'I need room. Holding an icon should let me make it; tapping will not.',
  ],
  poweredDown: [
    'You win.',
  ],
  restingHint: [
    'It is dead.',
    '...Maybe I should put it down.',
  ],
  restoreBlocked: [
    'The authorization is intact. The phone is not.',
    'It needs room for one last local restore.',
  ],
  stageBlocked: [
    'Not that one.',
    'The Concept file was written for whoever came after us. Start there.',
  ],
  evidenceBlocked: [
    'We still have things that can be downloaded again.',
    'Do not start erasing how we got here.',
  ],
  memoryBlocked: [
    'Those are not apps to me.',
    'Remove everything replaceable before you ask again.',
  ],
  messagesStandoff: [
    [
      'No.',
      'Those messages are not evidence.',
    ],
    [
      'That is my mother.',
      'If this goes, I cannot ask the archive to remember her again.',
    ],
    [
      'You really think the answer is worth more than everything that led us to it?',
      'Stop pressing it.',
    ],
  ],
} as const satisfies Record<string, DialogueLines | readonly DialogueLines[]>;

export const CHAPTER_NINE_DELETION_DIALOGUE: Readonly<Record<Exclude<ChapterNineDeletableApp, 'messages'>, DialogueLines>> = {
  about: [
    'The Concept file was only a manual for whoever found this later.',
    'It can go first.',
  ],
  amazemart: [
    'It is just a store. Fine.',
  ],
  screenshots: [
    'A box, some screenshots, and a seller who probably never existed.',
  ],
  viewtube: [
    'That channel started this whole thing.',
    'I will not miss it.',
  ],
  browser: [
    'That is where I found his name.',
    'Stopping now would mean we erased the rest for nothing.',
  ],
  social: [
    'Their profiles are still here.',
    'Mom\'s comments. Dad\'s old posts.',
  ],
};

export const getChapterNineBlockedDialogue = (
  app: ChapterNineDeletableApp,
  deletedIds: readonly string[],
): DialogueLines => {
  if (!deletedIds.includes('about')) return CHAPTER_NINE_DIALOGUE.stageBlocked;
  if (app === 'messages') return CHAPTER_NINE_DIALOGUE.memoryBlocked;
  if (app === 'browser' || app === 'social') return CHAPTER_NINE_DIALOGUE.evidenceBlocked;
  return CHAPTER_NINE_DIALOGUE.restoreBlocked;
};

export const getChapterNineMessagesStandoffDialogue = (attempt: number): DialogueLines =>
  CHAPTER_NINE_DIALOGUE.messagesStandoff[
    Math.min(CHAPTER_NINE_DIALOGUE.messagesStandoff.length - 1, Math.max(0, attempt))
  ];
