import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createPublicLeaderboard } from '../src/lib/leaderboard';
import {
  CHAPTER_TEN_AFTERWORD_EASTER_EGG_HINTS,
  CHAPTER_TEN_AFTERWORD_OPTIONS,
  CHAPTER_TEN_AFTERWORD_LINES,
} from '../src/lib/chapterTenAfterword';
import { getFinalLyricWordIndex } from '../src/lib/chapterTenCredits';

test('the three imagined outcomes are an optional afterword inside Skyline 256', () => {
  const gameSource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.equal(CHAPTER_TEN_AFTERWORD_OPTIONS.length, 3);
  assert.match(gameSource, /id="chapter-ten-afterword"/);
  assert.match(gameSource, /THREE THINGS THAT COULD HAVE HAPPENED\./);
  assert.match(gameSource, /AFTERWORD \/ OPTIONAL/);
  assert.match(gameSource, /NONE OF THESE CHANGE THE REAL STORY/);
  assert.match(gameSource, /id="chapter-ten-afterword-restart-loop"/);
  assert.match(gameSource, /id="chapter-ten-credit-score-corner"/);
  assert.match(gameSource, /chapter-ten-afterword-remember-/);
  assert.match(gameSource, /CHAPTER_TEN_AFTERWORD_MEMORY_STORAGE_KEY/);
  assert.doesNotMatch(gameSource, /id="chapter-ten-afterword-arcane"/);
  assert.match(gameSource, /speak\(CHAPTER_TEN_AFTERWORD_LINES\[afterword\]\)/);
  assert.match(CHAPTER_TEN_AFTERWORD_LINES.submit.join(' '), /being first matters/);
  assert.match(CHAPTER_TEN_AFTERWORD_LINES.publicize.join(' '), /SKG Automation/);
  assert.match(CHAPTER_TEN_AFTERWORD_LINES.preserve.join(' '), /Dad would understand/);
  assert.match(CHAPTER_TEN_AFTERWORD_EASTER_EGG_HINTS.submit, /LOWEST SCORE/);
  assert.ok(gameSource.indexOf('id="chapter-ten-credit-score"') < gameSource.indexOf('id="chapter-ten-final-lyric"'));
  assert.equal(getFinalLyricWordIndex(0.85), -1);
  assert.equal(getFinalLyricWordIndex(0.86), 0);
  assert.doesNotMatch(appSource, /id="ending-choice-overlay"/);
  assert.doesNotMatch(appSource, /HOW SHOULD THE SKYLINE CONCLUDE\?/);
});

test('the replay leaves only Arcane negative record and zero defeated flyers', () => {
  const finalBoard = createPublicLeaderboard(0, 48, true, false);

  assert.equal(finalBoard.some((entry) => entry.id === 'current-player'), false);
  assert.equal(finalBoard.at(-1)?.name, 'ARCANE');
  assert.equal(finalBoard.at(-1)?.score, -65535);
});

test('Arcane keeps his right hand anchored at the edge during autonomous flight', () => {
  const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.match(metaSource, /autonomousTapping \? 'right-\[-18%\]' : 'right-\[-3%\]'/);
  assert.match(metaSource, /opacity: deviceResting \|\| scrollGesture \? 0 : autonomousTapping \? 1/);
  assert.match(metaSource, /data-hand-edge-offset=\{autonomousTapping \? '18%' : '3%'\}/);
});
