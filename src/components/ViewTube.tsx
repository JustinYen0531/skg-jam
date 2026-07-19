import React, { useState, useEffect } from 'react';
import { GameProgress, PuzzleChapter } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import { useMetaInteraction } from './MetaInteractionScene';
import { createFeedSeed, shuffleFeed } from '../lib/pseudoFeed';
import { Search, Play, ThumbsUp, MessageSquare, Share2, AlertTriangle, Radio, TrendingUp } from 'lucide-react';

const VIEWTUBE_FEED = [
  { id: 'vt-1', title: 'I Let An Algorithm Plan My Entire Morning', channel: 'EverydayMax', views: '2.4M views', age: '6 hours ago', duration: '12:08', label: 'LIFE+', gradient: 'from-fuchsia-700 via-purple-700 to-cyan-600' },
  { id: 'vt-2', title: 'The Cloud That Looked Exactly Like My Boss', channel: 'WeatherWitness', views: '418K views', age: '1 day ago', duration: '8:44', label: 'TREND', gradient: 'from-sky-500 via-blue-600 to-indigo-900' },
  { id: 'vt-3', title: 'Top 37 Mobile Games You Already Forgot', channel: 'ByteSizedGaming', views: '891K views', age: '3 days ago', duration: '18:37', label: 'GAME', gradient: 'from-amber-500 via-orange-600 to-red-800' },
  { id: 'vt-4', title: 'LIVE: Downtown Pigeon Cam — Camera 04', channel: 'CityWindow', views: '8.2K watching', age: 'LIVE', duration: 'LIVE', label: 'LIVE', gradient: 'from-emerald-600 via-teal-700 to-slate-950' },
  { id: 'vt-5', title: 'Restoring a Phone Nobody Remembers', channel: 'QuietRepair', views: '73K views', age: '2 weeks ago', duration: '24:16', label: 'TECH', gradient: 'from-slate-500 via-slate-700 to-black' },
  { id: 'vt-6', title: 'One Hour of Extremely Productive Keyboard Sounds', channel: 'DeepFocusNow', views: '5.1M views', age: '8 months ago', duration: '1:00:00', label: 'FOCUS', gradient: 'from-indigo-700 via-violet-900 to-black' },
  { id: 'vt-7', title: 'Can A Bird Understand Level Design?', channel: 'GameThinkDaily', views: '206K views', age: '4 days ago', duration: '10:52', label: 'ESSAY', gradient: 'from-lime-500 via-emerald-700 to-cyan-900' },
  { id: 'vt-8', title: 'Five Products That Disappeared Without Explanation', channel: 'ListMachine', views: '1.7M views', age: '1 week ago', duration: '15:09', label: 'DOC', gradient: 'from-rose-700 via-red-900 to-slate-950' },
  { id: 'vt-9', title: 'Ambient Mall Music From A Closed Food Court', channel: 'MemoryLoop', views: '334K views', age: '2 years ago', duration: '2:41:18', label: 'MIX', gradient: 'from-pink-400 via-cyan-500 to-indigo-800' },
  { id: 'vt-10', title: 'World Record Attempts That Ended Strangely', channel: 'ReplayCabinet', views: '962K views', age: '5 days ago', duration: '21:37', label: 'SPORT', gradient: 'from-yellow-500 via-red-600 to-purple-950' },
] as const;

interface ViewTubeProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

export const ViewTube: React.FC<ViewTubeProps> = ({ progress, updateProgress }) => {
  const metaInteraction = useMetaInteraction();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(progress.viewTubeSearchedArc);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [danmakus, setDanmakus] = useState<Array<{ id: number; text: string; top: number; delay: number }>>([]);
  const [recommendedVideos] = useState(() => shuffleFeed(VIEWTUBE_FEED, createFeedSeed('viewtube')));

  const performSearch = () => {
    audio.playTick();
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('arc') || query.includes('184')) {
      if (!canUseProgressionAction('viewtube-arc-search', progress)) {
        audio.playGlitch();
        setSearchError('THAT NAME IS INTERESTING. YOUR CHARACTER HAS NOT SEEN IT YET.');
        return;
      }
      setSearchError('');
      setHasSearched(true);
      updateProgress((prev) => ({ ...prev, viewTubeSearchedArc: true, currentChapter: Math.max(prev.currentChapter, 2) as PuzzleChapter }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  useEffect(() => metaInteraction.registerInput('vt-search-input', {
    getValue: () => searchQuery,
    onChange: setSearchQuery,
    onSubmit: performSearch,
  }), [metaInteraction.registerInput, searchQuery, progress, updateProgress]);

  const startVideo = () => {
    audio.playUnlock();
    setIsPlayingVideo(true);
    updateProgress((prev) => ({ ...prev, watchedVideo: true }));

    // Generate danmaku/bullet comments flying across screen
    const messages = [
      'WAIT HOW DID HE PASS 37??',
      'This must be hacked, there is a collider wall there',
      'NO, he said he used Lumen Arc',
      'The device government recalled in 2014?',
      'Requires native altitude sensor on the old hardware!',
      'He bypassed the invisible wall',
      'Fake video, fake inputs',
      'The old device they took away from everyone...',
      'My mother had one, it was amazing until the recall',
      'Is there an archive file of Skyline 256 somewhere?',
      'Check Internet Archive'
    ];

    const generated = messages.map((m, idx) => ({
      id: idx,
      text: m,
      top: 15 + Math.random() * 60, // random percentage from top
      delay: idx * 1.5, // staggered entrance
    }));
    setDanmakus(generated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden" id="viewtube-root">
      
      {/* ViewTube Header */}
      <div className="bg-red-700 p-3 flex items-center justify-between" id="vt-header">
        <div className="flex items-center gap-1.5 font-display font-black tracking-tight text-white text-base">
          <div className="bg-white text-red-700 px-1.5 py-0.5 rounded font-black text-xs">V</div>
          <span>ViewTube</span>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-[220px] ml-4 relative">
          <input
            type="text"
            placeholder="Search Creator or Video..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            readOnly={metaInteraction.active}
            className="w-full bg-red-950/40 text-xs text-white placeholder-red-300 px-2.5 py-1.5 pr-8 rounded border border-red-800 focus:outline-none focus:border-red-500 font-mono"
            id="vt-search-input"
          />
          <button type="submit" className="absolute right-2 top-2 text-red-300 hover:text-white" id="vt-search-submit">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Main Container */}
      {searchError && (
        <div className="mx-3 mt-2 rounded border border-red-500/30 bg-red-950/30 p-2 text-[9px] font-mono text-red-300" id="vt-search-error">
          ⚠ {searchError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-4" id="vt-body">
        {!hasSearched ? (
          <div className="space-y-3" id="vt-home-feed">
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[9px] font-bold whitespace-nowrap" id="vt-topic-chips">
              {['For You', 'Gaming', 'Live', 'Documentary', 'Repair', 'Recently Uploaded'].map((topic, index) => (
                <span key={topic} className={`px-2.5 py-1 rounded-full border ${index === 0 ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
                  {topic}
                </span>
              ))}
            </div>

            <section className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl" id="vt-featured-video">
              <div className={`h-28 bg-gradient-to-br ${recommendedVideos[0].gradient} relative p-3 flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black tracking-widest bg-black/50 px-1.5 py-0.5 rounded">FEATURED FOR YOU</span>
                  <span className="text-[8px] font-mono bg-black/70 px-1.5 py-0.5 rounded">{recommendedVideos[0].duration}</span>
                </div>
                <div className="flex justify-center">
                  <div className="w-11 h-11 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>
                <span className="text-[8px] font-black tracking-[0.2em] text-white/80">{recommendedVideos[0].label}</span>
              </div>
              <div className="p-2.5">
                <h2 className="text-xs font-bold leading-tight text-white">{recommendedVideos[0].title}</h2>
                <div className="text-[9px] text-slate-400 mt-1">{recommendedVideos[0].channel} · {recommendedVideos[0].views} · {recommendedVideos[0].age}</div>
              </div>
            </section>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-xs font-bold"><TrendingUp className="w-3.5 h-3.5 text-red-500" /> Recommended</div>
              <span className="text-[8px] text-slate-500 font-mono">REFRESHED JUST NOW</span>
            </div>

            <div className="grid grid-cols-2 gap-2" id="vt-recommendations">
              {recommendedVideos.slice(1, 9).map((video) => (
                <article key={video.id} className="min-w-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80">
                  <div className={`h-16 bg-gradient-to-br ${video.gradient} relative p-1.5`}>
                    <span className="absolute left-1.5 top-1.5 text-[7px] font-black bg-black/45 px-1 rounded">{video.label}</span>
                    <span className={`absolute right-1 bottom-1 text-[7px] font-mono px-1 rounded ${video.duration === 'LIVE' ? 'bg-red-600 text-white' : 'bg-black/75 text-white'}`}>{video.duration}</span>
                    {video.duration === 'LIVE' && <Radio className="absolute w-3.5 h-3.5 left-2 bottom-1.5 text-white animate-pulse" />}
                  </div>
                  <div className="p-2">
                    <h3 className="text-[10px] leading-tight font-bold text-slate-100 line-clamp-2">{video.title}</h3>
                    <div className="text-[8px] text-slate-500 mt-1 truncate">{video.channel}</div>
                    <div className="text-[8px] text-slate-600 truncate">{video.views} · {video.age}</div>
                  </div>
                </article>
              ))}
            </div>

            <button
              onClick={() => { audio.playTick(); setSearchQuery('ARC_184'); }}
              className="w-full text-left rounded-lg border border-red-900/50 bg-red-950/20 p-2.5 flex items-center gap-2"
              id="vt-rumor-suggestion"
            >
              <div className="w-8 h-8 rounded bg-red-700/60 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4" /></div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-200">People are searching for an erased record run</div>
                <div className="text-[9px] font-mono text-red-300">Trending query: ARC_184 · tap to place in search</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4" id="vt-search-results">
            
            {/* Controversial Video Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden" id="vt-video-card">
              
              {/* Fake Player Viewport */}
              <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden" id="vt-player">
                {isPlayingVideo ? (
                  <div className="absolute inset-0 flex flex-col justify-between p-3" id="vt-player-active">
                    
                    {/* Retro Canvas Simulator showing bird moving low */}
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                      <div className="w-full h-full relative bg-purple-900/40 font-mono text-[9px] text-pink-300 p-2 flex flex-col justify-between">
                        <div>
                          <div>SIMULATOR_REPLAY_ACTIVE: ARC_184</div>
                          <div className="text-[8px] opacity-70">FLAPPY_SOMETHING_V2_BYPASS</div>
                        </div>

                        {/* Visual representation of passing 37 */}
                        <div className="flex items-center justify-center gap-1 my-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                          <span className="text-emerald-400 font-bold text-xs animate-pulse">COLLISION_BYPASS_DETECTION</span>
                        </div>

                        <div className="flex justify-between text-xs font-bold text-white bg-black/40 p-1 rounded">
                          <span>PIPE_SEC: 037</span>
                          <span>ALT: 184m</span>
                        </div>
                      </div>
                    </div>

                    {/* Danmaku Comment Layer */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                      {danmakus.map((dan) => (
                        <div
                          key={dan.id}
                          style={{
                            top: `${dan.top}%`,
                            animation: `danmaku-run 10s linear infinite`,
                            animationDelay: `${dan.delay}s`,
                          }}
                          className="absolute white-space-nowrap text-xs font-bold text-white bg-black/50 px-1.5 py-0.5 rounded shadow-md border border-slate-700/30 whitespace-nowrap"
                        >
                          {dan.text}
                        </div>
                      ))}
                    </div>

                    {/* Controls Overlay */}
                    <div className="z-10 flex items-center justify-between text-[10px] text-slate-300 bg-gradient-to-t from-black/80 p-2 w-full mt-auto">
                      <span>▶ PLAYING | 0:24 / 1:12</span>
                      <span className="text-emerald-400 font-bold">LAG/BUFFER: 12%</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={startVideo}
                    className="flex flex-col items-center justify-center space-y-2 group hover:scale-105 transition-transform"
                    id="vt-play-trigger"
                  >
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-500 transition-colors">
                      <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                    </div>
                    <span className="text-xs text-slate-300 font-bold bg-black/60 px-2 py-0.5 rounded">
                      Play Controversial Run
                    </span>
                  </button>
                )}
              </div>

              {/* Video Info details */}
              <div className="p-3 space-y-1.5 border-t border-slate-800" id="vt-info">
                <h2 className="font-display font-bold text-sm text-white">
                  I BROKE THE UNBEATABLE FLAPPY GAME — 184 POINTS WORLD RECORD
                </h2>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>ARC_184 • 14,832 views • 12 years ago</span>
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Checked
                  </span>
                </div>

                <div className="flex gap-4 border-t border-b border-slate-800/60 py-2 my-2 text-xs text-slate-300">
                  <button className="flex items-center gap-1 hover:text-white" onClick={() => audio.playTick()}>
                    <ThumbsUp className="w-4 h-4 text-slate-400" /> 1.2k
                  </button>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MessageSquare className="w-4 h-4" /> 142 Comments
                  </div>
                  <button className="flex items-center gap-1 hover:text-white ml-auto" onClick={() => audio.playTick()}>
                    <Share2 className="w-4 h-4 text-slate-400" /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Video Comment Section */}
            <div className="space-y-3" id="vt-comments">
              <h3 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1">Discussion (142)</h3>
              
              <div className="space-y-3.5 text-xs">
                {/* Comment 1 */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-purple-400">SkyFlapMaster</span>
                    <span>12y ago</span>
                  </div>
                  <p className="text-slate-200">
                    This is 100% fake. At score 37, there is a hardcoded invisible collision volume. I inspected the bytecode. He is either using an emulator modification or spoofing values.
                  </p>
                  <div className="bg-slate-950 p-1.5 rounded text-[10px] text-yellow-400 border border-yellow-950 mt-1">
                    💬 **ARC_184 replied**: No emulator edits. No scripts. It runs on the <span className="underline font-bold text-white">Lumen Arc</span>, utilizing the native altitude sensor glitch of the LAOS operating system. Look up the device they recalled.
                  </div>
                </div>

                {/* Comment 2 */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-amber-400">LumenHacker</span>
                    <span>11y ago</span>
                  </div>
                  <p className="text-slate-200">
                    Can confirm! The Lumen Arc's barometric sensor could be manipulated on LAOS by tapping in a specific rhythmic frequency. It allows bypassing absolute colliders! But where on earth do you even get a working Lumen Arc now? They recalled every single one of them.
                  </p>
                </div>

                {/* Comment 3 */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-blue-400">WaybackLover</span>
                    <span>10y ago</span>
                  </div>
                  <p className="text-slate-200">
                    If anyone has the old original IPA file, it is preserved on Internet Archive. It is titled <span className="font-mono text-cyan-400">Skyline256_LAOS_Final.ipa</span>. Download it there if you have a device that supports it.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Embedded CSS for Danmaku movement */}
      <style>{`
        @keyframes danmaku-run {
          0% { transform: translateX(480px); }
          100% { transform: translateX(-500px); }
        }
      `}</style>
    </div>
  );
};
