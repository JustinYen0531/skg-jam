import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import audio from '../lib/audio';

interface LumenArcRevealProps {
  reducedMotion: boolean;
  onDeceptionRevealed: () => void;
  onComplete: () => void;
}

type RevealPhase = 'scratch' | 'phone-ready' | 'inspect' | 'burst' | 'clear';

const SCRATCH_COMPLETE_AT = 72;
const BURST_ANGLE = 58;
const PHONE_ROTATION_SENSITIVITY = 0.21;
const REVEAL_TIME_SCALE = 2;
const PHONE_DEPTH_LAYERS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const;

const FALLING_IMAGES: readonly {
  apexX: number;
  apexY: number;
  finalX: number;
  finalY: number;
  spin: number;
  tint: string;
}[] = [
  { apexX: -182, apexY: -210, finalX: -154, finalY: 152, spin: -24, tint: '#f4f4f5' },
  { apexX: -118, apexY: -244, finalX: -96, finalY: 194, spin: 18, tint: '#faf6e8' },
  { apexX: -50, apexY: -190, finalX: -42, finalY: 142, spin: -15, tint: '#f0f9ff' },
  { apexX: 20, apexY: -252, finalX: 8, finalY: 210, spin: 22, tint: '#fafaf9' },
  { apexX: 92, apexY: -205, finalX: 70, finalY: 158, spin: -18, tint: '#f4f4f5' },
  { apexX: 166, apexY: -236, finalX: 136, finalY: 198, spin: 25, tint: '#fefce8' },
  { apexX: -152, apexY: -150, finalX: -126, finalY: 230, spin: 31, tint: '#faf5ff' },
  { apexX: -70, apexY: -278, finalX: -62, finalY: 244, spin: -28, tint: '#111827' },
  { apexX: 70, apexY: -282, finalX: 50, finalY: 236, spin: 16, tint: '#f4f4f5' },
  { apexX: 150, apexY: -162, finalX: 118, finalY: 250, spin: -32, tint: '#eef2ff' },
];

const drawPackageCover = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';

  const cardboard = ctx.createLinearGradient(0, 0, width, height);
  cardboard.addColorStop(0, '#d1aa72');
  cardboard.addColorStop(0.46, '#ad7e49');
  cardboard.addColorStop(1, '#835a34');
  ctx.fillStyle = cardboard;
  ctx.beginPath();
  ctx.roundRect(18, 18, width - 36, height - 36, 28);
  ctx.fill();

  ctx.strokeStyle = 'rgba(71, 42, 20, 0.72)';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Deterministic fibres keep the cover tactile without image assets.
  for (let index = 0; index < 110; index += 1) {
    const x = 28 + ((index * 83) % (width - 56));
    const y = 30 + ((index * 47) % (height - 60));
    const length = 10 + ((index * 13) % 30);
    ctx.strokeStyle = index % 3 === 0 ? 'rgba(79, 46, 23, 0.18)' : 'rgba(255, 232, 191, 0.12)';
    ctx.lineWidth = index % 4 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(Math.min(width - 24, x + length), y + ((index % 5) - 2));
    ctx.stroke();
  }

  // Reinforced packing tape and an anonymous shipping label.
  ctx.fillStyle = 'rgba(226, 194, 139, 0.78)';
  ctx.fillRect(width / 2 - 34, 19, 68, height - 38);
  ctx.fillStyle = 'rgba(245, 237, 219, 0.92)';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 88, height / 2 - 34, 176, 68, 7);
  ctx.fill();
  ctx.fillStyle = 'rgba(54, 42, 30, 0.66)';
  ctx.fillRect(width / 2 - 66, height / 2 - 12, 92, 5);
  ctx.fillStyle = 'rgba(54, 42, 30, 0.34)';
  ctx.fillRect(width / 2 - 66, height / 2 + 4, 126, 4);
  ctx.fillRect(width / 2 - 66, height / 2 + 18, 74, 4);
};

export const LumenArcReveal: React.FC<LumenArcRevealProps> = ({ reducedMotion, onDeceptionRevealed, onComplete }) => {
  const [phase, setPhase] = useState<RevealPhase>('scratch');
  const [damage, setDamage] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [draggingPhone, setDraggingPhone] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const damageRef = useRef(0);
  const scratchShieldPointer = useRef<number | null>(null);
  const scratchPointer = useRef<number | null>(null);
  const scratchPoint = useRef<{ x: number; y: number } | null>(null);
  // Do not remove the canvas in the middle of the drag that finishes it.
  // Otherwise that drag's mouse-up/click can land on the contents that were
  // physically beneath the parcel a moment earlier.
  const scratchReadyToOpen = useRef(false);
  const suppressScratchClick = useRef(false);
  const scratchClickReleaseTimer = useRef<number | null>(null);
  const phonePointer = useRef<number | null>(null);
  const phonePointerX = useRef(0);
  const rotationRef = useRef(0);
  const lastScratchSound = useRef(0);
  const completed = useRef(false);
  const deceptionNotified = useRef(false);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'scratch' || !canvasRef.current) return;
    drawPackageCover(canvasRef.current);
  }, [phase]);

  useEffect(() => {
    // Nothing before the angle threshold is timed or automatic. The only
    // timers belong to the aftermath the player has deliberately triggered.
    if (phase !== 'burst') return;

    if (reducedMotion) {
      const reducedTimer = window.setTimeout(finish, 220);
      return () => window.clearTimeout(reducedTimer);
    }

    audio.play('story.dataCorrupt');
    audio.play('screenshot.zoom', { delay: 0.08 * REVEAL_TIME_SCALE });
    audio.play('archive.downloadStart', { delay: 0.22 * REVEAL_TIME_SCALE });
    audio.play('screenshot.rotate', { delay: 1.5 * REVEAL_TIME_SCALE });
    audio.play('archive.downloadComplete', { delay: 2.9 * REVEAL_TIME_SCALE });

    const clearTimer = window.setTimeout(() => setPhase('clear'), 3900 * REVEAL_TIME_SCALE);
    const doneTimer = window.setTimeout(finish, 4500 * REVEAL_TIME_SCALE);
    return () => {
      window.clearTimeout(clearTimer);
      window.clearTimeout(doneTimer);
    };
  }, [finish, phase, reducedMotion]);

  const scratchAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'scratch') return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = scratchPoint.current;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 76;
    ctx.beginPath();
    if (previous) {
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, 38, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.fill();
    ctx.restore();

    const travelled = previous ? Math.hypot(x - previous.x, y - previous.y) : 42;
    scratchPoint.current = { x, y };
    const current = damageRef.current;
    const next = Math.min(100, current + Math.min(4.2, travelled / 55));
    damageRef.current = next;
    setDamage(next);
    if (next - lastScratchSound.current >= 12) {
      lastScratchSound.current = next;
      audio.play('screenshot.rotate');
    }
    if (current < SCRATCH_COMPLETE_AT && next >= SCRATCH_COMPLETE_AT) {
      audio.play('amazemart.delivery');
      scratchReadyToOpen.current = true;
    }
  }, [phase]);

  const finishScratchGesture = useCallback(() => {
    if (!scratchReadyToOpen.current) return;
    scratchReadyToOpen.current = false;
    setPhase('phone-ready');
  }, []);

  useEffect(() => {
    const blockScratchClick = (event: MouseEvent) => {
      if (!suppressScratchClick.current) return;
      suppressScratchClick.current = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener('click', blockScratchClick, true);
    return () => {
      window.removeEventListener('click', blockScratchClick, true);
      if (scratchClickReleaseTimer.current !== null) {
        window.clearTimeout(scratchClickReleaseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== 'scratch') return;

    const releaseClickGuardSoon = () => {
      if (scratchClickReleaseTimer.current !== null) {
        window.clearTimeout(scratchClickReleaseTimer.current);
      }
      scratchClickReleaseTimer.current = window.setTimeout(() => {
        suppressScratchClick.current = false;
        scratchClickReleaseTimer.current = null;
      }, 0);
    };

    const handleScratchPointerDown = (event: PointerEvent) => {
      const reveal = revealRef.current;
      const canvas = canvasRef.current;
      if (!reveal || !canvas || event.button !== 0 || scratchShieldPointer.current !== null) return;
      const revealRect = reveal.getBoundingClientRect();
      const insideReveal = event.clientX >= revealRect.left
        && event.clientX <= revealRect.right
        && event.clientY >= revealRect.top
        && event.clientY <= revealRect.bottom;
      if (!insideReveal) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      suppressScratchClick.current = true;
      scratchShieldPointer.current = event.pointerId;

      const rect = canvas.getBoundingClientRect();
      const insideCanvas = event.clientX >= rect.left
        && event.clientX <= rect.right
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom;
      if (!insideCanvas) return;

      scratchPointer.current = event.pointerId;
      scratchPoint.current = null;
      scratchAt(event.clientX, event.clientY);
    };

    const handleScratchPointerMove = (event: PointerEvent) => {
      if (scratchShieldPointer.current !== event.pointerId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (scratchPointer.current === event.pointerId) {
        scratchAt(event.clientX, event.clientY);
      }
    };

    const finishCapturedScratch = (event: PointerEvent) => {
      if (scratchShieldPointer.current !== event.pointerId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      scratchShieldPointer.current = null;
      if (scratchPointer.current === event.pointerId) {
        scratchPointer.current = null;
        scratchPoint.current = null;
        finishScratchGesture();
      }
      releaseClickGuardSoon();
    };

    window.addEventListener('pointerdown', handleScratchPointerDown, true);
    window.addEventListener('pointermove', handleScratchPointerMove, true);
    window.addEventListener('pointerup', finishCapturedScratch, true);
    window.addEventListener('pointercancel', finishCapturedScratch, true);
    return () => {
      window.removeEventListener('pointerdown', handleScratchPointerDown, true);
      window.removeEventListener('pointermove', handleScratchPointerMove, true);
      window.removeEventListener('pointerup', finishCapturedScratch, true);
      window.removeEventListener('pointercancel', finishCapturedScratch, true);
      scratchShieldPointer.current = null;
      scratchPointer.current = null;
      scratchPoint.current = null;
    };
  }, [finishScratchGesture, phase, scratchAt]);

  const triggerBurst = useCallback(() => {
    if (phase !== 'inspect') return;
    phonePointer.current = null;
    setDraggingPhone(false);
    if (!deceptionNotified.current) {
      deceptionNotified.current = true;
      onDeceptionRevealed();
    }
    setPhase('burst');
  }, [onDeceptionRevealed, phase]);

  const updatePhoneRotation = (clientX: number) => {
    if (phase !== 'inspect' || phonePointer.current === null) return;
    const delta = clientX - phonePointerX.current;
    phonePointerX.current = clientX;
    const next = Math.max(-72, Math.min(72, rotationRef.current + delta * PHONE_ROTATION_SENSITIVITY));
    rotationRef.current = next;
    setRotation(next);
    if (Math.abs(next) >= BURST_ANGLE) triggerBurst();
  };

  const intact = Math.max(0, Math.round(100 - damage));
  const phoneVisible = phase !== 'burst' && phase !== 'clear';

  return (
    <motion.div
      ref={revealRef}
      className="absolute inset-0 z-40 overflow-hidden bg-[#090f16] text-slate-100"
      id="lumen-arc-reveal"
      data-meta-direct-gesture="true"
      data-reveal-phase={phase}
      data-package-damage={Math.round(damage)}
      data-phone-rotation={Math.round(rotation)}
      data-reveal-input-lock={phase === 'scratch' ? 'parcel-only' : 'released'}
      animate={{ opacity: phase === 'clear' ? 0 : 1 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(53,87,108,0.28),transparent_38%),linear-gradient(180deg,#111a24_0%,#080d13_100%)]" />
      <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute inset-5 rounded-[18px] border border-slate-400/10" />
      <div className="pointer-events-none absolute left-8 top-8 h-5 w-5 border-l border-t border-cyan-200/35" />
      <div className="pointer-events-none absolute right-8 top-8 h-5 w-5 border-r border-t border-cyan-200/35" />
      <div className="pointer-events-none absolute bottom-8 left-8 h-5 w-5 border-b border-l border-cyan-200/35" />
      <div className="pointer-events-none absolute bottom-8 right-8 h-5 w-5 border-b border-r border-cyan-200/35" />

      <header className="pointer-events-none absolute left-1/2 top-[6%] z-30 w-[min(520px,76%)] -translate-x-1/2 text-center">
        <div className="font-mono text-[8px] tracking-[0.34em] text-cyan-100/45">SIGNED DELIVERY // RECOVERY LOT</div>
        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-cyan-100/25 to-transparent" />
      </header>

      <main className="absolute inset-0 flex items-center justify-center pb-[2%] [perspective:1200px]">
        {/* Dark package cavity with the device physically underneath the
            scratchable cardboard canvas. */}
        {phase === 'scratch' && (
          <motion.div
            className="relative h-[230px] w-[330px] max-w-[60vw] overflow-visible rounded-[16px] border border-amber-100/20 bg-[#17120d] shadow-[0_28px_55px_rgba(0,0,0,0.62),inset_0_0_35px_rgba(0,0,0,0.78)]"
            initial={{ y: 8, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.42 }}
          >
            <div className="absolute inset-3 flex items-center justify-center overflow-hidden rounded-[11px] bg-[radial-gradient(circle,rgba(89,145,177,0.22),#05070a_68%)]">
              <div className="h-[166px] w-[88px] rounded-[19px] border border-cyan-100/20 bg-gradient-to-br from-[#313944] via-[#0a0d12] to-black shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
                <div className="mx-auto mt-3 h-1 w-7 rounded-full bg-white/15" />
                <div className="mx-auto mt-12 h-10 w-10 rounded-full border border-cyan-200/30 shadow-[0_0_20px_rgba(103,232,249,0.18)]" />
              </div>
            </div>
            <canvas
              ref={canvasRef}
              width={660}
              height={460}
              className="absolute inset-0 h-full w-full touch-none cursor-crosshair rounded-[16px]"
              id="lumen-arc-package-scratch-layer"
              data-meta-immediate="true"
              data-meta-direct-gesture="true"
              aria-label="Hold and drag to tear open the parcel"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                scratchPointer.current = event.pointerId;
                scratchPoint.current = null;
                event.currentTarget.setPointerCapture(event.pointerId);
                scratchAt(event.clientX, event.clientY);
              }}
              onPointerMove={(event) => {
                if (scratchPointer.current !== event.pointerId) return;
                event.preventDefault();
                event.stopPropagation();
                scratchAt(event.clientX, event.clientY);
              }}
              onPointerUp={(event) => {
                if (scratchPointer.current !== event.pointerId) return;
                scratchPointer.current = null;
                scratchPoint.current = null;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                finishScratchGesture();
              }}
              onPointerCancel={() => {
                scratchPointer.current = null;
                scratchPoint.current = null;
                finishScratchGesture();
              }}
            />
          </motion.div>
        )}

        {phase !== 'scratch' && phoneVisible && (
          <div className="relative flex h-[300px] w-[360px] max-w-[68vw] items-center justify-center [perspective:1200px]">
            <motion.div
              className={`relative h-[228px] w-[124px] touch-none ${phase === 'inspect' ? 'cursor-ew-resize' : 'cursor-pointer'}`}
              id="lumen-arc-layered-phone"
              data-phone-material="stacked-paper"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 50%',
              }}
              initial={{ y: 18, opacity: 0, scale: 0.9, rotateX: -5, rotateY: 0 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateX: -5, rotateY: rotation }}
              transition={draggingPhone ? { duration: 0 } : { type: 'spring', stiffness: 190, damping: 19 }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (phase !== 'inspect') return;
                phonePointer.current = event.pointerId;
                phonePointerX.current = event.clientX;
                setDraggingPhone(true);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (phonePointer.current !== event.pointerId) return;
                event.preventDefault();
                event.stopPropagation();
                updatePhoneRotation(event.clientX);
              }}
              onPointerUp={(event) => {
                if (phonePointer.current !== event.pointerId) return;
                phonePointer.current = null;
                setDraggingPhone(false);
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onPointerCancel={() => {
                phonePointer.current = null;
                setDraggingPhone(false);
              }}
            >
              {PHONE_DEPTH_LAYERS.map((depth) => (
                <div
                  key={depth}
                  className={`absolute inset-0 rounded-[25px] border ${depth % 2 === 0 ? 'border-amber-100/55 bg-[#d6c5a9]' : 'border-slate-600/70 bg-[#857b6c]'}`}
                  style={{
                    transform: `translate3d(${depth * 0.72}px, ${depth * 0.34}px, ${-depth * 3.4}px)`,
                    boxShadow: depth === 10 ? '18px 26px 30px rgba(0,0,0,0.62)' : undefined,
                  }}
                >
                  <div className="absolute inset-y-5 right-[3px] w-px bg-amber-50/45" />
                </div>
              ))}

              <div className="absolute inset-0 overflow-hidden rounded-[24px] border border-white/25 bg-gradient-to-br from-[#313b48] via-[#090c12] to-[#020305] shadow-[inset_2px_1px_2px_rgba(255,255,255,0.2)] [transform:translateZ(2px)]">
                <div className="absolute inset-[7px] rounded-[18px] border border-cyan-100/10 bg-[radial-gradient(circle_at_50%_42%,rgba(76,175,218,0.2),transparent_34%),linear-gradient(160deg,#0c1823,#030509_68%)]" />
                <div className="absolute left-1/2 top-3 h-[4px] w-9 -translate-x-1/2 rounded-full bg-black shadow-[0_1px_0_rgba(255,255,255,0.16)]" />
                <div className="absolute inset-x-0 top-[76px] text-center">
                  <div className="mx-auto h-11 w-11 rounded-full border border-cyan-200/40 shadow-[0_0_26px_rgba(103,232,249,0.22)]">
                    <div className="m-[9px] h-5 w-5 rotate-45 rounded-[4px] border border-cyan-100/55" />
                  </div>
                  <div className="mt-4 font-mono text-[7px] tracking-[0.28em] text-cyan-100/65">LUMEN ARC</div>
                </div>
                <div className="absolute bottom-3 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-white/16" />
              </div>
            </motion.div>

            {phase === 'phone-ready' && (
              <button
                type="button"
                className="absolute inset-0 z-20 cursor-pointer rounded-[24px] bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                id="lumen-arc-inspect-phone"
                data-meta-immediate="true"
                aria-label="Inspect the Lumen Arc device"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  audio.play('ui.primaryTap');
                  setPhase('inspect');
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (event.detail === 0) {
                    audio.play('ui.primaryTap');
                    setPhase('inspect');
                  }
                }}
              />
            )}
          </div>
        )}

        {(phase === 'burst' || phase === 'clear') && (
          <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
            {/* A restrained jack-in-the-box sting: a toy jester on a compressed
                spring appears for one beat as the fake device gives way. */}
            <motion.div
              className="absolute z-20 flex flex-col items-center"
              initial={{ y: 54, scale: 0.3, opacity: 0 }}
              animate={{ y: [54, -104, -78, 30], scale: [0.3, 1.16, 1, 0.72], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.25 * REVEAL_TIME_SCALE, times: [0, 0.32, 0.68, 1], ease: 'easeOut' }}
              data-jester-box-sting="true"
            >
              <div className="relative h-[68px] w-[68px] rounded-full border-2 border-slate-100/70 bg-[#e8d8bd] shadow-[0_0_25px_rgba(248,113,113,0.28)]">
                <div className="absolute -left-2 -top-5 h-8 w-10 -rotate-[28deg] rounded-t-full bg-[#7c3aed]" />
                <div className="absolute -right-2 -top-5 h-8 w-10 rotate-[28deg] rounded-t-full bg-[#0e7490]" />
                <div className="absolute left-[17px] top-[24px] h-2.5 w-2.5 rounded-full bg-slate-950" />
                <div className="absolute right-[17px] top-[24px] h-2.5 w-2.5 rounded-full bg-slate-950" />
                <div className="absolute left-1/2 top-[34px] h-3 w-3 -translate-x-1/2 rounded-full bg-red-500" />
                <div className="absolute bottom-[10px] left-1/2 h-2 w-7 -translate-x-1/2 rounded-b-full border-b-2 border-slate-800" />
              </div>
              <div className="h-[66px] w-[18px] bg-[repeating-linear-gradient(170deg,transparent_0px,transparent_7px,rgba(226,232,240,0.8)_8px,rgba(226,232,240,0.8)_11px)]" />
            </motion.div>

            {FALLING_IMAGES.map((image, index) => (
              <motion.div
                key={index}
                className="absolute z-30 h-[78px] w-[55px] overflow-hidden rounded-[4px] border-2 border-white bg-white shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
                initial={{ x: 0, y: -10, opacity: 0, scale: 0.3, rotate: 0, rotateY: 0 }}
                animate={
                  phase === 'clear'
                    ? { x: image.finalX, y: image.finalY + 22, opacity: 0, scale: 1, rotate: image.spin, rotateY: 0 }
                    : {
                        x: [0, image.apexX, image.finalX],
                        y: [-10, image.apexY, image.finalY],
                        opacity: [0, 1, 1],
                        scale: [0.3, 0.88, 1],
                        rotate: [0, image.spin * 1.8, image.spin],
                        rotateY: [76, index % 2 === 0 ? -24 : 28, 0],
                      }
                }
                transition={{
                  duration: phase === 'clear' ? 0.5 * REVEAL_TIME_SCALE : 3.05 * REVEAL_TIME_SCALE,
                  times: phase === 'clear' ? undefined : [0, 0.24, 1],
                  delay: phase === 'clear' ? 0 : index * 0.075 * REVEAL_TIME_SCALE,
                  ease: phase === 'clear' ? 'easeInOut' : [0.2, 0.72, 0.28, 1],
                }}
              >
                <div className="h-[55px] w-full" style={{ backgroundColor: image.tint }}>
                  <div className="mx-auto translate-y-3 h-6 w-7 rounded-sm border border-black/10 bg-black/10" />
                </div>
                <div className="space-y-[3px] p-1">
                  <div className="h-[2px] w-4/5 rounded bg-black/25" />
                  <div className="h-[2px] w-1/2 rounded bg-black/15" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="pointer-events-none absolute bottom-[7%] left-1/2 z-40 w-[min(520px,78%)] -translate-x-1/2">
        <div className="rounded-[12px] border border-slate-300/12 bg-black/28 px-5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-sm">
          {phase === 'scratch' && (
            <>
              <div className="flex items-center justify-between font-mono text-[8px] tracking-[0.16em] text-slate-300/70">
                <span>HOLD + DRAG TO TEAR</span>
                <span>PACKAGE INTEGRITY {intact}%</span>
              </div>
              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-amber-500 to-red-400 transition-[width] duration-100" style={{ width: `${damage}%` }} />
              </div>
            </>
          )}
          {phase === 'phone-ready' && (
            <div className="text-center font-mono text-[8px] tracking-[0.22em] text-cyan-100/70">CLICK THE DEVICE TO INSPECT</div>
          )}
          {phase === 'inspect' && (
            <>
              <div className="flex items-center justify-between font-mono text-[8px] tracking-[0.16em] text-cyan-100/70">
                <span>HOLD + DRAG LEFT / RIGHT</span>
                <span>{Math.round(Math.abs(rotation))}° / {BURST_ANGLE}°</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] text-slate-400">←</span>
                <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="absolute left-1/2 top-0 h-full bg-cyan-300/70" style={{ width: `${Math.min(50, Math.abs(rotation) / BURST_ANGLE * 50)}%`, transform: rotation < 0 ? 'translateX(-100%)' : undefined }} />
                </div>
                <span className="text-[9px] text-slate-400">→</span>
              </div>
            </>
          )}
          {(phase === 'burst' || phase === 'clear') && (
            <div className="text-center font-mono text-[8px] tracking-[0.28em] text-red-200/70">DEPTH MODEL FAILED // IMAGE STACK EXPOSED</div>
          )}
        </div>
      </footer>
    </motion.div>
  );
};
