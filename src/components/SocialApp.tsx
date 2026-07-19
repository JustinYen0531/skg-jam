import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import { Search, Heart, MessageCircle, ArrowDownAZ, ArrowUpAZ, Award, HelpCircle } from 'lucide-react';

interface SocialAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

export const SocialApp: React.FC<SocialAppProps> = ({ progress, updateProgress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(progress.discoveredNoahQA);
  const [sortOldest, setSortOldest] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [searchError, setSearchError] = useState('');

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
      updateProgress((prev) => ({
        ...prev,
        discoveredNoahQA: true,
        discoveredMotherComment: true,
        unlockedAdminLogin: true, // unlocks the ALT184GATE37END256 password path
      }));
    }
  };

  const toggleSort = () => {
    audio.playTick();
    setSortOldest(!sortOldest);
  };

  const posts = [
    {
      id: 'post-1',
      author: 'Noah Kade',
      avatar: 'NK',
      time: '12 years ago (2014)',
      content: 'I have updated Skyline 256. This is my final update. It can finally be completed. I coded a special calibration path into the flight engine through Gate 37. Nobody was supposed to finish this game without understanding the path.',
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
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 px-4" id="social-blank">
            <HelpCircle className="w-12 h-12 text-slate-700" />
            <div className="text-sm font-medium text-slate-400">Search "Noah Kade" to locate the developer's personal page.</div>
            <div className="text-[10px] text-slate-600">Explore his personal post logs for design hints and developer passwords.</div>
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
                  onClick={() => { audio.playTick(); setActiveTab('posts'); }}
                  className={`flex-1 py-2 font-bold ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
                >
                  Post Timeline
                </button>
                <button
                  onClick={() => { audio.playTick(); setActiveTab('about'); }}
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
                          "My absolute favorite coordinate string is <span className="bg-yellow-500/20 text-yellow-400 px-1 rounded font-bold">184-37-256</span>.
                        </p>
                        <p className="mt-1 text-slate-400">
                          But don't treat them simply as scores on a screen. Treat them as <span className="underline text-white font-bold">paths</span>. In our developer console, these numbers represent:
                        </p>
                        <ul className="list-disc pl-4 mt-1 text-slate-400 space-y-0.5 text-[10px]">
                          <li><span className="text-white font-bold">ALTITUDE</span>: 184</li>
                          <li><span className="text-white font-bold">GATE</span>: 37</li>
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
