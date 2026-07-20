import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  getChapterEnvironment,
  type CoffeeState,
  type EnvironmentChapter,
  type NotebookState,
  type PenState,
} from '../lib/chapterEnvironment';

interface ChapterEnvironmentProps {
  chapter: EnvironmentChapter;
  reducedMotion: boolean;
}

const COFFEE_LEVEL: Record<CoffeeState, number> = {
  none: 0,
  fresh: 82,
  sipped: 68,
  half: 50,
  'near-empty': 22,
  empty: 0,
  'pushed-away': 0,
};
const NOTEBOOK_COPY: Record<NotebookState, readonly string[]> = {
  none: [],
  closed: [],
  blank: [],
  skg: ['SKG', '?'],
  company: ['SILVER KITE GAMES', '→ SKG AUTOMATION', 'YEAR ?'],
  noah: ['NOAH KADE?', 'old posts / earliest'],
  numbers: ['184 — 40 — 256', 'ALT?  GATE?  END?'],
  password: ['184 / 40 / 256', 'ALT184GATE40END256'],
  quiet: [],
  route: ['184 · 172 · 149 · 133', '121 · 118 · 126 · 143'],
};

const LIGHTING_CLASS = {
  hidden: 'bg-transparent',
  cool: 'bg-[radial-gradient(circle_at_50%_62%,rgba(126,154,183,0.08),transparent_45%)]',
  focused: 'bg-[radial-gradient(circle_at_39%_70%,rgba(238,190,128,0.09),transparent_34%),linear-gradient(rgba(0,0,0,0.05),rgba(0,0,0,0.15))]',
  still: 'bg-[linear-gradient(rgba(6,8,12,0.13),rgba(0,0,0,0.24))]',
  ready: 'bg-[radial-gradient(circle_at_50%_66%,rgba(232,177,115,0.11),transparent_42%)]',
} as const;

const CoffeeCup: React.FC<{ state: CoffeeState; ring: boolean; animateLayout: boolean }> = ({ state, ring, animateLayout }) => {
  if (state === 'none') return null;
  const pushedAway = state === 'pushed-away';
  const level = COFFEE_LEVEL[state];

  return (
    <motion.div
      layout={animateLayout}
      className={`absolute z-[3] h-[11%] w-[8%] min-w-16 ${pushedAway ? 'right-[2.5%] top-[63%] scale-[0.82]' : 'right-[7%] top-[65%]'}`}
      data-coffee-state={state}
      id="meta-desk-coffee"
    >
      {ring && (
        <div
          className="absolute left-[5%] top-[78%] h-[34%] w-[72%] rounded-[50%] border-[3px] border-amber-950/35 opacity-60 blur-[0.4px]"
          id="meta-coffee-ring"
        />
      )}
      <div className="absolute left-[11%] top-[10%] h-[72%] w-[66%] rounded-b-[32%] rounded-t-[22%] border border-[#c8b5a1]/55 bg-gradient-to-r from-[#77685d] via-[#c2b09d] to-[#66574d] shadow-[0_12px_16px_rgba(0,0,0,0.34),inset_5px_0_8px_rgba(255,255,255,0.14)]">
        <div className="absolute -top-[8%] left-[-2%] h-[22%] w-[104%] overflow-hidden rounded-[50%] border border-[#d7c8b7]/60 bg-[#554a42] shadow-[inset_0_2px_3px_rgba(0,0,0,0.6)]">
          {level > 0 && (
            <div
              className="absolute inset-x-[6%] bottom-[7%] rounded-[50%] bg-[#2b160d] shadow-[inset_0_1px_2px_rgba(255,210,160,0.18)]"
              style={{ height: `${Math.max(28, level)}%`, opacity: 0.72 + level / 500 }}
            />
          )}
        </div>
      </div>
      <div className="absolute right-[1%] top-[27%] h-[42%] w-[30%] rounded-r-full border-[5px] border-l-0 border-[#9f8d7d]/70" />
    </motion.div>
  );
};

const ChargingCable: React.FC<{ connected: boolean; animateLayout: boolean }> = ({ connected, animateLayout }) => (
  <motion.svg
    layout={animateLayout}
    viewBox="0 0 500 140"
    className="absolute bottom-[19%] right-[-2%] z-[2] h-[12%] w-[39%] overflow-visible opacity-75 drop-shadow-[0_5px_4px_rgba(0,0,0,0.45)]"
    data-cable-state={connected ? 'connected' : 'loose'}
    id="meta-desk-cable"
  >
    <path
      d={connected ? 'M510 116 C430 116 422 44 338 54 C273 62 256 100 187 83 C143 72 115 60 72 63' : 'M510 116 C430 116 422 44 338 54 C273 62 252 101 194 90 C164 84 145 81 120 94'}
      fill="none"
      stroke="#24262a"
      strokeWidth="10"
      strokeLinecap="round"
    />
    <path
      d={connected ? 'M510 114 C430 114 422 42 338 52 C273 60 256 98 187 81 C143 70 115 58 72 61' : 'M510 114 C430 114 422 42 338 52 C273 60 252 99 194 88 C164 82 145 79 120 92'}
      fill="none"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x={connected ? 54 : 102} y={connected ? 49 : 80} width="28" height="24" rx="5" fill="#343840" stroke="#747b85" strokeWidth="2" />
    {connected && <rect x="46" y="55" width="10" height="12" rx="2" fill="#aeb4bc" />}
  </motion.svg>
);

const Pen: React.FC<{ state: PenState; animateLayout: boolean }> = ({ state, animateLayout }) => {
  if (state === 'none') return null;
  const poseClass: Record<Exclude<PenState, 'none'>, string> = {
    neat: 'left-[12%] top-[88%] rotate-[-7deg]',
    working: 'left-[23%] top-[70%] rotate-[28deg]',
    crossed: 'left-[18%] top-[70%] rotate-[47deg]',
    resting: 'left-[10%] top-[85%] rotate-[4deg]',
    route: 'left-[10%] top-[87%] rotate-0',
  };

  return (
    <motion.div
      layout={animateLayout}
      className={`absolute z-[5] h-[5px] w-[17%] min-w-28 origin-left rounded-full bg-gradient-to-r from-[#15181c] via-[#464d58] to-[#111318] shadow-[0_4px_4px_rgba(0,0,0,0.38)] ${poseClass[state]}`}
      data-pen-state={state}
      id="meta-desk-pen"
    >
      <div className="absolute right-0 top-[-1px] h-[7px] w-[9%] rounded-r-full bg-[#b4a88f]" />
      <div className="absolute left-[12%] top-[-2px] h-[9px] w-[3px] bg-white/20" />
    </motion.div>
  );
};

const Notebook: React.FC<{ state: NotebookState; stickyNote: string | null; animateLayout: boolean }> = ({ state, stickyNote, animateLayout }) => {
  if (state === 'none') return null;
  const copy = NOTEBOOK_COPY[state];
  const isClosed = state === 'closed';

  return (
    <motion.div
      layout={animateLayout}
      className={`absolute left-[5%] top-[64%] z-[3] h-[20%] w-[24%] min-w-56 origin-center -rotate-[4deg] rounded-sm shadow-[0_16px_18px_rgba(0,0,0,0.38)] ${isClosed ? 'bg-[#243a42]' : 'bg-[#d6ccb7]'}`}
      data-notebook-state={state}
      id="meta-desk-notebook"
    >
      {!isClosed && (
        <>
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#8e806b]/45 shadow-[2px_0_3px_rgba(0,0,0,0.12)]" />
          <div className="absolute inset-[7%] bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_15px,rgba(67,85,96,0.18)_16px)]" />
          <div className="absolute left-[9%] top-[14%] max-w-[78%] space-y-1.5 font-mono text-[clamp(7px,0.72vw,11px)] leading-tight tracking-[0.03em] text-[#24313a]/75">
            {copy.map((line, index) => (
              <div key={`${line}-${index}`} className={state === 'password' && index === 0 ? 'line-through opacity-45' : ''}>
                {line || '\u00a0'}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="absolute inset-y-0 left-[3%] w-[4px] bg-[#6f6250]/35" />
      {stickyNote !== null && (
        <div
          className="absolute -right-[12%] -top-[16%] grid h-[46%] w-[38%] rotate-[7deg] place-items-center bg-[#c9ba78] px-1 text-center font-mono text-[clamp(6px,0.62vw,9px)] font-bold leading-tight text-[#40391f]/75 shadow-[0_7px_9px_rgba(0,0,0,0.25)]"
          id="meta-desk-sticky-note"
        >
          {stickyNote || '\u00a0'}
        </div>
      )}
    </motion.div>
  );
};

export const ChapterEnvironment: React.FC<ChapterEnvironmentProps> = ({ chapter, reducedMotion }) => {
  const environment = getChapterEnvironment(chapter);
  if (chapter === 0) return null;

  const transition = reducedMotion ? { duration: 0.12 } : { duration: 0.62, ease: 'easeOut' as const };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      data-environment-chapter={chapter}
      data-desk-order={environment.deskOrder}
      id="meta-chapter-environment"
    >
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={transition}
        className={`absolute inset-0 ${LIGHTING_CLASS[environment.lighting]}`}
        data-lighting={environment.lighting}
        id="meta-desk-lighting"
      />

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`objects-${chapter}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="absolute inset-0"
        >
          <CoffeeCup state={environment.coffee} ring={environment.coffeeRing} animateLayout={!reducedMotion} />
          {environment.cable !== 'none' && <ChargingCable connected={environment.cable === 'connected'} animateLayout={!reducedMotion} />}
          <Notebook state={environment.notebook} stickyNote={environment.stickyNote} animateLayout={!reducedMotion} />
          <Pen state={environment.pen} animateLayout={!reducedMotion} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`case-${chapter}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
          animate={{ opacity: [0, 0.7, 0.7, 0] }}
          exit={{ opacity: 0 }}
          transition={reducedMotion ? { duration: 0.12 } : { duration: 1.8, times: [0, 0.18, 0.72, 1] }}
          className="absolute left-[8%] top-[14%] rounded-sm border border-amber-100/15 bg-black/20 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-amber-100/55"
          id="meta-case-marker"
        >
          CASE {chapter.toString().padStart(2, '0')} // {environment.caseLabel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
