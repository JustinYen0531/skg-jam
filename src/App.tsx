import React, { useState, useEffect } from 'react';
import { GameProgress, PuzzleChapter } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { MetaInteractionScene } from './components/MetaInteractionScene';
import { DEBUG_CHAPTERS, getChapterAdvanceGuide, getChapterById, getChapterSnapshot } from './lib/chapterProgress';
import {
  shouldPersistDeveloperMetaView,
  shouldRevealMetaView,
  shouldShowMetaScene,
} from './lib/metaInteraction';
import audio from './lib/audio';
import music, { getMusicPhase } from './lib/music';
import { 
  Award, Terminal, RefreshCw, Volume2, VolumeX,
  CheckCircle, Database, HelpCircle, Archive, Globe
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
  discoveredMaraAltitude184: false,
  discoveredMaraGate40: false,
  discoveredMaraEnd256: false,
  unlockedAdminLogin: false,
  loggedIntoAdmin: false,
  chapterEightMemoryIds: [],
  chapterEightRestoredMessageIds: [],
  chapterNineRestorePhase: 'idle',
  chapterNineProfileChoice: null,
  chapterNinePasswordVerified: false,
  chapterNineDownloadState: 'idle',
  chapterNineDeletedAppIds: [],
  chapterNineMessageAttempts: 0,
  chapterNineArcaneSilent: false,
  unlockedCodeRoute: false,
  completedGame: false,
  selectedEnding: null,
};

const FULLSCREEN_ONLY_STORAGE_KEY = 'skg.fullscreenOnly';
const ENDING_PREVIEW_LINES: Readonly<Record<NonNullable<GameProgress['selectedEnding']>, readonly string[]>> = {
  submit: [
    'So I let the board keep it.',
    'Negative sixty-five thousand, five hundred and thirty-five. Dead last.',
    'Honestly? There is a lot less pressure down here.',
  ],
  publicize: [
    'So I tell everyone what happened.',
    'They argue over the score, the archive, and whether any of it counts.',
    'At least nobody gets to pretend the game never existed.',
  ],
  preserve: [
    'So I keep the build alive and leave the scoreboard alone.',
    'No victory announcement. No permanent server.',
    'Just a door that still opens when someone needs it.',
  ],
};

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(INITIAL_PROGRESS);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVolume, setSoundVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(1);
  const [screenBrightness, setScreenBrightness] = useState(1);
  const [screenContrast, setScreenContrast] = useState(1);
  const [cameraPitchEnabled, setCameraPitchEnabled] = useState(true);
  const [postureControlEnabled, setPostureControlEnabled] = useState(true);
  const [fullscreenOnly, setFullscreenOnly] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(FULLSCREEN_ONLY_STORAGE_KEY) === 'true';
  });
  const [deskLamp, setDeskLamp] = useState(true);
  const [metaViewActive, setMetaViewActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('meta') === 'true';
  });
  const [chapterTenPlayerFullscreen, setChapterTenPlayerFullscreen] = useState(false);
  const [chapterTenSceneryRewound, setChapterTenSceneryRewound] = useState(false);
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

  useEffect(() => {
    if (shouldPersistDeveloperMetaView(debugMode, progress.currentChapter)) {
      setMetaViewActive(true);
    }
  }, [debugMode, progress.currentChapter]);

  useEffect(() => audio.armUnlock(), []);

  useEffect(() => {
    window.localStorage.setItem(FULLSCREEN_ONLY_STORAGE_KEY, String(fullscreenOnly));
  }, [fullscreenOnly]);

  const jumpToChapter = (chapter: PuzzleChapter) => {
    const chapterInfo = getChapterById(chapter);
    setProgress(getChapterSnapshot(chapter));
    setChapterTenPlayerFullscreen(false);
    setChapterTenSceneryRewound(false);
    setMetaViewActive(true);
    setDebugTargetApp((previous) => ({ app: chapterInfo.targetApp, nonce: (previous?.nonce ?? 0) + 1 }));
    audio.playUnlock();
  };

  const handleSuspiciousRunSelected = () => {
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
    if (progress.phase === 'credits') {
      music.playFinaleOnce();
    } else {
      music.setPhase(activeMusicPhase);
    }
  }, [activeMusicPhase, progress.phase]);

  useEffect(() => audio.setVolume(soundVolume), [soundVolume]);
  useEffect(() => music.setVolume(musicVolume), [musicVolume]);

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
    audio.play('ui.primaryTap');
    setProgress(INITIAL_PROGRESS);
    setChapterTenPlayerFullscreen(false);
    setChapterTenSceneryRewound(false);
    setMetaViewActive(false);
    setDebugTargetApp(null);
  };

  const restartCurrentChapter = () => jumpToChapter(progress.currentChapter);

  const openDeveloperTools = () => {
    setDebugMode(true);
    setMetaViewActive(true);
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
      // "Download count: 1 (ARC_184), then 2." — audible, barely (§4.8).
      audio.play('story.downloadCount', { delay: 2.4 });
      audio.play('story.downloadCount', { delay: 3.6 });
    }
    setProgress((prev) => ({
      ...prev,
      phase: 'ending_choice',
      selectedEnding: ending
    }));
  };

  const chapterAdvanceGuide = getChapterAdvanceGuide(progress.currentChapter);
  // Fullscreen-only is a player-owned safety override. Meta may remain unlocked
  // underneath, but its projected camera and input relay are completely bypassed.
  const metaSceneActive = !chapterTenPlayerFullscreen
    && !fullscreenOnly
    && shouldShowMetaScene(metaViewActive, debugMode, progress.phase);

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

          <section className="space-y-3" id="debug-chapter-guide">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Chapter advance guide
              </h3>
              <span className="font-mono text-[9px] text-emerald-400">
                CHAPTER {progress.currentChapter.toString().padStart(2, '0')} → {chapterAdvanceGuide.nextLabel}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/10 p-3.5" id="chapter-guide-card">
              <p className="text-xs font-bold leading-snug text-slate-100" id="chapter-guide-objective">
                {chapterAdvanceGuide.objective}
              </p>

              <div className="mt-3 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Required steps
              </div>
              <ol className="mt-2 space-y-2" id="chapter-guide-steps">
                {chapterAdvanceGuide.steps.map((step, index) => (
                  <li key={step} className="flex gap-2.5 text-[10px] leading-snug text-slate-300">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 font-mono text-[8px] text-emerald-300">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {chapterAdvanceGuide.answers && (
                <div className="mt-3 border-t border-slate-800 pt-3" id="chapter-guide-answers">
                  <div className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    Question answers
                  </div>
                  <ol className="mt-2 space-y-2">
                    {chapterAdvanceGuide.answers.map(({ question, answer }, index) => (
                      <li key={question} className="rounded-md border border-amber-400/15 bg-amber-400/5 px-2.5 py-2">
                        <div className="flex gap-2 text-[9px] leading-snug text-slate-400">
                          <span className="font-mono text-amber-400/70">{index + 1}.</span>
                          <span>{question}</span>
                        </div>
                        <div className="mt-1 pl-4 text-[10px] font-bold leading-snug text-amber-200">
                          → {answer}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-3 flex gap-2 border-t border-slate-800 pt-3" id="chapter-guide-completion">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-400">
                    Advances when
                  </div>
                  <p className="mt-1 text-[9px] leading-snug text-slate-400">
                    {chapterAdvanceGuide.completion}
                  </p>
                </div>
              </div>
            </div>
          </section>

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
        className={`${metaSceneActive ? 'bg-slate-950/40' : 'bg-black'} flex-1 flex items-center justify-center relative z-10 min-h-[300px]`}
        id="phone-container"
        data-scene-frame={metaSceneActive ? 'edge-to-edge' : 'fullscreen-game'}
      >
        
        {/* Faint cold spill from the screen onto the desk */}
        {metaSceneActive && <div className="absolute w-96 h-96 bg-[#41526e]/[0.08] blur-[130px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>}

        <MetaInteractionScene
          active={metaSceneActive}
          chapter={metaSceneActive ? progress.currentChapter : 0}
          sceneryChapter={metaSceneActive && chapterTenSceneryRewound ? 1 : undefined}
          cameraPitchEnabled={cameraPitchEnabled}
          postureControlEnabled={postureControlEnabled}
        >
          <PhoneSimulator
            progress={progress}
            updateProgress={updateProgress}
            onMuteToggle={handleMuteToggle}
            isMuted={isMuted}
            immersiveIntro={!metaSceneActive}
            debugTargetApp={debugTargetApp}
            onSuspiciousRunSelected={handleSuspiciousRunSelected}
            soundVolume={soundVolume}
            musicVolume={musicVolume}
            screenBrightness={screenBrightness}
            screenContrast={screenContrast}
            cameraPitchEnabled={cameraPitchEnabled}
            postureControlEnabled={postureControlEnabled}
            fullscreenOnly={fullscreenOnly}
            developerToolsOpen={debugMode}
            chapterTenPlayerFullscreen={chapterTenPlayerFullscreen}
            onSoundVolumeChange={setSoundVolume}
            onMusicVolumeChange={setMusicVolume}
            onScreenBrightnessChange={setScreenBrightness}
            onScreenContrastChange={setScreenContrast}
            onCameraPitchEnabledChange={setCameraPitchEnabled}
            onPostureControlEnabledChange={setPostureControlEnabled}
            onFullscreenOnlyChange={setFullscreenOnly}
            onOpenDeveloperTools={openDeveloperTools}
            onChapterTenPlayerFlightStart={() => {
              setChapterTenSceneryRewound(false);
              setChapterTenPlayerFullscreen(true);
            }}
            onChapterTenPlayerFlightEnd={() => setChapterTenPlayerFullscreen(false)}
            onChapterTenTakeover={() => {
              setChapterTenSceneryRewound(true);
              setChapterTenPlayerFullscreen(false);
            }}
            onRestartCurrentChapter={restartCurrentChapter}
            onRestartLoop={restartLoop}
          />
        </MetaInteractionScene>

      </div>

      {/* ENDING DECISION OVERLAY (Phase triggered) */}
      <AnimatePresence>
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
                  Three player-controlled previews. None of them changes the real story.
                </p>
                <div className="laos-label text-[8px] !text-[var(--laos-warm)]">
                  NON-CANON EPILOGUE PREVIEW
                </div>
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
                      Leave ARCANE's signed −65535 record on the public leaderboard and let the impossible score speak for itself.
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
                      Release the route, the recovered conversations, and the story behind Skyline 256.
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
                    <h3 className="font-laos font-semibold text-xs text-[var(--laos-text)] tracking-wide">3. ARCHIVE &amp; PRESERVE</h3>
                    <p className="font-laos text-[10px] text-[var(--laos-dim)] leading-normal">
                      Preserve the playable build and its records without declaring any public winner.
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
                  <div className="flex items-center gap-2 font-mono text-[8px] font-bold tracking-[0.3em] text-[#91a7bb]">
                    <span className="h-1.5 w-1.5 rounded-[1px] border border-[#91a7bb]/60" aria-hidden="true" />
                    ARCANE
                  </div>

                  <div className="space-y-1.5 font-thought text-[15px] leading-relaxed text-[#c6d1de]">
                    {ENDING_PREVIEW_LINES[progress.selectedEnding].map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[var(--laos-line-dim)] flex justify-between items-center text-[10px]">
                    <span className="laos-label text-[7.5px]">PREVIEW ONLY · SWITCH BRANCHES FREELY</span>
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
