import React, { useState, useEffect } from 'react';
import { GameProgress, PuzzleChapter } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import { useMetaInteraction } from './MetaInteractionScene';
import { Search, Play, ThumbsUp, MessageSquare, Share2, AlertTriangle } from 'lucide-react';

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
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3" id="vt-blank">
            <MessageSquare className="w-12 h-12 text-slate-700" />
            <div className="text-sm font-medium text-slate-400">Search "ARC_184" to find the controversial record run.</div>
            <div className="text-[10px] text-slate-600">Comment section holds vital clues to passing the blocker.</div>
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
