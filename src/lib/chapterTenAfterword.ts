import type { GameProgress } from '../types';

export type ChapterTenAfterword = NonNullable<GameProgress['selectedEnding']>;

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
    'So I let the board keep it.',
    'Negative sixty-five thousand, five hundred and thirty-five. Dead last.',
    'Honestly? There is a lot less pressure down here.',
  ],
  publicize: [
    'So I tell everyone what happened.',
    'They argue over the score, the archive, and whether any of it counts.',
    'At least nobody gets to pretend the game never existed.',
  ],
  preserve: [
    'So I keep the build alive and leave the scoreboard alone.',
    'No victory announcement. No permanent server.',
    'Just a door that still opens when someone needs it.',
  ],
};
