export type MaraNumberClue = 'arc' | 'gate' | 'end';
export type MaraCoordinateMapping = Readonly<Record<MaraNumberClue, number | null>>;

export const MARA_COLLECTIBLE_NUMBERS = [184, 40, 256] as const;

export interface MaraProfilePost {
  id: string;
  date: string;
  content: string;
  reactions: number;
  comments: number;
  clue?: MaraNumberClue;
}

export const MARA_PROFILE_POSTS: readonly MaraProfilePost[] = [
  { id: 'mara-2014-09', date: '2014-09-03', content: 'Found the blue scarf again. It was exactly where I insisted I had already looked.', reactions: 18, comments: 3 },
  { id: 'mara-2014-08', date: '2014-08-17', content: 'The harbor lookout is still my favorite place in the city. Noah wrote ARC 184 beside it in the old family notebook.', reactions: 40, comments: 6, clue: 'arc' },
  { id: 'mara-2014-07', date: '2014-07-29', content: 'Noah says tea cannot count as dinner. This is a surprisingly rigid position for an experimental designer.', reactions: 31, comments: 4 },
  { id: 'mara-2014-06', date: '2014-06-12', content: 'Hundreds of tiny paper kites for the school fair. My fingers have formally resigned.', reactions: 56, comments: 9 },
  { id: 'mara-2014-05', date: '2014-05-04', content: 'Gate 40 at the old terminal. Same meeting place, every anniversary, even after the trains stopped using it.', reactions: 44, comments: 5, clue: 'gate' },
  { id: 'mara-2014-04', date: '2014-04-20', content: 'Proud of the last build. A game should be allowed to finish, even if nobody reaches the last screen.', reactions: 27, comments: 2 },
  { id: 'mara-2014-03', date: '2014-03-08', content: 'A quiet morning, a repaired radio, and absolutely no reason to check work mail.', reactions: 22, comments: 1 },
  { id: 'mara-2014-02', date: '2014-02-14', content: 'He remembered the flowers. I remembered the spare charger. Between us, one competent adult.', reactions: 63, comments: 11 },
  { id: 'mara-2014-01', date: '2014-01-26', content: 'Page 256. The ending of the book is still my favorite part: everyone finally chooses to go home.', reactions: 35, comments: 7, clue: 'end' },
  { id: 'mara-2013-12', date: '2013-12-18', content: 'Rain all afternoon. The radio still works, the tea went cold, and nobody needed anything from us.', reactions: 19, comments: 2 },
] as const;

export const getMaraNumberValue = (clue: MaraNumberClue): number => ({
  arc: 184,
  gate: 40,
  end: 256,
})[clue];

export const isMaraCoordinateMappingCorrect = (mapping: MaraCoordinateMapping): boolean =>
  mapping.arc === getMaraNumberValue('arc')
  && mapping.gate === getMaraNumberValue('gate')
  && mapping.end === getMaraNumberValue('end');

export const getMaraClueProgress = (progress: {
  discoveredMaraArc184: boolean;
  discoveredMaraGate40: boolean;
  discoveredMaraEnd256: boolean;
}): Readonly<Record<MaraNumberClue, boolean>> => ({
  arc: progress.discoveredMaraArc184,
  gate: progress.discoveredMaraGate40,
  end: progress.discoveredMaraEnd256,
});

export const hasAllMaraNumberClues = (progress: Parameters<typeof getMaraClueProgress>[0]): boolean => {
  const clues = getMaraClueProgress(progress);
  return clues.arc && clues.gate && clues.end;
};
