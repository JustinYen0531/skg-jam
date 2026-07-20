import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const audioSource = readFileSync(new URL('../src/lib/audio.ts', import.meta.url), 'utf8');
const flappySource = readFileSync(new URL('../src/components/FlappyGame.tsx', import.meta.url), 'utf8');
const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const leaderboardSource = readFileSync(new URL('../src/components/LeaderboardPanel.tsx', import.meta.url), 'utf8');
const screenshotsSource = readFileSync(new URL('../src/components/SavedScreenshots.tsx', import.meta.url), 'utf8');

test('P0 and P1 sounds use audible event gain with a final limiter', () => {
  assert.match(audioSource, /gameplay: 4\.5/);
  assert.match(audioSource, /ui: 4\.5/);
  assert.match(audioSource, /narrative: 7/);
  assert.match(audioSource, /metaFoley: 5/);
  assert.match(audioSource, /createDynamicsCompressor\(\)/);
  assert.match(audioSource, /peak \* EVENT_GAIN\[busName\]/);
});

test('Web Audio resumes from real input and retries the triggering sound', () => {
  assert.match(audioSource, /armUnlock\(\)/);
  assert.match(audioSource, /addEventListener\('pointerdown', unlock, true\)/);
  assert.match(audioSource, /ctx\.resume\(\)\.then/);
  assert.match(audioSource, /this\.play\(event, options\)/);
});

test('core P0 sound events remain connected to gameplay and the Meta interface', () => {
  assert.match(flappySource, /audio\.play\('flight\.flap'\)/);
  assert.match(flappySource, /audio\.play\('flight\.score'/);
  assert.match(flappySource, /audio\.play\('flight\.pipeHit'/);
  assert.match(flappySource, /audio\.play\('flight\.deathResult'/);
  assert.match(phoneSource, /audio\.play\('phone\.appOpen'\)/);
  assert.match(phoneSource, /audio\.play\('phone\.home'\)/);
  assert.match(metaSource, /audio\.play\('key\.character'\)/);
  assert.match(metaSource, /audio\.play\('meta\.fingerContact'\)/);
  assert.match(metaSource, /audio\.play\('meta\.cameraPullback'\)/);
  assert.match(audioSource, /case 'narrative\.glyph'/);
});

test('P2 fine-detail sounds are defined, restrained, and connected to their interactions', () => {
  for (const event of [
    'leaderboard.rowPass',
    'leaderboard.percent',
    'phone.scrollLimit',
    'meta.fingerRelease',
    'meta.deviceCreak',
    'meta.deskContact',
    'screenshot.rotate',
    'story.downloadCount',
  ]) {
    assert.match(audioSource, new RegExp(`case '${event.replace('.', '\\.')}'`));
  }
  assert.match(audioSource, /const pastArc = count > 184/);
  assert.match(audioSource, /if \(!pastArc && count > 0 && count % 5 === 0\)/);
  assert.match(audioSource, /nowT - \(this\.lastPlayed\['creak'\] \?\? 0\) < 30/);
  assert.match(leaderboardSource, /audio\.play\('leaderboard\.rowPass'\)/);
  assert.match(leaderboardSource, /audio\.play\('leaderboard\.percent'\)/);
  assert.match(metaSource, /audio\.play\('phone\.scrollLimit'\)/);
  assert.match(metaSource, /audio\.play\('meta\.fingerRelease'\)/);
  assert.match(metaSource, /audio\.play\('meta\.deskContact', \{ delay: 1\.15 \}\)/);
  assert.match(metaSource, /audio\.play\('meta\.deviceCreak'\)/);
  assert.match(screenshotsSource, /audio\.play\('screenshot\.rotate'\)/);
  assert.equal((appSource.match(/audio\.play\('story\.downloadCount'/g) ?? []).length, 2);
});
