import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getChapterPhoneSignals } from '../src/lib/chapterPhoneSignals';
import { DEBUG_CHAPTERS } from '../src/lib/chapterProgress';

test('every chapter notifies the current target and underlines the previous target', () => {
  for (let index = 0; index < DEBUG_CHAPTERS.length; index += 1) {
    const chapter = DEBUG_CHAPTERS[index];
    const previousChapter = DEBUG_CHAPTERS[index - 1];
    const signals = getChapterPhoneSignals(chapter.id);

    if (chapter.targetApp !== 'home') {
      assert.equal(signals.notification.app, chapter.targetApp);
    }
    assert.equal(signals.notification.label, '1');
    if (!previousChapter || previousChapter.targetApp !== 'home') {
      assert.equal(signals.recentApp, previousChapter?.targetApp ?? null);
    }
  }
});

test('chapter 2 points to Wayback and never uses the inactive FileBox dock item', () => {
  const signals = getChapterPhoneSignals(2);

  assert.equal(signals.notification.app, 'browser');
  assert.equal(signals.recentApp, 'viewtube');
  assert.equal('fileBoxDownload' in signals, false);
});

test('consecutive same-app chapters show both current and previous signals together', () => {
  assert.equal(getChapterPhoneSignals(7).notification.app, 'social');
  assert.equal(getChapterPhoneSignals(7).recentApp, 'social');
  assert.equal(getChapterPhoneSignals(9).notification.app, 'messages');
  assert.equal(getChapterPhoneSignals(9).recentApp, 'messages');
});

test('the deletion and silent-home chapters retain understated launcher traces', () => {
  assert.equal(getChapterPhoneSignals(9).notification.app, 'messages');
  assert.equal(getChapterPhoneSignals(10).notification.app, 'flappy');
  assert.equal(getChapterPhoneSignals(10).recentApp, 'messages');
});

test('phone signals are wired without moving launchers or retaining misleading badges', () => {
  const source = readFileSync('src/components/PhoneSimulator.tsx', 'utf8');
  const launcherIds = [
    'launcher-game',
    'launcher-viewtube',
    'launcher-amazemart',
    'launcher-browser',
    'launcher-social',
    'launcher-messages',
    'launcher-screenshots',
    'launcher-about',
  ];

  let previousIndex = -1;
  for (const id of launcherIds) {
    const index = source.indexOf(`id="${id}"`);
    assert.ok(index > previousIndex, `${id} should retain its fixed source position`);
    previousIndex = index;
  }

  assert.match(source, /getChapterPhoneSignals\(progress\.currentChapter\)/);
  assert.match(source, /data-phone-notification=/);
  assert.match(source, /data-recent-app=/);
  assert.match(source, /launcherSignals\('flappy'\)/);
  assert.match(source, /phoneSignals\.notification\.app !== 'flappy'/);
  assert.doesNotMatch(source, /data-filebox-status|fileBoxDownload/);
  assert.doesNotMatch(source, /A notification chip from another system's grammar/);
  assert.doesNotMatch(source, /Recommended|Continue search|launcherOrder|data-home-rank/);
});
