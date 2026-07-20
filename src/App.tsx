import React, { useState, useEffect } from 'react';
import { GameProgress, PuzzleChapter } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { MetaInteractionScene } from './components/MetaInteractionScene';
import { DEBUG_CHAPTERS, getChapterById, getChapterSnapshot } from './lib/chapterProgress';
import { shouldRevealMetaView, shouldShowMetaScene } from './lib/metaInteraction';
import audio from './lib/audio';
import music, { getMusicPhase } from './lib/music';
import { 
  FileText, Shield, Award, Terminal, RefreshCw, Volume2, VolumeX,
  Sparkles, CheckCircle, Database, HelpCircle, Archive, Globe, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_PROGRESS: GameProgress = {
  currentChapter: 1,
  phase: 'intro_game',
  deathsAt40: 0,
  seenLeaderboard: false,
  bestScore: 0,
  viewTubeSearchedArc: false,
  watchedVideo: false,
  archiveDownloaded: false,
  orderedPhone: false,
  deliveredPhone: false,
  discoveredOriginalTitle: false,
  discoveredSKGHistory: false,
  discoveredNoahQA: false,
  discoveredMotherComment: false,
  unlockedAdminLogin: false,
  loggedIntoAdmin: false,
  unlockedCodeRoute: false,
  completedGame: false,
  selectedEnding: null,
};

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(INITIAL_PROGRESS);
  const [isMuted, setIsMuted] = useState(false);
  const [deskLamp, setDeskLamp] = useState(true);
  const [metaViewActive, setMetaViewActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('meta') === 'true';
  });
  const [debugMode, setDebugMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debug') === 'true';
  });
  const [debugTargetApp, setDebugTargetApp] = useState<{ app: ReturnType<typeof getChapterById>['targetApp']; nonce: number } | null>(null);
  const activeMusicPhase = getMusicPhase(progress);

  // Developer-only evidence tools stay out of the player's story surface.
  // The keyboard listener changes visibility only; progress remains untouched.
  useEffect(() => {
    const handleDebugShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setDebugMode((current) => !current);
      }
    };

    window.addEventListener('keydown', handleDebugShortcut);
    return () => window.removeEventListener('keydown', handleDebugShortcut);
  }, []);

  useEffect(() => audio.armUnlock(), []);

  const jumpToChapter = (chapter: PuzzleChapter) => {
    const chapterInfo = getChapterById(chapter);
    setProgress(getChapterSnapshot(chapter));
    setMetaViewActive(true);
    setDebugTargetApp((previous) => ({ app: chapterInfo.targetApp, nonce: (previous?.nonce ?? 0) + 1 }));
    audio.playUnlock();
  };

  const handleLeaderboardOpened = () => {
    if (shouldRevealMetaView(progress.deathsAt40, true)) {
      setMetaViewActive(true);
      setProgress((previous) => ({ ...previous, phase: 'os_unlocked' }));
    }
  };

  // Handle background ambient hum
  useEffect(() => {
    audio.setMute(isMuted);
    music.setMuted(isMuted);
    if (!isMuted) {
      audio.startAmbientHum();
    }
    return () => {
      audio.stopAmbientHum();
    };
  }, [isMuted]);

  useEffect(() => {
    music.setPhase(activeMusicPhase);
  }, [activeMusicPhase]);

  const updateProgress = (updater: (prev: GameProgress) => GameProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      // Play brief hacker tick sound when items unlock
      if (
        next.deliveredPhone !== prev.deliveredPhone ||
        next.unlockedCodeRoute !== prev.unlockedCodeRoute ||
        next.loggedIntoAdmin !== prev.loggedIntoAdmin
      ) {
        audio.playUnlock();
      }
      return next;
    });
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.setMute(nextMuted);
    music.setMuted(nextMuted);
    if (!nextMuted) audio.play('ui.toggle', { variant: 1 });
  };

  const restartLoop = () => {
    audio.playUnlock();
    setProgress(INITIAL_PROGRESS);
    setMetaViewActive(false);
    setDebugTargetApp(null);
  };

  const selectEnding = (ending: 'submit' | 'publicize' | 'preserve') => {
    // §4.8 — each ending owns its sound: preserving is a file finishing
    // its write; submitting is a complete but hollow ad victory;
    // publicizing is a notification swarm cut off by the server.
    audio.play(
      ending === 'preserve' ? 'story.endingPreserve'
        : ending === 'submit' ? 'story.endingSubmit'
          : 'story.endingPublicize',
    );
    if (ending === 'preserve') {
      audio.play('story.downloadCount', { delay: 2.4 });
      audio.play('story.downloadCount', { delay: 3.6 });
    }
    setProgress((prev) => ({
      ...prev,
      phase: 'ending_choice',
      selectedEnding: ending
    }));
  };

  const debugFlags = [
    ['Gate 40 deaths', progress.deathsAt40],
    ['Leaderboard seen', progress.seenLeaderboard],
    ['ARC_184 searched', progress.viewTubeSearchedArc],
    ['Replay watched', progress.watchedVideo],
    ['Archive downloaded', progress.archiveDownloaded],
    ['Phone delivered', progress.deliveredPhone],
    ['Original title found', progress.discoveredOriginalTitle],
    ['SKG history found', progress.discoveredSKGHistory],
    ['Noah Q&A found', progress.discoveredNoahQA],
    ['Admin login unlocked', progress.unlockedAdminLogin],
    ['Admin logged in', progress.loggedIntoAdmin],
    ['Code route unlocked', progress.unlockedCodeRoute],
    ['Game completed', progress.completedGame],
  ] as const;

  const metaSceneActive = shouldShowMetaScene(metaViewActive, debugMode);

  return (
    <div className={`h-screen w-full flex flex-col md:flex-row relative overflow-hidden transition-all duration-700 ${
      deskLamp ? 'bg-[#0b0c10]' : 'bg-[#020204]'
    }`} id="workspace-desk">
      
      {/* Quiet room: one soft vignette, no texture, no scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(120% 95% at 50% 42%, transparent 0%, rgba(0,0,0,0.6) 100%)' }}
      ></div>

      {/* LEFT SIDEBAR: Developer-only Evidence & Hacking Log Dashboard */}
      <div
        className={`${debugMode ? 'flex' : 'hidden'} w-full md:w-[360px] border-b md:border-b-0 md:border-r border-slate-800/60 bg-slate-950/80 p-5 flex-col justify-between z-10 backdrop-blur-md overflow-y-auto`}
        id="evidence-panel"
        data-debug-mode={debugMode ? 'enabled' : 'disabled'}
      >
        <div className="space-y-5">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                ACTIVE COGNITIVE INVESTIGATION
              </span>
              <button 
                onClick={() => { audio.play('ui.toggle', { variant: deskLamp ? 0 : 1 }); setDeskLamp(!deskLamp); }}
                className="text-[9px] text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                title="Toggle Lamp"
                id="lamp-toggle"
              >
                💡 {deskLamp ? 'LAMP: ON' : 'LAMP: OFF'}
              </button>
            </div>
            <h1 className="font-display font-black text-xl tracking-tight text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span>SKG: SCOREKEEPER</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono italic">
              "Nobody was supposed to finish."
            </p>
          <div className="flex items-center justify-between gap-3 rounded border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-[9px] font-mono text-fuchsia-300">
              <span>DEVELOPER DEBUG MODE</span>
              <span className="text-slate-500">CTRL + SHIFT + D</span>
            </div>
          </div>

          <div className="space-y-3" id="debug-chapter-controls">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                GDD Puzzle Chapters 1–10
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Ctrl+Shift+D</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEBUG_CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => jumpToChapter(chapter.id)}
                  aria-pressed={progress.currentChapter === chapter.id}
                  className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    progress.currentChapter === chapter.id
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                      : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                  id={`debug-chapter-${chapter.id}`}
                >
                  <span className="block font-mono text-[9px] opacity-70">CHAPTER {chapter.id.toString().padStart(2, '0')}</span>
                  <span className="block text-[10px] font-bold leading-tight mt-0.5">{chapter.shortTitle}</span>
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-2.5 text-[9px] leading-relaxed text-slate-400">
              <span className="font-bold text-emerald-300">目前快照：</span>{' '}
              {getChapterById(progress.currentChapter).description}
            </div>
          </div>

          {/* Unlocked Clues list (Dynamic Bento feed) */}
          <div className="space-y-3" id="clues-feed">
            <h3 className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              EVIDENCE RECORDINGS
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              
              {/* Clue 1: The Discrepancy */}
              <div className={`p-3 rounded-xl border text-xs transition-all flex gap-2.5 ${
                progress.deathsAt40 >= 1
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200' 
                  : 'bg-slate-950/20 border-slate-900/40 text-slate-600'
              }`} id="evidence-discrepancy">
                <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">The Blocker Discrepancy</div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {progress.deathsAt40 >= 1
                      ? `Failed at Gate 40 (${progress.deathsAt40} times). Leaderboard tied perfectly at score 40. Suspicion: Real colliders bypassed.`
                      : 'Investigation inactive. Play the mobile game to encounter the blocker.'}
                  </p>
                </div>
              </div>

              {/* Clue 2: Obsolete phone */}
              <div className={`p-3 rounded-xl border text-xs transition-all flex gap-2.5 ${
                progress.watchedVideo 
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200' 
                  : 'bg-slate-950/20 border-slate-900/40 text-slate-600'
              }`} id="evidence-recalled-device">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">The Recalled Console</div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {progress.watchedVideo 
                      ? 'ARC_184 run video shows he bypassed 40 using "Lumen Arc" phone with native altitude sensor. Tapping frequency unlocks collision bounds!'
                      : 'No hardware references discovered yet.'}
                  </p>
                </div>
              </div>

              {/* Clue 3: Original Identity */}
              <div className={`p-3 rounded-xl border text-xs transition-all flex gap-2.5 ${
                progress.discoveredOriginalTitle 
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200' 
                  : 'bg-slate-950/20 border-slate-900/40 text-slate-600'
              }`} id="evidence-original-title">
                <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Identity: Skyline 256</div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {progress.discoveredOriginalTitle 
                      ? 'The slop game was originally named "SKG: Skyline 256" by "Silver Kite Games". It was built with a clear end at gate 256.' 
                      : 'Original developers and brand identities remain obscured.'}
                  </p>
                </div>
              </div>

              {/* Clue 4: Decrypted path */}
              <div className={`p-3 rounded-xl border text-xs transition-all flex gap-2.5 ${
                progress.unlockedCodeRoute 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                  : 'bg-slate-950/20 border-slate-900/40 text-slate-600'
              }`} id="evidence-bypass-code">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <div className="font-bold">Collision Bypass Gained</div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {progress.unlockedCodeRoute 
                      ? 'Successfully logged in. Acquired flight heights near Gate 40: ALT 184, 172, 149, 133, 121, 118, 126, 143. Calibration sensor active!'
                      : 'Developer coordinates locked.'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-2" id="debug-progress-flags">
            <h3 className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Progress flags
            </h3>
            <div className="grid grid-cols-1 gap-1 rounded-xl border border-slate-800 bg-black/20 p-2 font-mono text-[9px]">
              {debugFlags.map(([label, value]) => {
                const active = typeof value === 'number' ? value > 0 : value;
                return (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="truncate text-slate-500">{label}</span>
                    <span className={active ? 'text-emerald-400' : 'text-slate-700'}>
                      {typeof value === 'number' ? value : active ? 'TRUE' : 'FALSE'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Global preserver widgets */}
        <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-3 text-[10px] text-slate-400" id="audio-console">
          <div className="flex items-center justify-between">
            <span className="font-mono">AMBIENT ATMOSPHERE SYSTEM</span>
            <button 
              onClick={handleMuteToggle}
              className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-200 hover:text-white border border-slate-800 transition-colors flex items-center gap-1.5"
              id="master-mute"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'UNMUTE HUM' : 'MUTE HUM'}</span>
            </button>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800 text-[9px] text-slate-500 font-mono leading-tight">
            Low frequency hum (55Hz / A1) represents the CRT radiation hum of your childhood workspace. Keeps thoughts centered.
          </div>
        </div>

      </div>

      {/* CENTER STAGE: Simulated Bezel Phone in Interactive Light Panel */}
      <div
        className={`${metaSceneActive ? 'phone-stage bg-slate-950/40' : 'bg-black'} flex-1 flex items-center justify-center relative z-10 min-h-[300px]`}
        id="phone-container"
      >
        
        {/* Faint cold spill from the screen onto the desk */}
        {metaSceneActive && <div className="absolute w-96 h-96 bg-[#41526e]/[0.08] blur-[130px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>}

        <MetaInteractionScene active={metaSceneActive} chapter={metaSceneActive ? progress.currentChapter : 0}>
          <PhoneSimulator
            progress={progress}
            updateProgress={updateProgress}
            onMuteToggle={handleMuteToggle}
            isMuted={isMuted}
            immersiveIntro={!metaSceneActive}
            debugTargetApp={debugTargetApp}
            onLeaderboardOpened={handleLeaderboardOpened}
          />
        </MetaInteractionScene>

      </div>

      {/* STORY CREDITS AND ENDING DECISION OVERLAYS (Phase triggered) */}
      <AnimatePresence>
        {progress.phase === 'credits' && (
          /* The old system holds the whole display now. It is not broken —
             it has simply waited a long time to show this page. */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="fixed inset-0 bg-[#0a0e13]/[0.99] flex flex-col justify-center items-center p-6 z-50 overflow-y-auto"
            id="credits-overlay"
          >
            <div className="max-w-md w-full space-y-6 text-center p-4" id="credits-scroll-box">
              <div className="space-y-1.5">
                <div className="laos-label text-[10px] !text-[var(--laos-warm)]">
                  - CONNECTION COMPLETED -
                </div>
                <h1 className="font-laos font-semibold text-2xl text-[var(--laos-text)] tracking-[0.06em]">
                  SKYLINE COMPLETE
                </h1>
              </div>

              {/* Emotional Developer text excerpt */}
              <div className="laos-panel p-4 text-left text-xs space-y-3 leading-relaxed font-laos text-[var(--laos-text)]">
                <p className="laos-label text-[9px] border-b border-[var(--laos-line-dim)] pb-2">
                  DEVELOPER RELEASE LOG // VER: 1.04_FINAL
                </p>
                <p>
                  "這不是一款無限遊戲。我從來不想讓它無限。"
                </p>
                <p>
                  "無限分數只是讓玩家不必面對結束的方法。但所有遊戲都會結束。裝置會停止生產，商店會關閉，伺服器會消失。"
                </p>
                <p>
                  "我能做的，只是替它留下最後一關。有人抵達這裡，就代表它曾經存在。"
                </p>
                <div className="text-right text-[10px] text-[var(--laos-dim)] mt-2 font-semibold">
                  —— Noah Kade (Silver Kite Games)
                </div>
              </div>

              {/* Credited names */}
              <div className="space-y-1.5 text-xs text-[var(--laos-dim)] font-laos text-center">
                <div className="laos-label text-[9px] mb-2 !text-[var(--laos-text)]">SILVER KITE DEVELOPERS</div>
                <div>Noah Kade — System Design & Mechanics</div>
                <div>Elias Vale — Business Logistics</div>
                <div>Mara — Special Supporting Partner</div>
                <div>ARC_184 — Controversial Preservation Witness</div>
                <div className="text-[var(--laos-warm)] font-semibold mt-2">AND YOU — THE PERSISTENT RETRIEVER</div>
              </div>

              <button
                onClick={() => {
                  audio.playUnlock();
                  setProgress((prev) => ({ ...prev, phase: 'ending_choice' }));
                }}
                className="laos-slow px-6 py-2.5 bg-[var(--laos-surface-2)] hover:bg-[var(--laos-line-dim)] text-[var(--laos-text)] border border-[var(--laos-line)] font-laos font-semibold tracking-[0.14em] text-[11px]"
                id="credits-proceed-btn"
              >
                PROCEED TO FINAL STRATEGY
              </button>
            </div>
          </motion.div>
        )}

        {progress.phase === 'ending_choice' && (
          /* The final choice belongs to the old system's page too. Three
             plain documents, no fireworks — attention stays on the decision. */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="fixed inset-0 bg-[#0a0e13]/[0.99] flex flex-col justify-center items-center p-6 z-50 overflow-y-auto"
            id="ending-choice-overlay"
          >
            <div className="max-w-2xl w-full space-y-8" id="ending-container">

              <div className="text-center space-y-1.5">
                <h1 className="font-laos font-semibold text-2xl text-[var(--laos-text)] tracking-[0.04em]">
                  HOW SHOULD THE SKYLINE CONCLUDE?
                </h1>
                <p className="font-laos text-xs text-[var(--laos-dim)] max-w-md mx-auto">
                  Noah's negative score has been retrieved. You have the original source files. Decide how to manage this legacy.
                </p>
              </div>

              {/* Three Final Choices */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ending-options-grid">

                {/* Option 1: Submit Score */}
                <div
                  onClick={() => selectEnding('submit')}
                  className={`laos-slow p-4 border text-left cursor-pointer flex flex-col justify-between h-[200px] bg-[var(--laos-surface)] ${
                    progress.selectedEnding === 'submit'
                      ? 'border-[var(--laos-warm)]'
                      : 'border-[var(--laos-line)] hover:border-[var(--laos-dim)]'
                  }`}
                  id="opt-submit-score"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 border border-[var(--laos-line)] bg-[var(--laos-surface-2)] flex items-center justify-center">
                      <Award className="w-4 h-4 text-[var(--laos-dim)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-laos font-semibold text-xs text-[var(--laos-text)] tracking-wide">1. SUBMIT SCORE</h3>
                    <p className="font-laos text-[10px] text-[var(--laos-dim)] leading-normal">
                      Exploit modern system registers to report a score of 257. Become the absolute number one on the global leaderboards.
                    </p>
                  </div>
                  <span className="laos-label text-[8px] mt-2">SELECT BRANCH</span>
                </div>

                {/* Option 2: Publicize the story */}
                <div
                  onClick={() => selectEnding('publicize')}
                  className={`laos-slow p-4 border text-left cursor-pointer flex flex-col justify-between h-[200px] bg-[var(--laos-surface)] ${
                    progress.selectedEnding === 'publicize'
                      ? 'border-[var(--laos-warm)]'
                      : 'border-[var(--laos-line)] hover:border-[var(--laos-dim)]'
                  }`}
                  id="opt-publicize"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 border border-[var(--laos-line)] bg-[var(--laos-surface-2)] flex items-center justify-center">
                      <Globe className="w-4 h-4 text-[var(--laos-dim)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-laos font-semibold text-xs text-[var(--laos-text)] tracking-wide">2. PUBLICIZE STORY</h3>
                    <p className="font-laos text-[10px] text-[var(--laos-dim)] leading-normal">
                      Upload the complete coordinates sequence and story to ViewTube. Ignite discussion regarding original design preservation.
                    </p>
                  </div>
                  <span className="laos-label text-[8px] mt-2">SELECT BRANCH</span>
                </div>

                {/* Option 3: Archive & Preserve */}
                <div
                  onClick={() => selectEnding('preserve')}
                  className={`laos-slow p-4 border text-left cursor-pointer flex flex-col justify-between h-[200px] bg-[var(--laos-surface)] ${
                    progress.selectedEnding === 'preserve'
                      ? 'border-[var(--laos-warm)]'
                      : 'border-[var(--laos-line)] hover:border-[var(--laos-dim)]'
                  }`}
                  id="opt-preserve"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 border border-[var(--laos-line)] bg-[var(--laos-surface-2)] flex items-center justify-center">
                      <Archive className="w-4 h-4 text-[var(--laos-warm)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-laos font-semibold text-xs text-[var(--laos-text)] tracking-wide">3. ARCHIVE & PRESERVE</h3>
                    <p className="font-laos text-[10px] text-[var(--laos-dim)] leading-normal">
                      Refuse database score submission. Upload the legacy source binary and tech flight logs to preservation platforms safely.
                    </p>
                  </div>
                  <span className="laos-label text-[8px] mt-2 !text-[var(--laos-warm)]">TRUE ARCHIVIST</span>
                </div>

              </div>

              {/* Dynamic ending narrative text based on chosen option */}
              {progress.selectedEnding && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="laos-panel p-4 text-xs space-y-2 font-laos leading-relaxed"
                  id="ending-narrative"
                >
                  <div className="font-semibold text-[var(--laos-text)] flex items-center gap-1.5 tracking-wide">
                    <Sparkles className="w-4 h-4 text-[var(--laos-warm)]" strokeWidth={1.5} />
                    <span>
                      {progress.selectedEnding === 'submit' && 'SUBMITTED ENDING: HIGHEST SCORE CHASER'}
                      {progress.selectedEnding === 'publicize' && 'PUBLICIZED ENDING: COGNITIVE MASS DISRUPT'}
                      {progress.selectedEnding === 'preserve' && 'TRUE ENDING: COGNITIVE PRESERVED CAPABILITY'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--laos-text)]">
                    {progress.selectedEnding === 'submit' &&
                      'You update the scoreboard data. Social discussion swarms with your score of 257 as the world record. Yet, the corporate system logo stays as a modern slop clone. Noah\'s negative score is pushed further deep into memory, unacknowledged.'}
                    {progress.selectedEnding === 'publicize' &&
                      'Your replay goes viral. Millions watch the altitude sensor bypassing Gate 40. SKG Automation reacts quickly: they close down the legacy database servers, claiming security breeches, and permanently scrub Noah\'s negative code records.'}
                    {progress.selectedEnding === 'preserve' &&
                      'You do not submit the score. You keep the secret safe on digital libraries. The original IPA remains possible. Download count: 1 (ARC_184), then 2. The game does not need to run forever. It only needs to remain possible.'}
                  </p>

                  <div className="pt-2 border-t border-[var(--laos-line-dim)] flex justify-between items-center text-[10px]">
                    <span className="laos-label text-[7.5px]">BRANCH DECIDED BY END USER RECODING</span>
                    <button
                      onClick={restartLoop}
                      className="laos-slow px-3 py-1 bg-[var(--laos-surface-2)] text-[var(--laos-text)] hover:bg-[var(--laos-line-dim)] flex items-center gap-1 border border-[var(--laos-line)] font-laos tracking-wide"
                      id="restart-loop-btn"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Restart Loop
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
