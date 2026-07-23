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

const readComponent = (name: string) =>
  readFileSync(new URL(`../src/components/${name}.tsx`, import.meta.url), 'utf8');

test('Chapter 9 deletion is free within each tier but cannot skip emotional thresholds', () => {
  assert.equal(canDeleteChapterNineApp('viewtube', []), true);
  assert.equal(canDeleteChapterNineApp('screenshots', []), true);
  assert.equal(canDeleteChapterNineApp('browser', []), false);
  assert.equal(canDeleteChapterNineApp('messages', []), false);

  const disposableGone = ['amazemart', 'screenshots', 'viewtube'] as const;
  assert.equal(getChapterNineDeletionStage(disposableGone).id, 'evidence');
  assert.equal(canDeleteChapterNineApp('about', disposableGone), true);
  assert.equal(canDeleteChapterNineApp('social', disposableGone), false);

  const evidenceGone = [...disposableGone, 'about', 'browser'] as const;
  assert.equal(getChapterNineDeletionStage(evidenceGone).id, 'memory');
  assert.equal(canDeleteChapterNineApp('social', evidenceGone), true);
  assert.equal(canDeleteChapterNineApp('messages', evidenceGone), false);
  assert.equal(canDeleteChapterNineApp('messages', [...evidenceGone, 'social']), true);
});

test('Messages standoff is available only after every other app has been removed', () => {
  const beforeMessages = CHAPTER_NINE_DELETABLE_APPS.filter((app) => app !== 'messages');
  assert.equal(isChapterNineMessagesStandoffReady(beforeMessages), true);
  assert.equal(isChapterNineMessagesStandoffReady(beforeMessages.slice(1)), false);
});

test('restore progress rises while battery falls from player actions', () => {
  const oneDeleted = addDeletedChapterNineApp([], 'viewtube');
  const sixDeleted = CHAPTER_NINE_DELETABLE_APPS.filter((app) => app !== 'messages');

  assert.equal(getChapterNineRestorePercent([]), 8);
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
  assert.match(messages, /onClick=\{onBeginChapterNineCleanup\}/);
  assert.doesNotMatch(messages, /completePuzzleChapter\(prev, 9/);

  assert.match(phone, /chapterNineMessageAttempts < 3/);
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
