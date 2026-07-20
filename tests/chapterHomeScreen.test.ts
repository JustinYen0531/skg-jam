import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getChapterHomeScreenState,
  getHomeLauncherOrder,
  type HomeLauncherApp,
} from '../src/lib/chapterHomeScreen';

test('chapters 1 through 5 promote the app required by the current investigation beat', () => {
  const expected: Record<number, HomeLauncherApp> = {
    1: 'viewtube',
    2: 'browser',
    3: 'amazemart',
    4: 'screenshots',
    5: 'browser',
  };

  for (const [chapter, app] of Object.entries(expected)) {
    const state = getChapterHomeScreenState(Number(chapter) as 1 | 2 | 3 | 4 | 5);
    assert.equal(state.primaryApp, app);
    assert.equal(getHomeLauncherOrder(state, app), 0);
  }
});

test('chapter-specific phone states stay limited to the relevant surface', () => {
  assert.equal(getChapterHomeScreenState(2).fileBoxStatus, true);
  assert.equal(getChapterHomeScreenState(2).secondaryApp, 'viewtube');
  assert.equal(getChapterHomeScreenState(4).screenshotsCount, 1);
  assert.equal(getChapterHomeScreenState(4).secondaryApp, 'browser');
  assert.equal(getChapterHomeScreenState(5).overOrdered, true);

  assert.equal(getChapterHomeScreenState(1).fileBoxStatus, false);
  assert.equal(getChapterHomeScreenState(3).screenshotsCount, 0);
});

test('later chapters keep the existing launcher layout until their own pass', () => {
  const state = getChapterHomeScreenState(6);
  assert.equal(state.primaryApp, null);
  assert.equal(state.primaryHint, '');
  assert.equal(state.overOrdered, false);
});

test('each chapter keeps every launcher exactly once instead of hiding apps', () => {
  for (const chapter of [1, 2, 3, 4, 5] as const) {
    const order = getChapterHomeScreenState(chapter).launcherOrder;
    assert.equal(order.length, 8);
    assert.equal(new Set(order).size, order.length);
  }
});

test('the phone home screen consumes chapter order, hints, and status markers', () => {
  const source = readFileSync('src/components/PhoneSimulator.tsx', 'utf8');

  assert.match(source, /getChapterHomeScreenState\(progress\.currentChapter\)/);
  assert.match(source, /data-home-rank=/);
  assert.match(source, /data-home-primary-hint=/);
  assert.match(source, /data-filebox-status="download"/);
  assert.match(source, /data-schematics-count=/);
  assert.match(source, /data-home-layout=/);
});
