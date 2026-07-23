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
 *  3. Second tap: the game begins (onComplete).
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

const SEQ = { collide: 650, burst: 950, center: 2000, ready: 2350 } as const;
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

  const handleTap = (event: React.PointerEvent) => {
    event.stopPropagation();
    if (phase === 'idle') { beginSequence(); return; }
    if (phase === 'ready') { finish(); return; }
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
      animate={{ opacity: showHint ? [0.25, 0.6, 0.25] : 0 }}
      transition={showHint ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      aria-hidden="true"
    >
      {phase === 'ready' ? 'TAP TO BEGIN' : 'TAP'}
    </motion.div>
  );

  return (
    <motion.div
      className="absolute inset-0 z-[80] flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(130% 130% at 50% 45%, #0b0c14 0%, #060709 62%, #030305 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0.5 : 0.85, ease: 'easeOut' }}
      onPointerDown={handleTap}
      role="button"
      tabIndex={-1}
      aria-label="game questing, questioning game. Tap to continue."
      id="game-logo-intro"
      data-logo-phase={phase}
    >
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
  );
};
