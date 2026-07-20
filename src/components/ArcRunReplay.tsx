import React, { useEffect, useRef } from 'react';
import {
  ARC_RUN_AUTO_PAUSE_MS,
  ARC_RUN_REPLAY_DURATION_MS,
  ArcRunReplayFrame,
  getArcRunReplayFrame,
} from '../lib/arcRunReplay';

interface ArcRunReplayProps {
  active: boolean;
  paused: boolean;
  onBarrageChange: (active: boolean) => void;
  onPausePoint: () => void;
}

const WIDTH = 640;
const HEIGHT = 360;
const BIRD_X = 96;
const PIPE_WIDTH = 50;
const CAPTURE_FPS = 15;

const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
  ctx.beginPath();
  ctx.arc(x, y, 14 * scale, 0, Math.PI * 2);
  ctx.arc(x + 17 * scale, y - 7 * scale, 21 * scale, 0, Math.PI * 2);
  ctx.arc(x + 39 * scale, y, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
};

const drawPipe = (ctx: CanvasRenderingContext2D, pipe: ArcRunReplayFrame['pipes'][number]) => {
  const bottomY = HEIGHT - pipe.bottomHeight;
  const levelTwo = pipe.index >= 40;
  const fill = levelTwo ? 'rgba(15,118,110,0.88)' : 'rgba(91,68,174,0.9)';
  const edge = levelTwo ? '#2dd4bf' : '#67e8f9';

  ctx.save();
  ctx.fillStyle = fill;
  ctx.shadowColor = levelTwo ? 'rgba(20,184,166,0.45)' : 'rgba(139,92,246,0.42)';
  ctx.shadowBlur = 8;
  ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
  ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, pipe.bottomHeight);
  ctx.restore();

  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.strokeRect(pipe.x, -1, PIPE_WIDTH, pipe.topHeight + 1);
  ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, pipe.bottomHeight + 1);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  for (let y = 14; y < pipe.topHeight - 5; y += 22) {
    ctx.beginPath();
    ctx.moveTo(pipe.x + 3, y);
    ctx.lineTo(pipe.x + 10, y);
    ctx.stroke();
  }

  if (pipe.index === 40) {
    ctx.fillStyle = 'rgba(167,243,208,0.78)';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL 2 // LOCKED', pipe.x + PIPE_WIDTH / 2, pipe.topHeight + 67);
  }
};

const drawBird = (ctx: CanvasRenderingContext2D, frame: ArcRunReplayFrame) => {
  ctx.save();
  ctx.translate(BIRD_X, frame.birdY);
  ctx.rotate(frame.birdAngle);

  const orb = ctx.createRadialGradient(-4, -5, 2, 0, 0, 15);
  orb.addColorStop(0, '#ddd6fe');
  orb.addColorStop(0.58, '#8b5cf6');
  orb.addColorStop(1, '#4c1d95');
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(34,211,238,0.85)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(5, -4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(6.5, -4, 2.8, 0, Math.PI * 2);
  ctx.fill();

  const wing = Math.sin(frame.elapsedMs / 70) * 5;
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(-17, -4 - wing);
  ctx.lineTo(-10, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawReplay = (ctx: CanvasRenderingContext2D, frame: ArcRunReplayFrame) => {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#72d8ff');
  sky.addColorStop(0.55, '#a8ddff');
  sky.addColorStop(1, '#42d5ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (frame.nightMix > 0) {
    const night = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    night.addColorStop(0, '#020617');
    night.addColorStop(0.5, '#11103d');
    night.addColorStop(1, '#06283f');
    ctx.globalAlpha = frame.nightMix;
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.34)';
  drawCloud(ctx, 90 - (frame.elapsedMs * 0.014) % 760, 62, 0.9);
  drawCloud(ctx, 420 - (frame.elapsedMs * 0.009) % 820, 112, 1.25);

  frame.pipes.forEach((pipe) => drawPipe(ctx, pipe));
  drawBird(ctx, frame);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.48)';
  ctx.beginPath();
  ctx.roundRect(WIDTH / 2 - 62, 14, 124, 58, 18);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(String(frame.score), WIDTH / 2, 52);
  ctx.font = '8px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.68)';
  ctx.fillText('FLIGHT POINTS', WIDTH / 2, 65);

  // The replay is intentionally captured at a low frame rate. Sparse scan
  // lines, deterministic luma noise, and a washed edge suggest old mobile
  // compression without turning the footage into a horror effect.
  ctx.fillStyle = 'rgba(10,16,30,0.055)';
  for (let y = 0; y < HEIGHT; y += 4) ctx.fillRect(0, y, WIDTH, 1);

  const frameNumber = Math.floor(frame.elapsedMs / (1000 / CAPTURE_FPS));
  for (let i = 0; i < 38; i++) {
    const x = (i * 97 + frameNumber * 31) % WIDTH;
    const y = (i * 53 + frameNumber * 17) % HEIGHT;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,225,190,0.05)' : 'rgba(25,35,60,0.06)';
    ctx.fillRect(x, y, 9 + (i % 5) * 5, 2 + (i % 3));
  }

  ctx.textAlign = 'left';
  ctx.font = '8px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.58)';
  ctx.fillText('ARC_184 · MOBILE CAPTURE', 10, HEIGHT - 12);
};

export const ArcRunReplay: React.FC<ArcRunReplayProps> = ({ active, paused, onBarrageChange, onPausePoint }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const barrageCallbackRef = useRef(onBarrageChange);
  const pausePointCallbackRef = useRef(onPausePoint);
  const pausedRef = useRef(paused);

  useEffect(() => {
    barrageCallbackRef.current = onBarrageChange;
  }, [onBarrageChange]);

  useEffect(() => {
    pausePointCallbackRef.current = onPausePoint;
  }, [onPausePoint]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let animationFrame = 0;
    let lastCaptureFrame = -1;
    let previousBarrage = false;
    let pauseRequested = false;
    let elapsed = 0;
    let previousNow = performance.now();

    const render = (now: number) => {
      const previousElapsed = elapsed;
      const delta = Math.min(100, Math.max(0, now - previousNow));
      previousNow = now;
      if (!pausedRef.current) elapsed = (elapsed + delta) % ARC_RUN_REPLAY_DURATION_MS;
      if (elapsed < previousElapsed) pauseRequested = false;

      const captureFrame = Math.floor(elapsed / (1000 / CAPTURE_FPS));
      if (captureFrame !== lastCaptureFrame) {
        const frame = getArcRunReplayFrame(elapsed);
        drawReplay(ctx, frame);
        lastCaptureFrame = captureFrame;
        if (frame.barrageActive !== previousBarrage) {
          previousBarrage = frame.barrageActive;
          barrageCallbackRef.current(frame.barrageActive);
        }
        if (!pauseRequested && elapsed >= ARC_RUN_AUTO_PAUSE_MS) {
          pauseRequested = true;
          pausePointCallbackRef.current();
        }
      }
      animationFrame = requestAnimationFrame(render);
    };

    drawReplay(ctx, getArcRunReplayFrame(0));
    barrageCallbackRef.current(false);
    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrame);
      barrageCallbackRef.current(false);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="h-full w-full bg-black object-cover [filter:saturate(.72)_contrast(.92)_sepia(.13)_blur(.15px)]"
      id="arc-run-replay-canvas"
      aria-label="Accelerated archived gameplay replay of ARC_184 approaching Gate 40"
    />
  );
};
