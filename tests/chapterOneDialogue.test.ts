import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  CHAPTER_ONE_DIALOGUE,
  getChapterOneCompanionDialogue,
  getChapterOneIrrelevantVideoDialogue,
  getChapterOneSearchResponse,
  getChapterOneWrongAppDialogue,
} from '../src/lib/chapterOneDialogue';

test('Chapter 1 only accepts ARC_184 variants as the intended search', () => {
  for (const query of ['ARC_184', 'arc 184', 'Arc-184', 'ARC184']) {
    assert.equal(getChapterOneSearchResponse(query).isArcSearch, true, query);
  }

  for (const query of ['184', 'ALT184GATE40END256', 'Lumen Arc', 'Noah Kade']) {
    assert.equal(getChapterOneSearchResponse(query).isArcSearch, false, query);
  }
});

test('future Chapter clues receive teasing warnings without unlocking the search result', () => {
  assert.equal(getChapterOneSearchResponse('ALT184GATE40END256').kind, 'future_password');
  assert.equal(getChapterOneSearchResponse('184 172 149 133 121 118 126 143').kind, 'future_altitudes');
  assert.equal(getChapterOneSearchResponse('Noah Kade').kind, 'future_person');
  assert.equal(getChapterOneSearchResponse('Mara Vale').kind, 'future_person');
  assert.equal(getChapterOneSearchResponse('Lumen Arc').kind, 'lumen_arc');
  assert.equal(getChapterOneSearchResponse('Silver Kite Games').kind, 'silver_kite');
});

test('repeat interactions rotate companion and distraction dialogue', () => {
  assert.notDeepEqual(getChapterOneIrrelevantVideoDialogue(0), getChapterOneIrrelevantVideoDialogue(1));
  assert.notDeepEqual(getChapterOneCompanionDialogue(0), getChapterOneCompanionDialogue(1));
  assert.match(getChapterOneWrongAppDialogue('amazemart', 0)[0], /shopping/i);
});

test('all Chapter 1 protagonist dialogue is English-only', () => {
  const lines = [
    ...Object.values(CHAPTER_ONE_DIALOGUE).flat(),
    ...Array.from({ length: 8 }, (_, index) => getChapterOneIrrelevantVideoDialogue(index)).flat(),
    ...Array.from({ length: 5 }, (_, index) => getChapterOneCompanionDialogue(index)).flat(),
    ...(['flappy', 'amazemart', 'browser', 'social', 'messages', 'screenshots', 'about'] as const)
      .flatMap((app, index) => getChapterOneWrongAppDialogue(app, index)),
    ...[
      '', 'Gate 40', 'me', 'Noah Kade', 'Lumen Arc', 'Silver Kite Games',
      'ALT184GATE40END256', '184 172 149 133 121 118 126 143', 'cats',
    ].flatMap((query, index) => getChapterOneSearchResponse(query, index).lines),
  ];

  for (const line of lines) assert.doesNotMatch(line, /[\u3400-\u9fff]/, line);
});

test('Chapter 1 dialogue events are wired into the transcript, phone, and ViewTube', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const phone = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const viewTube = readFileSync(new URL('../src/components/ViewTube.tsx', import.meta.url), 'utf8');

  assert.match(scene, /speak: \(lines: DialogueLines, onComplete\?: \(\) => void\) => void/);
  assert.match(scene, /dialogueLines\.map/);
  assert.match(phone, /getChapterOneWrongAppDialogue/);
  assert.match(phone, /getChapterOneCompanionDialogue/);
  assert.match(viewTube, /getChapterOneSearchResponse/);
  assert.match(viewTube, /getChapterOneIrrelevantVideoDialogue/);
  assert.match(viewTube, /id="vt-player-active"/);
  assert.match(viewTube, /id="vt-arc-reply"/);
});
