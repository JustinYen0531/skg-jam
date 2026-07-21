import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction, completePuzzleChapter } from '../lib/chapterProgress';
import { createFeedSeed, shuffleFeed } from '../lib/pseudoFeed';
import { Search, Heart, MessageCircle, ArrowDownAZ, ArrowUpAZ, Award, Globe2, MoreHorizontal, UserPlus, Users } from 'lucide-react';

const FACESPACE_FEED = [
  { id: 'fs-1', author: 'Mina Liao', avatar: 'ML', time: '18 min', audience: 'Friends', content: 'The café recommendation algorithm sent me to the café I was already sitting in. Five stars for confidence.', reactions: 84, comments: 12, accent: 'from-rose-500 to-orange-400', media: 'SUGGESTED FOR YOU · SUGGESTED BY YOU' },
  { id: 'fs-2', author: 'Retro Tech Archaeology', avatar: 'RT', time: '1 hr', audience: 'Public', content: 'What discontinued gadget would you bring back for exactly one afternoon?', reactions: 1300, comments: 418, accent: 'from-cyan-500 to-indigo-800', media: 'THIS WEEK IN FORGOTTEN HARDWARE' },
  { id: 'fs-3', author: 'Jules Park', avatar: 'JP', time: '2 hr', audience: 'Friends', content: 'I finished reorganizing my desktop and immediately forgot where everything went. Progress!', reactions: 31, comments: 7, accent: 'from-emerald-500 to-teal-900', media: 'BEFORE / AFTER / REGRET' },
  { id: 'fs-4', author: 'Bird Photos With No Context', avatar: 'BP', time: '3 hr', audience: 'Public', content: 'Today’s bird has been promoted to Regional Operations Manager.', reactions: 9200, comments: 602, accent: 'from-sky-400 to-blue-900', media: 'A VERY IMPORTANT PIGEON' },
  { id: 'fs-5', author: 'Evan Ortiz', avatar: 'EO', time: 'Yesterday', audience: 'Friends', content: 'Does anybody else remember when mobile games were allowed to end?', reactions: 256, comments: 37, accent: 'from-violet-600 to-slate-950', media: 'MEMORY UNLOCKED' },
  { id: 'fs-6', author: 'LifePilot AI', avatar: 'LP', time: 'Sponsored', audience: 'Promoted', content: 'Automate your hobbies so you have more time to optimize your free time.', reactions: 12000, comments: 3, accent: 'from-fuchsia-500 via-purple-700 to-cyan-600', media: 'YOUR BEST SELF IS NOW A SUBSCRIPTION' },
  { id: 'fs-7', author: 'Closed Mall Appreciation Group', avatar: 'CM', time: 'Yesterday', audience: 'Group', content: 'New album: food courts that still look like 2013 if you squint.', reactions: 614, comments: 89, accent: 'from-amber-300 to-pink-600', media: '24 NEW PHOTOS' },
  { id: 'fs-8', author: 'Priya Raman', avatar: 'PR', time: '2 days', audience: 'Friends', content: 'Found an old screenshot folder with no context. Naturally, this is my evening now.', reactions: 73, comments: 19, accent: 'from-slate-400 to-purple-900', media: 'ARCHIVE_MYSTERY_FINAL_FINAL_2' },
  { id: 'fs-9', author: 'Dead Formats Preservation Circle', avatar: 'DF', time: '4 hr', audience: 'Group', content: 'We are looking for volunteers who still keep games that companies decided to forget. If you own something that no longer officially exists, you already qualify.', reactions: 342, comments: 58, accent: 'from-teal-600 to-slate-900', media: 'SOME THINGS ARE WORTH KEEPING RUNNABLE' },
  { id: 'fs-10', author: 'Optimized Living Daily', avatar: 'OL', time: 'Sponsored', audience: 'Promoted', content: 'Studies show nostalgia reduces engagement metrics. Consult our app before remembering anything.', reactions: 8800, comments: 2, accent: 'from-fuchsia-600 to-cyan-700', media: 'FORGET FASTER™' },
  { id: 'fs-11', author: 'Toshi Nakamura', avatar: 'TN', time: 'Yesterday', audience: 'Friends', content: 'My kid asked why old games "stopped." Not shut down. Just stopped. I did not have a good answer.', reactions: 512, comments: 74, accent: 'from-indigo-500 to-slate-950', media: 'HARD QUESTIONS FROM SMALL PEOPLE' },
  { id: 'fs-12', author: 'Aggressively Neutral News', avatar: 'AN', time: '2 days', audience: 'Public', content: 'Automation firm reports record quarter managing apps nobody is allowed to play anymore. Analysts thrilled. Nobody else asked.', reactions: 1900, comments: 233, accent: 'from-slate-500 to-red-950', media: 'NUMBERS GO UP' },
  { id: 'fs-13', author: 'Gwen Alvarez', avatar: 'GA', time: '3 days', audience: 'Friends', content: 'Cleaned out my dad’s drawer and found a device I don’t recognize. It hums a little. I’m keeping it.', reactions: 128, comments: 41, accent: 'from-amber-400 to-purple-900', media: 'WHAT IS THIS THING' },
] as const;

interface SocialAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

export const SocialApp: React.FC<SocialAppProps> = ({ progress, updateProgress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(
    progress.discoveredMotherComment || progress.discoveredNoahQA || progress.currentChapter >= 7,
  );
  const [sortOldest, setSortOldest] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [searchError, setSearchError] = useState('');
  const [homeFeed] = useState(() => shuffleFeed(FACESPACE_FEED, createFeedSeed('facespace')));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playTick();
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('noah') || query.includes('kade')) {
      if (!canUseProgressionAction('social-noah-search', progress)) {
        audio.playGlitch();
        setSearchError('PROFILE EXISTS. NARRATIVE PERMISSION DOES NOT. KEEP INVESTIGATING.');
        return;
      }
      setSearchError('');
      setHasSearched(true);
    }
  };

  const toggleSort = () => {
    const nextSortOldest = !sortOldest;
    // Cards shuffle; rewinding to the oldest posts runs the ticks upward.
    audio.play('social.sort', { variant: nextSortOldest ? 1 : 0 });
    setSortOldest(nextSortOldest);
    if (nextSortOldest) {
      updateProgress((prev) => completePuzzleChapter(prev, 6, { discoveredMotherComment: true }));
    }
  };

  const openAbout = () => {
    audio.play('phone.tab');
    setActiveTab('about');
    updateProgress((prev) => prev.currentChapter === 7
      ? { ...prev, discoveredNoahQA: true }
      : prev);
  };

  const posts = [
    {
      id: 'post-1',
      author: 'Noah Kade',
      avatar: 'NK',
      time: '12 years ago (2014)',
      content: 'I have updated Skyline 256. This is my final update. It can finally be completed. I coded a special calibration path into the flight engine through Gate 40. Nobody was supposed to finish this game without understanding the path.',
      likes: 2,
      comments: [
        {
          author: 'Mara',
          avatar: 'M',
          time: '12 years ago',
          content: 'Don\'t worry, my dear. I bought hundreds of copies to support you, and I\'ve saved a fully-loaded device key for our child. He will find it and play it one day when he is older.',
        }
      ]
    },
    {
      id: 'post-2',
      author: 'Noah Kade',
      avatar: 'NK',
      time: '12 years ago (2014)',
      content: 'The government battery recalls are official now. Elias wants to sell our game database and pivot the business model to "SKG Automation" to deploy auto-scraped content. I refused to sign. How can we throw away everything we crafted?',
      likes: 4,
      comments: []
    },
    {
      id: 'post-3',
      author: 'Noah Kade',
      avatar: 'NK',
      time: '13 years ago (2013)',
      content: 'Development on "Skyline 256" is progressing beautifully. My design goal is simple: games are finite journeys that deserve proper endpoints. A player shouldn\'t have to flap endlessly just to get a high score. At Gate 256, your journey finishes.',
      likes: 12,
      comments: []
    },
    {
      id: 'post-4',
      author: 'Noah Kade',
      avatar: 'NK',
      time: '13 years ago (2013)',
      content: 'Thrilled to announce Silver Kite Games is partnering with Lumen Arc! A revolutionary hardware console designed to companion users for a lifetime. This is the platform of the future.',
      likes: 24,
      comments: []
    }
  ];

  // If sortOldest is active, reverse posts array
  const displayedPosts = sortOldest ? [...posts].reverse() : posts;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans overflow-hidden" id="social-root">
      
      {/* FaceSpace Header */}
      <div className="bg-blue-600 p-3 flex items-center justify-between border-b border-blue-700/50" id="social-header">
        <div className="flex items-center gap-1.5 font-display font-black tracking-tight text-white text-base">
          <div className="bg-white text-blue-600 px-1.5 py-0.5 rounded font-black text-xs">f</div>
          <span>FaceSpace</span>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-[200px] ml-4 relative">
          <input
            type="text"
            placeholder="Search Profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-blue-950/30 text-xs text-white placeholder-blue-300 px-2.5 py-1.5 pr-8 rounded border border-blue-700 focus:outline-none focus:border-blue-500"
            id="social-search-input"
          />
          <button type="submit" className="absolute right-2 top-2 text-blue-300" id="social-search-submit">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Main Container */}
      {searchError && (
        <div className="mx-3 mt-2 rounded border border-red-500/30 bg-red-950/30 p-2 text-[9px] font-mono text-red-300" id="social-search-error">
          ⚠ {searchError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto" id="social-body">
        {!hasSearched ? (
          <div className="p-3 space-y-3" id="social-home-feed">
            <section className="flex gap-2 overflow-x-auto pb-1" id="social-stories">
              {[
                ['Your story', 'ME', 'from-blue-500 to-cyan-400'],
                ['Mina', 'ML', 'from-pink-500 to-orange-400'],
                ['Jules', 'JP', 'from-emerald-400 to-teal-700'],
                ['Retro Tech', 'RT', 'from-purple-500 to-indigo-800'],
                ['Bird Pics', 'BP', 'from-amber-300 to-blue-600'],
              ].map(([name, initials, gradient]) => (
                <div key={name} className="w-14 shrink-0 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full p-0.5 bg-gradient-to-br ${gradient}`}>
                    <div className="w-full h-full rounded-full bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">{initials}</div>
                  </div>
                  <div className="text-[8px] mt-1 text-slate-400 truncate">{name}</div>
                </div>
              ))}
            </section>

            <section className="rounded-xl bg-slate-950 border border-slate-800 p-2.5" id="social-composer">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black">ME</div>
                <div className="flex-1 rounded-full bg-slate-800 px-3 py-2 text-[10px] text-slate-500">What are you investigating?</div>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-800 text-[8px] text-center font-bold text-slate-400">
                <span>▣ Photo</span><span>● Live</span><span>☺ Feeling</span>
              </div>
            </section>

            <section className="rounded-xl bg-blue-950/30 border border-blue-700/30 p-2.5" id="social-people-suggestion">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1 text-[10px] font-bold"><Users className="w-3.5 h-3.5 text-blue-400" /> People from old game circles</div>
                <span className="text-[8px] text-blue-400">See all</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-950 flex items-center justify-center font-black text-xs">NK</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold">Noah Kade</div>
                  <div className="text-[8px] text-slate-500 truncate">Silver Kite Games · 3 mutual archive groups</div>
                </div>
                <button
                  onClick={() => { audio.playTick(); setSearchQuery('Noah Kade'); }}
                  className="px-2 py-1.5 rounded bg-blue-600 text-[8px] font-black flex items-center gap-1"
                  id="social-noah-suggestion"
                >
                  <UserPlus className="w-3 h-3" /> Find
                </button>
              </div>
            </section>

            <div className="flex justify-between items-center px-0.5">
              <span className="text-xs font-black">Top stories</span>
              <span className="text-[8px] text-slate-600 font-mono">PERSONALIZED · PROBABLY</span>
            </div>

            <div className="space-y-3" id="social-feed-posts">
              {homeFeed.map((post) => (
                <article key={post.id} className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <div className="p-2.5 flex gap-2 items-start">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${post.accent} flex items-center justify-center text-[9px] font-black shrink-0`}>{post.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-100 truncate">{post.author}</div>
                      <div className="text-[8px] text-slate-500 flex items-center gap-1">{post.time} · {post.audience} <Globe2 className="w-2.5 h-2.5" /></div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="px-2.5 pb-2.5 text-[10px] leading-relaxed text-slate-300">{post.content}</p>
                  <div className={`h-20 bg-gradient-to-br ${post.accent} flex items-center justify-center p-3 text-center`}>
                    <span className="text-[10px] font-black tracking-widest text-white/90 bg-black/20 px-2 py-1 rounded">{post.media}</span>
                  </div>
                  <div className="px-2.5 py-1.5 flex justify-between text-[8px] text-slate-500 border-b border-slate-800">
                    <span>♥ 👍 {post.reactions.toLocaleString()}</span><span>{post.comments} comments · 4 shares</span>
                  </div>
                  <div className="grid grid-cols-3 text-[9px] font-bold text-slate-400">
                    <button onClick={() => audio.playTick()} className="py-2 hover:bg-slate-900"><Heart className="w-3 h-3 inline mr-1" />Like</button>
                    <button onClick={() => audio.playTick()} className="py-2 hover:bg-slate-900"><MessageCircle className="w-3 h-3 inline mr-1" />Comment</button>
                    <button onClick={() => audio.playTick()} className="py-2 hover:bg-slate-900">↗ Share</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4" id="social-profile-view">
            
            {/* Developer Cover & Avatar Profile */}
            <div className="bg-slate-950 border-b border-slate-800" id="social-profile-banner">
              <div className="h-16 bg-gradient-to-r from-blue-900 to-indigo-950"></div>
              <div className="px-4 pb-3 flex items-end gap-3 -mt-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full border-4 border-slate-950 flex items-center justify-center font-display font-bold text-xl text-white shadow-lg">
                  NK
                </div>
                <div className="mb-1">
                  <h2 className="font-display font-bold text-sm text-white">Noah Kade</h2>
                  <p className="text-[10px] text-slate-400">Founder & Game Designer, Silver Kite Games</p>
                </div>
              </div>

              {/* Profile Navigation Tabs */}
              <div className="flex border-t border-slate-800/60 text-xs text-center font-mono">
                <button
                  onClick={() => { audio.play('phone.tab'); setActiveTab('posts'); }}
                  className={`flex-1 py-2 font-bold ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
                >
                  Post Timeline
                </button>
                <button
                  onClick={openAbout}
                  className={`flex-1 py-2 font-bold ${activeTab === 'about' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
                  id="social-about-tab"
                >
                  About & QA
                </button>
              </div>
            </div>

            {/* Profile Tab Contents */}
            <div className="px-3 pb-4" id="social-tab-content">
              {activeTab === 'posts' ? (
                /* POSTS TIMELINE */
                <div className="space-y-4" id="social-posts">
                  <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800 text-[10px] text-slate-400">
                    <span className="font-mono">POST TIMELINE HISTORY</span>
                    <button onClick={toggleSort} className="flex items-center gap-1 hover:text-white font-bold" id="social-sort-toggle">
                      {sortOldest ? <ArrowUpAZ className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDownAZ className="w-3.5 h-3.5" />}
                      <span>{sortOldest ? 'Sort: Oldest First' : 'Sort: Newest First'}</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {displayedPosts.map((post) => (
                      <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1">
                          <span className="font-bold text-blue-400">{post.author}</span>
                          <span>{post.time}</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>
                        
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                          <span className="flex items-center gap-0.5 text-red-500"><Heart className="w-3 h-3 fill-current" /> {post.likes}</span>
                          <span><MessageCircle className="w-3 h-3 inline mr-0.5" /> {post.comments.length} comments</span>
                        </div>

                        {/* Rendering mother comment */}
                        {post.comments.map((comm, cidx) => (
                          <div key={cidx} className="bg-slate-950/80 p-2.5 rounded border border-slate-800/40 mt-2 space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                              <span className="font-bold text-pink-400">Mara Kade</span>
                              <span>{comm.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-300 italic">"{comm.content}"</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ABOUT / QA SECTION */
                <div className="space-y-3 text-xs" id="social-about">
                  
                  {/* QA item */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold border-b border-slate-800 pb-1.5 mb-1.5">
                      <Award className="w-4 h-4" />
                      <span>Developer Personal Q&A Board</span>
                    </div>

                    <div className="space-y-2">
                      <div className="font-bold text-white">Q: What is your favorite number or coordinate?</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                        <p className="font-mono">
                          "My absolute favorite coordinate string is <span className="bg-yellow-500/20 text-yellow-400 px-1 rounded font-bold">184-40-256</span>.
                        </p>
                        <p className="mt-1 text-slate-400">
                          But don't treat them simply as scores on a screen. Treat them as <span className="underline text-white font-bold">paths</span>. In our developer console, these numbers represent:
                        </p>
                        <ul className="list-disc pl-4 mt-1 text-slate-400 space-y-0.5 text-[10px]">
                          <li><span className="text-white font-bold">ALTITUDE</span>: 184</li>
                          <li><span className="text-white font-bold">GATE</span>: 40</li>
                          <li><span className="text-white font-bold">END</span>: 256</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[10px] text-slate-400 leading-relaxed space-y-1.5">
                    <div>📌 <span className="font-bold text-white">Biography Info</span>:</div>
                    <div>Formally trained in systems mechanics. Refuses to accept the uncrafted endless monetization loops of automated web companies. Believes that every flight must end.</div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
