import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { getMusicPhase, MUSIC_TRACKS } from '../src/lib/music';

test('all eleven renamed phase tracks exist in the public music folder', () => {
  assert.equal(Object.keys(MUSIC_TRACKS).length, 11);

  for (let phase = 1; phase <= 11; phase += 1) {
    const path = new URL(`../public/assets/music/Phase ${phase}.mp3`, import.meta.url);
    assert.equal(existsSync(path), true, `missing Phase ${phase}.mp3`);
  }
});

test('Chapter 0 uses Phase 1 and investigation Chapters 1–10 use Phases 2–11', () => {
  assert.equal(getMusicPhase({ phase: 'intro_game', currentChapter: 1 }), 1);
  assert.equal(getMusicPhase({ phase: 'os_unlocked', currentChapter: 1 }), 2);
  assert.equal(getMusicPhase({ phase: 'os_unlocked', currentChapter: 5 }), 6);
  assert.equal(getMusicPhase({ phase: 'credits', currentChapter: 10 }), 11);
});

test('the app follows chapter changes and shares the global mute control with music', () => {
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const musicSource = readFileSync(new URL('../src/lib/music.ts', import.meta.url), 'utf8');

  assert.match(appSource, /music\.setPhase\(activeMusicPhase\)/);
  assert.match(appSource, /music\.setMuted\(isMuted\)/);
  assert.match(musicSource, /next\.loop = true/);
  assert.match(musicSource, /phase === this\.currentPhase/);
});
