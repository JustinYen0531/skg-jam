import React, { useRef, useState } from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Award,
  Bell,
  CalendarDays,
  ChevronDown,
  Globe2,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings2,
  UserRound,
  Users,
} from 'lucide-react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import { createFeedSeed, shuffleFeed } from '../lib/pseudoFeed';
import {
  getChapterSixTimeline,
  type ChapterSixComment,
  type ChapterSixPost,
} from '../lib/chapterSixSocial';
import {
  CHAPTER_SIX_DIALOGUE,
  getChapterSixAdDialogue,
  getChapterSixCommentDialogue,
  getChapterSixNoiseDialogue,
  getChapterSixPostDialogue,
  getChapterSixSearchDialogue,
  type ChapterSixNoiseKind,
} from '../lib/chapterSixDialogue';
import type { DialogueLines } from '../lib/chapterOneDialogue';

const FACESPACE_FEED = [
  { id: 'fs-1', author: 'Mina Liao', avatar: 'ML', time: '18 min', audience: 'Friends', content: 'The café recommendation algorithm sent me to the café I was already sitting in. Five stars for confidence.', reactions: 84, comments: 12, accent: 'from-rose-500 to-orange-400' },
  { id: 'fs-2', author: 'Retro Tech Archaeology', avatar: 'RT', time: '1 hr', audience: 'Public', content: 'What discontinued gadget would you bring back for exactly one afternoon?', reactions: 1300, comments: 418, accent: 'from-cyan-500 to-indigo-800' },
  { id: 'fs-3', author: 'Jules Park', avatar: 'JP', time: '2 hr', audience: 'Friends', content: 'I finished reorganizing my desktop and immediately forgot where everything went. Progress!', reactions: 31, comments: 7, accent: 'from-emerald-500 to-teal-900' },
  { id: 'fs-4', author: 'Bird Photos With No Context', avatar: 'BP', time: '3 hr', audience: 'Public', content: 'Today’s bird has been promoted to Regional Operations Manager.', reactions: 9200, comments: 602, accent: 'from-sky-400 to-blue-900' },
  { id: 'fs-5', author: 'Evan Ortiz', avatar: 'EO', time: 'Yesterday', audience: 'Friends', content: 'Does anybody else remember when mobile games were allowed to end?', reactions: 256, comments: 37, accent: 'from-violet-600 to-slate-950' },
  { id: 'fs-6', author: 'LifePilot AI', avatar: 'LP', time: 'Sponsored', audience: 'Promoted', content: 'Automate your hobbies so you have more time to optimize your free time.', reactions: 12000, comments: 3, accent: 'from-fuchsia-500 via-purple-700 to-cyan-600' },
] as const;

const FRIEND_NOISE = [
  ['ML', 'Mina Liao', '3 mutual friends'],
  ['JP', 'Jules Park', 'Archive Club'],
  ['PR', 'Priya Raman', 'Harborview'],
] as const;

interface SocialAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onMaraFound?: () => void;
  onDialogue?: (lines: DialogueLines) => void;
}

const LeftSidebar: React.FC<{ onInteract: (kind: ChapterSixNoiseKind) => void }> = ({ onInteract }) => (
  <aside className="w-[21%] min-w-[126px] shrink-0 space-y-2 overflow-y-auto rounded-xl border border-white/[0.06] bg-slate-950/70 p-2" id="social-left-sidebar">
    <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">Your FaceSpace</div>
    {[
      [Home, 'Home feed', '12 new'],
      [Bell, 'Notifications', '4 unread'],
      [CalendarDays, 'Memories', 'On this day'],
      [Users, 'Groups', '7 updates'],
    ].map(([Icon, label, meta]) => {
      const ItemIcon = Icon as React.FC<{ className?: string }>;
      return (
        <button key={label as string} type="button" onClick={() => { audio.playTick(); onInteract('left-sidebar'); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-white/[0.05]">
          <ItemIcon className="h-3.5 w-3.5 shrink-0 text-blue-400" />
          <span className="min-w-0 flex-1 text-[9px] font-semibold text-slate-200">{label as string}</span>
          <span className="text-[7px] text-slate-600">{meta as string}</span>
        </button>
      );
    })}
    <div className="border-t border-white/[0.06] pt-2 text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">People you may know</div>
    {FRIEND_NOISE.map(([avatar, name, mutual]) => (
      <button key={name} type="button" onClick={() => { audio.playTick(); onInteract('left-sidebar'); }} className="flex w-full items-center gap-2 rounded-lg bg-white/[0.025] p-2 text-left">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-950 text-[8px] font-black">{avatar}</div>
        <div className="min-w-0">
          <div className="truncate text-[8.5px] font-bold">{name}</div>
          <div className="truncate text-[7px] text-slate-600">{mutual}</div>
        </div>
      </button>
    ))}
  </aside>
);

const RightSidebar: React.FC<{ onInteract: (kind: ChapterSixNoiseKind) => void }> = ({ onInteract }) => (
  <aside className="w-[22%] min-w-[132px] shrink-0 space-y-2 overflow-y-auto rounded-xl border border-white/[0.06] bg-slate-950/70 p-2" id="social-right-sidebar">
    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.15em] text-slate-500"><span>Trending</span><Globe2 className="h-3 w-3" /></div>
    {['#HarborviewFog', '#ArchiveWeekend', '#EndlessSummerAI'].map((tag, index) => (
      <button key={tag} type="button" onClick={() => { audio.playTick(); onInteract('right-sidebar'); }} className="block w-full rounded-lg bg-white/[0.03] p-2 text-left">
        <div className="text-[8.5px] font-bold text-slate-300">{tag}</div>
        <div className="mt-0.5 text-[7px] text-slate-600">{[1300, 884, 40200][index].toLocaleString()} posts</div>
      </button>
    ))}
    <button type="button" onClick={() => { audio.playTick(); onInteract('sidebar-ad'); }} className="w-full rounded-lg border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-950/70 to-cyan-950/50 p-2 text-left" id="social-sidebar-ad">
      <div className="text-[6.5px] font-black tracking-[0.18em] text-fuchsia-300">SPONSORED</div>
      <div className="mt-1 text-[9px] font-black text-white">AutoFriend Pro</div>
      <p className="mt-1 text-[7.5px] leading-relaxed text-slate-400">Never forget a birthday. Never remember one either.</p>
    </button>
    <div className="text-[7px] leading-relaxed text-slate-700">Privacy · Terms · Automated memories · Ad choices · © 2026</div>
  </aside>
);

export const SocialApp: React.FC<SocialAppProps> = ({ progress, updateProgress, onMaraFound, onDialogue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(progress.discoveredMotherComment || progress.currentChapter >= 7);
  const [sortOldest, setSortOldest] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [searchError, setSearchError] = useState('');
  const [expandedComments, setExpandedComments] = useState<ReadonlySet<string>>(() => new Set());
  const [homeFeed] = useState(() => shuffleFeed(FACESPACE_FEED, createFeedSeed('facespace')));
  const searchFocusShown = useRef(false);
  const noiseAttempt = useRef(0);
  const commentAttempt = useRef(0);
  const adAttempts = useRef(new Map<string, number>());
  const postAttempts = useRef(new Map<string, number>());

  const speakChapterSix = (lines: DialogueLines) => {
    if (progress.currentChapter === 6 && lines.length > 0) onDialogue?.(lines);
  };

  const handleNoiseInteraction = (kind: ChapterSixNoiseKind) => {
    speakChapterSix(getChapterSixNoiseDialogue(kind, noiseAttempt.current));
    noiseAttempt.current += 1;
  };

  const handleSearchFocus = () => {
    if (searchFocusShown.current) return;
    searchFocusShown.current = true;
    speakChapterSix(CHAPTER_SIX_DIALOGUE.searchFocused);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    audio.playTick();
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('noah') || query.includes('kade')) {
      if (!canUseProgressionAction('social-noah-search', progress)) {
        audio.playGlitch();
        setSearchError('No matching profile is available from the evidence collected so far.');
        return;
      }
      setSearchError('');
      setHasSearched(true);
      setActiveTab('posts');
      speakChapterSix([
        CHAPTER_SIX_DIALOGUE.profileLoaded[0],
        CHAPTER_SIX_DIALOGUE.sponsoredWallVisible[0],
      ]);
      return;
    }
    setSearchError(query ? `No profiles found for “${searchQuery.trim()}”.` : 'Enter a name to search FaceSpace.');
    speakChapterSix(getChapterSixSearchDialogue(searchQuery));
  };

  const toggleSort = () => {
    const next = !sortOldest;
    audio.play('social.sort', { variant: next ? 1 : 0 });
    setSortOldest(next);
    setExpandedComments(new Set());
    speakChapterSix(next ? CHAPTER_SIX_DIALOGUE.sortedOldest : CHAPTER_SIX_DIALOGUE.sortedSponsored);
  };

  const toggleComments = (post: ChapterSixPost) => {
    audio.play('phone.tab');
    const opening = !expandedComments.has(post.id);
    if (opening) {
      const containsMara = post.comments.some((comment) => comment.clue === 'mara-kade');
      const attempt = postAttempts.current.get(post.id) ?? 0;
      speakChapterSix(containsMara
        ? getChapterSixCommentDialogue(true, commentAttempt.current++)
        : attempt === 0
          ? getChapterSixPostDialogue(post.id, attempt)
          : getChapterSixCommentDialogue(false, commentAttempt.current++));
      postAttempts.current.set(post.id, attempt + 1);
    }
    setExpandedComments((current) => {
      const next = new Set(current);
      if (next.has(post.id)) next.delete(post.id);
      else next.add(post.id);
      return next;
    });
  };

  const handleAdInteraction = (adId: string) => {
    audio.playTick();
    const attempt = adAttempts.current.get(adId) ?? 0;
    speakChapterSix(getChapterSixAdDialogue(adId, attempt));
    adAttempts.current.set(adId, attempt + 1);
  };

  const handleComment = (comment: ChapterSixComment) => {
    audio.playTick();
    if (comment.clue !== 'mara-kade' || progress.currentChapter !== 6 || progress.discoveredMotherComment) return;
    updateProgress((previous) => previous.currentChapter === 6
      ? { ...previous, discoveredMotherComment: true }
      : previous);
    onMaraFound?.();
  };

  const timeline = getChapterSixTimeline(sortOldest);

  const renderPost = (post: ChapterSixPost) => {
    const commentsOpen = expandedComments.has(post.id);
    return (
      <article key={post.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3" data-noah-post={post.id}>
        <div className="flex items-start gap-2 border-b border-slate-800 pb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-950 text-[9px] font-black">NK</div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-blue-300">Noah Kade</div>
            <div className="text-[8px] text-slate-500">{post.time} · Public</div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-slate-600" />
        </div>
        <p className="py-2 text-[10px] leading-relaxed text-slate-200">{post.content}</p>
        <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[8px] text-slate-500">
          <span><Heart className="mr-1 inline h-3 w-3 text-rose-500" />{post.likes}</span>
          <button type="button" onClick={() => toggleComments(post)} className="flex items-center gap-1 rounded px-1.5 py-1 font-bold text-slate-400 hover:bg-white/[0.05] hover:text-white" aria-expanded={commentsOpen} data-comment-toggle={post.id}>
            <MessageCircle className="h-3 w-3" /> {commentsOpen ? 'Hide' : 'View'} {post.comments.length} comments
            <ChevronDown className={`h-3 w-3 transition-transform ${commentsOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {commentsOpen && (
          <div className="mt-2 space-y-2 border-l border-slate-700 pl-2" data-comments-for={post.id}>
            {post.comments.map((comment) => (
              <button
                key={comment.id}
                type="button"
                onClick={() => handleComment(comment)}
                className={`flex w-full gap-2 rounded-lg p-2 text-left ${comment.clue === 'mara-kade' ? 'bg-pink-950/25 hover:bg-pink-950/40' : 'bg-slate-950/70 hover:bg-slate-950'}`}
                data-mara-clue={comment.clue === 'mara-kade' ? 'hidden-in-comment' : undefined}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[8px] font-black ${comment.clue === 'mara-kade' ? 'bg-pink-700' : 'bg-slate-700'}`}>{comment.avatar}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2"><span className="text-[8.5px] font-bold text-slate-200">{comment.author}</span><span className="text-[7px] text-slate-600">{comment.time}</span></div>
                  <p className="mt-0.5 text-[8.5px] leading-relaxed text-slate-400">{comment.content}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-900 font-sans text-slate-100" id="social-root">
      <header className="flex shrink-0 items-center gap-3 border-b border-blue-700/50 bg-blue-600 px-3 py-2" id="social-header">
        <div className="flex items-center gap-1.5 font-display text-base font-black tracking-tight text-white"><span className="rounded bg-white px-1.5 py-0.5 text-xs text-blue-600">f</span>FaceSpace</div>
        <form onSubmit={handleSearch} className="relative mx-auto w-[48%] max-w-[360px]">
          <input id="social-search-input" value={searchQuery} onFocus={handleSearchFocus} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search people" className="w-full rounded-full border border-blue-400/30 bg-blue-950/35 px-3 py-1.5 pr-8 text-[10px] text-white placeholder-blue-200/70 outline-none focus:border-white/50" />
          <button id="social-search-submit" type="submit" className="absolute right-2.5 top-1.5 text-blue-200"><Search className="h-3.5 w-3.5" /></button>
        </form>
        <div className="flex items-center gap-1.5 text-blue-100"><Bell className="h-4 w-4" /><UserRound className="h-4 w-4" /></div>
      </header>

      {searchError && <div className="shrink-0 border-b border-amber-400/20 bg-amber-950/35 px-3 py-1.5 text-center text-[8px] text-amber-200" id="social-search-error">{searchError}</div>}

      <div className="flex min-h-0 flex-1 gap-2 p-2" id="social-three-column-layout">
        <LeftSidebar onInteract={handleNoiseInteraction} />
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain" id="social-primary-column">
          {!hasSearched ? (
            <div className="mx-auto max-w-[540px] space-y-3" id="social-home-feed">
              <section className="rounded-xl border border-slate-800 bg-slate-950 p-2.5" id="social-composer">
                <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black">ME</div><div className="flex-1 rounded-full bg-slate-800 px-3 py-2 text-[9px] text-slate-500">What is on your mind?</div></div>
              </section>
              <div className="flex items-center justify-between px-1"><span className="text-[10px] font-black">Top stories</span><span className="text-[7px] font-mono text-slate-600">PERSONALIZED · PROBABLY</span></div>
              {homeFeed.map((post) => (
                <article key={post.id} onClick={() => handleNoiseInteraction('home-feed')} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  <div className="flex items-start gap-2 p-2.5"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${post.accent} text-[8px] font-black`}>{post.avatar}</div><div className="min-w-0 flex-1"><div className="truncate text-[9px] font-bold">{post.author}</div><div className="text-[7px] text-slate-600">{post.time} · {post.audience}</div></div><MoreHorizontal className="h-4 w-4 text-slate-700" /></div>
                  <p className="px-2.5 pb-2.5 text-[9px] leading-relaxed text-slate-300">{post.content}</p>
                  <div className={`h-14 bg-gradient-to-br ${post.accent} opacity-75`} />
                  <div className="flex justify-between px-2.5 py-1.5 text-[7px] text-slate-600"><span>♥ 👍 {post.reactions.toLocaleString()}</span><span>{post.comments} comments</span></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-[560px] space-y-3" id="social-profile-view">
              <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950" id="social-profile-banner">
                <div className="h-16 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950" />
                <div className="-mt-6 flex items-end gap-3 px-4 pb-3"><div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-950 bg-blue-600 text-xl font-black">NK</div><div className="mb-1"><h2 className="text-sm font-bold">Noah Kade</h2><p className="text-[9px] text-slate-500">Founder & Game Designer · Silver Kite Games</p></div></div>
                <div className="grid grid-cols-2 border-t border-slate-800 text-center text-[9px] font-bold">
                  <button type="button" onClick={() => { audio.play('phone.tab'); setActiveTab('posts'); }} className={`py-2 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-500'}`}>Post timeline</button>
                  <button type="button" disabled={progress.currentChapter < 7} onClick={() => { audio.play('phone.tab'); setActiveTab('about'); updateProgress((previous) => previous.currentChapter === 7 ? { ...previous, discoveredNoahQA: true } : previous); }} className={`py-2 ${activeTab === 'about' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-500'} disabled:cursor-not-allowed disabled:opacity-35`} id="social-about-tab">About & Q&A</button>
                </div>
              </section>

              {activeTab === 'posts' ? (
                <section className="space-y-3" id="social-posts">
                  <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/95 p-2 text-[8.5px] text-slate-400 backdrop-blur">
                    <span className="font-mono">{sortOldest ? 'EARLIEST PUBLIC ACTIVITY' : 'RELEVANCE · SPONSORED FIRST'}</span>
                    <button type="button" onClick={toggleSort} className="flex items-center gap-1 rounded bg-blue-600/20 px-2 py-1.5 font-bold text-blue-300" id="social-sort-toggle">{sortOldest ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />}{sortOldest ? 'Oldest First' : 'Newest First'}</button>
                  </div>
                  <div className="space-y-3" data-timeline-order={sortOldest ? 'oldest-first' : 'sponsored-first'}>
                    {timeline.map((entry) => entry.kind === 'post' ? renderPost(entry) : (
                      <article key={entry.id} className="overflow-hidden rounded-xl border border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-950/75 via-slate-950 to-cyan-950/60 p-3" data-skg-automation-ad={entry.id}>
                        <div className="flex items-center justify-between text-[7px] font-black tracking-[0.16em] text-fuchsia-300"><span>SKG AUTOMATION · SPONSORED</span><Settings2 className="h-3 w-3" /></div>
                        <h3 className="mt-2 text-[12px] font-black text-white">{entry.headline}</h3><p className="mt-1 text-[8.5px] leading-relaxed text-slate-400">{entry.body}</p>
                        <div className="mt-2 flex items-center justify-between border-t border-white/[0.08] pt-2 text-[7.5px]"><span className="text-cyan-300">{entry.metric}</span><button type="button" onClick={() => handleAdInteraction(entry.id)} className="rounded bg-fuchsia-500 px-2 py-1 font-black text-white">AUTOMATE NOW</button></div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-[10px]" id="social-about">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 font-bold text-blue-400"><Award className="h-4 w-4" />Developer Personal Q&A Board</div>
                  <div className="font-bold">Q: What is your favorite number or coordinate?</div>
                  <div className="rounded border border-slate-800 bg-slate-900 p-2.5 font-mono text-slate-300">My favorite coordinate is <span className="bg-yellow-500/20 px-1 font-bold text-yellow-400">184-40-256</span>. Treat it as a path: ALTITUDE / GATE / END.</div>
                </section>
              )}
            </div>
          )}
        </main>
        <RightSidebar onInteract={handleNoiseInteraction} />
      </div>
    </div>
  );
};
