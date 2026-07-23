import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  getFinaleCreditProgress,
  getMusicPhase,
  MUSIC_FADE_MS,
  MUSIC_LOOP_GAP_MS,
  MUSIC_TRACKS,
} from '../src/lib/music';

test('Finale credit progress uses the remaining real playback window', () => {
  assert.equal(
    getFinaleCreditProgress(80, { currentTime: 80, duration: 120, ended: false }),
    0,
  );
  assert.equal(
    getFinaleCreditProgress(80, { currentTime: 100, duration: 120, ended: false }),
    0.5,
  );
  assert.equal(
    getFinaleCreditProgress(80, { currentTime: 120, duration: 120, ended: true }),
    1,
  );
  assert.equal(
    getFinaleCreditProgress(80, { currentTime: 90, duration: null, ended: false }),
    null,
  );
});

test('the complete new phase batch exists in the public music folder', () => {
  const expectedTracks = [
    'Phase 00.mp3',
    'Phase 01.mp3',
    'Phase 02.mp3',
    'Phase 03.mp3',
    'Phase 04.mp3',
    'Phase 05.mp3',
    'Phase 06.mp3',
    'Phase 07.mp3',
    'Phase 08.mp3',
    'Phase 09.mp3',
    'Phase 10.mp3',
    'Phase 10 (Finale).mp3',
  ];

  assert.equal(Object.keys(MUSIC_TRACKS).length, expectedTracks.length);
  for (const track of expectedTracks) {
    const path = new URL(`../public/assets/music/${track}`, import.meta.url);
    assert.equal(existsSync(path), true, `missing ${track}`);
  }
});

test('the cheap game, Meta chapters, and credits select the intended tracks', () => {
  assert.equal(getMusicPhase({ phase: 'intro_game', currentChapter: 1 }), 0);
  assert.equal(getMusicPhase({ phase: 'os_unlocked', currentChapter: 1 }), 1);
  assert.equal(getMusicPhase({ phase: 'os_unlocked', currentChapter: 5 }), 5);
  assert.equal(getMusicPhase({ phase: 'os_unlocked', currentChapter: 9 }), 9);
  assert.equal(getMusicPhase({ phase: 'passed_40', currentChapter: 10 }), 10);
  assert.equal(getMusicPhase({ phase: 'credits', currentChapter: 10 }), 'finale');
  assert.equal(getMusicPhase({ phase: 'ending_choice', currentChapter: 10 }), 10);
});

test('every track fades and repeats only after a short silent gap', () => {
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const musicSource = readFileSync(new URL('../src/lib/music.ts', import.meta.url), 'utf8');

  assert.ok(MUSIC_FADE_MS > 0);
  assert.ok(MUSIC_LOOP_GAP_MS > 0);
  assert.match(appSource, /music\.setPhase\(activeMusicPhase\)/);
  assert.match(appSource, /music\.setMuted\(isMuted\)/);
  assert.match(musicSource, /next\.loop = false/);
  assert.match(musicSource, /track\.ontimeupdate/);
  assert.match(musicSource, /track\.onended/);
  assert.match(musicSource, /this\.fadeIn\(track\)/);
  assert.match(musicSource, /}, MUSIC_LOOP_GAP_MS\)/);
  assert.match(musicSource, /phase === this\.currentPhase/);
});

test('Chapter 10 Finale starts after the typed Gate 40 takeover, plays once, and gates the final choice', () => {
  const flappySource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const musicSource = readFileSync(new URL('../src/lib/music.ts', import.meta.url), 'utf8');

  assert.match(flappySource, /speak\(ARCANE_TAKEOVER_LINES, resumeChapterTenTakeover\)/);
  assert.match(
    flappySource,
    /const resumeChapterTenTakeover[\s\S]*?beginAutonomousControlRef\.current\('flappy-canvas'\)[\s\S]*?music\.playFinaleOnce\(\)/,
  );
  assert.match(musicSource, /private playCurrentOnce = false/);
  assert.match(musicSource, /if \(this\.playCurrentOnce\)/);
  assert.match(musicSource, /this\.finaleEnded = true/);
  assert.match(musicSource, /window\.requestAnimationFrame\(update\)/);
  assert.match(appSource, /getFinaleCreditProgress\(creditsPlaybackStartedAt, finalePlayback\)/);
  assert.match(appSource, /scrollBox\.scrollTop = maxScroll \* progressRatio/);
  assert.match(appSource, /finaleTrackEnded && creditsScrollComplete/);
  assert.match(appSource, /music\.onFinaleEnded\(setFinaleTrackEnded\)/);
  assert.match(appSource, /finaleTrackEnded && creditsScrollComplete \?/);
  assert.match(appSource, /FINAL TRANSMISSION CONTINUES WITH THE SONG/);
});

test('the title logo suppresses only background music while it is mounted', () => {
  const logoSource = readFileSync(new URL('../src/components/GameLogoIntro.tsx', import.meta.url), 'utf8');
  const musicSource = readFileSync(new URL('../src/lib/music.ts', import.meta.url), 'utf8');

  assert.match(logoSource, /music\.setSuppressed\(true\)/);
  assert.match(logoSource, /return \(\) => music\.setSuppressed\(false\)/);
  assert.match(musicSource, /private suppressed = false/);
  assert.match(musicSource, /this\.current\.muted = this\.muted \|\| this\.suppressed/);
});
