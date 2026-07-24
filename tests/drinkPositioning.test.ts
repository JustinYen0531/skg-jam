import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getChapterEnvironment } from '../src/lib/chapterEnvironment';

const source = readFileSync(new URL('../src/components/ChapterEnvironment.tsx', import.meta.url), 'utf8');

test('energy drinks begin below the dialogue center in both camera postures', () => {
  assert.match(source, /left-\[6%\] top-\[76%\] scale-\[2\.025\]/);
  assert.match(source, /left-\[4%\] top-\[90%\] scale-\[2\.7\]/);
  assert.match(source, /transition-\[top,left,scale\]/);
  assert.match(source, /CoffeeCup/);
  assert.doesNotMatch(source, /TeaService|PaperBalls/);
});

test('coffee keeps its original lowered desk anchors in both camera postures', () => {
  assert.match(source, /right-\[6%\] top-\[76%\] scale-\[2\.025\]/);
  assert.match(source, /right-\[4%\] top-\[90%\] scale-\[2\.7\]/);
  assert.match(source, /transition-\[top,right,scale\]/);
});

test('the tipped coffee remains from Chapter 5 through Chapter 10', () => {
  for (let chapter = 5; chapter <= 10; chapter += 1) {
    const environment = getChapterEnvironment(chapter as 5 | 6 | 7 | 8 | 9 | 10);
    assert.equal(environment.coffee, 'tipped-empty');
    assert.equal(environment.coffeeSpill, true);
  }
});
