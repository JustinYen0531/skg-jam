import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CHAPTER_NINE_DELETABLE_APPS,
  addDeletedChapterNineApp,
  canDeleteChapterNineApp,
  getChapterNineBatteryPercent,
  getChapterNineDeletionStage,
  getChapterNineRestorePercent,
  isChapterNineMessagesStandoffReady,
} from '../src/lib/chapterNineDeletion';
import {
  CHAPTER_NINE_CHILD_PROFILE,
  CHAPTER_NINE_PLAYER_PASSWORD,
  canRecoverChapterNineChildProfile,
  getChapterNinePasswordResult,
} from '../src/lib/chapterNineRecovery';

const readComponent = (name: string) =>
  readFileSync(new URL(`../src/components/${name}.tsx`, import.meta.url), 'utf8');

test('Chapter 9 deletion is free within each tier but cannot skip emotional thresholds', () => {
  assert.equal(canDeleteChapterNineApp('about', []), true);
  assert.equal(canDeleteChapterNineApp('viewtube', []), false);
  assert.equal(canDeleteChapterNineApp('screenshots', []), false);
  assert.equal(canDeleteChapterNineApp('browser', []), false);
  assert.equal(canDeleteChapterNineApp('messages', []), false);

  const manualGone = ['about'] as const;
  assert.equal(getChapterNineDeletionStage(manualGone).id, 'disposable');
  assert.equal(canDeleteChapterNineApp('viewtube', manualGone), true);
  assert.equal(canDeleteChapterNineApp('social', manualGone), false);

  const disposableGone = [...manualGone, 'amazemart', 'screenshots', 'viewtube'] as const;
  assert.equal(getChapterNineDeletionStage(disposableGone).id, 'history');
  assert.equal(canDeleteChapterNineApp('browser', disposableGone), true);
  assert.equal(canDeleteChapterNineApp('social', disposableGone), true);
  assert.equal(canDeleteChapterNineApp('messages', disposableGone), false);

  const historyGone = [...disposableGone, 'browser', 'social'] as const;
  assert.equal(getChapterNineDeletionStage(historyGone).id, 'memory');
  assert.equal(canDeleteChapterNineApp('messages', historyGone), true);
});

test('the fixed child profile uses ARC_184 as a narrative misread before revealing Arcane', () => {
  assert.equal(CHAPTER_NINE_CHILD_PROFILE.score, 184);
  assert.equal(CHAPTER_NINE_CHILD_PROFILE.signature, 'LUMEN ARC · DEVICE VERIFIED');
  assert.equal(CHAPTER_NINE_PLAYER_PASSWORD, 'ARCANE');
  assert.equal(getChapterNinePasswordResult('ARC-184'), 'record-alias');
  assert.equal(getChapterNinePasswordResult('wrong'), 'rejected');
  assert.equal(canRecoverChapterNineChildProfile('Arcane'), true);
});

test('Messages standoff is available only after every other app has been removed', () => {
  const beforeMessages = CHAPTER_NINE_DELETABLE_APPS.filter((app) => app !== 'messages');
  assert.equal(isChapterNineMessagesStandoffReady(beforeMessages), true);
  assert.equal(isChapterNineMessagesStandoffReady(beforeMessages.slice(1)), false);
});

test('restore progress rises while battery falls from player actions', () => {
  const oneDeleted = addDeletedChapterNineApp([], 'viewtube');
  const sixDeleted = CHAPTER_NINE_DELETABLE_APPS.filter((app) => app !== 'messages');

  assert.equal(getChapterNineRestorePercent([]), 58);
  assert.ok(getChapterNineRestorePercent(oneDeleted) > getChapterNineRestorePercent([]));
  assert.equal(getChapterNineRestorePercent(sixDeleted), 96);
  assert.equal(getChapterNineBatteryPercent([], 0), 6);
  assert.equal(getChapterNineBatteryPercent(sixDeleted, 2), 1);
  assert.equal(getChapterNineBatteryPercent(sixDeleted, 3), 0);
});

test('runtime connects storage cleanup, the unresolved power loss, and silent Chapter 10 home', () => {
  const phone = readComponent('PhoneSimulator');
  const messages = readComponent('MessagesApp');
  const home = readComponent('ChapterNineDeletionHome');

  assert.match(messages, /id="chapter-nine-legacy-restore"/);
  assert.match(messages, /id="chapter-nine-child-profile"/);
  assert.doesNotMatch(messages, /id="chapter-nine-profile-choices"/);
  assert.match(messages, /Who once held first place in this game/);
  assert.match(messages, /RECOVERED ACCOUNT OWNER · ARCANE KADE/);
  assert.match(messages, /id="chapter-nine-player-password"/);
  assert.match(messages, /id="chapter-nine-download-progress"/);
  assert.match(messages, /id="chapter-nine-storage-error"/);
  assert.match(messages, /onClick=\{onBeginChapterNineCleanup\}/);
  assert.doesNotMatch(messages, /completePuzzleChapter\(prev, 9/);

  assert.match(phone, /chapterNineMessageAttempts < 3/);
  assert.match(phone, /handleChapterNineLongPressStart/);
  assert.match(phone, /chapter-nine-editing/);
  assert.match(phone, /ChapterNineMakeRoomWidget/);
  assert.match(phone, /activeApp === 'home' && !chapterNineTerminalHome/);
  assert.match(phone, /chapterNineRestorePhase: 'blackout'/);
  assert.match(phone, /metaInteraction\.active && !metaInteraction\.deviceResting/);
  assert.match(phone, /chapterNineArcaneSilent: true/);
  assert.match(phone, /completePuzzleChapter\(poweredDownState, 9/);

  assert.match(home, /id="chapter-nine-messages-standoff"/);
  assert.match(home, /CONFLICTING INPUT/);
  assert.match(home, /id="chapter-nine-power-loss"/);
  assert.match(home, /id="chapter-ten-only-flappy"/);
  assert.match(home, /data-arcane-dialogue="silent"/);
});
