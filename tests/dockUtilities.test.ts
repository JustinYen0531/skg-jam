import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const phoneSource = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
const metaSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
const audioSource = readFileSync(new URL('../src/lib/audio.ts', import.meta.url), 'utf8');
const musicSource = readFileSync(new URL('../src/lib/music.ts', import.meta.url), 'utf8');
const typesSource = readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');

test('dock utilities stay on the home screen in one small non-modal popover', () => {
  assert.match(phoneSource, /role="dialog"/);
  assert.match(phoneSource, /aria-modal="false"/);
  assert.match(phoneSource, /id="home-dock-utility-popover"/);
  assert.match(phoneSource, /w-\[min\(88%,400px\)\]/);
  assert.doesNotMatch(typesSource, /'voicelog'|'filebox'|'gallery'|'terminal'|'controls'/);
  assert.match(phoneSource, /toggleDockUtility\(utility\)/);
  assert.match(phoneSource, /id="home-dock"\s+data-meta-immediate="true"/);
  assert.match(phoneSource, /onPointerDown=\{\(event\) => handleDockUtilityPointerDown\(event, utility\)\}/);
  assert.doesNotMatch(phoneSource, /handleDockUtilityPointerUp/);
  assert.match(phoneSource, /onClick=\{\(event\) => handleDockUtilityClick\(event, utility\)\}/);
  assert.match(metaSource, /onPointerDownCapture=\{handlePointerDownCapture\}/);
  assert.match(metaSource, /#home-dock button, button\[data-meta-hit-recovery="true"\]/);
  assert.match(metaSource, /input\[data-meta-hit-recovery="true"\]/);
  assert.match(metaSource, /getBoundingClientRect\(\)/);
  assert.match(metaSource, /const hitSlop = 16/);
  assert.match(metaSource, /control instanceof HTMLButtonElement && !control\.disabled\) control\.click\(\)/);
  assert.match(metaSource, /className="pointer-events-none absolute bottom-\[2\.5%\][^"]+"\s+id="meta-terminal-dialogue"/);
});

test('all five dock icons expose working utility controls', () => {
  for (const utility of ['voicelog', 'filebox', 'gallery', 'terminal', 'controls']) {
    assert.match(phoneSource, new RegExp(`\\['[^']+', '${utility}', Icon`));
  }

  for (const controlId of [
    'dock-music-volume',
    'dock-sound-volume',
    'dock-master-mute',
    'dock-restart-chapter',
    'dock-restart-loop',
    'dock-screen-brightness',
    'dock-screen-contrast',
    'dock-open-developer-tools',
    'dock-camera-follow',
    'dock-desk-posture',
    'dock-fullscreen-only',
  ]) {
    assert.match(phoneSource, new RegExp(`id="${controlId}"`));
  }
});

test('audio sliders control the real Web Audio and music output', () => {
  assert.match(audioSource, /setVolume\(volume: number\)/);
  assert.match(audioSource, /MASTER_GAIN \* this\.volume/);
  assert.match(musicSource, /setVolume\(volume: number\)/);
  assert.match(musicSource, /0\.28 \* Math\.max\(0, Math\.min\(1, volume\)\)/);
  assert.match(appSource, /audio\.setVolume\(soundVolume\)/);
  assert.match(appSource, /music\.setVolume\(musicVolume\)/);
});

test('Terminal opens the existing developer panel and keeps Meta active', () => {
  assert.match(appSource, /const openDeveloperTools = \(\) => \{[\s\S]{0,100}setDebugMode\(true\);[\s\S]{0,100}setMetaViewActive\(true\);/);
  assert.match(phoneSource, /onOpenDeveloperTools\(\)/);
  assert.match(phoneSource, /setDockUtility\(null\)/);
});

test('Controls independently gate camera follow and desk posture', () => {
  assert.match(metaSource, /if \(!active \|\| !cameraPitchEnabled \|\| deviceResting/);
  assert.match(metaSource, /const postureAction = postureControlEnabled/);
  assert.match(metaSource, /if \(!postureControlEnabled\) setDeviceResting\(false\)/);
  assert.match(phoneSource, /onCameraPitchEnabledChange\(!cameraPitchEnabled\)/);
  assert.match(phoneSource, /onPostureControlEnabledChange\(!postureControlEnabled\)/);
});

test('Controls provides a persistent fullscreen-only Meta bypass', () => {
  assert.match(phoneSource, /id="dock-fullscreen-only"/);
  assert.match(phoneSource, /aria-checked=\{fullscreenOnly\}/);
  assert.match(phoneSource, /onFullscreenOnlyChange\(!fullscreenOnly\)/);
  assert.match(phoneSource, /data-meta-hit-recovery="true"/);
  assert.match(appSource, /FULLSCREEN_ONLY_STORAGE_KEY = 'skg\.fullscreenOnly'/);
  assert.match(appSource, /localStorage\.getItem\(FULLSCREEN_ONLY_STORAGE_KEY\) === 'true'/);
  assert.match(appSource, /localStorage\.setItem\(FULLSCREEN_ONLY_STORAGE_KEY, String\(fullscreenOnly\)\)/);
  assert.match(appSource, /const metaSceneActive = !fullscreenOnly && shouldShowMetaScene/);
  assert.match(appSource, /fullscreenOnly=\{fullscreenOnly\}/);
  assert.match(appSource, /onFullscreenOnlyChange=\{setFullscreenOnly\}/);
});

test('FileBox destructive actions require the same choice twice', () => {
  assert.match(phoneSource, /if \(resetConfirmation !== target\)/);
  assert.match(phoneSource, /setResetConfirmation\(target\)/);
  assert.match(phoneSource, /if \(target === 'chapter'\) onRestartCurrentChapter\(\)/);
  assert.match(phoneSource, /else onRestartLoop\(\)/);
});
