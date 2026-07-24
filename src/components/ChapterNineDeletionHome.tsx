import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BatteryWarning, HardDrive, LockKeyhole, X } from 'lucide-react';
import {
  IconAmazeMart,
  IconConcept,
  IconDeliveries,
  IconFaceSpace,
  IconFlappy,
  IconMessages,
  IconViewTube,
  IconWayback,
} from './OsIcons';
import {
  CHAPTER_NINE_DELETABLE_APPS,
  canDeleteChapterNineApp,
  getChapterNineBatteryPercent,
  getChapterNineDeletionStage,
  getChapterNineRestorePercent,
  type ChapterNineDeletableApp,
  type ChapterNineRestorePhase,
} from '../lib/chapterNineDeletion';
import { useReducedMotion } from '../lib/useReducedMotion';

interface ChapterNineDeletionHomeProps {
  phase: ChapterNineRestorePhase;
  deletedAppIds: readonly ChapterNineDeletableApp[];
  messageAttempts: number;
  deviceResting: boolean;
  onDeleteApp: (app: Exclude<ChapterNineDeletableApp, 'messages'>) => void;
  onBlockedApp: (app: ChapterNineDeletableApp) => void;
  onMessageAttempt: () => void;
  onLaunchFlappy: () => void;
}

const APPS: ReadonlyArray<{
  id: ChapterNineDeletableApp;
  label: string;
  localData: string;
  Icon: React.FC;
}> = [
  { id: 'viewtube', label: 'ViewTube', localData: '1.3 GB', Icon: IconViewTube },
  { id: 'amazemart', label: 'AmazeMart', localData: '2.4 GB', Icon: IconAmazeMart },
  { id: 'screenshots', label: 'Deliveries', localData: '1.7 GB', Icon: () => <IconDeliveries legacy /> },
  { id: 'about', label: 'Concept', localData: '1.1 GB', Icon: IconConcept },
  { id: 'browser', label: 'Wayback', localData: '4.2 GB', Icon: IconWayback },
  { id: 'social', label: 'FaceSpace', localData: '5.9 GB', Icon: IconFaceSpace },
  { id: 'messages', label: 'Messages', localData: '12.4 GB', Icon: IconMessages },
];

const STANDOFF_COPY = [
  {
    title: 'Arcane cancelled the request.',
    body: 'Those messages are not evidence.',
    action: 'TRY DELETE AGAIN',
  },
  {
    title: 'Arcane cancelled it again.',
    body: 'That is my mother.',
    action: 'INSIST',
  },
  {
    title: 'Conflicting input detected.',
    body: 'DELETE and CANCEL are both still being received.',
    action: 'DELETE ANYWAY',
  },
] as const;

export const ChapterNineMakeRoomWidget: React.FC<{
  deletedAppIds: readonly ChapterNineDeletableApp[];
  messageAttempts: number;
  editMode: boolean;
  interactionReady: boolean;
  onDone: () => void;
}> = ({
  deletedAppIds,
  messageAttempts,
  editMode,
  interactionReady,
  onDone,
}) => {
  const restorePercent = getChapterNineRestorePercent(deletedAppIds);
  const batteryPercent = getChapterNineBatteryPercent(deletedAppIds, messageAttempts);

  return (
    <aside
      className="laos-panel laos-slow flex h-full min-h-0 flex-col p-4"
      id="chapter-nine-make-room-widget"
      data-edit-mode={editMode}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--laos-line-dim)] pb-3">
        <div>
          <div className="laos-label text-[8px]">LEGACY PROFILE RESTORE</div>
          <h2 className="mt-1 text-[15px] font-semibold text-[var(--laos-text)]">Make room</h2>
        </div>
        {editMode && (
          <button
            type="button"
            onClick={onDone}
            className="border border-white/10 px-2 py-1 font-mono text-[7px] text-slate-300"
            data-meta-immediate="true"
            data-meta-hit-recovery="true"
          >
            DONE
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-[8px]">
            <span className="flex items-center gap-1.5 text-slate-400"><HardDrive className="h-3 w-3" /> DOWNLOAD RESUME</span>
            <span className="font-mono text-slate-200" id="chapter-nine-restore-percent">{restorePercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div animate={{ width: `${restorePercent}%` }} className="h-full bg-emerald-300/70" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-amber-300/15 bg-amber-300/[0.05] px-3 py-2">
          <span className="flex items-center gap-1.5 text-[8px] text-amber-200/70"><BatteryWarning className="h-3 w-3" /> BATTERY</span>
          <span className="font-mono text-[10px] text-amber-100" id="chapter-nine-battery">{batteryPercent}%</span>
        </div>
      </div>

      <div className="mt-5 border border-red-300/20 bg-red-300/[0.05] p-3">
        <div className="font-mono text-[8px] font-bold tracking-[0.12em] text-red-200">18.0 GB STILL REQUIRED</div>
        <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
          {!interactionReady
            ? 'Waiting for local operator input...'
            : editMode
            ? 'Tap an app marked with × to remove its local data.'
            : 'Press and hold any app until the icons begin to move.'}
        </p>
      </div>

      {messageAttempts > 0 && (
        <div
          className="mt-3 border border-amber-300/25 bg-amber-300/[0.06] p-3"
          id="chapter-nine-messages-standoff-widget"
          data-standoff-attempt={messageAttempts}
        >
          <div className="text-[9px] font-semibold text-amber-100">
            {STANDOFF_COPY[Math.min(STANDOFF_COPY.length - 1, messageAttempts - 1)].title}
          </div>
          <div className="mt-1 font-mono text-[7px] leading-relaxed text-amber-200/60">
            {messageAttempts >= 3
              ? 'DELETE / CANCEL · CONFLICTING INPUT · BATTERY CRITICAL'
              : STANDOFF_COPY[Math.min(STANDOFF_COPY.length - 1, messageAttempts - 1)].body}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-white/[0.07] pt-3 font-mono text-[7px] leading-relaxed text-slate-600">
        {deletedAppIds.length}/7 LOCAL DATA SETS REMOVED
        <br />
        INTERRUPTED DOWNLOAD WILL RESUME AFTER RESTART
      </div>
    </aside>
  );
};

export const ChapterNineDeletionHome: React.FC<ChapterNineDeletionHomeProps> = ({
  phase,
  deletedAppIds,
  messageAttempts,
  deviceResting,
  onDeleteApp,
  onBlockedApp,
  onMessageAttempt,
  onLaunchFlappy,
}) => {
  const reducedMotion = useReducedMotion();
  const [selectedApp, setSelectedApp] = useState<ChapterNineDeletableApp | null>(null);

  useEffect(() => {
    if (selectedApp && deletedAppIds.includes(selectedApp)) setSelectedApp(null);
  }, [deletedAppIds, selectedApp]);

  if (phase === 'blackout') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black"
        id="chapter-nine-power-loss"
        data-device-resting={deviceResting}
      >
        {!deviceResting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.42, 0.28] }}
            transition={{ duration: reducedMotion ? 0 : 2.8, times: [0, 0.72, 1] }}
            className="flex w-[min(76%,540px)] flex-col items-center font-mono text-[10px] tracking-[0.24em] text-slate-500"
            id="chapter-nine-resting-hint"
          >
            <div>RECOVERY SUSPENDED</div>
            <div className="mt-3 text-[9px] text-slate-600">WAITING FOR A STABLE SURFACE</div>
            <motion.div
              className="mt-6 h-px w-28 bg-slate-700"
              animate={reducedMotion ? undefined : { scaleX: [0.65, 1, 0.65], opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
        {deviceResting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-[min(76%,540px)] font-mono text-[10px] leading-7 text-slate-500"
            id="chapter-nine-reboot-log"
          >
            <div>INTERRUPTED STORAGE OPERATION DETECTED</div>
            <div>RESUMING CLEANUP...</div>
            <div className="mt-3 text-slate-300">LEGACY PROFILE RESTORED</div>
          </motion.div>
        )}
      </div>
    );
  }

  if (phase === 'rebooted') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(100%_120%_at_50%_0%,#252d40_0%,#111621_58%,#090c12_100%)]"
        id="chapter-ten-empty-home"
        data-arcane-dialogue="silent"
      >
        <button
          type="button"
          onClick={onLaunchFlappy}
          className="group flex flex-col items-center gap-2"
          id="chapter-ten-only-flappy"
          data-meta-immediate="true"
        >
          <div className="h-[clamp(82px,10cqw,122px)] w-[clamp(82px,10cqw,122px)] drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] transition-transform group-hover:scale-[1.03] group-active:scale-95">
            <IconFlappy />
          </div>
          <span className="font-laos text-[clamp(11px,1.2cqw,14px)] tracking-[0.08em] text-slate-300">
            Flappy Something
          </span>
        </button>
      </div>
    );
  }

  const activeStage = getChapterNineDeletionStage(deletedAppIds);
  const restorePercent = getChapterNineRestorePercent(deletedAppIds);
  const batteryPercent = getChapterNineBatteryPercent(deletedAppIds, messageAttempts);
  const selected = APPS.find(({ id }) => id === selectedApp);
  const standoff = STANDOFF_COPY[Math.min(STANDOFF_COPY.length - 1, Math.max(0, messageAttempts - 1))];

  const requestDelete = (app: ChapterNineDeletableApp) => {
    if (!canDeleteChapterNineApp(app, deletedAppIds)) {
      onBlockedApp(app);
      return;
    }
    setSelectedApp(app);
  };

  const confirmDelete = () => {
    if (!selectedApp) return;
    if (selectedApp === 'messages') {
      onMessageAttempt();
      return;
    }
    onDeleteApp(selectedApp);
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_130%_at_82%_-12%,#33405c_0%,#1d2434_44%,#10141d_100%)] p-4"
      id="chapter-nine-cleanup-home"
      data-cleanup-stage={activeStage.id}
    >
      <div className="grid h-full grid-cols-[minmax(210px,0.74fr)_minmax(360px,1.26fr)] gap-4">
        <aside className="flex min-h-0 flex-col rounded-[22px] border border-white/10 bg-black/20 p-4 backdrop-blur-md">
          <div className="font-mono text-[8px] tracking-[0.18em] text-slate-500">LEGACY PROFILE RESTORE</div>
          <h2 className="mt-1 text-[15px] font-semibold text-slate-100">Make room</h2>
          <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
            Local-only app data must be removed before the preserved profile can finish loading.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[8px]">
                <span className="flex items-center gap-1.5 text-slate-400"><HardDrive className="h-3 w-3" /> LEGACY RESTORE</span>
                <span className="font-mono text-slate-200" id="chapter-nine-restore-percent">{restorePercent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{ width: `${restorePercent}%` }}
                  transition={{ duration: reducedMotion ? 0 : 0.45 }}
                  className="h-full bg-emerald-300/70"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-amber-300/15 bg-amber-300/[0.05] px-3 py-2">
              <span className="flex items-center gap-1.5 text-[8px] text-amber-200/70"><BatteryWarning className="h-3 w-3" /> BATTERY</span>
              <span className="font-mono text-[10px] text-amber-100" id="chapter-nine-battery">{batteryPercent}%</span>
            </div>
          </div>

          <div className="mt-auto border-t border-white/[0.07] pt-3">
            <div className="text-[7px] uppercase tracking-[0.16em] text-slate-600">Current threshold</div>
            <div className="mt-1 text-[10px] text-slate-300">{activeStage.label}</div>
            <div className="mt-2 font-mono text-[7px] leading-relaxed text-slate-600">
              {deletedAppIds.length}/{CHAPTER_NINE_DELETABLE_APPS.length} APP DATA SETS REMOVED
            </div>
          </div>
        </aside>

        <main className="relative flex min-h-0 flex-col rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-100">Storage cleanup</div>
              <div className="mt-0.5 text-[8px] text-slate-500">Select an app, then remove its local data.</div>
            </div>
            <div className="rounded-full border border-red-300/20 bg-red-300/[0.07] px-2 py-1 font-mono text-[7px] text-red-200/80">
              LOCAL DATA CANNOT BE RECOVERED
            </div>
          </div>

          <div className="mt-5 grid flex-1 grid-cols-4 content-start gap-x-3 gap-y-5" id="chapter-nine-app-grid">
            <AnimatePresence>
              {APPS.filter(({ id }) => !deletedAppIds.includes(id)).map(({ id, label, localData, Icon }) => {
                const available = canDeleteChapterNineApp(id, deletedAppIds);
                return (
                  <motion.button
                    key={id}
                    layout
                    initial={{ opacity: 0, scale: 0.86 }}
                    animate={{ opacity: available ? 1 : 0.36, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6, y: 10 }}
                    transition={{ duration: reducedMotion ? 0 : 0.22 }}
                    type="button"
                    onClick={() => requestDelete(id)}
                    className="group relative flex min-w-0 flex-col items-center gap-1.5"
                    id={`chapter-nine-delete-${id}`}
                    data-delete-available={available}
                    data-meta-immediate="true"
                  >
                    <span className="absolute right-[13%] top-[-3px] z-10 flex h-4 w-4 items-center justify-center rounded-full border border-white/70 bg-slate-800 text-white shadow">
                      <X className="h-2.5 w-2.5" />
                    </span>
                    <span className="h-[clamp(58px,6.7cqw,88px)] w-[clamp(58px,6.7cqw,88px)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]">
                      <Icon />
                    </span>
                    <span className="max-w-full truncate text-[9px] text-slate-200">{label}</span>
                    <span className="font-mono text-[7px] text-slate-600">{localData}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-3 border-t border-white/[0.06] pt-2 font-mono text-[7px] text-slate-600">
            System utilities will be removed during the required restart.
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-6 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            id="chapter-nine-delete-confirmation"
            data-delete-target={selected.id}
          >
            <motion.div
              initial={{ y: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.98 }}
              animate={{ y: 0, scale: 1 }}
              className="w-[min(88%,420px)] rounded-2xl border border-white/[0.12] bg-[#171c27] p-4 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0"><selected.Icon /></div>
                <div>
                  <div className="font-mono text-[7px] tracking-[0.16em] text-red-300/70">DELETE APP AND LOCAL DATA</div>
                  <h3 className="mt-1 text-[14px] font-semibold text-white">{selected.label}</h3>
                  <p className="mt-1 text-[9px] leading-relaxed text-slate-400">
                    {selected.id === 'messages' && messageAttempts > 0
                      ? standoff.body
                      : `${selected.localData} is stored only on this device. This cannot be undone.`}
                  </p>
                </div>
              </div>

              {selected.id === 'messages' && messageAttempts > 0 && (
                <div
                  className={`mt-3 rounded-lg border px-3 py-2 ${messageAttempts >= 3 ? 'animate-pulse border-red-300/40 bg-red-300/10' : 'border-amber-300/20 bg-amber-300/[0.06]'}`}
                  id="chapter-nine-messages-standoff"
                  data-standoff-attempt={messageAttempts}
                >
                  <div className="text-[9px] font-semibold text-amber-100">{standoff.title}</div>
                  {messageAttempts >= 3 && (
                    <div className="mt-1 font-mono text-[7px] text-red-200/70">DELETE / CANCEL · CONFLICTING INPUT · BATTERY CRITICAL</div>
                  )}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  disabled={selected.id === 'messages' && messageAttempts >= 3}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[9px] text-slate-300 hover:bg-white/[0.05] disabled:opacity-30"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={selected.id === 'messages' && messageAttempts >= 3}
                  className="rounded-lg border border-red-300/30 bg-red-300/10 px-3 py-2 text-[9px] font-semibold text-red-200 hover:bg-red-300/15 disabled:opacity-30"
                  id="chapter-nine-confirm-delete"
                  data-meta-immediate="true"
                >
                  {selected.id === 'messages' && messageAttempts > 0 ? standoff.action : 'DELETE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
