import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getChapterPhoneWidgetState } from '../src/lib/chapterPhoneWidgets';

const chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

test('phone clock advances through one fixed overnight timeline', () => {
  let previous = -1;
  let dayOffset = 0;

  for (const chapter of chapters) {
    const [hours, minutes] = getChapterPhoneWidgetState(chapter).clock.split(':').map(Number);
    if (chapter > 1 && hours < 12 && previous >= 12 * 60) dayOffset = 24 * 60;
    const absoluteMinutes = dayOffset + hours * 60 + minutes;
    assert.ok(absoluteMinutes > previous);
    previous = absoluteMinutes;
  }

  assert.equal(getChapterPhoneWidgetState(1).clock, '19:48');
  assert.equal(getChapterPhoneWidgetState(10).clock, '03:40');
});

test('agenda permanently drops elapsed items and its scroll range shrinks toward the end', () => {
  for (let index = 1; index < chapters.length; index += 1) {
    const previous = getChapterPhoneWidgetState(chapters[index - 1]).agenda.entries;
    const current = getChapterPhoneWidgetState(chapters[index]).agenda.entries;

    assert.equal(current.length, previous.length - 1);
    assert.equal(current[0], previous[1]);
    assert.ok(!current.includes(previous[0]));
  }

  assert.equal(getChapterPhoneWidgetState(1).agenda.entries.length, 12);
  assert.equal(getChapterPhoneWidgetState(9).agenda.entries.length, 4);
  assert.equal(getChapterPhoneWidgetState(10).agenda.entries.length, 3);
});

test('weather cools through the night and every chapter receives distinct widget color', () => {
  const temperatures = chapters.map(
    (chapter) => getChapterPhoneWidgetState(chapter).weather.temperature,
  );
  const weatherBackgrounds = new Set(chapters.map(
    (chapter) => getChapterPhoneWidgetState(chapter).weather.background,
  ));
  const agendaBackgrounds = new Set(chapters.map(
    (chapter) => getChapterPhoneWidgetState(chapter).agenda.background,
  ));

  assert.deepEqual(temperatures, [13, 13, 12, 12, 11, 10, 10, 9, 8, 8]);
  assert.equal(weatherBackgrounds.size, chapters.length);
  assert.equal(agendaBackgrounds.size, chapters.length);
  assert.equal(getChapterPhoneWidgetState(5).agenda.dayLabel, 'WED 12');
  assert.equal(getChapterPhoneWidgetState(6).agenda.dayLabel, 'THU 13');
  assert.equal(getChapterPhoneWidgetState(9).weather.condition, 'Gale warning');
  assert.equal(getChapterPhoneWidgetState(10).weather.condition, 'Violent storm');
  assert.equal(getChapterPhoneWidgetState(10).agenda.footer, '3 LEFT · DEEP NIGHT');
});

test('phone screen consumes chapter widget state and never reads the computer clock', () => {
  const source = readFileSync('src/components/PhoneSimulator.tsx', 'utf8');

  assert.match(source, /getChapterPhoneWidgetState\(progress\.currentChapter\)/);
  assert.match(source, /data-fixed-time=/);
  assert.match(source, /data-weather-chapter=/);
  assert.match(source, /data-agenda-chapter=/);
  assert.match(source, /data-agenda-remaining=/);
  assert.match(source, /id="widget-agenda-scroll"/);
  assert.doesNotMatch(source, /new Date\(\)|setInterval\(updateClock/);
});
