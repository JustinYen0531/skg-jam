import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getChapterPhoneSignals } from '../src/lib/chapterPhoneSignals';

test('chapters 1 through 5 use restrained notification and recent-use signals', () => {
  assert.deepEqual(getChapterPhoneSignals(1), {
    notification: {
      app: 'viewtube',
      label: '1',
      tone: 'unread',
      accessibleLabel: 'ViewTube has one unread update',
    },
    recentApp: null,
    fileBoxDownload: false,
  });

  assert.equal(getChapterPhoneSignals(2).notification, null);
  assert.equal(getChapterPhoneSignals(2).recentApp, 'viewtube');
  assert.equal(getChapterPhoneSignals(2).fileBoxDownload, true);

  assert.equal(getChapterPhoneSignals(3).notification?.app, 'amazemart');
  assert.equal(getChapterPhoneSignals(3).recentApp, 'browser');
  assert.equal(getChapterPhoneSignals(4).notification?.app, 'screenshots');
  assert.equal(getChapterPhoneSignals(4).recentApp, 'amazemart');
  assert.equal(getChapterPhoneSignals(5).notification?.app, 'browser');
  assert.equal(getChapterPhoneSignals(5).notification?.tone, 'quiet');
  assert.equal(getChapterPhoneSignals(5).recentApp, 'screenshots');
});

test('later chapters remain unchanged until their own implementation pass', () => {
  for (const chapter of [6, 7, 8, 9, 10] as const) {
    assert.deepEqual(getChapterPhoneSignals(chapter), {
      notification: null,
      recentApp: null,
      fileBoxDownload: false,
    });
  }
});

test('phone signals are wired without moving launchers or adding quest copy', () => {
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
  assert.match(source, /data-filebox-status="download"/);
  assert.doesNotMatch(source, /Recommended|Continue search|launcherOrder|data-home-rank/);
});
