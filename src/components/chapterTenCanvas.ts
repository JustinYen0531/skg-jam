import {
  CHAPTER_TEN_SCORE_OVERFLOW,
  distanceToEnd,
  type ChapterTenPhase,
  type RoutePoint,
} from '../lib/chapterTenFlight';
import {
  CHAPTER_TEN_COMPLETE_LINES,
  CHAPTER_TEN_DEV_RESIDUE,
  CHAPTER_TEN_MEMORY_LINES,
  CHAPTER_TEN_TERMINAL_LABEL,
  getBirdForm,
  getGeometryProgress,
  getHudMode,
  getObstacleForm,
  getPixelPresence,
  getShellOpacity,
  getTerminalDrain,
} from '../lib/chapterTenVisualPhases';

interface PipeShape {
  x: number;
  topHeight: number;
  bottomHeight: number;
}

export const drawChapterTenWorld = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  score: number,
  frame: number,
): void => {
  const drain = getTerminalDrain(score);
  ctx.fillStyle = `rgb(${Math.round(8 + 18 * (1 - drain))} ${Math.round(18 + 38 * (1 - drain))} ${Math.round(24 + 48 * (1 - drain))})`;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.globalAlpha = 0.24 + getPixelPresence(score) * 0.5;
  ctx.fillStyle = '#79a9a1';
  ctx.fillRect(0, height * 0.72, width, height * 0.28);
  ctx.fillStyle = '#172d35';
  for (let x = -((frame * 0.5) % 72); x < width; x += 72) {
    ctx.fillRect(x, height * 0.72 - 18 - (((x / 72) | 0) & 3) * 12, 56, 66);
  }
  ctx.restore();
  const geometry = getGeometryProgress(score);
  if (geometry > 0) {
    ctx.save();
    ctx.globalAlpha = geometry * 0.28;
    ctx.strokeStyle = '#b8c7c3';
    for (let x = -((frame * 0.8) % 32); x < width; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = getShellOpacity(score) * 0.55;
  ctx.fillStyle = '#6d28d9';
  for (let i = 0; i < 9; i += 1) {
    ctx.fillRect((i * 137 - frame * (1 + i * 0.04)) % (width + 100), 20 + (i % 4) * 88, 42, 5);
  }
  ctx.restore();
};

export const drawChapterTenPipe = (
  ctx: CanvasRenderingContext2D,
  pipe: PipeShape,
  height: number,
  score: number,
): void => {
  const bottomY = height - pipe.bottomHeight;
  const form = getObstacleForm(score);
  ctx.save();
  ctx.strokeStyle = form === 'data-boundary' ? 'rgba(205,220,216,.62)' : '#708f70';
  ctx.fillStyle = '#426b48';
  if (form === 'pixel' || form === 'pixel-with-box') {
    ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
    ctx.fillRect(pipe.x, bottomY, 50, pipe.bottomHeight);
  }
  ctx.strokeRect(pipe.x, -1, 50, pipe.topHeight + 1);
  ctx.strokeRect(pipe.x, bottomY, 50, pipe.bottomHeight + 1);
  if (form === 'pixel-with-box') {
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(pipe.x - 3, -1, 56, pipe.topHeight + 4);
    ctx.strokeRect(pipe.x - 3, bottomY - 3, 56, pipe.bottomHeight + 4);
  }
  ctx.restore();
};

export const drawChapterTenBird = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  score: number,
): void => {
  const form = getBirdForm(score);
  ctx.save();
  if (form === 'pixel-bird' || form === 'outlined-bird') {
    ctx.fillStyle = '#d8b84f'; ctx.fillRect(x - 11, y - 8, 18, 16);
    ctx.fillStyle = '#e8d88b'; ctx.fillRect(x - 5, y - 11, 12, 5);
    ctx.fillStyle = '#1b2528'; ctx.fillRect(x + 2, y - 7, 3, 3);
    ctx.fillStyle = '#b86135'; ctx.fillRect(x + 7, y - 2, 8, 4);
    if (form === 'outlined-bird') ctx.strokeRect(x - 13, y - 13, 30, 26);
  } else if (form === 'outline') {
    ctx.strokeStyle = '#dce7e2'; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.fillStyle = '#e7eee9'; ctx.beginPath(); ctx.arc(x, y, form === 'coordinate' ? 2.5 : 4, 0, Math.PI * 2); ctx.fill();
    if (form === 'coordinate') {
      ctx.font = '9px "JetBrains Mono"'; ctx.fillText(`(${Math.round(x)},${Math.round(y)})`, x + 8, y - 7);
    }
  }
  ctx.restore();
};

export const drawChapterTenRoutePoint = (
  ctx: CanvasRenderingContext2D,
  pipeX: number,
  point: RoutePoint,
  collected: boolean,
): void => {
  ctx.save();
  ctx.globalAlpha = collected ? 0.2 : 0.72;
  ctx.fillStyle = collected ? '#80908b' : '#f0ddb0';
  ctx.beginPath(); ctx.arc(pipeX + 25, point.y, collected ? 2 : 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = '7px "JetBrains Mono"'; ctx.fillText(String(point.altitude), pipeX + 32, point.y + 2);
  ctx.restore();
};

export const drawChapterTenHud = (
  ctx: CanvasRenderingContext2D,
  width: number,
  score: number,
  collected: number,
  required: number,
): void => {
  ctx.save();
  ctx.fillStyle = 'rgba(4,10,13,.76)'; ctx.fillRect(14, 14, 190, 42);
  ctx.fillStyle = '#dce7e2'; ctx.font = '10px "JetBrains Mono"';
  ctx.fillText(getHudMode(score) === 'distance-to-end' ? `DISTANCE TO END  ${distanceToEnd(score)}` : 'LOCAL RANK  ARC_184', 24, 31);
  ctx.fillStyle = '#8fa8a0'; ctx.fillText(`TRACE ${collected}/${required}`, 24, 47);
  ctx.textAlign = 'right'; ctx.fillText(String(score).padStart(3, '0'), width - 20, 31);
  ctx.restore();
};

export const drawChapterTenBeat = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: ChapterTenPhase,
  score: number,
  beatFrames: number,
): void => {
  if (phase === 'restored-2013' && score > 165) {
    ctx.save(); ctx.globalAlpha = 0.34; ctx.font = '8px "JetBrains Mono"'; ctx.fillStyle = '#b9c8c3';
    CHAPTER_TEN_DEV_RESIDUE.forEach((line, i) => ctx.fillText(line, width - 170, 28 + i * 13)); ctx.restore();
  }
  if ((phase === 'memory-184' || beatFrames > 0) && beatFrames < 210) {
    ctx.save(); ctx.fillStyle = 'rgba(3,7,9,.84)'; ctx.fillRect(width / 2 - 118, height / 2 - 58, 236, 116);
    ctx.textAlign = 'center'; ctx.font = '11px "JetBrains Mono"';
    CHAPTER_TEN_MEMORY_LINES.forEach((line, i) => {
      ctx.fillStyle = i === 2 ? '#f0ddb0' : '#c8d5d1'; ctx.fillText(line, width / 2, height / 2 - 30 + i * 19);
    });
    ctx.restore();
  }
  if (phase === 'terminal-256') {
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.93)'; ctx.fillRect(width - 128, 0, 128, height);
    ctx.translate(width - 64, height / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center';
    ctx.fillStyle = '#b74d46'; ctx.font = '12px "JetBrains Mono"'; ctx.fillText(CHAPTER_TEN_TERMINAL_LABEL, 0, 4); ctx.restore();
  }
};

export const drawChapterTenComplete = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
): void => {
  ctx.fillStyle = '#050708'; ctx.fillRect(0, 0, width, height);
  ctx.textAlign = 'center'; ctx.font = '17px "JetBrains Mono"'; ctx.fillStyle = '#dce7e2';
  ctx.fillText(CHAPTER_TEN_COMPLETE_LINES[0], width / 2, height / 2 - 20);
  ctx.font = '10px "JetBrains Mono"'; ctx.fillStyle = '#8fa8a0';
  ctx.fillText(CHAPTER_TEN_COMPLETE_LINES[1], width / 2, height / 2 + 8);
  const overflow = CHAPTER_TEN_SCORE_OVERFLOW[Math.min(2, Math.floor(frame / 45))];
  ctx.fillText(`SCORE ${overflow}`, width / 2, height / 2 + 36);
};
