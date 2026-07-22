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
  layer?: 'lighting' | 'underlay' | 'objects';
  /** Share the tablet's resting camera scale so desk props remain one scene. */
  deviceResting?: boolean;
}

const COFFEE_ASSET_SOURCE: Record<Exclude<CoffeeState, 'none'>, string> = {
  fresh: '/assets/coffee-full.png',
  sipped: '/assets/coffee-full.png',
  half: '/assets/coffee-empty-drip.png',
  'near-empty': '/assets/coffee-empty-drip.png',
  empty: '/assets/coffee-empty-drip.png',
  'tipped-empty': '/assets/coffee-tipped-spill.png',
  'pushed-away': '/assets/coffee-empty-drip.png',
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

const CoffeeCup: React.FC<{
  state: CoffeeState;
  ring: boolean;
  steam: boolean;
  drip: boolean;
  spill: boolean;
  animateLayout: boolean;
  deviceResting: boolean;
}> = ({ state, ring, steam, drip, spill, animateLayout, deviceResting }) => {
  if (state === 'none') return null;
  const pushedAway = state === 'pushed-away';
  const tipped = state === 'tipped-empty';
  const assetSource = COFFEE_ASSET_SOURCE[state];
  const positionClass = deviceResting
    ? (pushedAway ? 'right-[7%] top-[51%] scale-[2.1]' : tipped ? 'right-[14%] top-[53%] scale-[2.5]' : 'right-[12%] top-[48%] scale-[2.7]')
    : (pushedAway ? 'right-[7%] top-[65%] scale-[2.1]' : tipped ? 'right-[14%] top-[67%] scale-[2.5]' : 'right-[12%] top-[62%] scale-[2.7]');

  // Position is anchored purely in CSS and eased with a CSS transition —
  // deliberately NOT Framer's `layout`. This desk layer sits inside an env
  // whose `scale` is Framer-animated when the device rests; a `layout` child
  // inside a scale-animated parent measures its own already-transformed box
  // and re-projects against it, so rapidly interrupting the animation (jumping
  // chapters / toggling the dev panel mid-transition) compounds the projection
  // and the 2.7x-scaled cup runs away across the desk. A CSS transform can't
  // compound: the browser always re-renders it from its declared value.
  const motionClass = animateLayout
    ? 'transition-[top,right,scale] duration-[620ms] ease-out'
    : '';

  return (
    <div
      className={`absolute z-[3] h-[27%] w-[17%] min-w-36 origin-bottom-right ${motionClass} ${positionClass}`}
      data-composition-offset={deviceResting ? 'resting-coffee-up-14' : 'upright-original'}
      data-coffee-state={state}
      data-coffee-asset-state={tipped ? 'tipped' : state === 'fresh' || state === 'sipped' ? 'full' : 'empty'}
      data-coffee-drip={drip || undefined}
      data-coffee-spill={spill || undefined}
      id="meta-desk-coffee"
    >
      {ring && !tipped && (
        <div
          className="absolute left-[14%] top-[84%] h-[14%] w-[67%] rounded-[50%] border-[3px] border-amber-950/35 opacity-60 blur-[0.4px]"
          id="meta-coffee-ring"
        />
      )}
      {steam && (
        <svg className="absolute -top-[94%] left-[2%] z-[1] h-[100%] w-[92%] overflow-visible" viewBox="0 0 100 100" id="meta-coffee-steam" aria-hidden="true">
          {[28, 50, 72].map((x, index) => (
            <motion.path
              key={x}
              d={`M${x} 92 C${x - 11} 70 ${x + 13} 57 ${x} 30 C${x - 7} 18 ${x + 5} 10 ${x + 1} 2`}
              fill="none"
              stroke="rgba(237, 228, 213, 0.45)"
              strokeLinecap="round"
              strokeWidth="5"
              initial={{ opacity: 0.15, y: 8 }}
              animate={{ opacity: [0.12, 0.52, 0.08], y: [8, -4, -12] }}
              transition={{ duration: 2.2 + index * 0.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
            />
          ))}
        </svg>
      )}
      <img
        src={assetSource}
        alt=""
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.36)]"
        id="meta-coffee-png"
      />
    </div>
  );
};

// None of the desk objects use Framer's `layout` — they live inside an env
// whose `scale` is Framer-animated when the device rests, and a `layout` child
// there re-projects against its own already-transformed box, compounding into
// a runaway when the animation is interrupted (chapter jumps / dev-panel
// toggles mid-transition). CSS transitions ease the same moves without ever
// compounding.
const ChargingCable: React.FC<{ connected: boolean; animateLayout: boolean; part: 'insert' | 'body' }> = ({ connected, animateLayout, part }) => (
  <svg
    viewBox="0 0 500 140"
    className={`absolute bottom-[15.5%] right-[-5%] z-[2] h-[12%] w-[39%] origin-bottom-right scale-[1.7] overflow-visible opacity-75 drop-shadow-[0_5px_4px_rgba(0,0,0,0.45)] ${animateLayout ? 'transition-transform duration-[620ms] ease-out' : ''}`}
    data-composition-offset="cable-right-3"
    data-cable-state={connected ? 'connected' : 'loose'}
    data-cable-layer={part === 'insert' ? 'underlay' : 'foreground'}
    data-plug-target={connected && part === 'insert' ? 'phone-bottom-port' : undefined}
    id={part === 'insert' ? 'meta-cable-insert-layer' : 'meta-desk-cable'}
  >
    {part === 'insert' && connected ? (
      <>
        <rect x="64" y="50" width="9" height="16" rx="2" fill="#aeb4bc" id="meta-cable-plug-tip" />
        <rect x="65.5" y="49" width="6" height="6" rx="2" fill="#171a1f" id="meta-cable-inserted-end" />
      </>
    ) : part === 'body' ? (
      <>
        <path
          d={connected ? 'M650 116 C590 116 552 116 510 116 C430 116 422 44 338 54 C273 62 256 100 187 83 C143 72 119 70 78 70' : 'M650 116 C590 116 552 116 510 116 C430 116 422 44 338 54 C273 62 252 101 194 90 C164 84 145 81 120 94'}
          fill="none"
          stroke="#24262a"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={connected ? 'M650 114 C590 114 552 114 510 114 C430 114 422 42 338 52 C273 60 256 98 187 81 C143 70 119 68 78 68' : 'M650 114 C590 114 552 114 510 114 C430 114 422 42 338 52 C273 60 252 99 194 88 C164 82 145 79 120 92'}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {connected && (
          <>
            <rect x="57" y="63" width="23" height="14" rx="4" fill="#343840" stroke="#747b85" strokeWidth="2" id="meta-cable-plug-housing" />
            <path d="M61 66 H76" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {!connected && <rect x="102" y="80" width="28" height="24" rx="5" fill="#343840" stroke="#747b85" strokeWidth="2" />}
      </>
    ) : null}
  </svg>
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
    <div
      className={`absolute z-[5] h-[5px] w-[17%] min-w-28 origin-left scale-[1.35] rounded-full bg-gradient-to-r from-[#15181c] via-[#464d58] to-[#111318] shadow-[0_4px_4px_rgba(0,0,0,0.38)] ${animateLayout ? 'transition-[left,top,rotate,scale] duration-[620ms] ease-out' : ''} ${poseClass[state]}`}
      data-pen-state={state}
      id="meta-desk-pen"
    >
      <div className="absolute right-0 top-[-1px] h-[7px] w-[9%] rounded-r-full bg-[#b4a88f]" />
      <div className="absolute left-[12%] top-[-2px] h-[9px] w-[3px] bg-white/20" />
    </div>
  );
};

const Notebook: React.FC<{ state: NotebookState; stickyNote: string | null; position: 'default' | 'lowered'; animateLayout: boolean }> = ({ state, stickyNote, position, animateLayout }) => {
  if (state === 'none') return null;
  const copy = NOTEBOOK_COPY[state];
  const isClosed = state === 'closed';

  return (
    <div
      className={`absolute left-[4%] ${position === 'lowered' ? 'top-[75%]' : 'top-[68%]'} z-[3] h-[20%] w-[24%] min-w-56 origin-bottom-left scale-[1.35] -rotate-[4deg] rounded-sm shadow-[0_16px_18px_rgba(0,0,0,0.38)] ${animateLayout ? 'transition-[top,scale,rotate] duration-[620ms] ease-out' : ''} ${isClosed ? 'bg-[#243a42]' : 'bg-[#d6ccb7]'}`}
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
    </div>
  );
};

const TeaService: React.FC = () => (
  <div className="absolute right-[25%] top-[72%] z-[4] h-[18%] w-[15%] scale-[1.3]" id="meta-desk-tea-service">
    <div className="absolute right-0 top-[4%] h-[64%] w-[52%] rounded-md border border-[#aeb8ab]/40 bg-gradient-to-r from-[#34433f] via-[#6c8174] to-[#29352f] shadow-[0_9px_12px_rgba(0,0,0,0.34)]" id="meta-desk-tea-machine">
      <div className="absolute left-[16%] top-[13%] h-[16%] w-[62%] rounded-sm bg-[#17211d]" />
      <div className="absolute left-[31%] top-[38%] h-[19%] w-[30%] rounded-full bg-emerald-200/65 shadow-[0_0_8px_rgba(110,231,183,0.5)]" />
      <div className="absolute left-[36%] top-[63%] h-[29%] w-[23%] rounded-b-sm bg-[#171b19]" />
    </div>
    <div className="absolute bottom-0 left-[3%] h-[42%] w-[33%] rounded-b-[38%] rounded-t-[18%] border border-[#d3d0b5]/60 bg-gradient-to-r from-[#8a9b83] via-[#d2d8bd] to-[#71816c] shadow-[0_7px_9px_rgba(0,0,0,0.35)]" id="meta-desk-tea-cup">
      <div className="absolute -top-[10%] left-[5%] h-[22%] w-[89%] rounded-[50%] border border-[#d3d0b5]/55 bg-[#8e7335]" />
      <div className="absolute -right-[43%] top-[25%] h-[30%] w-[43%] rounded-r-full border-[3px] border-l-0 border-[#b7c1ab]/65" />
      <div className="absolute left-[43%] top-[76%] h-[48%] w-px bg-[#c8b865]" />
      <div className="absolute left-[30%] top-[119%] grid h-[22%] w-[28%] place-items-center bg-[#d8c65e] text-[4px] font-bold text-[#39402b] shadow-sm" id="meta-tea-bag-tag">TEA</div>
    </div>
  </div>
);

const PaperBalls: React.FC = () => (
  <div className="absolute bottom-[13%] left-[31%] z-[4] h-[11%] w-[25%]" id="meta-desk-paper-balls">
    {[
      'left-[2%] top-[38%] h-[32%] w-[12%] rotate-[21deg]',
      'left-[17%] top-[5%] h-[42%] w-[15%] rotate-[-17deg]',
      'left-[38%] top-[40%] h-[29%] w-[11%] rotate-[31deg]',
      'left-[57%] top-[10%] h-[45%] w-[16%] rotate-[-25deg]',
    ].map((className, index) => (
      <div key={index} className={`absolute rounded-[48%_52%_44%_56%] bg-[#b7aa92] shadow-[inset_2px_2px_3px_rgba(255,255,255,0.2),0_4px_5px_rgba(0,0,0,0.34)] ${className}`} />
    ))}
  </div>
);

export const ChapterEnvironment: React.FC<ChapterEnvironmentProps> = ({
  chapter,
  reducedMotion,
  layer = 'objects',
  deviceResting = false,
}) => {
  const environment = getChapterEnvironment(chapter);
  if (chapter === 0) return null;

  const transition = reducedMotion ? { duration: 0.12 } : { duration: 0.62, ease: 'easeOut' as const };

  if (layer === 'lighting') {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={transition}
        className={`pointer-events-none absolute inset-0 z-[1] ${LIGHTING_CLASS[environment.lighting]}`}
        data-lighting={environment.lighting}
        id="meta-desk-lighting"
      />
    );
  }

  const underlay = layer === 'underlay';

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${underlay ? 'z-[9]' : 'z-[25]'}`}
      animate={{ scale: deviceResting ? 0.87 : 1, x: deviceResting ? '4%' : 0, y: deviceResting ? '2%' : 0 }}
      transition={transition}
      style={{ transformOrigin: '50% 72%' }}
      data-environment-chapter={chapter}
      data-desk-order={environment.deskOrder}
      data-environment-layer={underlay ? 'underlay' : 'foreground'}
      data-desk-resting-scale={deviceResting ? 'shared' : 'full'}
      id={underlay ? 'meta-chapter-underlay' : 'meta-chapter-environment'}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${layer}-${chapter}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="absolute inset-0"
        >
          {underlay ? (
            <>
              <Notebook state={environment.notebook} stickyNote={environment.stickyNote} position={environment.notebookPosition} animateLayout={!reducedMotion} />
              <Pen state={environment.pen} animateLayout={!reducedMotion} />
              {environment.cable === 'connected' && <ChargingCable connected animateLayout={!reducedMotion} part="insert" />}
            </>
          ) : (
            <>
              <CoffeeCup state={environment.coffee} ring={environment.coffeeRing} steam={environment.coffeeSteam} drip={environment.coffeeDrip} spill={environment.coffeeSpill} animateLayout={!reducedMotion} deviceResting={deviceResting} />
              {environment.teaService && <TeaService />}
              {environment.paperBalls && <PaperBalls />}
              {environment.cable !== 'none' && <ChargingCable connected={environment.cable === 'connected'} animateLayout={!reducedMotion} part="body" />}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {!underlay && <AnimatePresence mode="wait">
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
      </AnimatePresence>}
    </motion.div>
  );
};
