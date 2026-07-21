import React, { useState, useEffect, useRef } from 'react';
import { GameProgress, ActiveApp } from '../types';
import audio from '../lib/audio';
import { getResidueLevel, isMigratedApp } from '../lib/residue';
import { FlappyGame } from './FlappyGame';
import { ViewTube } from './ViewTube';
import { AmazeMart } from './AmazeMart';
import { SavedScreenshots } from './SavedScreenshots';
import { BrowserApp } from './BrowserApp';
import { SocialApp } from './SocialApp';
import { MessagesApp } from './MessagesApp';
import { useMetaInteraction } from './MetaInteractionScene';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, CheckCircle2, X, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import {
  IconFlappy, IconViewTube, IconAmazeMart, IconWayback, IconFaceSpace,
  IconMessages, IconSchematics, IconConcept,
  IconVoiceLog, IconFileBox, IconGallery, IconTerminal, IconControls,
} from './OsIcons';
import {
  CHAPTER_ONE_DIALOGUE,
  getChapterOneCompanionDialogue,
  getChapterOneWrongAppDialogue,
} from '../lib/chapterOneDialogue';
import {
  CHAPTER_TWO_DIALOGUE,
  getChapterTwoCompanionDialogue,
  getChapterTwoWrongAppDialogue,
} from '../lib/chapterTwoDialogue';
import {
  getChapterPhoneSignals,
  type PhoneLauncherApp,
} from '../lib/chapterPhoneSignals';
import { getChapterPhoneWidgetState } from '../lib/chapterPhoneWidgets';
import { getChapterReminderRows } from '../lib/chapterReminders';
import { getMetaWallStage } from '../lib/chapterEnvironment';
import {
  getAdvancedChapterTransition,
  getChapterEntryTransition,
  type ChapterTransitionData,
} from '../lib/chapterTransition';
import { useReducedMotion } from '../lib/useReducedMotion';
import { ChapterTransition, EvidenceNotification } from './ChapterTransition';
import { MetaWindowScene } from './MetaWindowScene';

/** Modern widget chassis: translucent, friendly, current-year. */
const WIDGET_SHELL =
  'relative rounded-[22px] border border-white/[0.08] bg-white/[0.055] backdrop-blur-md overflow-hidden';

type DockUtility = 'voicelog' | 'filebox' | 'gallery' | 'terminal' | 'controls';
type ResetTarget = 'chapter' | 'loop';

interface PhoneSimulatorProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  immersiveIntro?: boolean;
  debugTargetApp?: { app: ActiveApp; nonce: number } | null;
  onLeaderboardOpened: () => void;
  soundVolume: number;
  musicVolume: number;
  screenBrightness: number;
  screenContrast: number;
  cameraPitchEnabled: boolean;
  postureControlEnabled: boolean;
  developerToolsOpen: boolean;
  onSoundVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onScreenBrightnessChange: (brightness: number) => void;
  onScreenContrastChange: (contrast: number) => void;
  onCameraPitchEnabledChange: (enabled: boolean) => void;
  onPostureControlEnabledChange: (enabled: boolean) => void;
  onOpenDeveloperTools: () => void;
  onRestartCurrentChapter: () => void;
  onRestartLoop: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  progress,
  updateProgress,
  onMuteToggle,
  isMuted,
  immersiveIntro = false,
  debugTargetApp,
  onLeaderboardOpened,
  soundVolume,
  musicVolume,
  screenBrightness,
  screenContrast,
  cameraPitchEnabled,
  postureControlEnabled,
  developerToolsOpen,
  onSoundVolumeChange,
  onMusicVolumeChange,
  onScreenBrightnessChange,
  onScreenContrastChange,
  onCameraPitchEnabledChange,
  onPostureControlEnabledChange,
  onOpenDeveloperTools,
  onRestartCurrentChapter,
  onRestartLoop,
}) => {
  const metaInteraction = useMetaInteraction();
  const [activeApp, setActiveApp] = useState<ActiveApp>('flappy');
  // Restore flash: nonce re-keys the overlay so the CSS animation replays.
  const [restoreNonce, setRestoreNonce] = useState(0);
  const [restoreVisible, setRestoreVisible] = useState(false);
  const [dockUtility, setDockUtility] = useState<DockUtility | null>(null);
  const [resetConfirmation, setResetConfirmation] = useState<ResetTarget | null>(null);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterOneDialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterOneAppAttempt = useRef(0);
  const chapterOneHomeAttempt = useRef(0);
  const chapterOneHomeEntryShown = useRef(false);
  const chapterTwoAppAttempt = useRef(0);
  const chapterTwoHomeAttempt = useRef(0);
  const reminderListRef = useRef<HTMLDivElement>(null);

  // Chapter-advance transition: an "evidence collected" banner the moment a
  // chapter's evidence is obtained, then a cinematic when the player next
  // reaches the home screen.
  const reducedMotion = useReducedMotion();
  const prevChapterRef = useRef(progress.currentChapter);
  // A queue so a climax that advances several chapters without visiting home
  // (e.g. the Messages archive run, 7→8→9) still shows every evidence card.
  const [pendingTransitions, setPendingTransitions] = useState<ChapterTransitionData[]>([]);
  const [activeTransition, setActiveTransition] = useState<ChapterTransitionData | null>(null);
  const [evidenceBanner, setEvidenceBanner] = useState<ChapterTransitionData | null>(null);

  const residue = getResidueLevel(progress);
  const phoneSignals = getChapterPhoneSignals(progress.currentChapter);
  const phoneWidgets = getChapterPhoneWidgetState(progress.currentChapter);
  const widgetWeatherStage = getMetaWallStage(progress.currentChapter);
  const chapterReminderRows = getChapterReminderRows(progress);
  const completedReminderCount = chapterReminderRows.filter((row) => row.status === 'completed').length;
  const launcherSignals = (app: PhoneLauncherApp) => {
    const notification = phoneSignals.notification?.app === app
      ? phoneSignals.notification
      : null;
    const recentlyUsed = phoneSignals.recentApp === app;

    return (
      <>
        {notification && (
          <span
            className="absolute -right-1 -top-1 z-10 flex min-w-[16px] h-[16px] items-center justify-center rounded-full border border-[#182031] bg-[#e04a3d] px-1 text-[clamp(8px,0.9cqw,10px)] font-semibold text-white shadow"
            aria-label={notification.accessibleLabel}
            data-phone-notification={app}
          >
            {notification.label}
          </span>
        )}
        {recentlyUsed && (
          <span
            className="absolute -bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-slate-200/35"
            aria-label={`${app} was recently used`}
            data-recent-app={app}
          ></span>
        )}
      </>
    );
  };

  useEffect(() => {
    if (debugTargetApp) setActiveApp(debugTargetApp.app);
  }, [debugTargetApp]);

  useEffect(() => {
    if (activeApp !== 'home' || !reminderListRef.current) return;
    const activeIndex = chapterReminderRows.findIndex((row) => row.status === 'current');
    if (activeIndex < 0) return;
    reminderListRef.current.scrollTo({
      top: Math.max(0, (activeIndex - 1) * 44),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [activeApp, progress.currentChapter, progress.completedGame, reducedMotion]);

  // Obtaining a chapter's evidence steps currentChapter forward by one. Queue
  // the banner + a pending cinematic; the cinematic itself waits for home.
  useEffect(() => {
    const previous = prevChapterRef.current;
    const next = progress.currentChapter;
    if (next === previous) return;
    prevChapterRef.current = next;
    const data = getAdvancedChapterTransition(previous, next);
    if (data) {
      setPendingTransitions((queue) => [...queue, data]);
      setEvidenceBanner(data);
    }
  }, [progress.currentChapter]);

  // Play queued transitions one at a time while the home screen is showing.
  useEffect(() => {
    if (activeTransition || activeApp !== 'home' || pendingTransitions.length === 0) return;
    const [next, ...rest] = pendingTransitions;
    setPendingTransitions(rest);
    setActiveTransition(next);
    setEvidenceBanner(null);
    audio.playChapterTransition({ reduced: reducedMotion });
  }, [pendingTransitions, activeApp, activeTransition, reducedMotion]);

  useEffect(() => () => {
    if (restoreTimer.current) clearTimeout(restoreTimer.current);
    if (chapterOneDialogueTimer.current) clearTimeout(chapterOneDialogueTimer.current);
  }, []);

  useEffect(() => {
    if (activeApp !== 'home') {
      setDockUtility(null);
      setResetConfirmation(null);
    }
  }, [activeApp]);

  useEffect(() => {
    if (!dockUtility || typeof window === 'undefined') return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDockUtility(null);
        setResetConfirmation(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [dockUtility]);

  const handleLaunchApp = (app: ActiveApp) => {
    audio.play('phone.appOpen');
    setActiveApp(app);
    if ((progress.currentChapter === 1 || progress.currentChapter === 2) && metaInteraction.active) {
      const dialogue = progress.currentChapter === 1
        ? (app === 'viewtube'
        ? CHAPTER_ONE_DIALOGUE.viewTubeOpened
        : getChapterOneWrongAppDialogue(app, chapterOneAppAttempt.current))
        : (app === 'browser'
          ? CHAPTER_TWO_DIALOGUE.browserOpened
          : getChapterTwoWrongAppDialogue(app, chapterTwoAppAttempt.current));
      if (progress.currentChapter === 1 && app !== 'viewtube') chapterOneAppAttempt.current += 1;
      if (progress.currentChapter === 2 && app !== 'browser') chapterTwoAppAttempt.current += 1;
      if (chapterOneDialogueTimer.current) clearTimeout(chapterOneDialogueTimer.current);
      // Commit navigation first. Chapter 1 is the only chapter that also
      // updates the parent Meta dialogue on launch; separating those updates
      // prevents that parent render from leaving the home screen in place.
      chapterOneDialogueTimer.current = setTimeout(() => {
        metaInteraction.speak(dialogue);
        chapterOneDialogueTimer.current = null;
      }, 0);
    }
    // Migrated apps briefly hand the display to the old runtime. Decorative
    // only: the overlay ignores pointer events and clears itself.
    if (isMigratedApp(app, residue)) {
      setRestoreNonce((n) => n + 1);
      setRestoreVisible(true);
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
      restoreTimer.current = setTimeout(() => setRestoreVisible(false), 700);
    }
  };

  // The meta hand animation intercepts click events higher in the tree. Open
  // launchers on pointer release so mouse and touch do not depend on that
  // relay; native click remains available for keyboard activation.
  const handleLauncherPointerUp = (event: React.PointerEvent<HTMLButtonElement>, app: ActiveApp) => {
    event.stopPropagation();
    handleLaunchApp(app);
  };

  const handleLauncherClick = (event: React.MouseEvent<HTMLButtonElement>, app: ActiveApp) => {
    if (event.detail !== 0) return;
    handleLaunchApp(app);
  };

  const handleHomeButton = () => {
    audio.play('phone.home');
    setActiveApp('home');
    // Chapter 1 begins inside Flappy, so no progress increment exists when
    // the player first reaches the real home screen. Queue its case hand-off
    // explicitly; later returns remain ordinary home navigation.
    if (progress.currentChapter === 1 && !chapterOneHomeEntryShown.current) {
      chapterOneHomeEntryShown.current = true;
      setPendingTransitions((queue) => [...queue, getChapterEntryTransition(1)]);
    }
    if (progress.currentChapter === 1 && metaInteraction.active) {
      const attempt = chapterOneHomeAttempt.current;
      metaInteraction.speak(
        attempt === 0
          ? CHAPTER_ONE_DIALOGUE.homeReturned
          : getChapterOneCompanionDialogue(attempt - 1),
      );
      chapterOneHomeAttempt.current += 1;
    } else if (progress.currentChapter === 2 && metaInteraction.active) {
      const attempt = chapterTwoHomeAttempt.current;
      metaInteraction.speak(
        attempt === 0
          ? CHAPTER_TWO_DIALOGUE.homeReturned
          : getChapterTwoCompanionDialogue(attempt - 1),
      );
      chapterTwoHomeAttempt.current += 1;
    }
  };

  const toggleDockUtility = (utility: DockUtility) => {
    audio.play('phone.appOpen');
    setResetConfirmation(null);
    setDockUtility((current) => current === utility ? null : utility);
  };

  // Dock utilities are functional controls, not story-facing app launches.
  // Open on pointer-down while the transformed phone surface is still under
  // the cursor; camera follow can move the right edge before pointer-up.
  const handleDockUtilityPointerDown = (event: React.PointerEvent<HTMLButtonElement>, utility: DockUtility) => {
    event.stopPropagation();
    toggleDockUtility(utility);
  };

  const handleDockUtilityClick = (event: React.MouseEvent<HTMLButtonElement>, utility: DockUtility) => {
    if (event.detail !== 0) return;
    toggleDockUtility(utility);
  };

  const handleResetRequest = (target: ResetTarget) => {
    if (resetConfirmation !== target) {
      audio.play('ui.toggle', { variant: 1 });
      setResetConfirmation(target);
      return;
    }

    setDockUtility(null);
    setResetConfirmation(null);
    if (target === 'chapter') onRestartCurrentChapter();
    else onRestartLoop();
  };

  const closeDockUtility = () => {
    audio.play('ui.toggle');
    setDockUtility(null);
    setResetConfirmation(null);
  };

  const openDeveloperTools = () => {
    onOpenDeveloperTools();
    setDockUtility(null);
  };

  // At level 3 the old system re-renders the same chapter timeline in its own
  // language. Progress and scroll behavior remain unchanged.
  const remindersReclaimed = residue >= 3;

  const wallpaperCool =
    residue >= 3 ? 'residue-cool-3' : residue === 2 ? 'residue-cool-2' : residue === 1 ? 'residue-cool-1' : '';

  const dockUtilityTitle: Record<DockUtility, { title: string; eyebrow: string }> = {
    voicelog: { title: 'VoiceLog', eyebrow: 'AUDIO CONTROL' },
    filebox: { title: 'FileBox', eyebrow: 'SESSION DATA' },
    gallery: { title: 'Gallery', eyebrow: 'DISPLAY CONTROL' },
    terminal: { title: 'Terminal', eyebrow: 'DEVELOPER ACCESS' },
    controls: { title: 'Controls', eyebrow: 'CAMERA & POSTURE' },
  };

  const sliderClassName = 'h-1.5 w-full cursor-pointer accent-slate-200';
  const actionButtonClassName = 'rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-medium text-slate-100 transition-colors hover:bg-white/[0.1]';
  const dangerButtonClassName = 'rounded-lg border border-red-400/20 bg-red-400/[0.07] px-3 py-2 text-[10px] font-medium text-red-100 transition-colors hover:bg-red-400/[0.12]';

  const renderDockUtilityContent = () => {
    switch (dockUtility) {
      case 'voicelog':
        return (
          <div className="space-y-3" id="dock-voicelog-controls">
            <label className="block space-y-1.5 text-[10px] text-slate-300">
              <span className="flex justify-between"><span>Music</span><span>{Math.round(musicVolume * 100)}%</span></span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(musicVolume * 100)}
                onChange={(event) => onMusicVolumeChange(Number(event.target.value) / 100)}
                className={sliderClassName}
                id="dock-music-volume"
              />
            </label>
            <label className="block space-y-1.5 text-[10px] text-slate-300">
              <span className="flex justify-between"><span>Interface & room</span><span>{Math.round(soundVolume * 100)}%</span></span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(soundVolume * 100)}
                onChange={(event) => onSoundVolumeChange(Number(event.target.value) / 100)}
                className={sliderClassName}
                id="dock-sound-volume"
              />
            </label>
            <button type="button" onClick={onMuteToggle} className={`${actionButtonClassName} flex w-full items-center justify-center gap-2`} id="dock-master-mute">
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {isMuted ? 'Restore all audio' : 'Mute all audio'}
            </button>
          </div>
        );
      case 'filebox':
        return (
          <div className="space-y-3" id="dock-filebox-controls">
            <div className="rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2.5">
              <div className="text-[9px] text-slate-500">CURRENT SESSION</div>
              <div className="mt-1 font-mono text-[11px] text-slate-200">CHAPTER {progress.currentChapter.toString().padStart(2, '0')}</div>
              <div className="mt-0.5 text-[9px] text-slate-500">Progress is held for this session.</div>
            </div>
            <button type="button" onClick={() => handleResetRequest('chapter')} className={`${actionButtonClassName} w-full`} id="dock-restart-chapter">
              {resetConfirmation === 'chapter' ? 'Press again to restore chapter start' : 'Restore current chapter'}
            </button>
            <button type="button" onClick={() => handleResetRequest('loop')} className={`${dangerButtonClassName} w-full`} id="dock-restart-loop">
              {resetConfirmation === 'loop' ? 'Press again to erase this run' : 'Restart the entire loop'}
            </button>
          </div>
        );
      case 'gallery':
        return (
          <div className="space-y-3" id="dock-gallery-controls">
            <label className="block space-y-1.5 text-[10px] text-slate-300">
              <span className="flex justify-between"><span>Screen brightness</span><span>{Math.round(screenBrightness * 100)}%</span></span>
              <input
                type="range"
                min="65"
                max="115"
                value={Math.round(screenBrightness * 100)}
                onChange={(event) => onScreenBrightnessChange(Number(event.target.value) / 100)}
                className={sliderClassName}
                id="dock-screen-brightness"
              />
            </label>
            <label className="block space-y-1.5 text-[10px] text-slate-300">
              <span className="flex justify-between"><span>Screen contrast</span><span>{Math.round(screenContrast * 100)}%</span></span>
              <input
                type="range"
                min="90"
                max="130"
                value={Math.round(screenContrast * 100)}
                onChange={(event) => onScreenContrastChange(Number(event.target.value) / 100)}
                className={sliderClassName}
                id="dock-screen-contrast"
              />
            </label>
            <button
              type="button"
              onClick={() => { onScreenBrightnessChange(1); onScreenContrastChange(1); }}
              className={`${actionButtonClassName} flex w-full items-center justify-center gap-2`}
              id="dock-display-reset"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset display
            </button>
          </div>
        );
      case 'terminal':
        return (
          <div className="space-y-3" id="dock-terminal-controls">
            <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-2.5 font-mono text-[9px] leading-relaxed text-emerald-200/75">
              {developerToolsOpen
                ? 'DEVELOPER PANEL: CONNECTED'
                : 'Chapter snapshots and route controls are available outside the device.'}
            </div>
            <button
              type="button"
              onClick={openDeveloperTools}
              disabled={developerToolsOpen}
              className={`${actionButtonClassName} w-full disabled:cursor-default disabled:opacity-45`}
              id="dock-open-developer-tools"
            >
              {developerToolsOpen ? 'Developer panel is open' : 'Open developer panel'}
            </button>
          </div>
        );
      case 'controls':
        return (
          <div className="space-y-2" id="dock-camera-controls">
            <button
              type="button"
              role="switch"
              aria-checked={cameraPitchEnabled}
              onClick={() => onCameraPitchEnabledChange(!cameraPitchEnabled)}
              className={`${actionButtonClassName} flex w-full items-center justify-between text-left`}
              id="dock-camera-follow"
            >
              <span><span className="block">Camera follow</span><span className="mt-0.5 block text-[8px] text-slate-500">Mouse height tilts the held device</span></span>
              <span className={cameraPitchEnabled ? 'text-emerald-300' : 'text-slate-500'}>{cameraPitchEnabled ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={postureControlEnabled}
              onClick={() => onPostureControlEnabledChange(!postureControlEnabled)}
              className={`${actionButtonClassName} flex w-full items-center justify-between text-left`}
              id="dock-desk-posture">
              <span><span className="block">Desk posture</span><span className="mt-0.5 block text-[8px] text-slate-500">Background clicks can lay the device down</span></span>
              <span className={postureControlEnabled ? 'text-emerald-300' : 'text-slate-500'}>{postureControlEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative flex flex-col overflow-hidden ${immersiveIntro
        ? 'h-full w-full rounded-none border-0 bg-transparent shadow-none'
        : 'bg-[#16181d] rounded-[var(--phone-radius)] border-[var(--phone-border)] border-[#101216] shadow-2xl'
      }`}
      style={immersiveIntro ? undefined : {
        width: 'min(calc(100cqw - var(--phone-stage-inset)), calc((100cqh - var(--phone-stage-inset)) * var(--phone-aspect)))',
        height: 'min(calc(100cqh - var(--phone-stage-inset)), calc((100cqw - var(--phone-stage-inset)) / var(--phone-aspect)))',
        maxWidth: '1500px',
        maxHeight: '760px',
      }}
      id="phone-bezel"
      data-presentation={immersiveIntro ? 'chapter-0-fullscreen' : 'physical-phone'}
    >

      {/* Status bar: current-year OS chrome. One foreign glyph may appear. */}
      {!immersiveIntro && <div className="h-7 shrink-0 bg-[#0b0c0f] px-4 flex items-center justify-between text-[10.5px] text-slate-200 z-40" id="phone-status-bar">
        <div className="flex items-center gap-2.5" id="phone-notch">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1e2128] border border-[#2a2e38]"></span>
          <span
            className="font-medium tracking-wide"
            data-fixed-time={phoneWidgets.clock}
          >
            {phoneWidgets.clock}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* LAOS sync glyph: a notification style from another system. It is
              not part of the modern icon set and never will be. */}
          {residue >= 1 && (
            <span
              className="flex items-center gap-1"
              title="LAOS SyncService"
              id="status-laos-sync"
            >
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" aria-hidden="true">
                <rect
                  x="1.8" y="1.8" width="6.4" height="6.4"
                  fill="none"
                  stroke={residue >= 3 ? 'var(--laos-warm)' : 'var(--laos-dim)'}
                  strokeWidth="1.1"
                  transform="rotate(45 5 5)"
                />
              </svg>
              {residue >= 2 && (
                <span className="font-laos text-[7px] tracking-[0.14em] text-[var(--laos-dim)]">SYNC</span>
              )}
            </span>
          )}
          {/* Signal bars, drawn flat like every other modern phone */}
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            <span className="w-[3px] h-[4px] rounded-[1px] bg-slate-200"></span>
            <span className="w-[3px] h-[6px] rounded-[1px] bg-slate-200"></span>
            <span className="w-[3px] h-[8px] rounded-[1px] bg-slate-200"></span>
            <span className="w-[3px] h-[10px] rounded-[1px] bg-slate-500"></span>
          </span>
          <span className="text-[8.5px] font-semibold text-slate-300">5G</span>
          <Wifi className="w-3 h-3 text-slate-300" />
          <span className="flex items-center gap-1">
            <span className="relative w-[19px] h-[9px] rounded-[3px] border border-slate-400/70">
              <span className="absolute inset-[1.5px] right-[4px] rounded-[1px] bg-slate-200" style={{ width: '70%' }}></span>
              <span className="absolute -right-[3px] top-[2px] w-[2px] h-[4px] rounded-r-[1px] bg-slate-400/70"></span>
            </span>
          </span>
        </div>
      </div>}

      {/* Main Interactive Screen Area */}
      <div
        className="min-h-0 flex-1 bg-[#0d0f14] relative overflow-hidden transition-[filter] duration-150"
        id="phone-display"
        style={{ filter: `brightness(${screenBrightness}) contrast(${screenContrast})` }}
      >
        <AnimatePresence mode="wait">
          {activeApp === 'home' && (
            /* HOME SCREEN — a normal modern phone. The residue does the talking. */
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`absolute inset-0 p-3 md:p-4 flex flex-row gap-3 md:gap-4 overflow-y-auto ${wallpaperCool}`}
              id="phone-desktop"
              style={{
                background:
                  'radial-gradient(120% 130% at 82% -12%, #33405c 0%, #1d2434 44%, #10141d 100%)',
              }}
            >
              {/* Soft dusk accent in the wallpaper — pleasant, unremarkable */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(52% 42% at 12% 96%, rgba(157,130,120,0.10) 0%, transparent 70%)',
                }}
              ></div>

              {/* LEFT COLUMN: everyday widgets */}
              <div className="w-[44%] min-w-[220px] max-w-[420px] shrink-0 flex flex-col gap-3 relative">

                {/* Chapter reminder — four visible rows from a scrollable 00–10 timeline. */}
                <div
                  className={`${remindersReclaimed ? 'laos-panel laos-slow' : WIDGET_SHELL} flex-1 min-h-0 flex flex-col p-3.5`}
                  id="home-widget"
                  data-reminder-current={progress.currentChapter}
                >
                  <div className={`flex items-center justify-between ${remindersReclaimed ? 'border-b border-[var(--laos-line-dim)] pb-2' : ''}`}>
                    <div className="flex items-center gap-1.5">
                      {!remindersReclaimed && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-md bg-[#e8a33d]">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/90"></span>
                        </span>
                      )}
                      <span className={remindersReclaimed ? 'laos-label text-[8px]' : 'text-[11px] font-semibold text-slate-100'}>
                        {remindersReclaimed ? 'TASK LEDGER' : 'Reminders'}
                      </span>
                    </div>
                    <span className={remindersReclaimed
                      ? 'font-laos text-[8px] tracking-[0.12em] text-[var(--laos-faint)]'
                      : 'text-[9px] text-slate-400'}
                    >
                      {completedReminderCount}/11 {remindersReclaimed ? 'RESOLVED' : 'done'}
                    </span>
                  </div>

                  {!remindersReclaimed && (
                    <div className="mb-1.5 mt-0.5 text-[9.5px] text-slate-400">
                      Investigation sequence · Chapter {progress.currentChapter.toString().padStart(2, '0')}
                    </div>
                  )}

                  <div
                    ref={reminderListRef}
                    className={`${remindersReclaimed ? 'mt-2 space-y-px' : 'space-y-0.5'} h-[174px] min-h-0 shrink-0 overflow-y-auto overscroll-contain pr-1`}
                    data-reminder-window="four-rows"
                    aria-label="Chapter reminders, scroll for Chapters 00 through 10"
                  >
                    {chapterReminderRows.map((row) => {
                      const futureDistance = Math.max(0, row.chapter - progress.currentChapter);
                      const futureOpacity = Math.max(0.28, 0.72 - futureDistance * 0.09);
                      const isCurrent = row.status === 'current';
                      const isCompleted = row.status === 'completed';

                      return (
                        <div
                          key={row.chapter}
                          className={`flex h-[42px] items-center gap-2 px-2 ${remindersReclaimed ? 'border-l-2' : 'rounded-xl'} ${
                            isCurrent
                              ? remindersReclaimed
                                ? 'border-[var(--laos-warm)] bg-[var(--laos-surface-2)]'
                                : 'bg-white/[0.06]'
                              : remindersReclaimed
                                ? 'border-transparent'
                                : ''
                          }`}
                          data-reminder-chapter={row.chapter}
                          data-reminder-status={row.status}
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          <span className={`w-7 shrink-0 font-mono text-[8px] tracking-[0.08em] ${
                            isCurrent
                              ? remindersReclaimed ? 'text-[var(--laos-warm)]' : 'text-[#e8a33d]'
                              : isCompleted
                                ? remindersReclaimed ? 'text-[var(--laos-faint)]' : 'text-slate-500'
                                : remindersReclaimed ? 'text-[var(--laos-dim)]' : 'text-slate-500'
                          }`}>
                            {row.chapter.toString().padStart(2, '0')}
                          </span>

                          {isCompleted ? (
                            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 shrink-0" aria-label="Completed">
                              <circle cx="6" cy="6" r="5.2" fill={remindersReclaimed ? 'var(--laos-dim)' : '#e8a33d'} />
                              <path d="M3.6 6.2 L5.3 7.9 L8.6 4.4" fill="none" stroke="#14161c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span className={`h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px] ${
                              isCurrent
                                ? remindersReclaimed ? 'border-[var(--laos-warm)]' : 'border-[#e8a33d]'
                                : remindersReclaimed ? 'border-[var(--laos-line)]' : 'border-slate-500/60'
                            }`}></span>
                          )}

                          <span
                            className={`min-w-0 text-[10px] leading-snug ${remindersReclaimed ? 'font-laos' : ''} ${
                              isCompleted
                                ? remindersReclaimed ? 'text-[var(--laos-faint)] line-through' : 'text-slate-500 line-through decoration-slate-600'
                                : isCurrent
                                  ? remindersReclaimed ? 'text-[var(--laos-text)]' : 'text-slate-100'
                                  : remindersReclaimed ? 'text-[var(--laos-dim)]' : 'text-slate-300'
                            }`}
                            style={row.status === 'future' ? {
                              filter: `blur(${row.blurPx}px)`,
                              opacity: futureOpacity,
                              userSelect: 'none',
                            } : undefined}
                          >
                            {row.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`mt-1 flex items-center justify-between border-t pt-1.5 ${
                    remindersReclaimed
                      ? 'border-[var(--laos-line-dim)] font-laos text-[7.5px] tracking-[0.14em] text-[var(--laos-faint)]'
                      : 'border-white/[0.06] text-[8.5px] text-slate-500'
                  }`}>
                    <span>{remindersReclaimed ? 'PRESERVED BY LAOS_V12.1' : '00—10'}</span>
                    <span>{progress.completedGame ? 'COMPLETE' : 'SCROLL FOR MORE'}</span>
                  </div>
                </div>

                {/* Ambient widgets: weather + calendar */}
                <div className="grid grid-cols-2 gap-3 h-[36%] min-h-[118px] shrink-0">
                  <div
                    className={`${WIDGET_SHELL} isolate p-3 flex flex-col`}
                    id="widget-weather"
                    data-weather-chapter={progress.currentChapter}
                    data-temperature={phoneWidgets.weather.temperature}
                    data-weather-motion={reducedMotion ? 'reduced' : 'animated'}
                    style={{ background: phoneWidgets.weather.background }}
                  >
                    <MetaWindowScene
                      stage={widgetWeatherStage}
                      reducedMotion={reducedMotion}
                      context="widget"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 z-[1] backdrop-blur-[0.7px]"
                      style={{
                        background: 'linear-gradient(105deg, rgba(10,15,24,0.88) 0%, rgba(12,18,28,0.67) 48%, rgba(11,16,25,0.42) 100%)',
                      }}
                      data-weather-haze="soft-mask"
                    ></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-200">Harborview</span>
                      <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden="true">
                        <circle cx="9" cy="10" r="6.5" fill={phoneWidgets.weather.moonColor} />
                        <circle cx="12.2" cy="8" r="5.6" fill={phoneWidgets.weather.moonMask} />
                      </svg>
                    </div>
                    <span
                      className="relative z-10 font-semibold text-[30px] leading-none mt-1.5"
                      style={{ color: phoneWidgets.weather.temperatureColor }}
                    >
                      {phoneWidgets.weather.temperature}°
                    </span>
                    <span className="relative z-10 text-[9.5px] text-slate-300/75 mt-0.5">
                      {phoneWidgets.weather.condition}
                    </span>
                    <div className="relative z-10 mt-auto pt-1.5 flex items-center justify-between text-[8.5px] text-slate-400/70">
                      <span>H:{phoneWidgets.weather.high}° L:{phoneWidgets.weather.low}°</span>
                      {/* A data source that should not still be reporting */}
                      {residue >= 2 ? (
                        <span className="font-laos text-[7px] tracking-[0.12em] text-[var(--laos-faint)]">
                          LUMEN_WX · {phoneWidgets.weather.updated.replace('Updated ', '')}
                        </span>
                      ) : (
                        <span>{phoneWidgets.weather.updated}</span>
                      )}
                    </div>
                  </div>

                  {/* The calendar widget's typography does not belong to this
                      phone. It has always been like that. Nobody asked why. */}
                  <div
                    className={`${WIDGET_SHELL} p-3 flex flex-col`}
                    id="widget-agenda"
                    data-agenda-chapter={progress.currentChapter}
                    data-agenda-remaining={phoneWidgets.agenda.entries.length}
                    style={{ background: phoneWidgets.agenda.background }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-laos text-[9px] font-semibold tracking-[0.16em] uppercase text-slate-300">Agenda</span>
                      <span
                        className="font-laos text-[8.5px] tracking-[0.1em]"
                        style={{ color: phoneWidgets.agenda.accent }}
                      >
                        {phoneWidgets.agenda.dayLabel}
                      </span>
                    </div>
                    <div
                      className="mt-2 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1"
                      id="widget-agenda-scroll"
                      tabIndex={0}
                      aria-label={`${phoneWidgets.agenda.entries.length} upcoming agenda items`}
                    >
                      {phoneWidgets.agenda.entries.map((entry) => (
                        <div
                          key={`${entry.time}-${entry.title}`}
                          className="flex gap-2 items-baseline border-l-2 pl-2"
                          style={{ borderColor: phoneWidgets.agenda.accent }}
                        >
                          <span className="font-laos text-[9px] text-slate-300/75 shrink-0 w-8">{entry.time}</span>
                          <div className="min-w-0 leading-tight">
                            <div className="text-[10px] text-slate-100/90 font-medium truncate">{entry.title}</div>
                            <div className="text-[8px] text-slate-400/70 truncate">{entry.place}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="font-laos text-[7px] tracking-[0.14em] text-slate-400/45 pt-1.5 border-t border-white/[0.06]">
                      {phoneWidgets.agenda.footer}
                    </div>
                  </div>
                </div>

                {/* Migration remnant: a record nobody remembers creating */}
                <div
                  className="text-[7.5px] text-center font-laos tracking-[0.16em] shrink-0 text-[var(--laos-faint)]"
                  id="home-migration-record"
                >
                  {residue >= 1
                    ? `LAOS BACKUPAGENT · LEGACY VOLUME MOUNTED (READ-ONLY) · ${residue >= 3 ? 'PROFILE: MK_HOME' : 'LAST SYNC 2014-04-14'}`
                    : 'RESTORED FROM DEVICE BACKUP · 2014-04-14'}
                </div>
              </div>

              {/* RIGHT COLUMN: app grid + dock */}
              <div className="flex-1 min-w-0 flex items-center justify-center relative">
                <AnimatePresence>
                  {dockUtility && (
                    <motion.section
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      role="dialog"
                      aria-modal="false"
                      aria-labelledby="dock-utility-title"
                      data-meta-immediate="true"
                      className="absolute left-1/2 top-[43%] z-30 w-[min(88%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.12] bg-[#171c27]/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                      id="home-dock-utility-popover"
                      data-dock-utility={dockUtility}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3 border-b border-white/[0.07] pb-2.5">
                        <div>
                          <div className="font-mono text-[8px] tracking-[0.16em] text-slate-500">{dockUtilityTitle[dockUtility].eyebrow}</div>
                          <h2 className="mt-0.5 text-[13px] font-semibold text-slate-100" id="dock-utility-title">{dockUtilityTitle[dockUtility].title}</h2>
                        </div>
                        <button type="button" onClick={closeDockUtility} className="rounded-full p-1 text-slate-500 hover:bg-white/[0.07] hover:text-slate-200" aria-label="Close utility panel" id="dock-utility-close">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {renderDockUtilityContent()}
                    </motion.section>
                  )}
                </AnimatePresence>
                <div className="w-full max-w-[680px] flex flex-col gap-[clamp(14px,2.8cqh,30px)] px-1">

                <div
                  className="grid grid-cols-4 justify-items-center gap-y-[clamp(18px,3.4cqh,36px)]"
                  id="home-apps-grid"
                  data-meta-immediate="true"
                >
                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'flappy')}
                    onClick={(event) => handleLauncherClick(event, 'flappy')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-game"
                  >
                    {/* The one icon that was never re-rendered. Its proportions
                        are from another catalog; its label wears the old face. */}
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconFlappy />
                      {phoneSignals.notification.app !== 'flappy' && (
                        <span className="absolute -top-1 -right-1.5 bg-[#3c66c4] text-white font-semibold text-[6.5px] tracking-wide px-1.5 py-px rounded-full shadow">
                          UPDATED
                        </span>
                      )}
                      {launcherSignals('flappy')}
                    </div>
                    <span className="font-laos text-[clamp(10px,1.05cqw,12.5px)] tracking-[0.04em] text-[#b9c2d4] truncate max-w-full">
                      {progress.unlockedCodeRoute ? 'Skyline 256' : 'Flappy Someth.'}
                    </span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'viewtube')}
                    onClick={(event) => handleLauncherClick(event, 'viewtube')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-viewtube"
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconViewTube />
                      {launcherSignals('viewtube')}
                    </div>
                    <span className="text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90 truncate max-w-full">ViewTube</span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'amazemart')}
                    onClick={(event) => handleLauncherClick(event, 'amazemart')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-amazemart"
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconAmazeMart />
                      {launcherSignals('amazemart')}
                    </div>
                    <span className="text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90 truncate max-w-full">AmazeMart</span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'browser')}
                    onClick={(event) => handleLauncherClick(event, 'browser')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-browser"
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconWayback />
                      {launcherSignals('browser')}
                    </div>
                    <span className="text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90 truncate max-w-full">Wayback</span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'social')}
                    onClick={(event) => handleLauncherClick(event, 'social')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-social"
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconFaceSpace />
                      {launcherSignals('social')}
                    </div>
                    <span className="text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90 truncate max-w-full">FaceSpace</span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'messages')}
                    onClick={(event) => handleLauncherClick(event, 'messages')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-messages"
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconMessages />
                      {launcherSignals('messages')}
                    </div>
                    <span className="text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90 truncate max-w-full">Messages</span>
                  </button>

                  <button
                    disabled={!progress.deliveredPhone}
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'screenshots')}
                    onClick={(event) => handleLauncherClick(event, 'screenshots')}
                    className={`group flex flex-col items-center gap-1.5 min-w-0 ${
                      !progress.deliveredPhone ? 'opacity-35 saturate-50 cursor-not-allowed' : ''
                    }`}
                    id="launcher-screenshots"
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconSchematics legacy={residue >= 2} />
                      {launcherSignals('screenshots')}
                    </div>
                    <span className={`truncate max-w-full ${
                      residue >= 2
                        ? 'font-laos text-[clamp(10px,1.05cqw,12.5px)] tracking-[0.04em] text-[#b9c2d4]'
                        : 'text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90'
                    }`}>Schematics</span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'about')}
                    onClick={(event) => handleLauncherClick(event, 'about')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-about"
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconConcept />
                      {launcherSignals('about')}
                    </div>
                    <span className="text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90 truncate max-w-full">Concept</span>
                  </button>
                </div>

                {/* Page indicator dots */}
                <div className="flex justify-center gap-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200/80"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200/25"></span>
                </div>

                {/* Dock. At deeper residue its geometry stops being friendly. */}
                <div
                  className={`px-[clamp(18px,3.4cqw,52px)] py-[clamp(10px,1.6cqh,18px)] flex items-end justify-between gap-2 w-full ${
                    residue >= 2
                      ? 'laos-slow border border-[var(--laos-line-dim)] rounded-md bg-[var(--laos-bg)]/60'
                      : 'rounded-[26px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-md'
                  }`}
                  id="home-dock"
                  data-meta-immediate="true"
                >
                  {([
                    ['VoiceLog', 'voicelog', IconVoiceLog],
                    ['FileBox', 'filebox', IconFileBox],
                    ['Gallery', 'gallery', IconGallery],
                    ['Terminal', 'terminal', IconTerminal],
                    ['Controls', 'controls', IconControls],
                  ] as Array<[string, DockUtility, React.FC]>).map(([name, utility, Icon]) => (
                    <button
                      key={name}
                      onPointerDown={(event) => handleDockUtilityPointerDown(event, utility)}
                      onClick={(event) => handleDockUtilityClick(event, utility)}
                      aria-expanded={dockUtility === utility}
                      aria-controls="home-dock-utility-popover"
                      className={`group flex flex-col items-center gap-1 min-w-0 ${dockUtility === utility ? 'text-white' : ''}`}
                      title={name}
                      id={`launcher-${name.toLowerCase()}`}
                    >
                      <div className="w-[clamp(48px,5.6cqw,76px)] h-[clamp(48px,5.6cqw,76px)] drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)] transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
                        <Icon />
                      </div>
                      <span className={`truncate max-w-full ${
                        residue >= 2
                          ? 'font-laos text-[clamp(8.5px,0.95cqw,11px)] tracking-[0.06em] text-[var(--laos-dim)]'
                          : 'text-[clamp(9px,1cqw,12px)] text-slate-300/80'
                      }`}>{name}</span>
                    </button>
                  ))}
                </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeApp === 'flappy' && (
            <motion.div
              key="flappy"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: isMigratedApp('flappy', residue) ? 0.42 : 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <FlappyGame
                progress={progress}
                updateProgress={updateProgress}
                onHome={handleHomeButton}
                onLeaderboardOpened={onLeaderboardOpened}
              />
            </motion.div>
          )}

          {activeApp === 'viewtube' && (
            <motion.div
              key="viewtube"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <ViewTube progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'amazemart' && (
            <motion.div
              key="amazemart"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <AmazeMart
                progress={progress}
                updateProgress={updateProgress}
                onOpenScreenshots={() => setActiveApp('screenshots')}
              />
            </motion.div>
          )}

          {activeApp === 'screenshots' && (
            <motion.div
              key="screenshots"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: isMigratedApp('screenshots', residue) ? 0.42 : 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <SavedScreenshots progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'browser' && (
            <motion.div
              key="browser"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <BrowserApp progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <SocialApp progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: isMigratedApp('messages', residue) ? 0.42 : 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <MessagesApp progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'about' && (
            /* CONCEPTS / LORE PAGE */
            <motion.div
              key="about"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0 bg-[#111318] p-4 overflow-y-auto space-y-4 text-slate-100 font-sans"
              id="concept-info-page"
            >
              <div className="border-b border-white/[0.07] pb-2 flex items-center gap-2 mt-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="font-semibold text-sm text-white">THE STOP KILLING GAMES CONCEPT</h2>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>
                  <strong className="text-white">SKG: Scorekeeper</strong> is a creative interactive homage to the global <strong className="text-amber-400">"Stop Killing Games"</strong> campaign, exploring game preservation and consumer ownership rights.
                </p>

                <p>
                  Today, large automation and gaming corporations hold massive software catalog assets. When a device becomes obsolete or a backend server turns off, decades of human creativity, original art, and stories are programmatically replaced by high-yield slop, or erased entirely.
                </p>

                <div className="bg-[#0c0e12] p-2.5 rounded-xl border border-white/[0.07] space-y-1 font-mono text-[10px] text-slate-400">
                  <div className="font-bold text-white uppercase text-[11px] mb-1 text-amber-500">How to Play Guide:</div>
                  <div>1. Open **Flappy Something** and die at 40 points.</div>
                  <div>2. Examine the controversial replay in **ViewTube**.</div>
                  <div>3. Search and order the obsolete schematic in **AmazeMart**.</div>
                  <div>4. Use **Wayback Browser** (2014) to investigate Silver Kite Games.</div>
                  <div>5. Explore Noah Kade's FaceSpace and message archives.</div>
                  <div>6. Fly matching altitude sequences near Gate 40.</div>
                </div>

                <p className="text-[10px] text-slate-500 font-mono">
                  Created for digital preservation awareness. Thank you for exploring.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LAOS restore flash: for a breath, the old runtime owns the screen.
            Procedural and calm — a loading step, not a malfunction. */}
        {restoreVisible && (
          <div
            key={restoreNonce}
            className="laos-restore-overlay absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
            style={{ background: 'rgba(10, 14, 19, 0.86)' }}
            id="laos-restore-flash"
          >
            <div className="laos-panel w-[240px] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="laos-label text-[8px]">LAOS RUNTIME 12.1</span>
                <span className="font-laos text-[8px] text-[var(--laos-faint)]">RES_0x25</span>
              </div>
              <div className="mt-2.5 h-[3px] bg-[var(--laos-line-dim)]">
                <div className="laos-restore-bar h-full bg-[var(--laos-dim)]"></div>
              </div>
              <div className="mt-2 font-laos text-[8px] tracking-[0.1em] text-[var(--laos-dim)]">
                restoring interface state…
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gesture bar */}
      {!immersiveIntro && <div className="h-6 shrink-0 bg-[#0b0c0f] flex items-center justify-center" id="phone-footer">
        <button
          onClick={handleHomeButton}
          data-meta-immediate="true"
          className="w-24 h-1 bg-slate-500/60 rounded-full hover:bg-slate-300 active:bg-slate-400 transition-colors"
          title="Home Screen"
          id="home-swipe-indicator"
        />
      </div>}

      {/* Chapter-advance: "evidence collected" banner, then the cinematic once
          the player returns to the home screen. Both clip to the phone face. */}
      <AnimatePresence>
        {evidenceBanner && !activeTransition && (
          <EvidenceNotification
            key="evidence-banner"
            data={evidenceBanner}
            reducedMotion={reducedMotion}
            onOpen={handleHomeButton}
            onDismiss={() => setEvidenceBanner(null)}
          />
        )}
      </AnimatePresence>
      {activeTransition && (
        <ChapterTransition
          data={activeTransition}
          reducedMotion={reducedMotion}
          onDone={() => setActiveTransition(null)}
        />
      )}

    </div>
  );
};
