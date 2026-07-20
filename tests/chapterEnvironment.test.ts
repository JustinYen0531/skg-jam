import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CHAPTER_ENVIRONMENTS, getChapterEnvironment } from '../src/lib/chapterEnvironment';

test('defines one deterministic physical environment for Chapter 0 through 10', () => {
  assert.deepEqual(Object.keys(CHAPTER_ENVIRONMENTS).map(Number), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (let chapter = 0; chapter <= 10; chapter += 1) {
    assert.equal(getChapterEnvironment(chapter as keyof typeof CHAPTER_ENVIRONMENTS).chapter, chapter);
  }
});

test('Chapter 0 exposes no physical desk objects', () => {
  assert.deepEqual(getChapterEnvironment(0), {
    chapter: 0,
    caseLabel: 'CHEAP GAME',
    lighting: 'hidden',
    coffee: 'none',
    coffeeRing: false,
    coffeeDrop: false,
    cable: 'none',
    notebook: 'none',
    pen: 'none',
    stickyNote: null,
    deskOrder: 'hidden',
  });
});

test('desk evidence never appears before the player has earned it', () => {
  assert.equal(getChapterEnvironment(3).notebook, 'closed');
  assert.equal(getChapterEnvironment(3).stickyNote, null);
  assert.equal(getChapterEnvironment(4).notebook, 'blank');
  assert.equal(getChapterEnvironment(5).stickyNote, '');
  assert.equal(getChapterEnvironment(6).stickyNote, 'NOAH KADE?');
  assert.equal(getChapterEnvironment(7).notebook, 'noah');
  assert.equal(getChapterEnvironment(7).stickyNote, 'MARA COMMENT');
  assert.equal(getChapterEnvironment(8).notebook, 'password');
  assert.equal(getChapterEnvironment(10).notebook, 'route');
});

test('Chapter 3 alone adds the coffee drop and connects the charging cable', () => {
  assert.equal(getChapterEnvironment(2).coffeeDrop, false);
  assert.equal(getChapterEnvironment(2).cable, 'loose');
  assert.equal(getChapterEnvironment(3).coffeeDrop, true);
  assert.equal(getChapterEnvironment(3).cable, 'connected');
  assert.equal(getChapterEnvironment(4).coffeeDrop, false);
});

test('the desk progresses from gathering to clutter, quiet, and organized', () => {
  assert.equal(getChapterEnvironment(1).deskOrder, 'clean');
  assert.equal(getChapterEnvironment(3).cable, 'connected');
  assert.equal(getChapterEnvironment(8).deskOrder, 'cluttered');
  assert.equal(getChapterEnvironment(9).deskOrder, 'quiet');
  assert.equal(getChapterEnvironment(10).deskOrder, 'organized');
  assert.equal(getChapterEnvironment(10).pen, 'route');
});

test('the physical environment is display-only and does not mutate progress', () => {
  const environmentSource = readFileSync(new URL('../src/components/ChapterEnvironment.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(environmentSource, /updateProgress|setProgress|GameProgress/);
  assert.match(environmentSource, /id="meta-desk-coffee"/);
  assert.match(environmentSource, /id="meta-desk-notebook"/);
  assert.match(environmentSource, /id="meta-desk-cable"/);
  assert.match(environmentSource, /id="meta-case-marker"/);
  assert.match(environmentSource, /data-environment-layer=\{underlay \? 'underlay' : 'foreground'\}/);
  assert.match(environmentSource, /z-\[9\]/);
  assert.match(environmentSource, /z-\[25\]/);
  assert.match(environmentSource, /scale-\[2\.05\]/);
  assert.match(environmentSource, /scale-\[1\.35\]/);
  assert.match(environmentSource, /scale-\[1\.7\]/);
  assert.match(environmentSource, /id="meta-coffee-drop"/);
  assert.match(environmentSource, /id="meta-cable-plug-tip"/);
  assert.match(environmentSource, /data-plug-target=\{connected \? 'phone-bottom-port'/);
  assert.match(environmentSource, /skg: \['SKG', '\?'\]/);
  assert.match(environmentSource, /quiet: \[\]/);
  assert.equal((environmentSource.match(/layout=\{animateLayout\}/g) ?? []).length, 4);
});
