import type { ActiveApp } from '../types';
import type { DialogueLines } from './chapterOneDialogue';

export type ChapterSixNoiseKind = 'home-feed' | 'left-sidebar' | 'right-sidebar' | 'sidebar-ad';
export type ChapterSixSearchKind = 'empty' | 'mara' | 'elias' | 'studio' | 'other';

export const CHAPTER_SIX_DIALOGUE = {
  entry: [
    'I have a name now. Noah Kade.',
    'Even the erased get a profile somewhere. Let us see who he was in public.',
  ],
  homeReturned: [
    'One person survived the company page. FaceSpace may have kept the rest of him.',
  ],
  socialOpened: [
    'FaceSpace. Everyone performing a life at me at once.',
    'One specific person is buried in all this noise.',
  ],
  searchFocused: [
    'One name. Noah Kade. Let us find out if the platform kept him.',
  ],
  profileLoaded: [
    'Founder and game designer. Silver Kite Games.',
    'The corporate site scrubbed his name. This page still has his face.',
  ],
  sponsoredWallVisible: [
    'His own page, and the top of it is ads for the thing that ate his company.',
    'A founder voice, generated from whatever fragments remain. They are puppeting a man nobody can account for.',
  ],
  sortedOldest: [
    'The sponsored garbage can wait. This is where he started.',
  ],
  sortedSponsored: [
    'And the machine puts itself back on top. Predictable.',
  ],
  earlyTimelineRead: [
    'Two desks and a borrowed build machine.',
    'He spent four years saying the same thing: a journey should know when it has arrived.',
  ],
  recallPostRead: [
    'Finishing one last update so the complete route survives.',
    'He knew it was ending, and spent the time making sure something stayed.',
  ],
  maraNameVisible: [
    'Mara Kade.',
    'That is my mother\'s name. In a stranger\'s comment thread.',
  ],
  maraCommentSelected: [
    'I saved one fully loaded device for our child. He will find it when he is older.',
    'That sounds like the device on my desk. I need to know who that child was.',
    'This phone still has another page tied to the family backup. I should check whose account it calls mine.',
  ],
  profilePageOpened: [
    'Arcane Kade. My name, pulled from the same 2014 migration.',
    'The family records are under the linked accounts.',
  ],
  completed: [
    'I saved one fully loaded device for our child.',
    'That device is on my desk. I am the child.',
    'I remember Dad. I never knew Noah was the name he used here.',
  ],
  completedRevisit: [
    'I know whose device this was, and who it was waiting for.',
  ],
} as const satisfies Record<string, DialogueLines>;

const NOISE_DIALOGUE: Readonly<Record<ChapterSixNoiseKind, readonly string[]>> = {
  'home-feed': [
    'A bird promoted to Regional Operations Manager. Focus.',
    'The whole feed is performing a life. I need the one page that stopped.',
    'Someone remembers when mobile games were allowed to end. Noah built one that did.',
  ],
  'left-sidebar': [
    'People I may know. I am looking for someone nobody was supposed to remember.',
    'Notifications, memories, groups. Plenty of motion. No direction.',
  ],
  'right-sidebar': [
    'Trending topics: the daily ceremony of mistaking volume for memory.',
    'Another living feed. I need the page that stopped updating.',
  ],
  'sidebar-ad': [
    'AutoFriend Pro. Never remember a birthday either. Bleak, and not my problem right now.',
  ],
};

const AD_DIALOGUE: Readonly<Record<string, DialogueLines>> = {
  'ad-1': ['Turn one memory into four hundred daily posts. On the page of a man who chose an ending.'],
  'ad-2': ['Creators are optional. Content is forever. That is the whole crime in one slogan.'],
  'ad-3': ['Acquire the brand, replace the audience, call the noise a future. Efficient.'],
  'ad-4': ['Never let an archive go quiet. The archive is quiet because he is gone.'],
  'ad-5': ['Monetize dormant communities. Even abandonment needs quarterly growth.'],
  'ad-6': ['SKG AutoPersona. They kept his voice and deleted him.'],
};

const COMMENT_DIALOGUE = [
  'Old teammates, cheering him on. Warm. Not what I am here for.',
  'Elias Vale, agreeing with every post. The same Elias who later automated all of it.',
  'A dozen comments about wind physics. None of them is the one.',
  'Colleagues, playtesters, a Lumen representative. Everyone except the person I need.',
] as const;

const POST_DIALOGUE: Readonly<Record<string, DialogueLines>> = {
  'noah-2010-02': CHAPTER_SIX_DIALOGUE.earlyTimelineRead,
  'noah-2011-03': ['A score can keep counting, but a journey should still know when it has arrived. He meant that.'],
  'noah-2012-04': ['Lumen Arc sensor support. The device and his game were built around each other.'],
  'noah-2012-12': ['A title screen, a final gate, and credits. A whole game, not an endless meter.'],
  'noah-2013-06': ['Someone reached the credits without help. That was the part he cared about.'],
  'noah-2014-04': CHAPTER_SIX_DIALOGUE.recallPostRead,
  'noah-2014-08': ['He would not call generated inventory preservation. Neither will I.'],
  'noah-2014-10': ['Final build uploaded. It still ends. He kept that promise.'],
};

const WRONG_APP_DIALOGUE: Partial<Record<ActiveApp, DialogueLines>> = {
  flappy: ['Same wall at forty. Built by the man whose page I need to read.'],
  viewtube: ['The recording started all of this. It cannot tell me who he was.'],
  amazemart: ['The purchase is done. Now I am finding out who I bought a piece of.'],
  browser: ['I found the buried studio there. The person who built it is on FaceSpace.'],
  messages: ['Mom is one tap away. I am trying to find who she was to him.'],
  screenshots: ['The screenshots gave me the name. FaceSpace may still have the person.'],
  about: ['Preservation, again. His public page is proof of what the opposite costs.'],
};

const COMPANION_DIALOGUE = [
  'His page is buried under ads for his own erasure. The dates still know what came first.',
  'The answer may be in who answered him, not only in what he posted.',
  'Everyone in the comments knew him. One of them may have known him at home.',
] as const;

const rotate = <T>(items: readonly T[], attempt: number): T =>
  items[Math.abs(Math.floor(attempt)) % items.length];

export const classifyChapterSixSearch = (query: string): ChapterSixSearchKind => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 'empty';
  if (normalized.includes('mara')) return 'mara';
  if (normalized.includes('elias')) return 'elias';
  if (normalized.includes('silver kite') || normalized === 'skg' || normalized.includes('skg automation')) return 'studio';
  return 'other';
};

export const getChapterSixSearchDialogue = (query: string): DialogueLines => {
  const kind = classifyChapterSixSearch(query);
  if (kind === 'empty') return ['The box wants a person. I only have one worth typing.'];
  if (kind === 'mara') return ['She is in my messages, not a search bar. Noah first.'];
  if (kind === 'elias') return ['Elias Vale. The partner. No reason to look him up yet.'];
  if (kind === 'studio') return ['The studio is a ghost. I need the person who ran it.'];
  return ['Wrong person. There is only one profile I came here for.'];
};

export const getChapterSixNoiseDialogue = (kind: ChapterSixNoiseKind, attempt: number): DialogueLines => [
  rotate(NOISE_DIALOGUE[kind], attempt),
];

export const getChapterSixAdDialogue = (adId: string, attempt: number): DialogueLines =>
  attempt === 0 && AD_DIALOGUE[adId]
    ? AD_DIALOGUE[adId]
    : [rotate(Object.values(AD_DIALOGUE).flat(), attempt)];

export const getChapterSixPostDialogue = (postId: string, attempt: number): DialogueLines =>
  attempt === 0 && POST_DIALOGUE[postId]
    ? POST_DIALOGUE[postId]
    : [rotate(CHAPTER_SIX_DIALOGUE.earlyTimelineRead, attempt)];

export const getChapterSixCommentDialogue = (containsMara: boolean, attempt: number): DialogueLines =>
  containsMara ? CHAPTER_SIX_DIALOGUE.maraNameVisible : [rotate(COMMENT_DIALOGUE, attempt)];

export const getChapterSixWrongAppDialogue = (app: ActiveApp, attempt: number): DialogueLines =>
  WRONG_APP_DIALOGUE[app] ?? [rotate(COMPANION_DIALOGUE, attempt)];

export const getChapterSixCompanionDialogue = (attempt: number): DialogueLines => [
  rotate(COMPANION_DIALOGUE, attempt),
];
