import React, { useState, useEffect, useRef } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction, completePuzzleChapter } from '../lib/chapterProgress';
import { useMetaInteraction } from './MetaInteractionScene';
import { ArcRunReplay } from './ArcRunReplay';
import { createFeedSeed, shuffleFeed } from '../lib/pseudoFeed';
import {
  CHAPTER_ONE_DIALOGUE,
  DialogueLines,
  getChapterOneIrrelevantVideoDialogue,
  getChapterOneSearchResponse,
} from '../lib/chapterOneDialogue';
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

const GATE_40_DANMAKU = [
  { text: 'WAIT WAIT WAIT', top: 8, size: 17, duration: 2.8, delay: 0, mode: 'scroll' },
  { text: 'HOW DID HE PASS 40??', top: 17, size: 20, duration: 3.2, delay: 0.05, mode: 'scroll' },
  { text: 'THERE IS A WALL THERE', top: 28, size: 13, duration: 2.5, delay: 0.12, mode: 'scroll' },
  { text: 'fake fake fake fake fake', top: 39, size: 11, duration: 3.5, delay: 0, mode: 'scroll' },
  { text: 'DID ANYONE SEE THAT', top: 51, size: 18, duration: 2.7, delay: 0.18, mode: 'scroll' },
  { text: 'NO CUT???', top: 65, size: 22, duration: 3.1, delay: 0.08, mode: 'scroll' },
  { text: 'rewind it', top: 78, size: 12, duration: 2.4, delay: 0.24, mode: 'scroll' },
  { text: 'HE WENT THROUGH THE PIPE', top: 88, size: 16, duration: 3.7, delay: 0.04, mode: 'scroll' },
  { text: '40 → 41', top: 34, size: 25, duration: 2.4, delay: 0.4, mode: 'center' },
  { text: 'WHAT', top: 58, size: 28, duration: 2.1, delay: 0.7, mode: 'center' },
  { text: 'pause at 0:41', top: 12, size: 12, duration: 3.3, delay: 0.55, mode: 'scroll' },
  { text: 'COLLIDER IS HARDCODED', top: 23, size: 14, duration: 3.8, delay: 0.34, mode: 'scroll' },
  { text: 'my game always kills me here', top: 44, size: 10, duration: 3.1, delay: 0.62, mode: 'scroll' },
  { text: 'EMULATOR MOD', top: 71, size: 19, duration: 2.6, delay: 0.48, mode: 'scroll' },
  { text: 'the score changed', top: 83, size: 13, duration: 3.2, delay: 0.78, mode: 'scroll' },
  { text: 'THAT WAS NOT THE GAP', top: 6, size: 16, duration: 2.9, delay: 0.92, mode: 'scroll' },
  { text: 'I CANNOT SEE', top: 31, size: 21, duration: 2.5, delay: 1.05, mode: 'scroll' },
  { text: 'move the comments!!', top: 55, size: 11, duration: 3.6, delay: 0.96, mode: 'scroll' },
  { text: '184 IS REAL', top: 74, size: 23, duration: 2.8, delay: 1.12, mode: 'scroll' },
  { text: 'rewind rewind rewind', top: 91, size: 14, duration: 3, delay: 1.2, mode: 'scroll' },
  { text: '???', top: 47, size: 32, duration: 1.9, delay: 1.35, mode: 'center' },
  { text: 'NO WAY', top: 19, size: 26, duration: 2.2, delay: 1.55, mode: 'center' },
  { text: 'frame skip?', top: 62, size: 12, duration: 3.4, delay: 1.42, mode: 'scroll' },
  { text: 'HE IS STILL ALIVE', top: 80, size: 18, duration: 2.7, delay: 1.68, mode: 'scroll' },
] as const;

const AMBIENT_DANMAKU = [
  { text: 'clean run so far', top: 14, size: 10, duration: 9.5, delay: -2.1 },
  { text: 'he makes this look easy', top: 31, size: 12, duration: 11, delay: -7.4 },
  { text: 'what version is this?', top: 52, size: 9, duration: 8.8, delay: -4.8 },
  { text: '184 incoming', top: 72, size: 13, duration: 10.4, delay: -8.9 },
  { text: 'nice recovery', top: 86, size: 10, duration: 12, delay: -1.2 },
  { text: 'watch Gate 40', top: 22, size: 11, duration: 10.8, delay: -5.7 },
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
  const [replayPaused, setReplayPaused] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [barrageActive, setBarrageActive] = useState(false);
  const [barrageCycle, setBarrageCycle] = useState(0);
  const [recommendedVideos] = useState(() => shuffleFeed(VIEWTUBE_FEED, createFeedSeed('viewtube')));
  const chapterOneSearchAttempt = useRef(0);
  const chapterOneVideoAttempt = useRef(0);

  const speakChapterOne = (lines: DialogueLines) => {
    if (progress.currentChapter === 1 && metaInteraction.active) {
      metaInteraction.speak(lines);
    }
  };

  const performSearch = () => {
    audio.play('key.enter');
    const query = searchQuery.toLowerCase().trim();
    if (progress.currentChapter === 1 && metaInteraction.active) {
      const response = getChapterOneSearchResponse(searchQuery, chapterOneSearchAttempt.current);
      chapterOneSearchAttempt.current += 1;
      metaInteraction.speak(response.lines);

      if (!response.isArcSearch) {
        audio.play('search.noResult');
        setSearchError('NO RELEVANT RESULT FOR THE CURRENT INVESTIGATION.');
        return;
      }

      if (!canUseProgressionAction('viewtube-arc-search', progress)) {
        audio.play('search.noResult');
        setSearchError('THAT NAME IS INTERESTING. YOUR CHARACTER HAS NOT SEEN IT YET.');
        return;
      }

      audio.play('search.found');
      setSearchError('');
      setHasSearched(true);
      updateProgress((prev) => ({ ...prev, viewTubeSearchedArc: true }));
      return;
    }

    if (query.includes('arc') || query.includes('184')) {
      if (!canUseProgressionAction('viewtube-arc-search', progress)) {
        audio.play('search.noResult');
        setSearchError('THAT NAME IS INTERESTING. YOUR CHARACTER HAS NOT SEEN IT YET.');
        return;
      }
      audio.play('search.found');
      setSearchError('');
      setHasSearched(true);
      updateProgress((prev) => ({ ...prev, viewTubeSearchedArc: true }));
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
    // Old player relay click; the compressed recording floor engages.
    audio.play('viewtube.videoStart');
    setIsPlayingVideo(true);
    setReplayPaused(false);
    speakChapterOne(CHAPTER_ONE_DIALOGUE.videoStarted);
    updateProgress((prev) => ({ ...prev, watchedVideo: true }));

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
            onFocus={() => speakChapterOne(CHAPTER_ONE_DIALOGUE.searchFocused)}
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

            <button
              type="button"
              onClick={() => {
                audio.playTick();
                speakChapterOne(getChapterOneIrrelevantVideoDialogue(chapterOneVideoAttempt.current));
                chapterOneVideoAttempt.current += 1;
              }}
              className="w-full text-left rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl"
              id="vt-featured-video"
            >
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
            </button>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-xs font-bold"><TrendingUp className="w-3.5 h-3.5 text-red-500" /> Recommended</div>
              <span className="text-[8px] text-slate-500 font-mono">REFRESHED JUST NOW</span>
            </div>

            <div className="grid grid-cols-2 gap-2" id="vt-recommendations">
              {recommendedVideos.slice(1, 9).map((video) => (
                <button
                  type="button"
                  key={video.id}
                  onClick={() => {
                    audio.playTick();
                    speakChapterOne(getChapterOneIrrelevantVideoDialogue(chapterOneVideoAttempt.current));
                    chapterOneVideoAttempt.current += 1;
                  }}
                  className="min-w-0 text-left rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80"
                >
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
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                audio.playTick();
                setSearchQuery('ARC_184');
                speakChapterOne(CHAPTER_ONE_DIALOGUE.rumorSelected);
              }}
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
                  <button
                    type="button"
                    onClick={() => {
                      speakChapterOne(CHAPTER_ONE_DIALOGUE.videoEvidence);
                    }}
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden text-left"
                    id="vt-player-active"
                  >
                    <div className="absolute inset-0 bg-black" id="vt-arc-replay-surface">
                      <ArcRunReplay
                        active={isPlayingVideo}
                        paused={replayPaused}
                        onBarrageChange={(isActive) => {
                          setBarrageActive(isActive);
                          if (isActive) {
                            setBarrageCycle((cycle) => cycle + 1);
                            // One density-rising sizzle for the whole flood.
                            audio.play('viewtube.barrage');
                          }
                        }}
                        onPausePoint={() => {
                          metaInteraction.tapElement('arc-run-replay-canvas', () => {
                            audio.play('viewtube.pause');
                            setReplayPaused(true);
                            speakChapterOne(CHAPTER_ONE_DIALOGUE.videoPaused);
                          });
                        }}
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(130,70,30,0.08),transparent_16%,transparent_82%,rgba(20,30,55,0.13))] mix-blend-color"
                        id="vt-aged-video-wash"
                      />
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
                      id="vt-ambient-danmaku"
                      aria-hidden="true"
                    >
                      {AMBIENT_DANMAKU.map((dan, index) => (
                        <span
                          key={`${dan.text}-${index}`}
                          style={{
                            top: `${dan.top}%`,
                            fontSize: `${dan.size}px`,
                            animationName: 'danmaku-run',
                            animationDuration: `${dan.duration}s`,
                            animationDelay: `${dan.delay}s`,
                            animationIterationCount: 'infinite',
                            animationPlayState: replayPaused ? 'paused' : 'running',
                          }}
                          className="absolute left-0 whitespace-nowrap font-bold text-white/85 [animation-timing-function:linear] [text-shadow:1px_1px_1px_rgba(0,0,0,.85)]"
                        >
                          {dan.text}
                        </span>
                      ))}
                    </div>

                    {barrageActive && (
                      <div
                        key={barrageCycle}
                        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
                        id="vt-gate40-danmaku-barrage"
                        aria-hidden="true"
                      >
                        {GATE_40_DANMAKU.map((dan, index) => (
                          <span
                            key={`${dan.text}-${index}`}
                            style={{
                              top: `${dan.top}%`,
                              left: dan.mode === 'center' ? '50%' : '0',
                              fontSize: `${dan.size}px`,
                              animationName: dan.mode === 'center' ? 'danmaku-hold' : 'danmaku-run',
                              animationDuration: `${dan.duration}s`,
                              animationDelay: `${dan.delay}s`,
                              animationPlayState: replayPaused ? 'paused' : 'running',
                            }}
                            className="absolute left-0 whitespace-nowrap font-black text-white [animation-fill-mode:both] [animation-timing-function:linear] [text-shadow:1px_1px_1px_rgba(0,0,0,.9)]"
                          >
                            {dan.text}
                          </span>
                        ))}
                      </div>
                    )}

                    {replayPaused && (
                      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" id="vt-replay-paused">
                        <span className="font-mono text-3xl font-black tracking-[0.18em] text-white [text-shadow:0_2px_3px_rgba(0,0,0,.9)]">Ⅱ</span>
                      </div>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-2 pb-1.5 pt-5 text-[9px] text-white/80">
                      <span>{replayPaused ? '■ END OF EXAMINED CLIP' : '▶ ARCHIVED CLIP'}</span>
                      <span>{replayPaused ? '0:42 / 1:12' : '0:38 / 1:12'} · 240p</span>
                    </div>
                  </button>
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
                    This is 100% fake. At score 40, there is a hardcoded collision barrier. I inspected the bytecode. He is either using an emulator modification or spoofing values.
                  </p>
                  <button
                    type="button"
                    className="w-full bg-slate-950 p-1.5 rounded text-left text-[10px] text-yellow-400 border border-yellow-950 mt-1"
                    id="vt-arc-reply"
                    onClick={() => {
                      audio.playTick();
                      if (!isPlayingVideo) {
                        speakChapterOne(CHAPTER_ONE_DIALOGUE.videoReady);
                        return;
                      }
                      speakChapterOne(CHAPTER_ONE_DIALOGUE.lumenLead);
                      updateProgress((prev) => completePuzzleChapter(prev, 1, { watchedVideo: true }));
                    }}
                  >
                    💬 **ARC_184 replied**: No emulator edits. No scripts. It runs on the <span className="underline font-bold text-white">Lumen Arc</span>, utilizing the native altitude sensor glitch of the LAOS operating system. Look up the device they recalled.
                  </button>
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

      {/* Embedded CSS for the Gate 40 comment flood. Text deliberately has no
          pill, panel, or grey mask: the unreadability is the narrative beat. */}
      <style>{`
        @keyframes danmaku-run {
          0% { opacity: 0; transform: translateX(680px); }
          5% { opacity: 1; }
          94% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-115%); }
        }
        @keyframes danmaku-hold {
          0% { opacity: 0; transform: translateX(-50%) scale(0.82); }
          12% { opacity: 1; transform: translateX(-50%) scale(1); }
          82% { opacity: 1; transform: translateX(-50%) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) scale(1.04); }
        }
      `}</style>
    </div>
  );
};
