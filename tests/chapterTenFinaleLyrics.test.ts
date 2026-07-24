import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  getChapterTenFinaleLyric,
  getFinaleLyricWordIndex,
  parseChapterTenFinaleSrt,
} from '../src/lib/chapterTenFinaleLyrics';

test('the Chapter 10 Finale uses audio-derived SRT timing and a right-edge tap pose', () => {
  const gameSource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const srt = readFileSync(new URL('../public/assets/music/Phase 10 (Finale).srt', import.meta.url), 'utf8');
  const auditSrt = readFileSync(new URL('../output/transcribe/phase-10-finale/Phase 10 (Finale).srt', import.meta.url), 'utf8');
  const cues = parseChapterTenFinaleSrt(srt);

  assert.equal(auditSrt, srt);
  assert.equal(cues.length, 36);
  assert.equal(getChapterTenFinaleLyric(41.98, cues)?.line, 'Would someone still remember this place?');
  assert.equal(getChapterTenFinaleLyric(54.8, cues)?.line, 'Don’t chase the highest score tonight');
  assert.equal(getChapterTenFinaleLyric(90.38, cues)?.line, 'You found the path');
  const finalCue = getChapterTenFinaleLyric(112, cues);
  assert.equal(finalCue?.line, 'Thank you for reaching the end.');
  assert.equal(getFinaleLyricWordIndex(111.36, finalCue, 6), 0);
  assert.equal(getChapterTenFinaleLyric(115, cues), null);
  assert.match(gameSource, /Phase%2010%20\(Finale\)\.srt/);
  assert.match(gameSource, /data-lyric-time=/);
  assert.match(gameSource, /!chapterTenCreditsActive/);
  assert.match(metaSource, /pulsePlayerTap = useCallback\(\(id: string, point\?: MetaTapPoint\)/);
  assert.match(metaSource, /point \? point\.clientX - sceneRect\.left/);
  assert.match(metaSource, /point \? point\.clientY - sceneRect\.top/);
  assert.match(metaSource, /const selector = 'button:not\(\[disabled\]\)/);
  assert.match(metaSource, /recoveredClickPointRef\.current = \{ clientX: event\.clientX, clientY: event\.clientY \}/);
  assert.match(metaSource, /flappyTap \? 0\.88/);
  assert.match(metaSource, /flappyTap \? 0\.52/);
  assert.match(metaSource, /data-finger-orientation="restored-right-hand-upper-left-tap"/);
  assert.match(metaSource, /transformOrigin: '40% 5\.8%'[\s\S]{0,120}rotate: '-35deg'/);
  assert.match(gameSource, /pulsePlayerTap\('flappy-canvas', point\)/);
});
