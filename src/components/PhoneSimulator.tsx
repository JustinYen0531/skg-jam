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
import { Wifi, CheckCircle2 } from 'lucide-react';
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
  getChapterPhoneSignals,
  type PhoneLauncherApp,
} from '../lib/chapterPhoneSignals';
import { getChapterPhoneWidgetState } from '../lib/chapterPhoneWidgets';
import {
  getAdvancedChapterTransition,
  getChapterEntryTransition,
  type ChapterTransitionData,
} from '../lib/chapterTransition';
import { useReducedMotion } from '../lib/useReducedMotion';
import { ChapterTransition, EvidenceNotification } from './ChapterTransition';

/** Modern widget chassis: translucent, friendly, current-year. */
const WIDGET_SHELL =
  'relative rounded-[22px] border border-white/[0.08] bg-white/[0.055] backdrop-blur-md overflow-hidden';

interface PhoneSimulatorProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  immersiveIntro?: boolean;
  debugTargetApp?: { app: ActiveApp; nonce: number } | null;
  onLeaderboardOpened: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  progress, updateProgress, onMuteToggle, isMuted, immersiveIntro = false, debugTargetApp, onLeaderboardOpened
}) => {
  const metaInteraction = useMetaInteraction();
  const [activeApp, setActiveApp] = useState<ActiveApp>('flappy');
  // Restore flash: nonce re-keys the overlay so the CSS animation replays.
  const [restoreNonce, setRestoreNonce] = useState(0);
  const [restoreVisible, setRestoreVisible] = useState(false);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterOneAppAttempt = useRef(0);
  const chapterOneHomeAttempt = useRef(0);
  const chapterOneHomeEntryShown = useRef(false);

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
  }, []);

  const handleLaunchApp = (app: ActiveApp) => {
    audio.play('phone.appOpen');
    setActiveApp(app);
    if (progress.currentChapter === 1 && metaInteraction.active) {
      if (app === 'viewtube') {
        metaInteraction.speak(CHAPTER_ONE_DIALOGUE.viewTubeOpened);
      } else {
        metaInteraction.speak(getChapterOneWrongAppDialogue(app, chapterOneAppAttempt.current));
        chapterOneAppAttempt.current += 1;
      }
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
    }
  };

  // Investigation checklist — the labels are clue text, do not reword them.
  const missionSteps = [
    { done: progress.deathsAt40 >= 1, label: 'Die at pipe 40 to trigger the discrepancy' },
    { done: progress.watchedVideo, label: "Examine ARC_184's run video in ViewTube" },
    { done: progress.deliveredPhone, label: 'Buy the obsolete schematics folder in AmazeMart' },
    { done: progress.unlockedCodeRoute, label: "Decrypt Mother's Silver Kite Messenger login" },
  ];
  const nextStep = missionSteps.findIndex((step) => !step.done);
  const solvedCount = missionSteps.filter((step) => step.done).length;

  // At level 3 the old system re-renders the reminders list in its own
  // language. Same items, same order — only the presentation changes hands.
  const remindersReclaimed = residue >= 3;

  const wallpaperCool =
    residue >= 3 ? 'residue-cool-3' : residue === 2 ? 'residue-cool-2' : residue === 1 ? 'residue-cool-1' : '';

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
      <div className="flex-1 bg-[#0d0f14] relative overflow-hidden" id="phone-display">
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

                {/* Reminders — an ordinary list widget holding the case */}
                {!remindersReclaimed ? (
                  <div className={`${WIDGET_SHELL} flex-1 min-h-0 flex flex-col p-3.5`} id="home-widget">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-md bg-[#e8a33d] flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/90"></span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-100">Reminders</span>
                      </div>
                      <span className="text-[9px] text-slate-400">{solvedCount}/{missionSteps.length} done</span>
                    </div>

                    <div className="text-[9.5px] text-slate-400 mt-0.5 mb-1.5">The game again — what I still need to check</div>

                    <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1">
                      {missionSteps.map((step, i) => (
                        <div
                          key={step.label}
                          className={`flex items-start gap-2 rounded-xl px-2 py-1.5 ${
                            !step.done && i === nextStep ? 'bg-white/[0.05]' : ''
                          }`}
                        >
                          {step.done ? (
                            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true">
                              <circle cx="6" cy="6" r="5.2" fill="#e8a33d" />
                              <path d="M3.6 6.2 L5.3 7.9 L8.6 4.4" fill="none" stroke="#14161c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span
                              className={`w-3.5 h-3.5 mt-px shrink-0 rounded-full border-[1.5px] ${
                                i === nextStep ? 'border-[#e8a33d]' : 'border-slate-500/60'
                              }`}
                            ></span>
                          )}
                          <span
                            className={`block text-[10px] leading-snug ${
                              step.done
                                ? 'text-slate-500 line-through decoration-slate-600'
                                : i === nextStep
                                  ? 'text-slate-100'
                                  : 'text-slate-300'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1.5 mt-1 border-t border-white/[0.06] flex items-center justify-between text-[8.5px] text-slate-500">
                      <span>Today</span>
                      <span>{missionSteps.length - solvedCount} remaining</span>
                    </div>
                  </div>
                ) : (
                  /* Level 3: the old system has reclaimed this surface. Same
                     items, same order — rendered by something much older. */
                  <div className="laos-panel laos-slow flex-1 min-h-0 flex flex-col p-3.5" id="home-widget">
                    <div className="flex items-center justify-between border-b border-[var(--laos-line-dim)] pb-2">
                      <span className="laos-label text-[8px]">TASK LEDGER</span>
                      <span className="font-laos text-[8px] tracking-[0.12em] text-[var(--laos-faint)]">
                        {solvedCount}/{missionSteps.length} RESOLVED
                      </span>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto mt-2 space-y-px pr-1">
                      {missionSteps.map((step, i) => (
                        <div
                          key={step.label}
                          className={`flex items-start gap-2 px-2 py-2 border-l-2 ${
                            !step.done && i === nextStep
                              ? 'border-[var(--laos-warm)] bg-[var(--laos-surface-2)]'
                              : 'border-transparent'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 mt-0.5 shrink-0 border ${
                              step.done
                                ? 'bg-[var(--laos-dim)] border-[var(--laos-dim)]'
                                : 'border-[var(--laos-line)]'
                            }`}
                          ></span>
                          <span
                            className={`block font-laos text-[10px] leading-snug ${
                              step.done
                                ? 'text-[var(--laos-faint)] line-through'
                                : i === nextStep
                                  ? 'text-[var(--laos-text)]'
                                  : 'text-[var(--laos-dim)]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 mt-1 border-t border-[var(--laos-line-dim)] flex items-center justify-between font-laos text-[7.5px] tracking-[0.14em] text-[var(--laos-faint)]">
                      <span>PRESERVED BY LAOS_V12.1</span>
                      <span>READ-ONLY</span>
                    </div>
                  </div>
                )}

                {/* Ambient widgets: weather + calendar */}
                <div className="grid grid-cols-2 gap-3 h-[36%] min-h-[118px] shrink-0">
                  <div
                    className={`${WIDGET_SHELL} p-3 flex flex-col`}
                    id="widget-weather"
                    data-weather-chapter={progress.currentChapter}
                    data-temperature={phoneWidgets.weather.temperature}
                    style={{ background: phoneWidgets.weather.background }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-200">Harborview</span>
                      <svg viewBox="0 0 20 20" className="w-5 h-5" aria-hidden="true">
                        <circle cx="9" cy="10" r="6.5" fill={phoneWidgets.weather.moonColor} />
                        <circle cx="12.2" cy="8" r="5.6" fill={phoneWidgets.weather.moonMask} />
                      </svg>
                    </div>
                    <span
                      className="font-semibold text-[30px] leading-none mt-1.5"
                      style={{ color: phoneWidgets.weather.temperatureColor }}
                    >
                      {phoneWidgets.weather.temperature}°
                    </span>
                    <span className="text-[9.5px] text-slate-300/75 mt-0.5">
                      {phoneWidgets.weather.condition}
                    </span>
                    <div className="mt-auto pt-1.5 flex items-center justify-between text-[8.5px] text-slate-400/70">
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
                    <div className="mt-2 space-y-2 flex-1 overflow-hidden">
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
                >
                  {([
                    ['VoiceLog', IconVoiceLog],
                    ['FileBox', IconFileBox],
                    ['Gallery', IconGallery],
                    ['Terminal', IconTerminal],
                    ['Controls', IconControls],
                  ] as Array<[string, React.FC]>).map(([name, Icon]) => (
                    <button
                      key={name}
                      onClick={() => audio.playTick()}
                      className="group flex flex-col items-center gap-1 min-w-0"
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
