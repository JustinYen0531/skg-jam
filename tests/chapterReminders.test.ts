import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getChapterSnapshot } from '../src/lib/chapterProgress';
import { getChapterReminderRows } from '../src/lib/chapterReminders';

test('reminder timeline spans Chapter 00 through Chapter 10', () => {
  const rows = getChapterReminderRows(getChapterSnapshot(1));

  assert.equal(rows.length, 11);
  assert.deepEqual(rows.map((row) => row.chapter), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(rows[0].status, 'completed');
  assert.equal(rows[1].status, 'current');
});

test('completed chapters receive checks while future tasks become progressively blurred', () => {
  const rows = getChapterReminderRows(getChapterSnapshot(5));

  assert.ok(rows.slice(0, 5).every((row) => row.status === 'completed'));
  assert.equal(rows[5].status, 'current');
  assert.ok(rows.slice(6).every((row) => row.status === 'future'));
  assert.ok(rows[6].blurPx > 0);
  assert.ok(rows[7].blurPx > rows[6].blurPx);
  assert.ok(rows[10].blurPx >= rows[9].blurPx);
});

test('phone reminder exposes a four-row scroll window and follows the current chapter', () => {
  const source = readFileSync('src/components/PhoneSimulator.tsx', 'utf8');

  assert.match(source, /data-reminder-window="four-rows"/);
  assert.match(source, /overflow-y-auto/);
  assert.match(source, /data-reminder-chapter=\{row\.chapter\}/);
  assert.match(source, /reminderListRef\.current/);
  assert.match(source, /data-reminder-status=\{row\.status\}/);
});
