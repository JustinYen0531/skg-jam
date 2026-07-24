import assert from 'node:assert/strict';
import test from 'node:test';
import { getChapterPhoneBatteryPercent } from '../src/lib/chapterPhoneBattery';
import { getChapterNineBatteryPercent } from '../src/lib/chapterNineDeletion';

test('the phone battery falls through the investigation, drains in Chapter 9, and returns at Chapter 10', () => {
  const chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
  const values = chapters.map((chapter) => getChapterPhoneBatteryPercent(chapter));

  assert.deepEqual(values, [100, 91, 82, 73, 64, 54, 44, 31, 6]);
  assert.equal(getChapterPhoneBatteryPercent(9, 'cleanup', ['about', 'viewtube', 'amazemart']), getChapterNineBatteryPercent(['about', 'viewtube', 'amazemart']));
  assert.equal(getChapterPhoneBatteryPercent(10, 'rebooted'), 100);
});
