import React, { useEffect, useRef, useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { completePuzzleChapter } from '../lib/chapterProgress';
import {
  hasAssembledCase,
  REQUIRED_CLUE_IDS,
  type LumenArcClueId,
} from '../lib/lumenArcClues';
import {
  CHAPTER_FOUR_DIALOGUE,
  getChapterFourClueDialogue,
  getChapterFourDecoyDialogue,
  getChapterFourStalledDialogue,
  getChapterFourWrongDeliveryDialogue,
  type ChapterFourDecoySheetId,
  type ChapterFourDeliveryId,
  type ChapterFourSheetId,
  type ChapterFourWrongDeliveryId,
} from '../lib/chapterFourDialogue';
import { useReducedMotion } from '../lib/useReducedMotion';
import { LumenArcReveal } from './LumenArcReveal';
import { useMetaInteraction } from './MetaInteractionScene';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, FolderOpen, ImageIcon, PackageCheck, PackageOpen, Truck, X, ZoomIn } from 'lucide-react';

interface SavedScreenshotsProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

// A clue renderer wires one embedded phrase to the found-tracking handler; a
// decoy sheet simply never calls it. `clue` is `null` on decoys.
type ClueRenderer = ((label: React.ReactNode) => React.ReactNode) | null;

interface Sheet {
  id: ChapterFourSheetId;
  file: string;
  title: string;
  subtitle: string;
  angle: number;
  bg: string;
  textColor: string;
  clueId?: LumenArcClueId;
  content: (clue: ClueRenderer) => React.ReactNode;
}

interface DeliveryRecordBase {
  item: string;
  detail: string;
  date: string;
  status: string;
}

type DeliveryRecord =
  | (DeliveryRecordBase & { id: 'lumen-arc'; target: true })
  | (DeliveryRecordBase & { id: ChapterFourWrongDeliveryId; target?: false });

// This is a delivery archive, not a hand-authored evidence browser. The
// Lumen Arc parcel sits among ordinary orders the protagonist has actually
// received; only its signed attachment opens the Chapter 4 evidence folder.
const DELIVERY_RECORDS: readonly DeliveryRecord[] = [
  { id: 'tea', item: 'Cedar mint tea refills', detail: 'Kitchen supplies · 2 items', date: 'Today · 08:14', status: 'DELIVERED' },
  { id: 'bulb', item: 'Warm filament bulbs', detail: 'Home lighting · 4 pack', date: 'Yesterday · 18:42', status: 'DELIVERED' },
  { id: 'lumen-arc', item: 'Lumen Arc Recovery Lot', detail: 'coldboot_17 · recovery lot contents indexed', date: 'Yesterday · 17:03', status: 'SIGNED', target: true },
  { id: 'notebook', item: 'Grid notebook, charcoal', detail: 'Stationery · 1 item', date: 'Mon · 13:19', status: 'DELIVERED' },
  { id: 'cable', item: 'Braided charging cable', detail: 'Electronics · 2 m', date: 'Sun · 11:06', status: 'DELIVERED' },
  { id: 'filters', item: 'Coffee filters, cone 02', detail: 'Kitchen supplies · 100 count', date: 'Fri · 09:51', status: 'DELIVERED' },
  { id: 'tape', item: 'Archival tape, matte', detail: 'Office supplies · 3 rolls', date: 'Wed · 16:22', status: 'DELIVERED' },
];

// Ten screenshots, dumped in no particular order. Three hide a detail; the rest
// are the ordinary residue of a used device — battery, storage, a stranger's
// notes. The three that matter are never marked as special anywhere; only the
// embedded phrase itself is clickable, and only once the player reads far
// enough to notice it.
const SHEETS: readonly Sheet[] = [
  {
    id: 'battery',
    file: 'IMG_0142.png',
    title: 'Battery',
    subtitle: 'Settings capture — power',
    angle: -3,
    bg: 'bg-[#f4f4f5]',
    textColor: 'text-zinc-800',
    content: () => (
      <div className="space-y-2 p-1 font-sans text-[10px] text-zinc-700">
        <div className="flex items-center justify-between border-b border-zinc-300 pb-1 font-mono text-[9px] text-zinc-500">
          <span>BATTERY</span><span>21:47</span>
        </div>
        <div className="text-center"><span className="font-display text-2xl font-black text-zinc-800">84%</span></div>
        <div className="flex justify-between"><span>Maximum capacity</span><span className="font-mono">84%</span></div>
        <div className="flex justify-between"><span>Charge cycles</span><span className="font-mono">611</span></div>
        <p className="border-t border-zinc-200 pt-1.5 text-[9px] text-zinc-500">Battery health is degraded. Service recommended. Peak performance may be affected.</p>
      </div>
    ),
  },
  {
    id: 'home',
    file: 'IMG_0088.png',
    title: 'Home screen',
    subtitle: "Previous owner's apps, still installed",
    angle: -1,
    bg: 'bg-[#faf6e8]',
    textColor: 'text-amber-950',
    clueId: 'title',
    content: (clue) => (
      <div className="space-y-3 p-1 font-sans text-amber-900">
        <div className="flex items-center justify-between border-b-2 border-amber-900/20 pb-1.5 font-mono text-[9px]">
          <span className="font-bold">LAOS · HOME</span><span className="rounded bg-amber-200 px-1 text-amber-800">21:47</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['Weather', 'Clock', 'Notes', 'Camera', 'Maps', 'Music'].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="h-8 w-8 rounded-lg border border-amber-900/15 bg-white/50" />
              <span className="text-[7px] opacity-70">{label}</span>
            </div>
          ))}
          {/* One tile is a leftover game the previous owner never deleted. */}
          <div className="col-span-2 flex items-center gap-2 rounded-lg border border-amber-900/15 bg-white/60 p-1.5">
            <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg border border-amber-900/20 bg-amber-950">
              <div className="scale-75 font-mono text-[7px] font-bold uppercase tracking-widest text-amber-200">SKG</div>
              <div className="mt-0.5 h-3.5 w-3.5 rounded-full border border-amber-900 bg-amber-400" />
            </div>
            <div className="leading-tight">
              <div className="text-[7px] text-amber-700">Games</div>
              <div className="font-display text-[11px] font-black">
                {clue ? clue('Skyline 256') : 'Skyline 256'}
              </div>
            </div>
          </div>
        </div>
        <p className="text-[9px] leading-relaxed text-amber-800/80">Seller note: didn't wipe it, some old apps are still on here.</p>
      </div>
    ),
  },
  {
    id: 'storage',
    file: 'IMG_0143.png',
    title: 'Storage',
    subtitle: 'Settings capture — space used',
    angle: 3,
    bg: 'bg-[#f4f4f5]',
    textColor: 'text-zinc-800',
    content: () => (
      <div className="space-y-2 p-1 font-sans text-[10px] text-zinc-700">
        <div className="flex items-center justify-between border-b border-zinc-300 pb-1 font-mono text-[9px] text-zinc-500"><span>STORAGE</span><span>11.9 GB free</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-200"><div className="flex h-full"><div className="w-[26%] bg-zinc-500" /><div className="w-[7%] bg-zinc-400" /><div className="w-[9%] bg-zinc-300" /></div></div>
        <div className="space-y-1">
          <div className="flex justify-between"><span>Games</span><span className="font-mono">4.2 GB</span></div>
          <div className="flex justify-between"><span>Photos</span><span className="font-mono">1.1 GB</span></div>
          <div className="flex justify-between"><span>System</span><span className="font-mono">1.4 GB</span></div>
        </div>
      </div>
    ),
  },
  {
    id: 'calibration',
    file: 'IMG_0091.png',
    title: 'Game options',
    subtitle: 'Left open on a settings menu',
    angle: -4,
    bg: 'bg-[#f0f9ff]',
    textColor: 'text-sky-950',
    clueId: 'params',
    content: (clue) => (
      <div className="space-y-3 p-1 font-sans text-sky-900">
        <div className="flex items-center justify-between border-b-2 border-sky-900/20 pb-1.5 font-mono text-[9px]">
          <span className="font-bold">FLIGHT · CALIBRATION</span><span className="rounded bg-sky-200 px-1 font-bold text-sky-800">ADVANCED</span>
        </div>
        <div className="space-y-1.5 rounded border border-sky-900/10 bg-sky-950/[0.04] p-2 font-mono text-[10px]">
          <div className="flex justify-between border-b border-sky-900/10 pb-1 text-[9px] font-bold"><span>AXIS</span><span>LIMIT</span></div>
          <div className="flex justify-between"><span>Altitude</span><span className="font-bold">0 – 256 m</span></div>
          <div className="flex justify-between"><span>Gate index</span><span className="font-bold">0 – 256</span></div>
          <div className="flex justify-between"><span>End buffer</span><span className="font-bold">overflow</span></div>
        </div>
        <p className="border-t border-sky-900/10 pt-1.5 text-[9px] italic leading-relaxed text-sky-800/90">
          Frame order (do not edit): {clue ? clue('ALT · GATE · END') : 'ALT · GATE · END'}
        </p>
      </div>
    ),
  },
  {
    id: 'box',
    file: 'IMG_0067.png',
    title: 'What came in the box',
    subtitle: 'Photo — accessories',
    angle: 2,
    bg: 'bg-[#fafaf9]',
    textColor: 'text-stone-800',
    content: () => (
      <div className="space-y-2 p-1 font-sans text-[10px] text-stone-700">
        <div className="flex gap-2">
          <div className="h-12 w-16 shrink-0 rounded border border-stone-300 bg-stone-200" />
          <div className="h-12 w-10 shrink-0 rounded border border-stone-300 bg-stone-200" />
        </div>
        <p className="leading-relaxed">Comes with the original charger and a slightly frayed cable. No manual, no receipt. Case has light scuffs on the back corner.</p>
      </div>
    ),
  },
  {
    id: 'network',
    file: 'IMG_0144.png',
    title: 'Wi-Fi',
    subtitle: 'Settings capture — network',
    angle: -2,
    bg: 'bg-[#f4f4f5]',
    textColor: 'text-zinc-800',
    content: () => (
      <div className="space-y-1.5 p-1 font-sans text-[10px] text-zinc-700">
        <div className="border-b border-zinc-300 pb-1 font-mono text-[9px] text-zinc-500">WI-FI</div>
        {[['HOME-2F', 'saved'], ['xfinitywifi', 'weak'], ['NETGEAR-guest', 'locked']].map(([name, tag]) => (
          <div key={name} className="flex justify-between border-b border-zinc-100 py-0.5"><span className="font-mono">{name}</span><span className="text-[8px] uppercase text-zinc-400">{tag}</span></div>
        ))}
      </div>
    ),
  },
  {
    id: 'notes',
    file: 'IMG_0102.png',
    title: 'Notes',
    subtitle: "A stranger's to-do list",
    angle: 4,
    bg: 'bg-[#fefce8]',
    textColor: 'text-yellow-950',
    clueId: 'numbers',
    content: (clue) => (
      <div className="space-y-2 p-1 font-sans text-[10px] text-yellow-900">
        <div className="border-b-2 border-yellow-900/15 pb-1 font-mono text-[9px] font-bold text-yellow-800/80">NOTES · untitled</div>
        <ul className="space-y-1.5 leading-relaxed">
          <li>— pick up milk, bread</li>
          <li>— dentist thurs @ 3</li>
          <li>— return the drill to Sam</li>
          <li>— lucky combo again: {clue ? clue('184-40-256') : '184-40-256'}</li>
          <li>— call about the warranty</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'othergame',
    file: 'IMG_0110.png',
    title: 'CinderKart — best lap',
    subtitle: 'Photo of a different game',
    angle: -3,
    bg: 'bg-[#faf5ff]',
    textColor: 'text-purple-950',
    content: () => (
      <div className="space-y-2 p-1 text-center font-sans text-purple-900">
        <div className="font-display text-sm font-black">NEW RECORD!</div>
        <div className="font-mono text-2xl font-black text-purple-800">44,180</div>
        <p className="text-[9px] text-purple-700/80">Sunset Speedway · 3 laps · beat rival "turbo_gran"</p>
      </div>
    ),
  },
  {
    id: 'lockscreen',
    file: 'IMG_0001.png',
    title: 'Lock screen',
    subtitle: 'Photo — powered on',
    angle: 1,
    bg: 'bg-[#111827]',
    textColor: 'text-slate-200',
    content: () => (
      <div className="space-y-1 p-3 text-center font-sans text-slate-300">
        <div className="font-display text-3xl font-black text-white">21:47</div>
        <div className="text-[10px] text-slate-400">Tuesday · April 15</div>
        <div className="mt-3 text-[8px] uppercase tracking-widest text-slate-500">Lumen Arc · 12% charged</div>
      </div>
    ),
  },
  {
    id: 'about',
    file: 'IMG_0145.png',
    title: 'About this device',
    subtitle: 'Settings capture — model',
    angle: -1,
    bg: 'bg-[#f4f4f5]',
    textColor: 'text-zinc-800',
    content: () => (
      <div className="space-y-1.5 p-1 font-sans text-[10px] text-zinc-700">
        <div className="border-b border-zinc-300 pb-1 font-mono text-[9px] text-zinc-500">ABOUT</div>
        <div className="flex justify-between"><span>Model</span><span className="font-mono">Lumen Arc</span></div>
        <div className="flex justify-between"><span>System</span><span className="font-mono">LAOS 4.1</span></div>
        <div className="flex justify-between"><span>Serial</span><span className="font-mono">LA-••••-7731</span></div>
        <div className="flex justify-between"><span>Region</span><span className="font-mono">NA</span></div>
      </div>
    ),
  },
];

const CLUE_SHEET_COUNT = SHEETS.filter((sheet) => sheet.clueId).length;

export const SavedScreenshots: React.FC<SavedScreenshotsProps> = ({ progress, updateProgress }) => {
  const metaInteraction = useMetaInteraction();
  const reducedMotion = useReducedMotion();
  const [activeSheet, setActiveSheet] = useState<number | null>(null);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  // The package view appears first; the physical collapse begins only after
  // the player explicitly clicks the suspended parcel.
  const [revealPlaying, setRevealPlaying] = useState(false);
  // If the chapter is already complete (a later snapshot, or a re-visit), every
  // detail counts as found so the viewer shows its assembled state.
  const [found, setFound] = useState<Set<LumenArcClueId>>(
    () => (progress.discoveredOriginalTitle ? new Set(REQUIRED_CLUE_IDS) : new Set()),
  );
  const wrongDeliveryAttempts = useRef(new Map<ChapterFourDeliveryId, number>());
  const decoyAttempts = useRef(new Map<ChapterFourDecoySheetId, number>());
  const clueRepeatAttempts = useRef(new Map<LumenArcClueId, number>());
  const decoysSinceClue = useRef(0);
  const stalledAttempts = useRef(0);
  const packageOpenCount = useRef(0);
  const revealSeen = useRef(false);
  const completedRevisitSpoken = useRef(false);
  const completedHere = useRef(false);
  const caseDialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const assembled = hasAssembledCase(found);
  const activeDelivery = DELIVERY_RECORDS.find((record) => record.id === activeDeliveryId) ?? null;
  const chapterFourActive = progress.currentChapter === 4 && metaInteraction.active;

  useEffect(() => () => {
    if (caseDialogueTimer.current) clearTimeout(caseDialogueTimer.current);
  }, []);

  useEffect(() => {
    if (
      progress.currentChapter === 5
      && progress.discoveredOriginalTitle
      && metaInteraction.active
      && !completedHere.current
      && !completedRevisitSpoken.current
    ) {
      completedRevisitSpoken.current = true;
      metaInteraction.speak(CHAPTER_FOUR_DIALOGUE.completedRevisit);
    }
  }, [metaInteraction.active, metaInteraction.speak, progress.currentChapter, progress.discoveredOriginalTitle]);

  const openDelivery = (record: DeliveryRecord) => {
    if (record.id === 'lumen-arc') {
      // The reveal owns the physical opening sound and the first reaction. A
      // solved re-visit skips the theatre and goes straight to the image pile.
      if (!progress.discoveredOriginalTitle && !revealSeen.current) {
        revealSeen.current = true;
        setRevealPlaying(true);
      } else {
        audio.play('ui.primaryTap');
        if (chapterFourActive) {
          metaInteraction.speak(CHAPTER_FOUR_DIALOGUE.packetReentered);
          packageOpenCount.current += 1;
        }
      }
    } else {
      audio.play('ui.secondaryTap');
      if (chapterFourActive) {
        const attempt = wrongDeliveryAttempts.current.get(record.id) ?? 0;
        metaInteraction.speak(getChapterFourWrongDeliveryDialogue(record.id, attempt));
        wrongDeliveryAttempts.current.set(record.id, attempt + 1);
      }
    }
    setActiveDeliveryId(record.id);
  };

  const findClue = (clueId: LumenArcClueId) => {
    if (found.has(clueId)) {
      audio.play('ui.secondaryTap');
      if (chapterFourActive) {
        const attempt = clueRepeatAttempts.current.get(clueId) ?? 0;
        metaInteraction.speak(getChapterFourClueDialogue(clueId, attempt));
        clueRepeatAttempts.current.set(clueId, attempt + 1);
      }
      return;
    }
    audio.play('story.clueUnlock');
    const willAssemble = REQUIRED_CLUE_IDS.every((id) => id === clueId || found.has(id));
    if (chapterFourActive) {
      metaInteraction.speak(getChapterFourClueDialogue(clueId));
      decoysSinceClue.current = 0;
      if (willAssemble) {
        if (caseDialogueTimer.current) clearTimeout(caseDialogueTimer.current);
        caseDialogueTimer.current = setTimeout(() => {
          metaInteraction.speak(CHAPTER_FOUR_DIALOGUE.caseAssembled);
          caseDialogueTimer.current = null;
        }, 850);
      }
    }
    setFound((prev) => {
      const next = new Set(prev);
      next.add(clueId);
      return next;
    });
  };

  // Only a sheet that owns a clue produces a live, clickable phrase; decoys pass
  // `null` and render their text plain.
  const clueRendererFor = (sheet: Sheet): ClueRenderer => {
    if (!sheet.clueId) return null;
    const clueId = sheet.clueId;
    return (label: React.ReactNode) => {
      const isFound = found.has(clueId);
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            findClue(clueId);
          }}
          data-clue-word={clueId}
          data-clue-found={isFound || undefined}
          className={`mx-0.5 inline-flex items-center gap-0.5 rounded px-1 font-semibold underline decoration-dotted decoration-2 underline-offset-2 transition-colors ${
            isFound
              ? 'bg-emerald-300/70 text-emerald-950 decoration-emerald-700'
              : 'decoration-current/40 hover:bg-yellow-200/80 hover:text-black'
          }`}
        >
          {label}
          {isFound && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>
      );
    };
  };

  const handleContinue = () => {
    audio.play('ui.primaryTap');
    audio.play('story.clueUnlock', { delay: 0.16 });
    if (caseDialogueTimer.current) {
      clearTimeout(caseDialogueTimer.current);
      caseDialogueTimer.current = null;
    }
    completedHere.current = true;
    if (chapterFourActive) metaInteraction.speak(CHAPTER_FOUR_DIALOGUE.completed);
    updateProgress((prev) => completePuzzleChapter(prev, 4, { discoveredOriginalTitle: true }));
  };

  const closeActiveSheet = () => {
    audio.play('phone.modalClose');
    setActiveSheet(null);
  };

  const openSheet = (index: number) => {
    audio.play('screenshot.zoom');
    const sheet = SHEETS[index];
    if (chapterFourActive && !sheet.clueId) {
      const decoyId = sheet.id as ChapterFourDecoySheetId;
      const attempt = decoyAttempts.current.get(decoyId) ?? 0;
      const observation = getChapterFourDecoyDialogue(decoyId, attempt);
      decoyAttempts.current.set(decoyId, attempt + 1);
      decoysSinceClue.current += 1;
      if (decoysSinceClue.current % 3 === 0) {
        metaInteraction.speak([
          ...observation,
          ...getChapterFourStalledDialogue(stalledAttempts.current),
        ]);
        stalledAttempts.current += 1;
      } else {
        metaInteraction.speak(observation);
      }
    }
    setActiveSheet(index);
  };

  const viewingLumenPackage = activeDeliveryId === 'lumen-arc';

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[var(--laos-bg)] font-sans text-[var(--laos-text)]" id="screenshots-root">
      {!viewingLumenPackage ? (
        <>
          <div className="flex items-center justify-between border-b border-[var(--laos-line)] bg-[var(--laos-surface)] p-3" id="delivery-archive-header">
            <div className="flex items-center gap-1.5 font-laos text-xs font-semibold tracking-wide">
              <PackageOpen className="h-4 w-4 text-amber-300" strokeWidth={1.5} />
              <span>Delivery Archive</span>
            </div>
            <span className="laos-label text-[8px] text-[var(--laos-dim)]">7 SIGNED PARCELS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5" id="delivery-archive">
            <div className="mb-4 rounded-md border border-[var(--laos-line)] bg-[var(--laos-surface)] p-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <Truck className="h-4 w-4 text-sky-300" /> Recent deliveries
              </div>
              <p className="mt-1 text-[9px] leading-relaxed text-[var(--laos-dim)]">Signed parcels, household orders, and old purchase records kept on this device.</p>
            </div>

            <div className="space-y-2">
              {DELIVERY_RECORDS.map((record) => (
                <button
                  type="button"
                  key={record.id}
                  onClick={() => openDelivery(record)}
                  data-delivery-id={record.id}
                  className="w-full rounded-md border border-[var(--laos-line)] bg-[var(--laos-surface)] p-3 text-left transition-colors hover:border-[var(--laos-line-bright)] hover:bg-[var(--laos-surface-hover)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold"><PackageCheck className="h-3.5 w-3.5 shrink-0 text-[var(--laos-dim)]" />{record.item}</div>
                      <p className="mt-1 truncate text-[9px] text-[var(--laos-dim)]">{record.detail}</p>
                    </div>
                    <span className={`laos-label shrink-0 text-[8px] ${record.status === 'SIGNED' ? 'text-amber-300' : 'text-[var(--laos-dim)]'}`}>{record.status}</span>
                  </div>
                  <div className="mt-2 border-t border-[var(--laos-line-dim)] pt-1.5 font-mono text-[8px] text-[var(--laos-dim)]">{record.date}</div>
                </button>
              ))}
            </div>

            {activeDelivery && !activeDelivery.target && (
              <div className="mt-3 rounded-md border border-[var(--laos-line-dim)] bg-[var(--laos-bg)] p-3 text-[9px] text-[var(--laos-dim)]" id="delivery-selection">
                <span className="font-semibold text-[var(--laos-text)]">{activeDelivery.item}</span> arrived normally. Nothing here belongs to the old game case.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-[var(--laos-line)] bg-[var(--laos-surface)] p-3" id="spec-header">
            <div className="flex min-w-0 items-center gap-2 font-laos text-xs font-semibold tracking-wide text-[var(--laos-text)]">
              <button type="button" onClick={() => { audio.play('phone.modalClose'); setActiveDeliveryId(null); setActiveSheet(null); }} className="rounded p-1 text-[var(--laos-dim)] hover:bg-[var(--laos-surface-hover)]" id="delivery-back-to-archive" aria-label="Back to delivery archive">
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              </button>
              <FolderOpen className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={1.5} />
              <span className="truncate">Lumen Arc Recovery Lot</span>
            </div>
            <div
              className={`min-w-[108px] rounded-md border-2 px-2.5 py-1 text-right transition-colors ${assembled ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : 'border-amber-300/60 bg-[var(--laos-bg)] text-amber-200'}`}
              data-clues-found={found.size}
              id="spec-clue-counter"
            >
              <div className="laos-label text-[8px]">KEY DETAILS</div>
              <div className="font-mono text-base font-black leading-none">{found.size}<span className="text-[10px] opacity-75">/{CLUE_SHEET_COUNT}</span></div>
              <div className="mt-0.5 text-[7px] font-semibold">{assembled ? 'CASE ASSEMBLED' : 'IMAGE PACKET'}</div>
            </div>
          </div>

      {/* The signed parcel contains an uncurated attachment bundle. */}
      <div className="relative flex-1 space-y-3 overflow-y-auto p-3.5" id="spec-workspace">
        <div className="text-center font-laos text-[10px] text-[var(--laos-dim)]">
          coldboot_17 · signed image packet attached. Three details may belong to the same case.
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3" id="spec-pile">
          {SHEETS.map((sheet, index) => (
            <motion.button
              type="button"
              key={sheet.id}
              onClick={() => openSheet(index)}
              onHoverStart={() => audio.play('screenshot.rotate')}
              whileHover={{ scale: 1.03, rotate: sheet.angle * 0.6, zIndex: 5 }}
              style={{ rotate: `${sheet.angle}deg` }}
              data-sheet-id={sheet.id}
              data-sheet-kind={sheet.clueId ? 'clue' : 'decoy'}
              className={`paper-texture paper-crease relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-sm border border-black/20 p-2.5 text-left shadow-[0_10px_22px_rgba(0,0,0,0.45)] ${sheet.bg} ${sheet.textColor}`}
            >
              <span className="pointer-events-none absolute -top-0.5 left-6 h-1.5 w-3 rotate-[8deg] rounded-sm bg-gradient-to-b from-stone-400 to-stone-600 shadow-sm" />
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h4 className="font-display text-[11px] font-black leading-tight">{sheet.title}</h4>
                  <p className="truncate text-[8px] leading-normal opacity-70">{sheet.subtitle}</p>
                </div>
                <ImageIcon className="h-3.5 w-3.5 shrink-0 opacity-40" />
              </div>
              <div className="mt-1 text-right font-mono text-[8px] opacity-50">{sheet.file}</div>
            </motion.button>
          ))}
        </div>

        {/* Case-assembled banner + advance, only once all three are found. */}
        <AnimatePresence>
          {assembled && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="sticky bottom-0 z-10 rounded-md border border-emerald-300 bg-emerald-500/15 p-3 ring-1 ring-emerald-400/35 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]"
              id="spec-case-assembled"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-laos text-xs font-semibold text-emerald-300">
                    <Check className="h-4 w-4" strokeWidth={3} /> Case assembled — 3 / 3 key details
                  </div>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-[var(--laos-dim)]">The title, the flight frame, and the number set all line up.</p>
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex shrink-0 items-center gap-1 rounded bg-emerald-500 px-3 py-2 text-[11px] font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                  id="spec-continue-button"
                >
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoomed screenshot */}
        <AnimatePresence>
          {activeSheet !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col justify-center bg-black/90 p-4 font-sans"
              id="spec-modal"
            >
              <motion.div
                initial={{ scale: 0.92, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 10 }}
                className={`paper-texture halftone-zoom flex max-h-full flex-col justify-between overflow-y-auto rounded-sm p-4 shadow-2xl ${SHEETS[activeSheet].bg} ${SHEETS[activeSheet].textColor}`}
              >
                <div>
                  <div className="mb-3 flex items-start justify-between border-b border-current pb-2">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">{SHEETS[activeSheet].file}</span>
                      <h3 className="font-display text-sm font-black">{SHEETS[activeSheet].title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeActiveSheet}
                      className="rounded-full p-1 transition-colors hover:bg-black/10"
                      id="spec-close-button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {SHEETS[activeSheet].content(clueRendererFor(SHEETS[activeSheet]))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-current/20 pt-2 font-mono text-[9px] opacity-60">
                  <span className="flex items-center gap-1"><ZoomIn className="h-3 w-3" /> Lumen_Arc_Screenshots.zip</span>
                  <span>{String(activeSheet + 1).padStart(2, '0')} / {SHEETS.length}</span>
                </div>
                <button
                  type="button"
                  onClick={closeActiveSheet}
                  data-meta-immediate="true"
                  data-meta-hit-recovery="true"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-current/30 bg-black/80 px-3 py-2 font-laos text-[10px] font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-black/95"
                  id="spec-back-to-screenshots"
                  aria-label="Back to Lumen Arc screenshots"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" /> BACK
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        </>
      )}

      {revealPlaying && viewingLumenPackage && (
        <LumenArcReveal
          reducedMotion={reducedMotion}
          onComplete={() => {
            setRevealPlaying(false);
            if (chapterFourActive) {
              metaInteraction.speak(CHAPTER_FOUR_DIALOGUE.packageOpened);
              packageOpenCount.current += 1;
            }
          }}
        />
      )}
    </div>
  );
};
