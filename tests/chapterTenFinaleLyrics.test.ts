import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CHAPTER_TEN_FINALE_LYRICS,
  getChapterTenFinaleLyric,
} from '../src/lib/chapterTenFinaleLyrics';

test('the Chapter 10 Finale uses the supplied lyric as deterministic lower-screen subtitles', () => {
  const gameSource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');

  assert.equal(CHAPTER_TEN_FINALE_LYRICS[0]?.line, 'I made a little world one afternoon');
  assert.equal(CHAPTER_TEN_FINALE_LYRICS.at(-1)?.line, 'Who finally listened');
  assert.equal(getChapterTenFinaleLyric(null), null);
  assert.equal(getChapterTenFinaleLyric(0)?.line, 'I made a little world one afternoon');
  assert.match(gameSource, /id="chapter-ten-finale-lyric-subtitle"/);
  assert.match(gameSource, /!chapterTenCreditsActive/);
  assert.match(metaSource, /data-finger-orientation="upper-right-edge"/);
  assert.match(metaSource, /scaleX: -1/);
});
