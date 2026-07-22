import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import audio from '../lib/audio';

interface LumenArcRevealProps {
  reducedMotion: boolean;
  onComplete: () => void;
}

const STEPS = [
  'waiting',
  'drop',
  'open',
  'rise',
  'hold',
  'flatten',
  'fall',
  'impact',
  'shatter',
  'settle',
  'clear',
] as const;
type Step = (typeof STEPS)[number];

// Every timestamp begins only after the player explicitly opens the parcel.
const TIMELINE: Partial<Record<Step, number>> = {
  drop: 0,
  open: 480,
  rise: 820,
  hold: 1680,
  flatten: 2700,
  fall: 2880,
  impact: 3320,
  shatter: 3410,
  settle: 4180,
  clear: 5000,
};
const DONE_AT = 5600;

const PHONE_DEPTH_LAYERS = [7, 6, 5, 4, 3, 2, 1] as const;

// The final coordinates overlap on purpose: this must read as a dropped pile,
// not a tidy gallery that was always meant to contain screenshots.
const SHARDS: readonly { x: number; y: number; r: number }[] = [
  { x: -98, y: 112, r: -12 },
  { x: -42, y: 88, r: 7 },
  { x: 34, y: 96, r: -5 },
  { x: -116, y: 142, r: 10 },
  { x: 2, y: 126, r: -8 },
  { x: 104, y: 132, r: 6 },
  { x: -68, y: 158, r: -14 },
  { x: 38, y: 166, r: 9 },
  { x: -14, y: 148, r: 3 },
  { x: 82, y: 154, r: -10 },
];

const SHARD_TINTS = [
  '#f4f4f5', '#faf6e8', '#f4f4f5', '#f0f9ff', '#fafaf9',
  '#f4f4f5', '#fefce8', '#faf5ff', '#111827', '#f4f4f5',
];

export const LumenArcReveal: React.FC<LumenArcRevealProps> = ({ reducedMotion, onComplete }) => {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<Step>('waiting');
  const completed = useRef(false);
  const idx = STEPS.indexOf(step);
  const reached = (target: Step) => idx >= STEPS.indexOf(target);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  };

  const startReveal = () => {
    if (started) return;
    setStarted(true);
    setStep('drop');
  };

  useEffect(() => {
    // Mounting the overlay must never autoplay it. Even reduced-motion players
    // get the same explicit opening click before the pile is revealed.
    if (!started) return;

    if (reducedMotion) {
      const timer = window.setTimeout(finish, 140);
      return () => window.clearTimeout(timer);
    }

    const timers = Object.entries(TIMELINE).map(([nextStep, delay]) => (
      window.setTimeout(() => setStep(nextStep as Step), delay)
    ));
    timers.push(window.setTimeout(finish, DONE_AT));

    audio.play('meta.deskContact');
    audio.play('amazemart.delivery', { delay: 0.08 });
    audio.play('meta.cameraPullback', { delay: 0.82 });
    audio.play('story.dataCorrupt', { delay: 2.7 });
    audio.play('screenshot.zoom', { delay: 3.32 });
    audio.play('archive.downloadStart', { delay: 3.41 });
    audio.play('screenshot.rotate', { delay: 4.18 });
    audio.play('archive.downloadComplete', { delay: 4.34 });
    audio.play('ui.close', { delay: 5 });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // `finish` deliberately reads the current callback only for this run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, reducedMotion]);

  if (reducedMotion && started) return null;

  const easing = [0.22, 1, 0.36, 1] as const;
  const phoneAnimate = !reached('rise')
    ? { y: 52, scale: 0.56, scaleX: 1, scaleY: 1, opacity: 0, rotateX: -10, rotateY: -18, rotateZ: -2 }
    : !reached('flatten')
      ? { y: -40, scale: 1, scaleX: 1, scaleY: 1, opacity: 1, rotateX: -10, rotateY: -18, rotateZ: -2 }
      : !reached('fall')
        ? { y: -40, scale: 1, scaleX: 1, scaleY: 1, opacity: 1, rotateX: 0, rotateY: 0, rotateZ: 0 }
        : !reached('impact')
          ? { y: 42, scale: 0.98, scaleX: 1, scaleY: 0.94, opacity: 1, rotateX: 78, rotateY: 0, rotateZ: 0 }
          : !reached('shatter')
            ? { y: 68, scale: 1, scaleX: 1.06, scaleY: 0.68, opacity: 1, rotateX: 86, rotateY: 0, rotateZ: 0 }
            : { y: 68, scale: 1.02, scaleX: 1.08, scaleY: 0.64, opacity: 0, rotateX: 88, rotateY: 0, rotateZ: 0 };

  const phoneTransition = reached('shatter')
    ? { duration: 0.08 }
    : reached('impact')
      ? { duration: 0.1, ease: 'easeOut' as const }
      : reached('fall')
        ? { duration: 0.42, ease: [0.45, 0, 0.8, 0.3] as const }
        : reached('flatten')
          ? { duration: 0.14, ease: 'linear' as const }
          : { duration: 0.68, ease: easing };

  return (
    <div
      className="absolute inset-0 z-40 overflow-hidden"
      id="lumen-arc-reveal"
      data-reveal-started={started}
      data-reveal-step={step}
    >
      <motion.div
        className="absolute inset-0 bg-[var(--laos-bg)]"
        animate={{ opacity: reached('clear') ? 0 : 1 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      />

      {/* The physical stage is intentionally 1.5x; the instruction and input
          layer remain normal size and do not inherit this scale. */}
      <div
        className="absolute inset-0 flex items-center justify-center [perspective:1100px]"
        data-package-stage-scale="1.5"
      >
        <div className="absolute inset-0 flex scale-[1.5] items-center justify-center">
          {/* The sealed parcel waits in suspension. It only drops after input. */}
          <motion.div
            className="absolute"
            style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 100%' }}
            initial={false}
            animate={
              !started
                ? { y: -142, opacity: 1, rotateX: 10, scale: 1 }
                : !reached('open')
                  ? { y: 12, opacity: 1, rotateX: 18, scale: 1 }
                  : !reached('clear')
                    ? { y: 30, opacity: 1, rotateX: 30, scale: 1 }
                    : { y: 48, opacity: 0, rotateX: 34, scale: 0.82 }
            }
            transition={
              !started
                ? { duration: 0 }
                : !reached('open')
                  ? { duration: 0.44, ease: [0.34, 1.56, 0.64, 1] }
                  : { duration: 0.5, ease: easing }
            }
          >
            <motion.div
              className="absolute left-1/2 top-0 h-[22px] w-[150px] -translate-x-1/2 rounded-t-sm bg-gradient-to-b from-[#d0af7c] to-[#9b744a]"
              style={{ transformOrigin: '50% 100%' }}
              animate={{ rotateX: reached('open') ? -128 : -6 }}
              transition={{ duration: 0.48, ease: easing }}
            />
            <div className="h-[18px] w-[150px] rounded-sm bg-[#20170f] shadow-[inset_0_7px_12px_rgba(0,0,0,0.8)]" />
            <div className="h-[104px] w-[150px] rounded-b-sm border-x border-b border-[#765536] bg-gradient-to-b from-[#bd925f] to-[#8d683f] shadow-[0_18px_28px_rgba(0,0,0,0.58)]">
              <div className="mx-auto mt-6 h-[2px] w-[86px] bg-[#6d4e2e]/70" />
              <div className="mx-auto mt-3 h-[18px] w-[54px] rounded-[2px] bg-[#e8ddc7]/85 shadow-inner" />
            </div>
          </motion.div>

          {/* A layered solid, not a flat rounded rectangle. The depth slices
              disappear in 140 ms before the now-flat face falls forward. */}
          <motion.div
            className="absolute h-[176px] w-[94px]"
            style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 100%' }}
            initial={false}
            animate={phoneAnimate}
            transition={phoneTransition}
            data-phone-form={reached('flatten') ? 'flat' : 'solid'}
          >
            {PHONE_DEPTH_LAYERS.map((depth) => (
              <motion.div
                key={depth}
                className="absolute inset-0 rounded-[21px] border border-black/70 bg-gradient-to-r from-[#050608] via-[#161a20] to-[#292f38]"
                style={{
                  transform: `translate3d(${depth * 1.35}px, ${depth * 0.75}px, ${-depth * 2.6}px)`,
                  boxShadow: depth === 7 ? '16px 24px 26px rgba(0,0,0,0.62)' : undefined,
                }}
                animate={{ opacity: reached('flatten') ? 0 : 1 }}
                transition={{ duration: reached('flatten') ? 0.1 : 0.3 }}
              />
            ))}
            <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-white/20 bg-gradient-to-br from-[#343b46] via-[#0b0d11] to-[#020304] shadow-[inset_2px_0_2px_rgba(255,255,255,0.2)]">
              <div className="absolute left-1/2 top-2 h-1 w-8 -translate-x-1/2 rounded-full bg-white/22" />
              <div className="absolute bottom-2 left-1/2 h-[2px] w-9 -translate-x-1/2 rounded-full bg-white/16" />
              <motion.div
                className="absolute inset-[6px] rounded-[14px] bg-[linear-gradient(150deg,rgba(142,205,255,0.25),transparent_48%)]"
                animate={{ opacity: reached('rise') && !reached('flatten') ? 1 : 0 }}
                transition={{ duration: reached('flatten') ? 0.1 : 0.5 }}
              />
              <div className="absolute inset-y-4 left-[5px] w-px bg-white/25" />
            </div>
          </motion.div>

          {/* A one-frame compression seam makes the loss of depth abrupt. */}
          {reached('flatten') && !reached('fall') && (
            <motion.div
              className="absolute h-[184px] w-[3px] rounded-full bg-white shadow-[0_0_18px_rgba(160,220,255,0.95)]"
              initial={{ scaleY: 0.2, opacity: 0 }}
              animate={{ scaleY: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.16, ease: 'linear' }}
            />
          )}

          {reached('impact') && !reached('settle') && (
            <motion.div
              className="absolute h-[22px] w-[138px] rounded-[50%] border border-sky-100/60"
              initial={{ y: 112, scale: 0.35, opacity: 0.9 }}
              animate={{ y: 112, scale: 1.35, opacity: 0 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
            />
          )}

          {/* The flat face breaks only after it hits; every card starts at the
              impact plane, then drops into an irregular overlapping pile. */}
          {reached('shatter') && SHARDS.map((shard, index) => (
            <motion.div
              key={index}
              className="absolute h-[64px] w-[46px] overflow-hidden rounded-[3px] border-2 border-white bg-white shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
              style={{ transformOrigin: '50% 100%' }}
              initial={{ x: 0, y: 66, opacity: 0, scale: 0.68, rotate: 0, rotateX: 78 }}
              animate={
                reached('clear')
                  ? { x: shard.x, y: shard.y, opacity: 0, scale: 1, rotate: shard.r, rotateX: 0 }
                  : { x: shard.x, y: shard.y, opacity: 1, scale: 1, rotate: shard.r, rotateX: 0 }
              }
              transition={{
                duration: reached('clear') ? 0.5 : 0.7,
                ease: reached('clear') ? 'easeInOut' : [0.28, 0.82, 0.35, 1],
                delay: reached('clear') ? 0 : index * 0.038,
              }}
            >
              <div className="h-[44px] w-full" style={{ backgroundColor: SHARD_TINTS[index] }} />
              <div className="space-y-[3px] p-[3px]">
                <div className="h-[2px] w-3/4 rounded bg-black/25" />
                <div className="h-[2px] w-1/2 rounded bg-black/15" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {!started && (
        <button
          type="button"
          className="absolute inset-0 z-50 cursor-pointer bg-transparent text-[var(--laos-text)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300"
          id="lumen-arc-open-parcel"
          data-meta-immediate="true"
          aria-label="Open the Lumen Arc parcel"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            startReveal();
          }}
          onClick={(event) => {
            event.stopPropagation();
            // Pointer input already starts on pointer-down. detail === 0 keeps
            // keyboard activation without firing the sequence twice.
            if (event.detail === 0) startReveal();
          }}
        >
          <span className="absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-full border border-white/25 bg-black/55 px-5 py-2 font-laos text-[10px] tracking-[0.22em] shadow-lg backdrop-blur-sm">
            OPEN PARCEL
          </span>
        </button>
      )}
    </div>
  );
};
