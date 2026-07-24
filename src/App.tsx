import React, { useState, useEffect, useRef } from 'react';
import { GameProgress, PuzzleChapter } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { MetaInteractionScene } from './components/MetaInteractionScene';
import { DEBUG_CHAPTERS, getChapterAdvanceGuide, getChapterById, getChapterSnapshot } from './lib/chapterProgress';
import {
  shouldPersistDeveloperMetaView,
  shouldRevealMetaView,
  shouldShowMetaScene,
} from './lib/metaInteraction';
import {
  CHAPTER_TEN_AFTERWORD_OPTIONS,
  clearChapterTenEasterEggs,
  getRememberedChapterTenAfterwords,
  rememberChapterTenAfterword,
  type ChapterTenAfterword,
} from './lib/chapterTenAfterword';
import audio from './lib/audio';
import music, { getMusicPhase } from './lib/music';
import {
  loadChapterCheckpoint,
  loadManualCheckpoint,
  saveChapterCheckpoint,
  saveManualCheckpoint,
  type ChapterCheckpoint,
} from './lib/chapterCheckpoint';
import { canConsumeVerticalWheel } from './lib/wheelContainment';
import { 
  Terminal, Volume2, VolumeX,
  CheckCircle, Database, HelpCircle
} from 'lucide-react';

const INITIAL_PROGRESS: GameProgress = {
  currentChapter: 1,
  phase: 'intro_game',
  deathsAt40: 0,
  seenLeaderboard: false,
  bestScore: 0,
  viewTubeSearchedArc: false,
  watchedVideo: false,
  discoveredLegacyPassage: false,
  discoveredLegacyIpa: false,
  archiveDownloaded: false,
  orderedPhone: false,
  deliveredPhone: false,
  discoveredOriginalTitle: false,
  discoveredSKGHistory: false,
  discoveredNoahQA: false,
  discoveredMotherComment: false,
  discoveredMaraArc184: false,
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

export default function App() {
  const [checkpoint, setCheckpoint] = useState<ChapterCheckpoint | null>(() => (
    loadChapterCheckpoint(INITIAL_PROGRESS) ?? saveChapterCheckpoint(INITIAL_PROGRESS)
  ));
  const [progress, setProgress] = useState<GameProgress>(() => checkpoint?.progress ?? INITIAL_PROGRESS);
  const [manualCheckpoint, setManualCheckpoint] = useState<ChapterCheckpoint | null>(() => loadManualCheckpoint(INITIAL_PROGRESS));
  const pendingCheckpointChapter = useRef<PuzzleChapter | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [soundVolume, setSoundVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(1);
  const [screenBrightness, setScreenBrightness] = useState(1);
  const [screenContrast, setScreenContrast] = useState(1);
  const [cameraPitchEnabled, setCameraPitchEnabled] = useState(true);
  const [postureControlEnabled, setPostureControlEnabled] = useState(true);
  const [deskLamp, setDeskLamp] = useState(true);
  const [metaViewActive, setMetaViewActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('meta') === 'true'
      || (checkpoint?.progress.phase !== 'intro_game');
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
    const containGameWheel = (event: WheelEvent) => {
      const workspace = workspaceRef.current;
      const source = event.target;
      if (!workspace || !(source instanceof Element) || !workspace.contains(source)) return;

      // itch.io owns the page outside this iframe. Inside the game, cancel the
      // browser default first so reaching a game list boundary cannot scroll
      // the surrounding itch page.
      event.preventDefault();

      if (event.deltaY === 0) return;
      let scrollable = source instanceof HTMLElement ? source : source.parentElement;
      while (scrollable && workspace.contains(scrollable)) {
        const overflowY = window.getComputedStyle(scrollable).overflowY;
        const acceptsVerticalScroll = overflowY === 'auto'
          || overflowY === 'scroll'
          || overflowY === 'overlay';
        if (
          acceptsVerticalScroll
          && canConsumeVerticalWheel(
            scrollable.scrollTop,
            scrollable.scrollHeight,
            scrollable.clientHeight,
            event.deltaY,
          )
        ) {
          const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? scrollable.clientHeight
              : 1;
          scrollable.scrollBy({ top: event.deltaY * deltaScale, behavior: 'auto' });
          return;
        }
        if (scrollable === workspace) break;
        scrollable = scrollable.parentElement;
      }
    };

    window.addEventListener('wheel', containGameWheel, { capture: true, passive: false });
    return () => window.removeEventListener('wheel', containGameWheel, true);
  }, []);

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
      if (next.currentChapter > prev.currentChapter) {
        pendingCheckpointChapter.current = next.currentChapter;
      }
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

  useEffect(() => {
    if (pendingCheckpointChapter.current !== progress.currentChapter) return;
    pendingCheckpointChapter.current = null;
    const savedCheckpoint = saveChapterCheckpoint(progress);
    if (savedCheckpoint) setCheckpoint(savedCheckpoint);
  }, [progress]);

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
    setCheckpoint(saveChapterCheckpoint(INITIAL_PROGRESS));
    setDebugTargetApp(null);
  };

  const restartCurrentChapter = () => jumpToChapter(progress.currentChapter);

  const loadSavedCheckpoint = () => {
    const savedCheckpoint = loadChapterCheckpoint(INITIAL_PROGRESS);
    if (!savedCheckpoint) return;
    audio.play('ui.primaryTap');
    setCheckpoint(savedCheckpoint);
    setProgress(savedCheckpoint.progress);
    setChapterTenPlayerFullscreen(false);
    setChapterTenSceneryRewound(false);
    setMetaViewActive(savedCheckpoint.progress.phase !== 'intro_game');
    setDebugTargetApp(null);
  };

  const saveManualGame = () => {
    const savedCheckpoint = saveManualCheckpoint(progress);
    if (!savedCheckpoint) return;
    audio.play('ui.primaryTap');
    setManualCheckpoint(savedCheckpoint);
  };

  const loadManualGame = () => {
    const savedCheckpoint = loadManualCheckpoint(INITIAL_PROGRESS);
    if (!savedCheckpoint) return;
    audio.play('ui.primaryTap');
    setManualCheckpoint(savedCheckpoint);
    setProgress(savedCheckpoint.progress);
    setChapterTenPlayerFullscreen(false);
    setChapterTenSceneryRewound(false);
    setMetaViewActive(savedCheckpoint.progress.phase !== 'intro_game');
    setDebugTargetApp(null);
  };

  const openDeveloperTools = () => {
    setDebugMode(true);
    setMetaViewActive(true);
  };

  const setDeveloperAfterword = (afterword: ChapterTenAfterword) => {
    rememberChapterTenAfterword(afterword);
    setProgress((previous) => ({ ...previous, selectedEnding: afterword }));
  };

  const clearDeveloperAfterword = () => {
    clearChapterTenEasterEggs();
    setProgress((previous) => ({ ...previous, selectedEnding: null }));
  };

  const rememberedAfterwords = getRememberedChapterTenAfterwords();

  const chapterAdvanceGuide = getChapterAdvanceGuide(progress.currentChapter);
  const metaSceneActive = !chapterTenPlayerFullscreen
    && shouldShowMetaScene(metaViewActive, debugMode, progress.phase);

  return (
    <div ref={workspaceRef} className={`h-screen w-full flex flex-col md:flex-row relative overflow-hidden overscroll-none transition-all duration-700 ${
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
              <span>GAME QUESTING, QUESTIONING GAME</span>
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
              <span className="font-bold text-emerald-300">CURRENT SNAPSHOT:</span>{' '}
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

          {progress.currentChapter === 10 && (
            <section className="space-y-3" id="debug-chapter-ten-afterword">
              <div>
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-violet-300">Afterword / Easter egg state</h3>
                <p className="mt-1 text-[9px] leading-relaxed text-slate-500">Persist a loop trace for testing, or clear all traces for a clean recording demo.</p>
              </div>
              <div className="grid gap-2">
                {CHAPTER_TEN_AFTERWORD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeveloperAfterword(option.id)}
                    className={`rounded border px-3 py-2 text-left text-[9px] transition-colors ${
                      rememberedAfterwords.includes(option.id)
                        ? 'border-violet-300/50 bg-violet-400/10 text-violet-100'
                        : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-violet-400/40 hover:text-slate-200'
                    }`}
                    id={`debug-afterword-${option.id}`}
                    data-remembered={rememberedAfterwords.includes(option.id)}
                  >
                    <span className="block font-mono font-bold tracking-[0.1em]">{option.label}</span>
                    <span className="mt-1 block leading-snug opacity-70">{option.description}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearDeveloperAfterword}
                  className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-left text-[9px] text-slate-300 transition-colors hover:border-rose-400/55 hover:text-rose-200"
                  id="debug-afterword-clean"
                  data-remembered-count={rememberedAfterwords.length}
                >
                  <span className="block font-mono font-bold tracking-[0.1em]">NO AFTERWORD / CLEAN DEMO</span>
                  <span className="mt-1 block leading-snug opacity-70">Clear every stored trace. The next loop starts with no easter eggs.</span>
                </button>
              </div>
            </section>
          )}

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
          forceUpright={progress.phase === 'credits'}
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
            developerToolsOpen={debugMode}
            chapterTenPlayerFullscreen={chapterTenPlayerFullscreen}
            onSoundVolumeChange={setSoundVolume}
            onMusicVolumeChange={setMusicVolume}
            onScreenBrightnessChange={setScreenBrightness}
            onScreenContrastChange={setScreenContrast}
            onCameraPitchEnabledChange={setCameraPitchEnabled}
            onPostureControlEnabledChange={setPostureControlEnabled}
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
            checkpointChapter={checkpoint?.progress.currentChapter ?? 1}
            checkpointSavedAt={checkpoint?.savedAt ?? null}
            onLoadCheckpoint={loadSavedCheckpoint}
            manualCheckpointChapter={manualCheckpoint?.progress.currentChapter ?? null}
            manualCheckpointSavedAt={manualCheckpoint?.savedAt ?? null}
            onSaveManualCheckpoint={saveManualGame}
            onLoadManualCheckpoint={loadManualGame}
          />
        </MetaInteractionScene>

      </div>
    </div>
  );
}
