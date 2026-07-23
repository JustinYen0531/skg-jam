import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import audio from '../lib/audio';
import music from '../lib/music';
import { useReducedMotion } from '../lib/useReducedMotion';

/**
 * The first-run title logo, driven by two taps.
 *
 *  1. A purple "quest" fades in and waits.
 *  2. First tap: it divides — a blue half pulls up, a red half pulls down, the
 *     two rush together and SLAM, and the impact bursts the rest of the
 *     wordmark physically outward from the coloured letters in white:
 *     "game questing," on top, "questioning game" below. The two finished
 *     lines then glide to centre.
 *  3. Second tap: two human blink-pairs reveal that the title was on a phone
 *     held inside the Meta room all along.
 *  4. Third tap: the game begins (onComplete).
 *
 * Each line is a real flex line with baseline alignment, so the coloured core
 * and the white parts always sit on one baseline. The core is measured so it
 * can stay centred through the split/slam and then auto-centre its whole line.
 * A sacred bell-tower toll lands on the division; a soft bloom on the burst.
 */

const COLORS = {
  purple: '#8b6cff',
  blue: '#57a5ff',
  red: '#ff5b57',
  white: '#f6f8fc',
} as const;

const LOGO_TEXT: React.CSSProperties = {
  fontFamily: 'var(--font-thought, "Courier Prime", "Courier New", monospace)',
  fontWeight: 700,
  letterSpacing: '0.015em',
  WebkitTextStroke: '0.6px currentColor',
  paintOrder: 'stroke fill',
  lineHeight: 1,
  userSelect: 'none',
  whiteSpace: 'pre',
};

type Phase = 'idle' | 'split' | 'collide' | 'burst' | 'center' | 'ready';
type PerspectivePhase = 'screen' | 'blinking' | 'settling' | 'meta-ready';

const SEQ = { collide: 650, burst: 950, center: 2000, ready: 2350 } as const;
const BLINK_SEQ = {
  firstOpen: 180,
  secondClose: 480,
  secondOpen: 680,
  thirdClose: 1000,
  revealRoom: 1180,
  thirdOpen: 1440,
  fourthClose: 1860,
  fourthOpen: 2060,
  settle: 2400,
  ready: 3550,
} as const;
const INTRO_META_BRIDGE = {
  frameScale: 0.83,
  screenScale: 0.8,
  y: '-12%',
  duration: 1.05,
} as const;
const Y = { split: 0.78, near: 0.16, final: 0.98 } as const;

interface LogoLineProps {
  y: string;
  x: number;
  opacity: number;
  transition: React.ComponentProps<typeof motion.div>['transition'];
  burstIn: boolean;
  bursting: boolean;
  prefix?: string;
  core: string;
  suffix: string;
  coreColor: string;
  lineRef: React.RefObject<HTMLDivElement | null>;
  coreRef: React.RefObject<HTMLSpanElement | null>;
}

const WHITE_TRANSITION = {
  x: { duration: 0.32, ease: 'easeOut' as const },
  opacity: { duration: 0.14 },
  scale: { duration: 0.32, ease: 'easeOut' as const },
};

// Keep this component type stable across phase updates. Declaring it inside
// GameLogoIntro remounts both lines on every render and replays Motion's
// initial states, which makes the one-shot reveal flash several times.
const LogoLine: React.FC<LogoLineProps> = ({
  y,
  x,
  opacity,
  transition,
  burstIn,
  bursting,
  prefix,
  core,
  suffix,
  coreColor,
  lineRef,
  coreRef,
}) => (
  <motion.div
    ref={lineRef}
    style={{ gridArea: '1 / 1', position: 'relative', width: '100%', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}
    animate={{ y, x, opacity }}
    transition={transition}
  >
    {prefix && (
      <motion.span
        style={{ ...LOGO_TEXT, color: COLORS.white }}
        initial={{ opacity: 0, x: '1em', scale: 0.75 }}
        animate={{ opacity: burstIn ? 1 : 0, x: burstIn ? '0em' : '1em', scale: burstIn ? 1 : 0.75 }}
        transition={WHITE_TRANSITION}
      >
        {prefix}
      </motion.span>
    )}
    <motion.span
      ref={coreRef}
      style={{ ...LOGO_TEXT, color: coreColor, display: 'inline-block', transformOrigin: 'center' }}
      animate={{ scale: bursting ? [1, 1.14, 1] : 1 }}
      transition={{ duration: 0.42, times: [0, 0.3, 1], ease: 'easeOut' }}
    >
      {core}
    </motion.span>
    <motion.span
      style={{ ...LOGO_TEXT, color: COLORS.white }}
      initial={{ opacity: 0, x: '-1em', scale: 0.75 }}
      animate={{ opacity: burstIn ? 1 : 0, x: burstIn ? '0em' : '-1em', scale: burstIn ? 1 : 0.75 }}
      transition={WHITE_TRANSITION}
    >
      {suffix}
    </motion.span>
  </motion.div>
);

export const GameLogoIntro: React.FC<{
  onComplete: () => void;
  reducedMotion?: boolean;
}> = ({ onComplete, reducedMotion }) => {
  const prefersReduced = useReducedMotion();
  const reduced = reducedMotion ?? prefersReduced;
  const [phase, setPhase] = useState<Phase>('idle');
  const [perspectivePhase, setPerspectivePhase] = useState<PerspectivePhase>('screen');
  const [eyesClosed, setEyesClosed] = useState(false);
  const [metaFramed, setMetaFramed] = useState(false);
  const [bridgeSettled, setBridgeSettled] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [offsets, setOffsets] = useState({ top: 0, bottom: 0 });
  const doneRef = useRef(false);
  const bloomedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const topLineRef = useRef<HTMLDivElement>(null);
  const topCoreRef = useRef<HTMLSpanElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const bottomCoreRef = useRef<HTMLSpanElement>(null);

  const clearTimers = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };
  const push = (fn: () => void, ms: number) => timeoutsRef.current.push(window.setTimeout(fn, ms));

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  const playBloom = () => {
    if (bloomedRef.current) return;
    bloomedRef.current = true;
    audio.playLogoReveal({ variant: 'bloom' });
  };

  const beginSequence = () => {
    clearTimers();
    audio.playLogoReveal({ variant: 'bell' });
    if (reduced) { setPhase('ready'); return; }
    setPhase('split');
    push(() => setPhase('collide'), SEQ.collide);
    push(() => { setPhase('burst'); playBloom(); }, SEQ.burst);
    push(() => setPhase('center'), SEQ.center);
    push(() => setPhase('ready'), SEQ.ready);
  };

  const beginPerspectiveReveal = () => {
    clearTimers();
    setBridgeSettled(false);
    setPerspectivePhase('blinking');
    setEyesClosed(true);
    push(() => setEyesClosed(false), BLINK_SEQ.firstOpen);
    push(() => setEyesClosed(true), BLINK_SEQ.secondClose);
    push(() => setEyesClosed(false), BLINK_SEQ.secondOpen);
    push(() => setEyesClosed(true), BLINK_SEQ.thirdClose);
    // The room, hands, and phone frame appear while the third blink is fully
    // closed. Opening the eyes therefore reveals a continuous human viewpoint
    // instead of showing a UI layer being attached.
    push(() => setMetaFramed(true), BLINK_SEQ.revealRoom);
    push(() => setEyesClosed(false), BLINK_SEQ.thirdOpen);
    push(() => setEyesClosed(true), BLINK_SEQ.fourthClose);
    push(() => setEyesClosed(false), BLINK_SEQ.fourthOpen);
    push(() => {
      setBridgeSettled(true);
      setPerspectivePhase('settling');
    }, BLINK_SEQ.settle);
    push(() => setPerspectivePhase('meta-ready'), BLINK_SEQ.ready);
  };

  const handleTap = (event: React.PointerEvent) => {
    event.stopPropagation();
    if (phase === 'idle') { beginSequence(); return; }
    if (phase === 'ready') {
      if (perspectivePhase === 'screen') beginPerspectiveReveal();
      if (perspectivePhase === 'meta-ready') finish();
      return;
    }
    clearTimers();
    playBloom();
    setPhase('center');
    push(() => setPhase('ready'), 350);
  };

  useLayoutEffect(() => {
    music.setSuppressed(true);
    return () => music.setSuppressed(false);
  }, []);

  useEffect(() => () => clearTimers(), []);

  // Measure how far each coloured core sits from its line's centre (layout
  // coordinates, so motion transforms don't taint it). Re-measure once the
  // web font is ready, since that changes the metrics.
  useLayoutEffect(() => {
    const measureOne = (line: HTMLElement | null, core: HTMLElement | null) => {
      if (!line || !core) return 0;
      return core.offsetLeft + core.offsetWidth / 2 - line.clientWidth / 2;
    };
    const measure = () => setOffsets({
      top: measureOne(topLineRef.current, topCoreRef.current),
      bottom: measureOne(bottomLineRef.current, bottomCoreRef.current),
    });
    measure();
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => { if (!cancelled) measure(); }).catch(() => {});
    }
    window.addEventListener('resize', measure);
    return () => { cancelled = true; window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    setShowHint(false);
    if (phase !== 'idle' && phase !== 'ready') return undefined;
    const id = window.setTimeout(() => setShowHint(true), phase === 'idle' ? 1500 : 1000);
    return () => window.clearTimeout(id);
  }, [phase]);

  const burstIn = phase === 'burst' || phase === 'center' || phase === 'ready';
  const coreCentered = phase === 'idle' || phase === 'split' || phase === 'collide' || phase === 'burst';
  const stageFontSize = 'clamp(30px, 8vw, 68px)';

  const lineY = (sign: number) => {
    const mag = burstIn ? Y.final : phase === 'collide' ? Y.near : phase === 'split' ? Y.split : 0;
    return `${sign * mag}em`;
  };
  const lineTransition =
    phase === 'collide'
      ? { y: { duration: 0.24, ease: 'easeIn' as const }, x: { duration: 0.2 } }
      : phase === 'burst'
        ? { y: { type: 'spring' as const, stiffness: 260, damping: 22 }, x: { duration: 0.2 } }
        : phase === 'center'
          ? { x: { duration: 0.5, ease: 'easeOut' as const }, y: { duration: 0.3 } }
          : { y: { type: 'spring' as const, stiffness: 160, damping: 20 }, x: { duration: 0.3 }, opacity: { duration: 0.4 } };

  const hint = (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-[12%] flex justify-center"
      style={{ ...LOGO_TEXT, fontSize: '13px', fontWeight: 400, letterSpacing: '0.34em', color: '#7c8aa0' }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: showHint && perspectivePhase !== 'blinking' && perspectivePhase !== 'settling'
          ? [0.25, 0.6, 0.25]
          : 0,
      }}
      transition={showHint && perspectivePhase !== 'blinking' && perspectivePhase !== 'settling'
        ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
        : { duration: 0.3 }}
      aria-hidden="true"
    >
      {phase === 'ready' && perspectivePhase === 'meta-ready' ? 'TAP TO BEGIN' : 'TAP'}
    </motion.div>
  );

  return (
    <motion.div
      className="absolute inset-0 z-[80] overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0.5 : 0.85, ease: 'easeOut' }}
      onPointerDown={handleTap}
      role="button"
      tabIndex={-1}
      aria-label="game questing, questioning game. Tap to continue."
      id="game-logo-intro"
      data-logo-phase={phase}
      data-perspective-phase={perspectivePhase}
    >
      {/* The physical room is already behind the "screen capture"; the third
          blink only allows the player's eyes to register it. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#17130f]"
        initial={false}
        animate={{ opacity: metaFramed ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}
        data-intro-meta-room={metaFramed ? 'revealed' : 'hidden'}
      >
        <img
          src="/assets/meta-wall-stage-1.png"
          alt=""
          className="absolute left-[-10%] top-[-11.6%] h-[94.6%] w-[120%] max-w-none object-fill"
        />
        <img
          src="/assets/meta-floor-stage-1.png"
          alt=""
          className="absolute left-1/2 top-[28%] h-full w-[180%] max-w-none -translate-x-1/2 object-fill"
        />
        <img
          src="/assets/meta-desk-table.png"
          alt=""
          className="absolute left-1/2 top-[-40%] h-[212%] w-auto max-w-none -translate-x-1/2 object-fill"
        />
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{ background: 'radial-gradient(ellipse 82% 74% at 50% 50%, rgba(255,181,88,0.34) 0%, rgba(255,129,45,0.14) 38%, transparent 74%)' }}
        />
        <div className="absolute right-[10%] top-[14%] text-[9px] font-mono tracking-[0.32em] text-amber-100/25">CAM_02 · REC</div>
      </motion.div>

      {/* Metallic chassis becomes readable only after the perspective pullback. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-[32px] border-[14px] border-[#363c45] bg-[linear-gradient(145deg,#eef1f2_0%,#737b85_10%,#1c2128_30%,#9299a2_58%,#11151a_100%)] shadow-[18px_30px_38px_rgba(0,0,0,0.72),inset_0_2px_2px_rgba(255,255,255,0.72),inset_0_-5px_8px_rgba(0,0,0,0.72)]"
        initial={false}
        animate={{
          opacity: metaFramed ? 1 : 0,
          scale: metaFramed ? (bridgeSettled ? INTRO_META_BRIDGE.frameScale : 0.89) : 1,
          y: metaFramed ? (bridgeSettled ? INTRO_META_BRIDGE.y : '-9%') : '0%',
        }}
        transition={{
          duration: reduced ? 0 : bridgeSettled ? INTRO_META_BRIDGE.duration : 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        id="intro-meta-phone-frame"
        data-bridge-state={bridgeSettled ? 'settled' : 'revealed'}
      />

      {/* The original title never disappears. It simply becomes the content
          of the physical phone screen as the surrounding world is revealed. */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-[radial-gradient(130%_130%_at_50%_45%,#0b0c14_0%,#060709_62%,#030305_100%)]"
        initial={false}
        animate={{
          scale: metaFramed ? (bridgeSettled ? INTRO_META_BRIDGE.screenScale : 0.86) : 1,
          y: metaFramed ? (bridgeSettled ? INTRO_META_BRIDGE.y : '-9%') : '0%',
          borderRadius: metaFramed ? 24 : 0,
        }}
        transition={{
          duration: reduced ? 0 : bridgeSettled ? INTRO_META_BRIDGE.duration : 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        id="intro-title-phone-screen"
        data-title-location={metaFramed ? 'physical-phone' : 'fullscreen'}
        data-bridge-state={bridgeSettled ? 'settled' : 'revealed'}
      >
        {metaFramed && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between bg-[#0b0c0f] px-4 font-mono text-[9px] text-slate-300/80">
            <span>23:23</span>
            <span>◈ · LTE · 97%</span>
          </div>
        )}

        <motion.div
          style={{ display: 'grid', placeItems: 'center', width: '100%', fontSize: stageFontSize }}
          animate={{ x: phase === 'burst' ? [0, -7, 6, -3, 2, 0] : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {/* Undivided purple word, crossfading out as the halves take over. */}
          <motion.span
            style={{ ...LOGO_TEXT, gridArea: '1 / 1', color: COLORS.purple, justifySelf: 'center' }}
            animate={{ opacity: phase === 'idle' ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            quest
          </motion.span>

          <LogoLine
            y={lineY(-1)}
            x={coreCentered ? -offsets.top : 0}
            opacity={phase === 'idle' ? 0 : 1}
            transition={lineTransition}
            burstIn={burstIn}
            bursting={phase === 'burst'}
            prefix={'game '}
            core="quest"
            suffix="ing,"
            coreColor={COLORS.blue}
            lineRef={topLineRef}
            coreRef={topCoreRef}
          />
          <LogoLine
            y={lineY(1)}
            x={coreCentered ? -offsets.bottom : 0}
            opacity={phase === 'idle' ? 0 : 1}
            transition={lineTransition}
            burstIn={burstIn}
            bursting={phase === 'burst'}
            core="quest"
            suffix="ioning game"
            coreColor={COLORS.red}
            lineRef={bottomLineRef}
            coreRef={bottomCoreRef}
          />

          {/* White flash on the slam. */}
          <motion.div
            style={{
              gridArea: '1 / 1',
              justifySelf: 'center',
              width: '3.4em',
              height: '1.5em',
              borderRadius: '50%',
              background: 'radial-gradient(closest-side, rgba(255,255,255,0.7), transparent)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'burst' ? [0, 0.7, 0] : 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </motion.div>

        {hint}
      </motion.div>

      {/* Same supplied grip art as the live Meta scene, so the reveal and the
          real Chapter 1 hand-off share one silhouette. */}
      <motion.img
        src="/assets/meta-hand-grip.png"
        alt=""
        draggable={false}
        initial={false}
        animate={{ opacity: metaFramed ? 1 : 0, x: metaFramed ? 0 : -28 }}
        transition={{ duration: reduced ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-[-3%] top-0 z-30 h-full w-full select-none object-fill drop-shadow-[0_16px_14px_rgba(0,0,0,0.28)]"
        style={{ clipPath: 'inset(0 50% 0 0)' }}
        id="intro-meta-left-hand"
      />
      <motion.img
        src="/assets/meta-hand-grip.png"
        alt=""
        draggable={false}
        initial={false}
        animate={{ opacity: metaFramed ? 1 : 0, x: metaFramed ? 0 : 28 }}
        transition={{ duration: reduced ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute right-[-3%] top-0 z-30 h-full w-full select-none object-fill drop-shadow-[0_16px_14px_rgba(0,0,0,0.28)]"
        style={{ clipPath: 'inset(0 0 0 50%)' }}
        id="intro-meta-right-hand"
      />

      {/* Four blinks in two pairs. Pair one questions the cheap game; the room
          appears behind fully closed lids before pair two opens on Meta. */}
      {perspectivePhase === 'blinking' && (
        <div
          className="pointer-events-none absolute inset-0 z-[100] overflow-hidden"
          data-blink-pairs="2"
          data-blink-count="4"
          data-blink-shape="horizontal-ellipse"
          data-eyes={eyesClosed ? 'closed' : 'open'}
          id="intro-first-person-blinks"
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <mask id="intro-horizontal-blink-mask" maskUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="white" />
                <motion.ellipse
                  cx="50"
                  cy="50"
                  rx="72"
                  initial={{ ry: 52 }}
                  animate={{ ry: eyesClosed ? 0.45 : 52 }}
                  transition={{
                    duration: reduced ? 0.05 : eyesClosed ? 0.15 : 0.19,
                    ease: 'easeInOut',
                  }}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100"
              height="100"
              fill="#000"
              mask="url(#intro-horizontal-blink-mask)"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
};
