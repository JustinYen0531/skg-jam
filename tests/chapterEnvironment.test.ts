import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CHAPTER_ENVIRONMENTS,
  getChapterEnvironment,
  getMetaFloorStage,
  getMetaWallStage,
} from '../src/lib/chapterEnvironment';

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
    coffeeSteam: false,
    coffeeDrip: false,
    coffeeSpill: false,
    teaService: false,
    paperBalls: false,
    cable: 'none',
    notebook: 'none',
    notebookPosition: 'default',
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

test('coffee tells a chapter-specific desk story without revealing later evidence early', () => {
  assert.equal(getChapterEnvironment(1).coffeeSteam, true);
  assert.equal(getChapterEnvironment(2).coffeeSteam, true);
  assert.equal(getChapterEnvironment(3).coffee, 'empty');
  assert.equal(getChapterEnvironment(3).coffeeDrip, true);
  assert.equal(getChapterEnvironment(3).coffeeSpill, false);
  assert.equal(getChapterEnvironment(2).cable, 'loose');
  assert.equal(getChapterEnvironment(3).cable, 'connected');
  assert.equal(getChapterEnvironment(4).coffeeDrip, false);
  assert.equal(getChapterEnvironment(5).coffee, 'tipped-empty');
  assert.equal(getChapterEnvironment(5).coffeeSpill, true);
  assert.equal(getChapterEnvironment(5).notebookPosition, 'lowered');
  assert.equal(getChapterEnvironment(6).coffee, 'tipped-empty');
  assert.equal(getChapterEnvironment(6).coffeeSpill, false);
  assert.equal(getChapterEnvironment(6).teaService, true);
  assert.equal(getChapterEnvironment(6).paperBalls, true);
});

test('the desk progresses from gathering to clutter, quiet, and organized', () => {
  assert.equal(getChapterEnvironment(1).deskOrder, 'clean');
  assert.equal(getChapterEnvironment(3).cable, 'connected');
  assert.equal(getChapterEnvironment(8).deskOrder, 'cluttered');
  assert.equal(getChapterEnvironment(9).deskOrder, 'quiet');
  assert.equal(getChapterEnvironment(10).deskOrder, 'organized');
  assert.equal(getChapterEnvironment(10).pen, 'route');
});

test('the supplied wall artwork ages in five stages and keeps its complete lower edge', () => {
  assert.deepEqual(
    Array.from({ length: 11 }, (_, chapter) => getMetaWallStage(chapter as keyof typeof CHAPTER_ENVIRONMENTS)),
    [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
  );

  for (let stage = 1; stage <= 5; stage += 1) {
    assert.equal(
      existsSync(new URL(`../public/assets/meta-wall-stage-${stage}.png`, import.meta.url)),
      true,
    );
  }

  const sceneSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  assert.match(sceneSource, /id="meta-wall-surface"/);
  assert.match(sceneSource, /absolute inset-0 z-\[1\] overflow-hidden/);
  assert.match(sceneSource, /src=\{`\/assets\/meta-wall-stage-\$\{wallStage\}\.png`\}/);
  assert.match(sceneSource, /left-\[-10%\] top-\[-11\.6%\] h-\[94\.6%\] w-\[120%\]/);
  assert.match(sceneSource, /data-source-floor="visible-over-floor"/);
  assert.match(sceneSource, /data-floor-treatment="wall-over-floor"/);
});

test('the supplied floor artwork shares each state across two chapters and meets the wall edge', () => {
  assert.deepEqual(
    Array.from({ length: 11 }, (_, chapter) => getMetaFloorStage(chapter as keyof typeof CHAPTER_ENVIRONMENTS)),
    [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
  );

  for (let stage = 1; stage <= 5; stage += 1) {
    assert.equal(
      existsSync(new URL(`../public/assets/meta-floor-stage-${stage}.png`, import.meta.url)),
      true,
    );
  }

  const sceneSource = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  assert.match(sceneSource, /id="meta-floor-art"/);
  assert.match(sceneSource, /src=\{`\/assets\/meta-floor-stage-\$\{floorStage\}\.png`\}/);
  assert.match(sceneSource, /left-1\/2 top-\[28%\] z-\[0\] h-full w-\[180%\] max-w-none -translate-x-1\/2 object-fill/);
  assert.match(sceneSource, /data-floor-stage=\{floorStage\}/);
  assert.match(sceneSource, /data-visible-crop="upper-two-thirds"/);
  assert.match(sceneSource, /id="meta-desk-table-art"/);
  assert.match(sceneSource, /top-\[-40%\] z-\[2\] h-\[212%\]/);
});

test('the physical environment is display-only and does not mutate progress', () => {
  const environmentSource = readFileSync(new URL('../src/components/ChapterEnvironment.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(environmentSource, /updateProgress|setProgress|GameProgress/);
  assert.match(environmentSource, /id="meta-desk-coffee"/);
  assert.match(environmentSource, /deviceResting\s+\? \(pushedAway \? 'right-\[7%\] top-\[51%\] scale-\[2\.1\]' : tipped \? 'right-\[14%\] top-\[53%\] scale-\[2\.5\]' : 'right-\[12%\] top-\[48%\] scale-\[2\.7\]'\)/);
  assert.match(environmentSource, /: \(pushedAway \? 'right-\[7%\] top-\[65%\] scale-\[2\.1\]' : tipped \? 'right-\[14%\] top-\[67%\] scale-\[2\.5\]' : 'right-\[12%\] top-\[62%\] scale-\[2\.7\]'\)/);
  assert.match(environmentSource, /data-composition-offset=\{deviceResting \? 'resting-coffee-up-14' : 'upright-original'\}/);
  assert.match(environmentSource, /deviceResting=\{deviceResting\}/);
  assert.match(environmentSource, /id="meta-desk-notebook"/);
  assert.match(environmentSource, /id=\{part === 'insert' \? 'meta-cable-insert-layer' : 'meta-desk-cable'\}/);
  assert.match(environmentSource, /id="meta-case-marker"/);
  assert.match(environmentSource, /data-environment-layer=\{underlay \? 'underlay' : 'foreground'\}/);
  assert.match(environmentSource, /x: deviceResting \? '4%' : 0/);
  assert.match(environmentSource, /z-\[9\]/);
  assert.match(environmentSource, /z-\[25\]/);
  assert.match(environmentSource, /scale-\[1\.35\]/);
  assert.match(environmentSource, /scale-\[1\.7\]/);
  assert.match(environmentSource, /bottom-\[15\.5%\] right-\[-5%\]/);
  assert.match(environmentSource, /data-composition-offset="cable-right-3"/);
  assert.match(environmentSource, /id="meta-coffee-steam"/);
  assert.match(environmentSource, /id="meta-coffee-png"/);
  assert.match(environmentSource, /coffee-full\.png/);
  assert.match(environmentSource, /coffee-empty-drip\.png/);
  assert.match(environmentSource, /coffee-tipped-spill\.png/);
  assert.match(environmentSource, /object-contain/);
  assert.doesNotMatch(environmentSource, /chapter-coffee-states\.png|backgroundSize: '500% 210%'/);
  assert.match(environmentSource, /data-coffee-drip=\{drip \|\| undefined\}/);
  assert.match(environmentSource, /data-coffee-spill=\{spill \|\| undefined\}/);
  assert.doesNotMatch(environmentSource, /id="meta-coffee-cup-drip"|id="meta-coffee-spill"/);
  assert.equal(existsSync(new URL('../public/assets/coffee-full.png', import.meta.url)), true);
  assert.equal(existsSync(new URL('../public/assets/coffee-empty-drip.png', import.meta.url)), true);
  assert.equal(existsSync(new URL('../public/assets/coffee-tipped-spill.png', import.meta.url)), true);
  assert.match(environmentSource, /id="meta-desk-tea-machine"/);
  assert.match(environmentSource, /id="meta-desk-tea-cup"/);
  assert.match(environmentSource, /id="meta-tea-bag-tag"/);
  assert.match(environmentSource, /id="meta-desk-paper-balls"/);
  assert.match(environmentSource, /id="meta-cable-plug-tip"/);
  assert.match(environmentSource, /id="meta-cable-inserted-end"/);
  assert.match(environmentSource, /id="meta-cable-plug-housing"/);
  assert.match(environmentSource, /x="64" y="50" width="9" height="16"/);
  assert.match(environmentSource, /x="57" y="63" width="23" height="14"/);
  assert.match(environmentSource, /data-cable-layer=\{part === 'insert' \? 'underlay' : 'foreground'\}/);
  assert.match(environmentSource, /M650 116 C590 116 552 116 510 116/);
  assert.match(environmentSource, /<Pen[\s\S]{0,400}<ChargingCable connected animateLayout=\{!reducedMotion\} part="insert"/);
  assert.match(environmentSource, /<CoffeeCup[\s\S]{0,400}<ChargingCable connected=\{environment\.cable === 'connected'\} animateLayout=\{!reducedMotion\} part="body"/);
  assert.match(environmentSource, /data-plug-target=\{connected && part === 'insert' \? 'phone-bottom-port'/);
  assert.match(environmentSource, /skg: \['SKG', '\?'\]/);
  assert.match(environmentSource, /quiet: \[\]/);
  // No desk object may use Framer's `layout`: they render inside an env whose
  // `scale` is Framer-animated when the device rests, and a `layout` child
  // there re-projects against its own already-transformed box. Interrupting the
  // animation (chapter jumps / dev-panel toggles mid-transition) compounds that
  // projection into a runaway — the coffee cup shooting across the desk. Each
  // object is anchored in CSS and eased with a CSS transition instead.
  assert.equal((environmentSource.match(/layout=\{animateLayout\}/g) ?? []).length, 0);
  assert.doesNotMatch(environmentSource, /<motion\.(div|svg)\s+layout/);
  // The moving desk objects still ease their position via CSS transitions.
  assert.match(environmentSource, /transition-\[top,right,scale\] duration-\[620ms\]/); // coffee cup
  assert.match(environmentSource, /transition-\[left,top,rotate,scale\] duration-\[620ms\]/); // pen
  assert.match(environmentSource, /transition-\[top,scale,rotate\] duration-\[620ms\]/); // notebook
});
