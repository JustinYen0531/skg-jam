import type { DialogueLines } from './chapterOneDialogue';
import type { ChapterNineDeletableApp } from './chapterNineDeletion';

export const CHAPTER_NINE_DIALOGUE = {
  restoreBlocked: [
    'The profile is intact. The phone is not.',
    'It needs room for one last local restore.',
  ],
  stageBlocked: [
    'No. Not that one first.',
    'If we are doing this, start with something replaceable.',
  ],
  evidenceBlocked: [
    'Those are the records that brought us here.',
    'Clear the disposable things before you ask me for those.',
  ],
  memoryBlocked: [
    'No. You do not get to start with them.',
    'Finish removing everything else first.',
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
  about: [
    'The diagrams only proved what the device used to be.',
    'We already know that now.',
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
  if (app === 'social' || app === 'messages') return CHAPTER_NINE_DIALOGUE.memoryBlocked;
  if (app === 'about' || app === 'browser') return CHAPTER_NINE_DIALOGUE.evidenceBlocked;
  return deletedIds.length === 0 ? CHAPTER_NINE_DIALOGUE.stageBlocked : CHAPTER_NINE_DIALOGUE.restoreBlocked;
};

export const getChapterNineMessagesStandoffDialogue = (attempt: number): DialogueLines =>
  CHAPTER_NINE_DIALOGUE.messagesStandoff[
    Math.min(CHAPTER_NINE_DIALOGUE.messagesStandoff.length - 1, Math.max(0, attempt))
  ];
