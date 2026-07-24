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
import { Wifi, CheckCircle2, ChevronRight, Link2, UserRound, Users, X, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import {
  IconFlappy, IconViewTube, IconAmazeMart, IconWayback, IconFaceSpace,
  IconMessages, IconDeliveries, IconConcept,
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
  CHAPTER_THREE_DIALOGUE,
  getChapterThreeCompanionDialogue,
  getChapterThreeWrongAppDialogue,
} from '../lib/chapterThreeDialogue';
import {
  CHAPTER_FOUR_DIALOGUE,
  getChapterFourCompanionDialogue,
  getChapterFourWrongAppDialogue,
} from '../lib/chapterFourDialogue';
import {
  CHAPTER_FIVE_DIALOGUE,
  getChapterFiveCompanionDialogue,
  getChapterFiveWrongAppDialogue,
} from '../lib/chapterFiveDialogue';
import {
  CHAPTER_SIX_DIALOGUE,
  getChapterSixCompanionDialogue,
  getChapterSixWrongAppDialogue,
} from '../lib/chapterSixDialogue';
import {
  CHAPTER_SEVEN_DIALOGUE,
  getChapterSevenCompanionDialogue,
  getChapterSevenWrongAppDialogue,
} from '../lib/chapterSevenDialogue';
import type { DialogueLines } from '../lib/chapterOneDialogue';
import {
  getChapterPhoneSignals,
  type PhoneLauncherApp,
} from '../lib/chapterPhoneSignals';
import { hasAllMaraNumberClues } from '../lib/chapterSevenSocial';
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
import type { AmazeMartOrderPhase } from '../lib/amazemartPuzzle';
import { completePuzzleChapter } from '../lib/chapterProgress';
import { ChapterNineDeletionHome, ChapterNineMakeRoomWidget } from './ChapterNineDeletionHome';
import {
  CHAPTER_NINE_DELETABLE_APPS,
  addDeletedChapterNineApp,
  canDeleteChapterNineApp,
  isChapterNineMessagesStandoffReady,
  type ChapterNineDeletableApp,
} from '../lib/chapterNineDeletion';
import {
  CHAPTER_NINE_DELETION_DIALOGUE,
  CHAPTER_NINE_DIALOGUE,
  getChapterNineBlockedDialogue,
  getChapterNineMessagesStandoffDialogue,
} from '../lib/chapterNineDialogue';
import { getChapterPhoneBatteryPercent } from '../lib/chapterPhoneBattery';
import { formatCheckpointTimestamp } from '../lib/chapterCheckpoint';

/** Modern widget chassis: translucent, friendly, current-year. */
const WIDGET_SHELL =
  'relative rounded-[22px] border border-white/[0.08] bg-white/[0.055] backdrop-blur-md overflow-hidden';
const HOME_SWIPE_THRESHOLD_PX = 28;

type DockUtility = 'voicelog' | 'filebox' | 'gallery' | 'terminal' | 'controls';
type ResetTarget = 'chapter' | 'loop';

interface PhoneSimulatorProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  immersiveIntro?: boolean;
  debugTargetApp?: { app: ActiveApp; nonce: number } | null;
  onSuspiciousRunSelected: () => void;
  soundVolume: number;
  musicVolume: number;
  screenBrightness: number;
  screenContrast: number;
  cameraPitchEnabled: boolean;
  postureControlEnabled: boolean;
  fullscreenOnly: boolean;
  developerToolsOpen: boolean;
  chapterTenPlayerFullscreen: boolean;
  onSoundVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onScreenBrightnessChange: (brightness: number) => void;
  onScreenContrastChange: (contrast: number) => void;
  onCameraPitchEnabledChange: (enabled: boolean) => void;
  onPostureControlEnabledChange: (enabled: boolean) => void;
  onFullscreenOnlyChange: (enabled: boolean) => void;
  onOpenDeveloperTools: () => void;
  onChapterTenPlayerFlightStart: () => void;
  onChapterTenPlayerFlightEnd: () => void;
  onChapterTenTakeover: () => void;
  onRestartCurrentChapter: () => void;
  onRestartLoop: () => void;
  checkpointChapter: number;
  checkpointSavedAt: string | null;
  onLoadCheckpoint: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  progress,
  updateProgress,
  onMuteToggle,
  isMuted,
  immersiveIntro = false,
  debugTargetApp,
  onSuspiciousRunSelected,
  soundVolume,
  musicVolume,
  screenBrightness,
  screenContrast,
  cameraPitchEnabled,
  postureControlEnabled,
  fullscreenOnly,
  developerToolsOpen,
  chapterTenPlayerFullscreen,
  onSoundVolumeChange,
  onMusicVolumeChange,
  onScreenBrightnessChange,
  onScreenContrastChange,
  onCameraPitchEnabledChange,
  onPostureControlEnabledChange,
  onFullscreenOnlyChange,
  onOpenDeveloperTools,
  onChapterTenPlayerFlightStart,
  onChapterTenPlayerFlightEnd,
  onChapterTenTakeover,
  onRestartCurrentChapter,
  onRestartLoop,
  checkpointChapter,
  checkpointSavedAt,
  onLoadCheckpoint,
}) => {
  const metaInteraction = useMetaInteraction();
  const [activeApp, setActiveApp] = useState<ActiveApp>('flappy');
  const [homePage, setHomePage] = useState<0 | 1>(0);
  const [chapterNineEditMode, setChapterNineEditMode] = useState(false);
  const [familyAccountsOpen, setFamilyAccountsOpen] = useState(false);
  const [familyAccountConfirmed, setFamilyAccountConfirmed] = useState(false);
  const homeSwipeGesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    latestX: number;
    latestY: number;
    horizontal: boolean;
  } | null>(null);
  // Restore flash: nonce re-keys the overlay so the CSS animation replays.
  const [restoreNonce, setRestoreNonce] = useState(0);
  const [restoreVisible, setRestoreVisible] = useState(false);
  const [dockUtility, setDockUtility] = useState<DockUtility | null>(null);
  const [resetConfirmation, setResetConfirmation] = useState<ResetTarget | null>(null);
  const [chapterThreeOrderPhase, setChapterThreeOrderPhase] = useState<AmazeMartOrderPhase>(() => (
    progress.deliveredPhone ? 'verified' : progress.orderedPhone ? 'verification-requested' : 'idle'
  ));
  const [sellerMessageUnread, setSellerMessageUnread] = useState(false);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterNinePowerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterNineRebootTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterNineRestingHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterNineLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterNineEditModeRef = useRef(false);
  const chapterOneDialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterOneAppAttempt = useRef(0);
  const chapterOneHomeAttempt = useRef(0);
  const chapterOneHomeEntryShown = useRef(false);
  const chapterTwoAppAttempt = useRef(0);
  const chapterTwoHomeAttempt = useRef(0);
  const chapterThreeAppAttempt = useRef(0);
  const chapterThreeHomeAttempt = useRef(0);
  const chapterFourAppAttempt = useRef(0);
  const chapterFourHomeAttempt = useRef(0);
  const chapterFiveAppAttempt = useRef(0);
  const chapterFiveHomeAttempt = useRef(0);
  const chapterSixAppAttempt = useRef(0);
  const chapterSixHomeAttempt = useRef(0);
  const chapterSevenAppAttempt = useRef(0);
  const chapterSevenHomeAttempt = useRef(0);
  const chapterSixProfileShown = useRef(false);
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
  const chapterSevenReadyForMessages = progress.currentChapter === 7
    && hasAllMaraNumberClues(progress)
    && !progress.loggedIntoAdmin;
  const handoffSignal = progress.currentChapter === 3 && sellerMessageUnread
    ? {
        notification: { app: 'messages' as const, label: '1', accessibleLabel: 'New message from coldboot_17' },
        recentApp: 'amazemart' as const,
      }
    : progress.currentChapter === 6 && progress.discoveredMotherComment && !familyAccountConfirmed
      ? { notification: null, recentApp: 'social' as const }
      : chapterSevenReadyForMessages
        ? {
            notification: { app: 'messages' as const, label: '1', accessibleLabel: 'Messages has an old-account lead' },
            recentApp: 'social' as const,
          }
        : phoneSignals;
  const phoneWidgets = getChapterPhoneWidgetState(progress.currentChapter);
  const widgetWeatherStage = getMetaWallStage(progress.currentChapter);
  const chapterReminderRows = getChapterReminderRows(progress);
  const completedReminderCount = chapterReminderRows.filter((row) => row.status === 'completed').length;
  const launcherSignals = (app: PhoneLauncherApp) => {
    const notification = app === 'messages' && sellerMessageUnread
      ? { label: '1', accessibleLabel: 'New message from coldboot_17' }
      : handoffSignal.notification?.app === app
      ? handoffSignal.notification
      : null;
    const recentlyUsed = handoffSignal.recentApp === app;

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
  const chapterNineRestorePhase = progress.chapterNineRestorePhase ?? 'idle';
  const chapterNineDeletedAppIds = progress.chapterNineDeletedAppIds ?? [];
  const chapterNineMessageAttempts = progress.chapterNineMessageAttempts ?? 0;
  const chapterNineCleanupHome = chapterNineRestorePhase === 'cleanup';
  const chapterNineTerminalHome = chapterNineRestorePhase === 'blackout'
    || chapterNineRestorePhase === 'rebooted';
  const chapterNineSpecialHome = chapterNineRestorePhase !== 'idle';
  const phoneBatteryPercent = getChapterPhoneBatteryPercent(
    progress.currentChapter,
    chapterNineRestorePhase,
    chapterNineDeletedAppIds,
    chapterNineMessageAttempts,
  );

  useEffect(() => {
    if (debugTargetApp) setActiveApp(debugTargetApp.app);
  }, [debugTargetApp]);

  useEffect(() => {
    if (progress.deliveredPhone) {
      setChapterThreeOrderPhase('verified');
      setSellerMessageUnread(false);
      return;
    }
    if (!progress.orderedPhone) {
      setChapterThreeOrderPhase('idle');
      setSellerMessageUnread(false);
    }
  }, [progress.currentChapter, progress.deliveredPhone, progress.orderedPhone]);

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
    // Arcane remains personally silent after the Chapter 9 rupture, but the
    // phone still records EVIDENCE 09 and resolves the shared static handoff.
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
    if (chapterNinePowerTimer.current) clearTimeout(chapterNinePowerTimer.current);
    if (chapterNineRebootTimer.current) clearTimeout(chapterNineRebootTimer.current);
    if (chapterNineRestingHintTimer.current) clearTimeout(chapterNineRestingHintTimer.current);
    if (chapterNineLongPressTimer.current) clearTimeout(chapterNineLongPressTimer.current);
  }, []);

  useEffect(() => {
    if (
      progress.currentChapter !== 9
      || chapterNineRestorePhase !== 'cleanup'
      || chapterNineMessageAttempts < 3
    ) return;
    if (chapterNinePowerTimer.current) return;
    chapterNinePowerTimer.current = setTimeout(() => {
      audio.play('story.serviceTerminated');
      if (metaInteraction.active) metaInteraction.speak(CHAPTER_NINE_DIALOGUE.poweredDown);
      updateProgress((previous) => previous.currentChapter === 9
        ? { ...previous, chapterNineRestorePhase: 'blackout' }
        : previous);
      chapterNinePowerTimer.current = null;
    }, reducedMotion ? 120 : 1500);
  }, [
    chapterNineMessageAttempts,
    chapterNineRestorePhase,
    progress.currentChapter,
    reducedMotion,
    updateProgress,
  ]);

  useEffect(() => {
    const waitingForSurface = progress.currentChapter === 9
      && chapterNineRestorePhase === 'blackout'
      && metaInteraction.active
      && !metaInteraction.deviceResting;

    if (!waitingForSurface) {
      if (chapterNineRestingHintTimer.current) {
        clearTimeout(chapterNineRestingHintTimer.current);
        chapterNineRestingHintTimer.current = null;
      }
      return;
    }
    if (chapterNineRestingHintTimer.current) return;

    chapterNineRestingHintTimer.current = setTimeout(() => {
      metaInteraction.speak(CHAPTER_NINE_DIALOGUE.restingHint);
      chapterNineRestingHintTimer.current = null;
    }, reducedMotion ? 600 : 2600);
  }, [
    chapterNineRestorePhase,
    metaInteraction,
    progress.currentChapter,
    reducedMotion,
  ]);

  useEffect(() => {
    if (
      progress.currentChapter !== 9
      || chapterNineRestorePhase !== 'blackout'
      || (metaInteraction.active && !metaInteraction.deviceResting)
    ) return;
    if (chapterNineRebootTimer.current) return;
    chapterNineRebootTimer.current = setTimeout(() => {
      updateProgress((previous) => {
        if (previous.currentChapter !== 9) return previous;
        const poweredDownState: GameProgress = {
          ...previous,
          chapterNineRestorePhase: 'rebooted',
          chapterNineDeletedAppIds: [...CHAPTER_NINE_DELETABLE_APPS],
          chapterNineMessageAttempts: Math.max(3, previous.chapterNineMessageAttempts ?? 0),
          chapterNineArcaneSilent: true,
        };
        return completePuzzleChapter(poweredDownState, 9, { unlockedCodeRoute: true });
      });
      setHomePage(0);
      setActiveApp('home');
      chapterNineRebootTimer.current = null;
    }, reducedMotion ? 220 : 1900);
  }, [
    chapterNineRestorePhase,
    metaInteraction.active,
    metaInteraction.deviceResting,
    progress.currentChapter,
    reducedMotion,
    updateProgress,
  ]);

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
    if (progress.currentChapter === 10 && app === 'flappy') {
      onChapterTenPlayerFlightStart();
    }
    setActiveApp(app);
    if (app === 'messages' && chapterThreeOrderPhase !== 'idle') {
      setSellerMessageUnread(false);
    }
    if ((progress.currentChapter === 1 || progress.currentChapter === 2 || progress.currentChapter === 3 || progress.currentChapter === 4 || progress.currentChapter === 5 || progress.currentChapter === 6 || progress.currentChapter === 7) && metaInteraction.active) {
      const dialogue = progress.currentChapter === 1
        ? (app === 'viewtube'
        ? CHAPTER_ONE_DIALOGUE.viewTubeOpened
        : getChapterOneWrongAppDialogue(app, chapterOneAppAttempt.current))
        : progress.currentChapter === 2
          ? (app === 'browser'
          ? CHAPTER_TWO_DIALOGUE.browserOpened
          : getChapterTwoWrongAppDialogue(app, chapterTwoAppAttempt.current))
          : progress.currentChapter === 3
            ? (app === 'amazemart'
              ? [...CHAPTER_THREE_DIALOGUE.amazeMartOpened, ...CHAPTER_THREE_DIALOGUE.storefrontVisible]
              : app === 'messages' && chapterThreeOrderPhase !== 'idle'
                ? (chapterThreeOrderPhase === 'verified'
                  ? CHAPTER_THREE_DIALOGUE.sellerMatched
                  : CHAPTER_THREE_DIALOGUE.sellerRelayOpened)
                : getChapterThreeWrongAppDialogue(app, chapterThreeAppAttempt.current))
            : progress.currentChapter === 4
              ? (app === 'screenshots'
                ? CHAPTER_FOUR_DIALOGUE.deliveriesOpened
                : getChapterFourWrongAppDialogue(app, chapterFourAppAttempt.current))
              : progress.currentChapter === 5
                ? (app === 'browser'
                  ? CHAPTER_FIVE_DIALOGUE.browserOpened
                  : getChapterFiveWrongAppDialogue(app, chapterFiveAppAttempt.current))
                : progress.currentChapter === 6
                  ? (app === 'social'
                    ? CHAPTER_SIX_DIALOGUE.socialOpened
                    : getChapterSixWrongAppDialogue(app, chapterSixAppAttempt.current))
                  : (app === 'social'
                    ? CHAPTER_SEVEN_DIALOGUE.socialOpened
                    : app === 'messages'
                      ? CHAPTER_SEVEN_DIALOGUE.messagesOpened
                      : getChapterSevenWrongAppDialogue(app, chapterSevenAppAttempt.current));
      if (progress.currentChapter === 1 && app !== 'viewtube') chapterOneAppAttempt.current += 1;
      if (progress.currentChapter === 2 && app !== 'browser') chapterTwoAppAttempt.current += 1;
      if (progress.currentChapter === 3 && app !== 'amazemart') chapterThreeAppAttempt.current += 1;
      if (progress.currentChapter === 4 && app !== 'screenshots') chapterFourAppAttempt.current += 1;
      if (progress.currentChapter === 5 && app !== 'browser') chapterFiveAppAttempt.current += 1;
      if (progress.currentChapter === 6 && app !== 'social') chapterSixAppAttempt.current += 1;
      if (progress.currentChapter === 7 && app !== 'social' && app !== 'messages') chapterSevenAppAttempt.current += 1;
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

  const handleRequestSellerVerification = () => {
    updateProgress((prev) => ({ ...prev, orderedPhone: true }));
    setChapterThreeOrderPhase('verification-requested');
    setSellerMessageUnread(true);
    audio.play('messages.incoming');
  };

  const handleSellerMessagePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleLaunchApp('messages');
  };

  const handleSellerMessageClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return;
    handleLaunchApp('messages');
  };

  const handleSellerVerified = () => {
    setChapterThreeOrderPhase('verified');
    updateProgress((prev) => completePuzzleChapter(prev, 3, {
      orderedPhone: true,
      deliveredPhone: true,
    }));
  };

  const handleBeginChapterNineCleanup = () => {
    if (progress.currentChapter !== 9) return;
    audio.play('ui.primaryTap');
    updateProgress((previous) => previous.currentChapter === 9
      ? {
          ...previous,
          chapterNineRestorePhase: 'cleanup',
          chapterNineDeletedAppIds: [],
          chapterNineMessageAttempts: 0,
          chapterNineArcaneSilent: false,
        }
      : previous);
    setHomePage(0);
    setActiveApp('home');
    chapterNineEditModeRef.current = false;
    setChapterNineEditMode(false);
    if (metaInteraction.active) metaInteraction.speak(CHAPTER_NINE_DIALOGUE.restoreBlocked);
  };

  const stopChapterNineLongPress = () => {
    if (chapterNineLongPressTimer.current) clearTimeout(chapterNineLongPressTimer.current);
    chapterNineLongPressTimer.current = null;
  };

  const handleChapterNineLongPressStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!chapterNineCleanupHome || chapterNineEditModeRef.current || event.button !== 0) return;
    stopChapterNineLongPress();
    chapterNineLongPressTimer.current = setTimeout(() => {
      chapterNineEditModeRef.current = true;
      setChapterNineEditMode(true);
      audio.play('ui.toggle', { variant: 0 });
      chapterNineLongPressTimer.current = null;
    }, 520);
  };

  const leaveChapterNineEditMode = () => {
    stopChapterNineLongPress();
    chapterNineEditModeRef.current = false;
    setChapterNineEditMode(false);
  };

  const handleDeleteChapterNineApp = (app: Exclude<ChapterNineDeletableApp, 'messages'>) => {
    if (
      progress.currentChapter !== 9
      || chapterNineRestorePhase !== 'cleanup'
      || !canDeleteChapterNineApp(app, chapterNineDeletedAppIds)
    ) return;
    audio.play('ui.toggle', { variant: 0 });
    updateProgress((previous) => previous.currentChapter === 9
      ? {
          ...previous,
          chapterNineDeletedAppIds: addDeletedChapterNineApp(previous.chapterNineDeletedAppIds ?? [], app),
        }
      : previous);
    if (metaInteraction.active) metaInteraction.speak(CHAPTER_NINE_DELETION_DIALOGUE[app]);
  };

  const handleBlockedChapterNineApp = (app: ChapterNineDeletableApp) => {
    audio.play('auth.wrong');
    if (metaInteraction.active) {
      metaInteraction.speak(getChapterNineBlockedDialogue(app, chapterNineDeletedAppIds));
    }
  };

  const handleChapterNineMessagesAttempt = () => {
    if (
      progress.currentChapter !== 9
      || chapterNineRestorePhase !== 'cleanup'
      || !isChapterNineMessagesStandoffReady(chapterNineDeletedAppIds)
    ) {
      handleBlockedChapterNineApp('messages');
      return;
    }
    const attempt = chapterNineMessageAttempts;
    audio.play('auth.wrong');
    updateProgress((previous) => previous.currentChapter === 9
      ? {
          ...previous,
          chapterNineMessageAttempts: Math.min(3, (previous.chapterNineMessageAttempts ?? 0) + 1),
        }
      : previous);
    if (metaInteraction.active) {
      metaInteraction.speak(getChapterNineMessagesStandoffDialogue(attempt));
    }
  };

  // The meta hand animation intercepts click events higher in the tree. Open
  // launchers on pointer release so mouse and touch do not depend on that
  // relay; native click remains available for keyboard activation.
  const handleLauncherPointerUp = (event: React.PointerEvent<HTMLButtonElement>, app: ActiveApp) => {
    event.stopPropagation();
    stopChapterNineLongPress();
    if (chapterNineCleanupHome) {
      if (!chapterNineEditModeRef.current) return;
      if (app === 'flappy') {
        if (metaInteraction.active) metaInteraction.speak(CHAPTER_NINE_DIALOGUE.restoreBlocked);
        return;
      }
      if (CHAPTER_NINE_DELETABLE_APPS.includes(app as ChapterNineDeletableApp)) {
        const deletable = app as ChapterNineDeletableApp;
        if (!canDeleteChapterNineApp(deletable, chapterNineDeletedAppIds)) {
          handleBlockedChapterNineApp(deletable);
        } else if (deletable === 'messages') {
          handleChapterNineMessagesAttempt();
        } else {
          handleDeleteChapterNineApp(deletable);
        }
      }
      return;
    }
    handleLaunchApp(app);
  };

  const handleLauncherClick = (event: React.MouseEvent<HTMLButtonElement>, app: ActiveApp) => {
    if (chapterNineCleanupHome) {
      event.preventDefault();
      return;
    }
    if (event.detail !== 0) return;
    handleLaunchApp(app);
  };

  const handleHomeButton = () => {
    audio.play('phone.home');
    if (progress.currentChapter === 10) onChapterTenPlayerFlightEnd();
    setActiveApp('home');
    setHomePage(0);
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
    } else if (progress.currentChapter === 3 && metaInteraction.active) {
      const attempt = chapterThreeHomeAttempt.current;
      metaInteraction.speak(
        attempt === 0
          ? CHAPTER_THREE_DIALOGUE.homeReturned
          : getChapterThreeCompanionDialogue(attempt - 1),
      );
      chapterThreeHomeAttempt.current += 1;
    } else if (progress.currentChapter === 4 && metaInteraction.active) {
      const attempt = chapterFourHomeAttempt.current;
      metaInteraction.speak(
        attempt === 0
          ? CHAPTER_FOUR_DIALOGUE.homeReturned
          : getChapterFourCompanionDialogue(attempt - 1),
      );
      chapterFourHomeAttempt.current += 1;
    } else if (progress.currentChapter === 5 && metaInteraction.active) {
      const attempt = chapterFiveHomeAttempt.current;
      metaInteraction.speak(
        attempt === 0
          ? CHAPTER_FIVE_DIALOGUE.homeReturned
          : getChapterFiveCompanionDialogue(attempt - 1),
      );
      chapterFiveHomeAttempt.current += 1;
    } else if (progress.currentChapter === 6 && metaInteraction.active) {
      const attempt = chapterSixHomeAttempt.current;
      metaInteraction.speak(
        attempt === 0
          ? CHAPTER_SIX_DIALOGUE.homeReturned
          : getChapterSixCompanionDialogue(attempt - 1),
      );
      chapterSixHomeAttempt.current += 1;
    } else if (progress.currentChapter === 7 && metaInteraction.active) {
      const attempt = chapterSevenHomeAttempt.current;
      metaInteraction.speak(
        attempt === 0
          ? CHAPTER_SEVEN_DIALOGUE.homeReturned
          : getChapterSevenCompanionDialogue(attempt - 1),
      );
      chapterSevenHomeAttempt.current += 1;
    }
  };

  const profilePageUnlocked = progress.discoveredMotherComment || progress.currentChapter >= 7;

  const selectHomePage = (page: 0 | 1) => {
    if (page === 1 && !profilePageUnlocked) return;
    audio.play('phone.tab');
    setHomePage(page);
    if (page === 1 && progress.currentChapter === 6 && metaInteraction.active && !chapterSixProfileShown.current) {
      chapterSixProfileShown.current = true;
      metaInteraction.speak(CHAPTER_SIX_DIALOGUE.profilePageOpened);
    }
  };

  const handleHomeSwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    homeSwipeGesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      latestX: event.clientX,
      latestY: event.clientY,
      horizontal: false,
    };
  };

  const handleHomeSwipeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = homeSwipeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gesture.latestX = event.clientX;
    gesture.latestY = event.clientY;
    const travelX = gesture.latestX - gesture.startX;
    const travelY = gesture.latestY - gesture.startY;
    if (
      Math.abs(travelX) >= HOME_SWIPE_THRESHOLD_PX
      && Math.abs(travelX) > Math.abs(travelY)
    ) {
      gesture.horizontal = true;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleHomeSwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = homeSwipeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    homeSwipeGesture.current = null;
    const travelX = event.clientX - gesture.startX;
    const travelY = event.clientY - gesture.startY;
    const horizontal = gesture.horizontal || (
      Math.abs(travelX) >= HOME_SWIPE_THRESHOLD_PX
      && Math.abs(travelX) > Math.abs(travelY)
    );
    if (!horizontal) return;
    event.preventDefault();
    event.stopPropagation();
    selectHomePage(homePage === 0 ? 1 : 0);
  };

  const handleHomeSwipeCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (homeSwipeGesture.current?.pointerId === event.pointerId) {
      homeSwipeGesture.current = null;
    }
  };

  const handleMaraFound = () => {
    if (metaInteraction.active) metaInteraction.speak(CHAPTER_SIX_DIALOGUE.maraCommentSelected);
  };

  const handleSocialDialogue = (lines: DialogueLines) => {
    if ((progress.currentChapter === 6 || progress.currentChapter === 7) && metaInteraction.active) metaInteraction.speak(lines);
  };

  const confirmMaraFamilyAccount = () => {
    if (!progress.discoveredMotherComment || progress.currentChapter !== 6) return;
    audio.play('narrative.clueEmphasis');
    setFamilyAccountConfirmed(true);
    updateProgress((prev) => completePuzzleChapter(prev, 6, { discoveredMotherComment: true }));
    if (metaInteraction.active) metaInteraction.speak(CHAPTER_SIX_DIALOGUE.completed);
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
              <div className="text-[9px] text-slate-500">AUTO CHECKPOINT</div>
              <div className="mt-1 font-mono text-[11px] text-slate-200">CHAPTER {checkpointChapter.toString().padStart(2, '0')}</div>
              <div className="mt-0.5 text-[9px] text-slate-500">
                {checkpointSavedAt ? `LAST SAVED · ${formatCheckpointTimestamp(checkpointSavedAt)}` : 'NO CHECKPOINT FOUND'}
              </div>
            </div>
            <button type="button" onClick={onLoadCheckpoint} className={`${actionButtonClassName} w-full`} id="dock-load-checkpoint">
              Load saved game
            </button>
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
            <button
              type="button"
              role="switch"
              aria-checked={fullscreenOnly}
              onClick={() => onFullscreenOnlyChange(!fullscreenOnly)}
              className={`${actionButtonClassName} flex w-full items-center justify-between border-amber-300/20 text-left`}
              id="dock-fullscreen-only"
              data-meta-hit-recovery="true"
            >
              <span><span className="block">Fullscreen only</span><span className="mt-0.5 block text-[8px] text-slate-500">Bypass the Meta camera and use direct screen input</span></span>
              <span className={fullscreenOnly ? 'text-amber-300' : 'text-slate-500'}>{fullscreenOnly ? 'ON' : 'OFF'}</span>
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
            <span className={`font-mono text-[7px] ${progress.currentChapter === 9 ? 'text-amber-200' : 'text-slate-300'}`} id="status-phone-battery">
              {phoneBatteryPercent}%
            </span>
            <span className="relative w-[19px] h-[9px] rounded-[3px] border border-slate-400/70">
              <span
                className={`absolute inset-[1.5px] right-[4px] rounded-[1px] ${progress.currentChapter === 9 ? 'bg-amber-300' : 'bg-slate-200'}`}
                style={{ width: `${Math.max(5, phoneBatteryPercent)}%` }}
              ></span>
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
          {activeApp === 'home' && chapterNineTerminalHome && (
            <motion.div
              key={`chapter-nine-home-${chapterNineRestorePhase}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
              className="absolute inset-0"
            >
              <ChapterNineDeletionHome
                phase={chapterNineRestorePhase}
                deletedAppIds={chapterNineDeletedAppIds}
                messageAttempts={chapterNineMessageAttempts}
                deviceResting={metaInteraction.deviceResting}
                onDeleteApp={handleDeleteChapterNineApp}
                onBlockedApp={handleBlockedChapterNineApp}
                onMessageAttempt={handleChapterNineMessagesAttempt}
                onLaunchFlappy={() => handleLaunchApp('flappy')}
              />
            </motion.div>
          )}

          {activeApp === 'home' && !chapterNineTerminalHome && (
            /* HOME SCREEN — a normal modern phone. The residue does the talking. */
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`absolute inset-0 p-3 md:p-4 flex flex-row gap-3 md:gap-4 overflow-y-auto ${wallpaperCool}`}
              id="phone-desktop"
              onPointerDownCapture={handleHomeSwipeStart}
              onPointerMoveCapture={handleHomeSwipeMove}
              onPointerUpCapture={handleHomeSwipeEnd}
              onPointerCancelCapture={handleHomeSwipeCancel}
              data-home-page={homePage}
              style={{
                background:
                  'radial-gradient(120% 130% at 82% -12%, #33405c 0%, #1d2434 44%, #10141d 100%)',
                touchAction: 'pan-y',
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
                {chapterNineCleanupHome ? (
                  <ChapterNineMakeRoomWidget
                    deletedAppIds={chapterNineDeletedAppIds}
                    messageAttempts={chapterNineMessageAttempts}
                    editMode={chapterNineEditMode}
                    onDone={leaveChapterNineEditMode}
                  />
                ) : (
                  <>

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
                  </>
                )}
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
                <div className="flex min-h-[clamp(250px,42cqh,390px)] w-full items-center" id="home-right-page-content">
                  <AnimatePresence mode="wait" initial={false}>
                    {homePage === 0 ? (
                      <motion.div
                        key="apps"
                        initial={{ opacity: 0, x: reducedMotion ? 0 : '-7%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: reducedMotion ? 0 : '-7%' }}
                        transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
                        className="w-full"
                      >
                <div
                  className={`grid grid-cols-4 justify-items-center gap-y-[clamp(18px,3.4cqh,36px)] rounded-[22px] border p-3 transition-colors ${
                    chapterNineCleanupHome
                      ? chapterNineEditMode
                        ? 'chapter-nine-editing border-red-300/25 bg-red-300/[0.025]'
                        : 'border-white/[0.08] bg-white/[0.02]'
                      : 'border-transparent'
                  }`}
                  id="home-apps-grid"
                  data-meta-immediate="true"
                  data-meta-direct-gesture="true"
                  data-chapter-nine-cleanup={chapterNineCleanupHome}
                  data-chapter-nine-edit-mode={chapterNineEditMode}
                  onPointerDownCapture={handleChapterNineLongPressStart}
                  onPointerUpCapture={stopChapterNineLongPress}
                  onPointerCancelCapture={stopChapterNineLongPress}
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
                      {phoneSignals.notification.app !== 'flappy' && handoffSignal.notification?.app !== 'flappy' && (
                        <span className="absolute -top-1 -right-1.5 bg-[#3c66c4] text-white font-semibold text-[6.5px] tracking-wide px-1.5 py-px rounded-full shadow">
                          UPDATED
                        </span>
                      )}
                      {launcherSignals('flappy')}
                    </div>
                    <span className="font-laos text-[clamp(10px,1.05cqw,12.5px)] tracking-[0.04em] text-[#b9c2d4] truncate max-w-full">
                      Flappy Something
                    </span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'viewtube')}
                    onClick={(event) => handleLauncherClick(event, 'viewtube')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-viewtube"
                    data-chapter-nine-deleted={chapterNineDeletedAppIds.includes('viewtube')}
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
                    data-chapter-nine-deleted={chapterNineDeletedAppIds.includes('amazemart')}
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
                    data-chapter-nine-deleted={chapterNineDeletedAppIds.includes('browser')}
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
                    data-chapter-nine-deleted={chapterNineDeletedAppIds.includes('social')}
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
                    data-chapter-nine-deleted={chapterNineDeletedAppIds.includes('messages')}
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
                    data-chapter-nine-deleted={chapterNineDeletedAppIds.includes('screenshots')}
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconDeliveries legacy={residue >= 2} />
                      {launcherSignals('screenshots')}
                    </div>
                    <span className={`truncate max-w-full ${
                      residue >= 2
                        ? 'font-laos text-[clamp(10px,1.05cqw,12.5px)] tracking-[0.04em] text-[#b9c2d4]'
                        : 'text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90'
                    }`}>Deliveries</span>
                  </button>

                  <button
                    onPointerUp={(event) => handleLauncherPointerUp(event, 'about')}
                    onClick={(event) => handleLauncherClick(event, 'about')}
                    className="group flex flex-col items-center gap-1.5 min-w-0"
                    id="launcher-about"
                    data-chapter-nine-deleted={chapterNineDeletedAppIds.includes('about')}
                  >
                    <div className="relative w-[clamp(64px,7.8cqw,104px)] h-[clamp(64px,7.8cqw,104px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:scale-[1.04] group-active:scale-95">
                      <IconConcept />
                      {launcherSignals('about')}
                    </div>
                    <span className="text-[clamp(10px,1.1cqw,13px)] font-medium text-slate-100/90 truncate max-w-full">Concept</span>
                  </button>
                </div>

                {/* Page indicator dots */}
                <div className="flex items-center justify-center gap-1.5 py-0.5" id="home-page-indicator">
                  <button type="button" onClick={() => selectHomePage(0)} className={`h-1.5 w-1.5 rounded-full ${homePage === 0 ? 'bg-slate-200/80' : 'bg-slate-200/25'}`} aria-label="Open apps home page" />
                  <button type="button" disabled={!profilePageUnlocked} onClick={() => selectHomePage(1)} className={`h-1.5 w-1.5 rounded-full ${homePage === 1 ? 'bg-slate-200/80' : 'bg-slate-200/25'} disabled:opacity-20`} aria-label="Open personal profile page" id="home-profile-page-dot" />
                  <button
                    type="button"
                    disabled={!profilePageUnlocked}
                    onClick={() => selectHomePage(1)}
                    data-meta-hit-recovery="true"
                    className="relative ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/15 transition-colors hover:bg-white/[0.08] disabled:opacity-20"
                    aria-label="Next page: linked accounts"
                    id="home-profile-page-next"
                  >
                    {progress.currentChapter === 6 && progress.discoveredMotherComment && !familyAccountConfirmed && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-[#182031] bg-[#e04a3d] px-1 text-[7px] font-semibold text-white" aria-label="Linked accounts have one new family record">1</span>
                    )}
                    <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-slate-200/75" aria-hidden="true" />
                  </button>
                </div>
                      </motion.div>
                    ) : profilePageUnlocked ? (
                      <motion.section
                        key="profile"
                        initial={{ opacity: 0, x: reducedMotion ? 0 : '7%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: reducedMotion ? 0 : '7%' }}
                        transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
                        className="w-full rounded-[22px] border border-white/[0.09] bg-[#141925]/72 p-[clamp(12px,1.6cqw,18px)] shadow-[0_16px_38px_rgba(0,0,0,0.22)] backdrop-blur-md"
                        id="home-personal-profile-page"
                        data-profile-owner="Arcane Kade"
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                          <div><div className="font-mono text-[7px] tracking-[0.18em] text-slate-500">PERSONAL SETTINGS</div><h2 className="mt-0.5 text-[clamp(12px,1.25cqw,15px)] font-semibold text-white">Account & device identity</h2></div>
                          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[7px] text-emerald-300">BACKUP VERIFIED</div>
                        </div>

                        <div className="mt-3 grid grid-cols-[0.92fr_1.08fr] gap-3">
                          <div className="rounded-2xl border border-white/[0.09] bg-white/[0.045] p-3">
                            <div className="flex items-center gap-2.5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-900 text-sm font-black text-white">AK</div><div className="min-w-0"><div className="text-[7px] text-slate-500">PRIMARY ACCOUNT</div><div className="truncate text-[clamp(12px,1.25cqw,15px)] font-semibold text-white" id="home-profile-owner-name">Arcane Kade</div><div className="text-[8px] text-slate-400">Local player · Harborview</div></div></div>
                            <div className="mt-3 space-y-1.5 border-t border-white/[0.07] pt-2.5 text-[8px] text-slate-400"><div className="flex justify-between gap-2"><span>Account created</span><span className="text-right text-slate-200">2014 migration</span></div><div className="flex justify-between gap-2"><span>Legacy profile</span><span className="font-mono text-slate-200">AK_HOME</span></div><div className="flex justify-between gap-2"><span>Device source</span><span className="text-right text-slate-200">Lumen Arc backup</span></div></div>
                          </div>

                          <div className="space-y-2 rounded-2xl border border-white/[0.09] bg-white/[0.045] p-3">
                            <button type="button" onClick={() => { audio.play('phone.tab'); setFamilyAccountsOpen((open) => !open); }} className="flex w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-black/15 p-2.5 text-left" id="home-linked-accounts-toggle" aria-expanded={familyAccountsOpen}>
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><Link2 className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-[9px] font-semibold text-white">Accounts linked to this profile</div><div className="mt-0.5 text-[7px] text-slate-500">Family and migration relationships</div></div><ChevronRight className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${familyAccountsOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {familyAccountsOpen && (
                              <div className="space-y-1.5" id="home-linked-family-accounts">
                                <div className="flex items-center gap-2 rounded-xl bg-black/15 p-2 text-slate-500"><UserRound className="h-4 w-4" /><div className="flex-1"><div className="text-[8px] font-semibold">Archived guardian record</div><div className="text-[7px]">Identity unavailable</div></div></div>
                                <button type="button" onClick={confirmMaraFamilyAccount} disabled={familyAccountConfirmed || progress.currentChapter >= 7} className="flex w-full items-center gap-2 rounded-xl border border-pink-300/20 bg-pink-300/[0.07] p-2 text-left hover:bg-pink-300/[0.12] disabled:cursor-default" id="home-mara-related-account">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-700 text-[8px] font-black text-white">MK</div><div className="min-w-0 flex-1"><div className="text-[9px] font-semibold text-pink-100">Mara Kade</div><div className="text-[7px] leading-snug text-pink-200/55">Mother · linked through Lumen Arc family migration</div></div><Users className="h-4 w-4 shrink-0 text-pink-300/60" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.section>
                    ) : null}
                  </AnimatePresence>
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
                onSuspiciousRunSelected={onSuspiciousRunSelected}
                chapterTenPlayerFullscreen={chapterTenPlayerFullscreen}
                onChapterTenTakeover={onChapterTenTakeover}
                onRestartLoop={onRestartLoop}
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
              <ViewTube
                progress={progress}
                updateProgress={updateProgress}
                developerPreview={Boolean(debugTargetApp)}
              />
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
                orderPhase={chapterThreeOrderPhase}
                onRequestSellerVerification={handleRequestSellerVerification}
                onOpenMessages={() => handleLaunchApp('messages')}
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
              <SocialApp progress={progress} updateProgress={updateProgress} onMaraFound={handleMaraFound} onDialogue={handleSocialDialogue} />
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
              <MessagesApp
                progress={progress}
                updateProgress={updateProgress}
                chapterThreeOrderPhase={chapterThreeOrderPhase}
                onSellerVerified={handleSellerVerified}
                onBeginChapterNineCleanup={handleBeginChapterNineCleanup}
                developerPreview={developerToolsOpen || Boolean(debugTargetApp)}
              />
            </motion.div>
          )}

          {activeApp === 'about' && (
            /* Concept is a player-facing preservation statement, not a puzzle. */
            <motion.div
              key="about"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0 bg-[#111318] p-4 overflow-y-auto space-y-4 text-slate-100 font-sans"
              id="concept-info-page"
            >
              <div className="border-b border-white/[0.07] pb-3 flex items-start gap-2 mt-4">
                <CheckCircle2 className="mt-0.5 w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/75">Concept // why this game exists</p>
                  <h2 className="mt-1 font-semibold text-sm text-white">THE HIGH SCORE IS THE BAIT. THE MISSING GAME IS THE STORY.</h2>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                <p>
                  <strong className="text-white">High Score Chaser</strong> begins with one cheap game and one petty goal: beat <strong className="text-amber-300">ARC_184</strong>. Then Gate 40 reveals that the contest is no longer fair. The current release kept the title, the bird, and the leaderboard, but removed a route that the Legacy build could actually complete.
                </p>

                <p>
                  The player is not digging through old files because retro technology is automatically important. The investigation exists because the score cannot be understood without recovering the version, hardware, people, and records that once made it possible.
                </p>

                <section className="rounded-xl border border-emerald-300/[0.14] bg-emerald-300/[0.045] p-3" aria-labelledby="concept-in-game">
                  <h3 id="concept-in-game" className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">What was actually lost</h3>
                  <ul className="mt-2 space-y-2 text-slate-300 marker:text-emerald-300">
                    <li><strong className="text-white">The playable route:</strong> an update preserved the product shell while deleting the original ending.</li>
                    <li><strong className="text-white">The means to run it:</strong> the surviving build depends on an archived package and discontinued hardware.</li>
                    <li><strong className="text-white">The human record:</strong> the leaderboard, creator history, family messages, and company archive were split across systems that were never designed to remember together.</li>
                  </ul>
                </section>

                <section className="rounded-xl border border-white/[0.08] bg-[#0c0e12] p-3" aria-labelledby="concept-score">
                  <h3 id="concept-score" className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">Why the high score matters</h3>
                  <p className="mt-2">
                    Arcane chases first place. The impersonator chases attention. Noah chases an ending. The player chases an explanation. The number is never the answer; it is the visible scar left by a version of the game that can no longer be reached through normal play.
                  </p>
                </section>

                <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3" aria-labelledby="concept-player">
                  <h3 id="concept-player" className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">Where Stop Killing Games enters</h3>
                  <p className="mt-2">
                    This is not a general introduction to an organization, nor a demand that every server run forever. It dramatizes the preservation question associated with <strong className="text-white">Stop Killing Games</strong>: after official support ends, can a lawful owner still launch a complete version without depending forever on a dead server, vanished device, or company decision?
                  </p>
                  <p className="mt-2">
                    Saving only the download is not enough. <strong className="text-white">Skyline 256</strong> remains possible only when the executable build, a way to run it, and enough human context to understand what was removed survive together.
                  </p>
                </section>

                <p className="border-l-2 border-amber-400/60 pl-3 text-sm leading-relaxed text-slate-100">
                  A game does not need to run forever. It needs to remain possible.
                </p>

                <div className="border-t border-white/[0.07] pt-3 font-mono text-[9px] leading-relaxed text-slate-500">
                  Fictional work. Not an official Stop Killing Games product or statement. This file exists for the player who comes after Arcane: a record of why his impossible score became a preservation story.
                </div>
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

      <AnimatePresence>
        {sellerMessageUnread && chapterThreeOrderPhase === 'verification-requested' && (
          <motion.button
            type="button"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -70 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -70 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            onPointerDown={handleSellerMessagePointerDown}
            onClick={handleSellerMessageClick}
            data-meta-immediate="true"
            data-meta-hit-recovery="true"
            data-system-notification="incoming-message"
            className="absolute left-1/2 top-3 z-[70] flex w-[92%] max-w-[430px] -translate-x-1/2 items-center gap-3 rounded-[20px] border border-white/[0.1] bg-[#1b2130]/90 px-3.5 py-3 text-left shadow-2xl backdrop-blur-xl transition-transform active:scale-[0.985]"
            id="messages-seller-notification"
            aria-label="Open incoming message from coldboot_17"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-400 to-cyan-700 text-white shadow-inner">
              <IconMessages />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">Cognitive Investigation</span>
                <span className="text-[9.5px] text-slate-500">now</span>
              </div>
              <div className="text-[13px] font-semibold leading-tight text-slate-50">Incoming Message · coldboot_17</div>
              <div className="truncate text-[11px] leading-snug text-slate-300/85">Buyer check waiting in Messages — open the secure relay.</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

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
          onDone={() => {
            setActiveApp('home');
            setHomePage(0);
            setActiveTransition(null);
          }}
        />
      )}

    </div>
  );
};
