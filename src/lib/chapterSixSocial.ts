export interface ChapterSixComment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  clue?: 'mara-kade';
}

export interface ChapterSixPost {
  kind: 'post';
  id: string;
  publishedAt: string;
  time: string;
  content: string;
  likes: number;
  comments: readonly ChapterSixComment[];
}

export interface ChapterSixAd {
  kind: 'ad';
  id: string;
  publishedAt: string;
  headline: string;
  body: string;
  metric: string;
}

const comments = (id: string, entries: readonly [string, string, string][]): readonly ChapterSixComment[] => (
  entries.map(([author, avatar, content], index) => ({
    id: `${id}-comment-${index + 1}`,
    author,
    avatar,
    time: `${13 - Math.min(index, 2)} years ago`,
    content,
  }))
);

export const CHAPTER_SIX_POSTS: readonly ChapterSixPost[] = [
  {
    kind: 'post', id: 'noah-2010-02', publishedAt: '2010-02-18', time: 'Feb 18, 2010', likes: 34,
    content: 'First week in the tiny Silver Kite office. Two desks, one borrowed build machine, and more ideas than floor space. This can work.',
    comments: comments('2010-02', [
      ['Dani Wu', 'DW', 'Keep the window seat for concept sketches.'],
      ['Elias Vale', 'EV', 'The first milestone deck is already looking strong.'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2010-11', publishedAt: '2010-11-06', time: 'Nov 6, 2010', likes: 51,
    content: 'Our flight prototype finally feels like steering through weather instead of moving a number between two walls.',
    comments: comments('2010-11', [
      ['Jules Park', 'JP', 'The wind pass changed everything.'],
      ['Mina Liao', 'ML', 'Please keep the little landing wobble.'],
      ['Tomas Reed', 'TR', 'Playtest build tonight?'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2011-03', publishedAt: '2011-03-21', time: 'Mar 21, 2011', likes: 67,
    content: 'We decided the game needs a real ending. A score can keep counting, but a journey should still know when it has arrived.',
    comments: comments('2011-03', [
      ['Priya Raman', 'PR', 'Finally. I want credits after surviving that storm.'],
      ['Elias Vale', 'EV', 'Finite campaign approved. Let us make all 256 sections count.'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2011-10', publishedAt: '2011-10-02', time: 'Oct 2, 2011', likes: 83,
    content: 'Gate themes are on the wall now: coast, city, cloudline, night, and the quiet route home. It looks impossible and I love it.',
    comments: comments('2011-10', [
      ['Dani Wu', 'DW', 'The quiet route is staying. I am not negotiating.'],
      ['Tomas Reed', 'TR', 'Build server says 214 gates and climbing.'],
      ['Nora Bell', 'NB', 'This is the first roadmap I have enjoyed reading.'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2012-04', publishedAt: '2012-04-14', time: 'Apr 14, 2012', likes: 109,
    content: 'Lumen Arc sensor support is alive. Tilting the device feels strange for ten seconds, then every other control feels wrong.',
    comments: comments('2012-04', [
      ['Lumen DevRel', 'LA', 'The calibration team loved this build.'],
      ['Jules Park', 'JP', 'I nearly fell out of my chair and still gave it five stars.'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2012-12', publishedAt: '2012-12-09', time: 'Dec 9, 2012', likes: 142,
    content: 'Skyline 256 has a title screen, a final gate, and credits. There is still a mountain of work, but tonight it is a whole game.',
    comments: comments('2012-12', [
      ['Mina Liao', 'ML', 'You made the impossible list look short.'],
      ['Elias Vale', 'EV', 'Publisher preview next month. Rest first.'],
      ['Dani Wu', 'DW', 'Saving this post for launch day.'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2013-06', publishedAt: '2013-06-02', time: 'Jun 2, 2013', likes: 188,
    content: 'The first public demo ended exactly where it should. Watching someone reach the credits without help was worth every late night.',
    comments: comments('2013-06', [
      ['Retro Tech Archaeology', 'RT', 'A mobile game with an ending. Imagine that.'],
      ['Tomas Reed', 'TR', 'No crashes in the final route. Calling that a miracle.'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2014-04', publishedAt: '2014-04-20', time: 'Apr 20, 2014', likes: 24,
    content: 'The recall is real. I am finishing one last update so the complete route survives on any Lumen Arc that is still out there.',
    comments: [
      { id: '2014-04-comment-1', author: 'Dani Wu', avatar: 'DW', time: '12 years ago', content: 'I kept the final art source and the printed route map.' },
      { id: '2014-04-comment-2', author: 'Mara Kade', avatar: 'MK', time: '12 years ago', content: 'Do not worry, my dear. I bought hundreds of copies to support you, and I saved one fully loaded device for our child. He will find it when he is older.', clue: 'mara-kade' },
      { id: '2014-04-comment-3', author: 'Noah Kade', avatar: 'NK', time: '12 years ago', content: 'Then I will make sure there is something complete for him to find.' },
    ],
  },
  {
    kind: 'post', id: 'noah-2014-08', publishedAt: '2014-08-11', time: 'Aug 11, 2014', likes: 9,
    content: 'The studio name is changing. I did not approve the automation plan, and I will not pretend replacing craft with generated inventory is preservation.',
    comments: comments('2014-08', [
      ['Closed Mall Archive', 'CM', 'Keeping a copy of this statement.'],
      ['Elias Vale', 'EV', 'This discussion belongs off the public page.'],
    ]),
  },
  {
    kind: 'post', id: 'noah-2014-10', publishedAt: '2014-10-31', time: 'Oct 31, 2014', likes: 3,
    content: 'Final build uploaded. It still ends. Whatever happens to the storefront, that part is true.',
    comments: comments('2014-10', [
      ['Dead Formats Circle', 'DF', 'Mirrored the checksum.'],
      ['quietframes', 'QF', 'Thank you for letting it finish.'],
    ]),
  },
] as const;

export const SKG_AUTOMATION_FACE_ADS: readonly ChapterSixAd[] = [
  ['ad-1', '2026-06-18', 'Turn one memory into 400 daily posts', 'SKG Automation keeps your legacy account active with autonomous engagement.', '18.4K synthetic reactions'],
  ['ad-2', '2026-06-12', 'Creators are optional. Content is forever.', 'Replace slow human production with a feed that never reaches an ending.', '256 campaigns generated'],
  ['ad-3', '2026-06-04', 'Your old brand deserves a louder future', 'One-click acquisition, renaming, reposting, and audience replacement.', '40 markets automated'],
  ['ad-4', '2026-05-29', 'Never let an archive go quiet', 'Our remembrance engine posts anniversaries whether anyone remembers them or not.', '99.8% activity uptime'],
  ['ad-5', '2026-05-21', 'Monetize dormant communities', 'Convert abandoned groups into high-yield promotional surfaces overnight.', '12M impressions'],
  ['ad-6', '2026-05-08', 'SKG AutoPersona™', 'A founder voice, generated from whatever public fragments remain.', 'No personnel required'],
].map(([id, publishedAt, headline, body, metric]) => ({ kind: 'ad' as const, id, publishedAt, headline, body, metric }));

export type ChapterSixTimelineEntry = ChapterSixPost | ChapterSixAd;

export const getChapterSixTimeline = (oldestFirst: boolean): readonly ChapterSixTimelineEntry[] => {
  const posts = [...CHAPTER_SIX_POSTS].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  if (oldestFirst) return [...posts, ...SKG_AUTOMATION_FACE_ADS];
  return [...SKG_AUTOMATION_FACE_ADS, ...posts.reverse()];
};

export const getMaraCluePostIndex = (): number => (
  getChapterSixTimeline(true).findIndex((entry) => entry.kind === 'post' && entry.comments.some((comment) => comment.clue === 'mara-kade'))
);
