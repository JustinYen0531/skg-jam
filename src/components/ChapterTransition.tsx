import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Archive } from 'lucide-react';
import type { ChapterTransitionData } from '../lib/chapterTransition';

/**
 * The chapter-advance cinematic. The title and its EVIDENCE 0N label are
 * rendered to a canvas that resolves from a chunky low-resolution block
 * (4-bit-ish) up through finer stages until it reads like a crisp vector,
 * while a wash of signal static clears — a recovered piece of evidence coming
 * into focus. The revealed card is intentionally darker than the ordinary UI.
 *
 * This is a deliberate, one-off cinematic device: the noise here is the story
 * ("decoding a recovered record"), not a malfunction, and it is gone the
 * moment the card resolves. Under reduced motion the whole thing degrades to a
 * calm crisp fade with no static or stepping. Audio is fired by the caller.
 */

const FONT_TITLE = '"Space Grotesk", system-ui, sans-serif';
const FONT_LABEL = '"JetBrains Mono", ui-monospace, monospace';

// Buffer scale per stage: from blocky (few big pixels) to full crisp.
const STAGES = [0.11, 0.17, 0.26, 0.42, 0.66, 1] as const;
// The elapsed second at which each stage begins. The last stage is the
// crisp "vector" resolve, landing just before the margin bell in the audio.
const STAGE_TIMES = [0.25, 0.55, 0.85, 1.2, 1.6, 1.95] as const;
// Signal gaining fidelity: phosphor-tinted → clean neutral for the title,
// dim → warm gold for the evidence label.
const TITLE_COLORS = ['#3f7a58', '#5f9a6f', '#8ab39a', '#bccabf', '#dee6e0', '#eef2ef'] as const;
const LABEL_COLORS = ['#6f7a4a', '#8f8a44', '#b39a55', '#c4a468', '#cdb37c', '#d6be88'] as const;

const RESOLVE_END = 2.1; // static gone, title crisp
const STATIC_BACKING_W = 240;
const STATIC_BACKING_H = 135;

interface Timing {
  fadeIn: number;
  holdEnd: number; // when the exit fade begins
  fadeOut: number;
}
const TIMING = (reduced: boolean): Timing =>
  reduced ? { fadeIn: 0.2, holdEnd: 1.45, fadeOut: 0.45 } : { fadeIn: 0.28, holdEnd: 3.0, fadeOut: 0.7 };

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  data: ChapterTransitionData,
  w: number,
  h: number,
  stage: number,
) {
  const titlePx = Math.min(w * 0.085, h * 0.135);
  const labelPx = titlePx * 0.4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Evidence label
  ctx.font = `700 ${labelPx}px ${FONT_LABEL}`;
  ctx.fillStyle = LABEL_COLORS[stage];
  try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${labelPx * 0.22}px`; } catch { /* older engines */ }
  ctx.fillText(data.evidenceLabel, w / 2, h * 0.4);
  try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'; } catch { /* older engines */ }

  // Case title (wrapped)
  ctx.font = `700 ${titlePx}px ${FONT_TITLE}`;
  ctx.fillStyle = TITLE_COLORS[stage];
  const lines = wrapLines(ctx, data.title, w * 0.86);
  const lineH = titlePx * 1.12;
  const baseY = h * 0.57;
  const offset = ((lines.length - 1) * lineH) / 2;
  lines.forEach((line, i) => ctx.fillText(line, w / 2, baseY - offset + i * lineH));
}

function drawTitleStage(
  main: HTMLCanvasElement,
  buffer: HTMLCanvasElement,
  data: ChapterTransitionData,
  stage: number,
) {
  const w = main.width;
  const h = main.height;
  if (!w || !h) return;
  const f = STAGES[stage];
  const final = stage >= STAGES.length - 1;
  const bw = Math.max(1, Math.round(w * f));
  const bh = Math.max(1, Math.round(h * f));
  buffer.width = bw;
  buffer.height = bh;
  const bctx = buffer.getContext('2d');
  const mctx = main.getContext('2d');
  if (!bctx || !mctx) return;
  // Draw in full-size coordinates into a scaled-down buffer, then blit it back
  // up. With smoothing off the upscale produces hard pixel blocks.
  bctx.setTransform(f, 0, 0, f, 0, 0);
  bctx.clearRect(0, 0, w, h);
  drawContent(bctx, data, w, h, stage);
  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.clearRect(0, 0, w, h);
  mctx.imageSmoothingEnabled = final;
  mctx.drawImage(buffer, 0, 0, bw, bh, 0, 0, w, h);
}

function paintStatic(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const image = ctx.createImageData(canvas.width, canvas.height);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0; // decorative grain, not puzzle data
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

export const ChapterTransition: React.FC<{
  data: ChapterTransitionData;
  reducedMotion: boolean;
  onDone: () => void;
}> = ({ data, reducedMotion, onDone }) => {
  const titleRef = useRef<HTMLCanvasElement | null>(null);
  const staticRef = useRef<HTMLCanvasElement | null>(null);
  const doneRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');
  const [showChrome, setShowChrome] = useState(reducedMotion);
  const timing = TIMING(reducedMotion);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  const beginExit = () => {
    if (phase === 'exit') return;
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    setPhase('exit');
    timeoutsRef.current.push(window.setTimeout(finish, timing.fadeOut * 1000));
  };

  // Master timeline: fade in, hold, exit, done.
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setVisible(true));
    const push = (fn: () => void, sec: number) =>
      timeoutsRef.current.push(window.setTimeout(fn, sec * 1000));
    if (!reducedMotion) push(() => setShowChrome(true), RESOLVE_END + 0.05);
    push(() => setPhase('exit'), timing.holdEnd);
    push(finish, timing.holdEnd + timing.fadeOut);
    return () => {
      window.cancelAnimationFrame(raf);
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas resolve + static (skipped entirely under reduced motion).
  useEffect(() => {
    if (reducedMotion) return;
    const main = titleRef.current;
    const staticCanvas = staticRef.current;
    if (!main || !staticCanvas) return;
    const buffer = document.createElement('canvas');
    staticCanvas.width = STATIC_BACKING_W;
    staticCanvas.height = STATIC_BACKING_H;

    const sizeMain = () => {
      const rect = main.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      main.width = Math.max(1, Math.round(rect.width * dpr));
      main.height = Math.max(1, Math.round(rect.height * dpr));
    };
    sizeMain();

    let raf = 0;
    let lastStage = -1;
    const start = performance.now();
    const loop = (now: number) => {
      const el = (now - start) / 1000;

      paintStatic(staticCanvas);
      const rampIn = Math.min(1, el / 0.15);
      const rampOut = Math.max(0, 1 - Math.max(0, el - 0.15) / (RESOLVE_END - 0.15));
      staticCanvas.style.opacity = String(0.5 * rampIn * rampOut);

      let stage = 0;
      for (let k = 0; k < STAGE_TIMES.length; k += 1) {
        if (el >= STAGE_TIMES[k]) stage = k;
      }
      if (stage !== lastStage) {
        drawTitleStage(main, buffer, data, stage);
        lastStage = stage;
      }

      if (el < RESOLVE_END + 0.25) {
        raf = window.requestAnimationFrame(loop);
      } else {
        staticCanvas.style.opacity = '0';
        drawTitleStage(main, buffer, data, STAGES.length - 1);
      }
    };
    raf = window.requestAnimationFrame(loop);

    const onResize = () => {
      sizeMain();
      drawTitleStage(main, buffer, data, Math.max(0, lastStage));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [data, reducedMotion]);

  return (
    <div
      className="absolute inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden"
      style={{
        opacity: visible && phase !== 'exit' ? 1 : 0,
        transition: `opacity ${phase === 'exit' ? timing.fadeOut : timing.fadeIn}s ease-out`,
        // Do not create an invisible input shield during the first animation
        // frame or while the card is fading away.
        pointerEvents: visible && phase !== 'exit' ? 'auto' : 'none',
        background: 'radial-gradient(120% 120% at 50% 42%, #0b0f15 0%, #05070a 68%, #030406 100%)',
      }}
      id="chapter-transition"
      data-evidence={data.evidenceLabel}
      role="button"
      tabIndex={-1}
      aria-label={`${data.evidenceLabel} collected: ${data.title}. Tap to continue.`}
      onPointerDown={beginExit}
    >
      {/* Cold vignette + faint frame so the card reads as deliberate, not broken */}
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.7)' }} />

      {/* Signal static — chunky, fades as the record decodes */}
      {!reducedMotion && (
        <canvas
          ref={staticRef}
          className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
          style={{ imageRendering: 'pixelated', opacity: 0 }}
          aria-hidden="true"
        />
      )}

      {/* Title / label */}
      {reducedMotion ? (
        <motion.div
          className="relative px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="mb-2 text-[clamp(11px,2.4cqw,16px)] font-bold tracking-[0.22em] text-[#c4a468]"
            style={{ fontFamily: FONT_LABEL }}
          >
            {data.evidenceLabel}
          </div>
          <div
            className="text-[clamp(22px,6cqw,52px)] font-bold leading-tight text-[#eef2ef]"
            style={{ fontFamily: FONT_TITLE }}
          >
            {data.title}
          </div>
        </motion.div>
      ) : (
        <canvas ref={titleRef} className="relative h-full w-full" aria-hidden="true" />
      )}

      {/* Diegetic chrome — case file framing, faded in once the card resolves */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[13%] flex justify-center"
        style={{ opacity: showChrome ? 1 : 0, transition: 'opacity 0.7s ease-out' }}
      >
        <span
          className="text-[clamp(8px,1.5cqw,11px)] font-semibold uppercase tracking-[0.34em] text-[#5c6d7e]"
          style={{ fontFamily: FONT_LABEL }}
        >
          Cognitive Investigation
        </span>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[13%] flex flex-col items-center gap-2"
        style={{ opacity: showChrome ? 1 : 0, transition: 'opacity 0.7s ease-out' }}
      >
        <span className="h-px w-[38%] max-w-[280px] bg-gradient-to-r from-transparent via-[#2c3a49] to-transparent" />
        <span
          className="text-[clamp(8px,1.5cqw,11px)] font-semibold uppercase tracking-[0.28em] text-[#4a5b6b]"
          style={{ fontFamily: FONT_LABEL }}
        >
          Evidence Secured · Case Advancing
        </span>
      </div>

      {/* Screen-reader announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        {data.evidenceLabel} collected. {data.title}.
      </span>
    </div>
  );
};

/**
 * The iOS-style heads-up banner that drops in the moment evidence is secured,
 * before the player has returned home. Tapping it takes them home, where the
 * transition plays; otherwise it auto-dismisses like a normal notification.
 */
export const EvidenceNotification: React.FC<{
  data: ChapterTransitionData;
  reducedMotion: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}> = ({ data, reducedMotion, onOpen, onDismiss }) => {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 5200);
    return () => window.clearTimeout(id);
  }, [onDismiss]);

  return (
    <motion.div
      className="absolute left-1/2 top-3 z-[66] w-[92%] max-w-[430px] -translate-x-1/2"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -70 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -70 }}
      transition={{ duration: reducedMotion ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      id="evidence-notification"
      data-evidence={data.evidenceLabel}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.1] bg-[#1b2130]/85 px-3.5 py-3 text-left shadow-2xl backdrop-blur-xl transition-transform active:scale-[0.985]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#c4a468] to-[#8a7038] shadow-inner">
          <Archive className="h-[18px] w-[18px] text-[#1b1408]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between">
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Cognitive Investigation
            </span>
            <span className="text-[9.5px] text-slate-500">now</span>
          </span>
          <span className="block text-[13px] font-semibold leading-tight text-slate-50">
            Evidence Collected
          </span>
          <span className="block truncate text-[11px] leading-snug text-slate-300/85">
            {data.evidenceLabel} secured — return home to review the case file.
          </span>
        </span>
      </button>
    </motion.div>
  );
};
