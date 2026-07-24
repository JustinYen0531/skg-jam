import type { GameProgress } from '../types';

export type ChapterTenAfterword = NonNullable<GameProgress['selectedEnding']>;

export const CHAPTER_TEN_AFTERWORD_MEMORY_STORAGE_KEY = 'skg.chapterTen.afterwordMemories';

export const getRememberedChapterTenAfterwords = (): ChapterTenAfterword[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(CHAPTER_TEN_AFTERWORD_MEMORY_STORAGE_KEY) ?? '[]');
    return Array.isArray(saved)
      ? saved.filter((value): value is ChapterTenAfterword => ['submit', 'publicize', 'preserve'].includes(value))
      : [];
  } catch {
    return [];
  }
};

export const hasRememberedChapterTenAfterword = (afterword: ChapterTenAfterword): boolean =>
  getRememberedChapterTenAfterwords().includes(afterword);

export const CHAPTER_TEN_AFTERWORD_OPTIONS: ReadonlyArray<{
  id: ChapterTenAfterword;
  label: string;
  description: string;
}> = [
  {
    id: 'submit',
    label: 'I. LET THE SCORE REMAIN',
    description: 'Leave ARCANE at −65535 and let the impossible record speak for itself.',
  },
  {
    id: 'publicize',
    label: 'II. TELL THE STORY',
    description: 'Release the route, the recovered conversations, and the story behind Skyline 256.',
  },
  {
    id: 'preserve',
    label: 'III. KEEP THE DOOR OPEN',
    description: 'Keep the build playable without declaring a public winner.',
  },
] as const;

export const CHAPTER_TEN_AFTERWORD_LINES: Readonly<Record<ChapterTenAfterword, readonly string[]>> = {
  submit: [
    'You want me to leave it there.',
    'After everything it took to get here, I do not think being first matters as much as I thought it did.',
    'Let the board keep my name at negative sixty-five thousand, five hundred and thirty-five.',
    'It is honest. And there are more important things than being above everyone else.',
    'If you remember this one, scroll to the bottom of the board next loop. I will still be there.',
  ],
  publicize: [
    'You want to tell the story. I understand why.',
    'But SKG Automation would close this route the moment enough people looked at it. Then they would call us confused, and the archive would be easier to erase.',
    'I do not like giving them the last word just to prove they hurt us.',
    'Still, if you remember this choice, I will leave a small trace for the next loop. You deserve to see what we chose not to say aloud.',
  ],
  preserve: [
    'You want to keep the door open and stop there.',
    'I think Dad would understand. He left the route for me to find, not for everyone to turn into a spectacle.',
    'But he also let me submit the score. That feels less like hiding and more like permission.',
    'Maybe the natural thing is to leave the door where it is. No announcement. No disappearing act. Just a way back, if someone truly needs it.',
    'Remember it, and I will leave a quiet sign for you next time.',
  ],
};

export const CHAPTER_TEN_AFTERWORD_EASTER_EGG_HINTS: Readonly<Record<ChapterTenAfterword, string>> = {
  submit: 'NEXT LOOP: THE LOWEST SCORE IS NOT AT THE TOP.',
  publicize: 'NEXT LOOP: A ROUTE LEAVES A TRACE BEFORE IT GETS ERASED.',
  preserve: 'NEXT LOOP: SOME DOORS STAY OPEN WITHOUT AN ANNOUNCEMENT.',
};
