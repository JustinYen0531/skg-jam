import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getChapterEnvironment } from '../src/lib/chapterEnvironment';

const source = readFileSync(new URL('../src/components/ChapterEnvironment.tsx', import.meta.url), 'utf8');

test('desk drinks begin below the dialogue center in both camera postures', () => {
  assert.match(source, /left-\[6%\] top-\[76%\] scale-\[2\.025\]/);
  assert.match(source, /left-\[4%\] top-\[90%\] scale-\[2\.7\]/);
  assert.match(source, /transition-\[top,left,scale\]/);
});

test('coffee and energy cans share the lowered desk anchors', () => {
  assert.match(source, /right-\[8%\] top-\[76%\] scale-\[2\.1\]/);
  assert.match(source, /right-\[6%\] top-\[89%\] scale-\[2\.8125\]/);
  assert.match(source, /transition-\[top,right,scale\]/);
});

test('the tipped coffee remains from Chapter 5 through Chapter 10', () => {
  for (const chapter of [5, 6, 7, 8, 9, 10] as const) {
    const environment = getChapterEnvironment(chapter);
    assert.equal(environment.coffee, 'tipped-empty');
    assert.equal(environment.coffeeSpill, true);
  }
});
