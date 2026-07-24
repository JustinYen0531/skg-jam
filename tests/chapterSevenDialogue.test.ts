import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  CHAPTER_SEVEN_DIALOGUE,
  classifyChapterSevenLogin,
  getChapterSevenClueDialogue,
  getChapterSevenCompanionDialogue,
  getChapterSevenLoginDialogue,
  getChapterSevenMaraPostDialogue,
  getChapterSevenNoiseDialogue,
  getChapterSevenWrongAppDialogue,
} from '../src/lib/chapterSevenDialogue';

const root = process.cwd();
const socialSource = fs.readFileSync(path.join(root, 'src/components/SocialApp.tsx'), 'utf8');
const messagesSource = fs.readFileSync(path.join(root, 'src/components/MessagesApp.tsx'), 'utf8');
const phoneSource = fs.readFileSync(path.join(root, 'src/components/PhoneSimulator.tsx'), 'utf8');
const sceneSource = fs.readFileSync(path.join(root, 'src/components/MetaInteractionScene.tsx'), 'utf8');

test('Chapter 7 dialogue covers Mara life posts, three place clues, noise, wrong apps, and companion loops', () => {
  for (const clue of ['arc', 'gate', 'end'] as const) {
    assert.equal(getChapterSevenClueDialogue(clue).length, 2);
  }

  for (const postId of ['mara-2014-09', 'mara-2014-07', 'mara-2014-06', 'mara-2014-04', 'mara-2014-03', 'mara-2014-02']) {
    assert.notDeepEqual(
      getChapterSevenMaraPostDialogue(postId, 0),
      getChapterSevenMaraPostDialogue(postId, 1),
      postId,
    );
  }

  for (const kind of ['home-feed', 'left-sidebar', 'right-sidebar', 'sidebar-ad', 'noah-profile', 'search'] as const) {
    assert.ok(getChapterSevenNoiseDialogue(kind, 0)[0].length > 0, kind);
  }

  for (const app of ['flappy', 'viewtube', 'amazemart', 'browser', 'screenshots', 'about'] as const) {
    assert.ok(getChapterSevenWrongAppDialogue(app, 0)[0].length > 0, app);
  }
  assert.notDeepEqual(getChapterSevenCompanionDialogue(0), getChapterSevenCompanionDialogue(1));
});

test('archive login reactions respect clue and Mom-explanation knowledge boundaries', () => {
  assert.equal(classifyChapterSevenLogin('', false, false, 0), 'empty');
  assert.equal(classifyChapterSevenLogin('ARC184GATE40END256', false, false, 0), 'clues-missing');
  assert.equal(classifyChapterSevenLogin('ARC184GATE40END256', true, false, 0), 'mapping-unread');
  assert.equal(classifyChapterSevenLogin('END256GATE40ARC184', true, true, 0), 'wrong-order');
  assert.equal(classifyChapterSevenLogin('NOPE', true, true, 2), 'repeated');

  const beforeMapping = [
    ...CHAPTER_SEVEN_DIALOGUE.entry,
    ...CHAPTER_SEVEN_DIALOGUE.homeReturned,
    ...CHAPTER_SEVEN_DIALOGUE.socialOpened,
    ...CHAPTER_SEVEN_DIALOGUE.messagesOpened,
    ...CHAPTER_SEVEN_DIALOGUE.momPlacesRead,
    ...getChapterSevenLoginDialogue('ARC184GATE40END256', false, false, 0),
    ...getChapterSevenLoginDialogue('ARC184GATE40END256', true, false, 0),
  ].join(' ');
  assert.doesNotMatch(beforeMapping, /ARC184GATE40END256/);
  assert.doesNotMatch(beforeMapping, /184[^.]*altitude|40[^.]*gate|256[^.]*end/i);
  assert.match(CHAPTER_SEVEN_DIALOGUE.entry.join(' '), /Lumen Arc family backup/);
  assert.doesNotMatch(CHAPTER_SEVEN_DIALOGUE.entry.join(' '), /Silver Kite archive/);
  assert.match(CHAPTER_SEVEN_DIALOGUE.momMappingRead.join(' '), /Arc, gate, end/);
});

test('all Chapter 7 protagonist dialogue remains English-only', () => {
  const lines = [
    ...Object.values(CHAPTER_SEVEN_DIALOGUE).flat(),
    ...(['arc', 'gate', 'end'] as const).flatMap(getChapterSevenClueDialogue),
    ...['mara-2014-09', 'mara-2014-07', 'mara-2014-06', 'mara-2014-04', 'mara-2014-03', 'mara-2014-02']
      .flatMap((postId, index) => getChapterSevenMaraPostDialogue(postId, index)),
    ...(['home-feed', 'left-sidebar', 'right-sidebar', 'sidebar-ad', 'noah-profile', 'search'] as const)
      .flatMap((kind, index) => getChapterSevenNoiseDialogue(kind, index)),
    ...(['flappy', 'viewtube', 'amazemart', 'browser', 'screenshots', 'about'] as const)
      .flatMap((app, index) => getChapterSevenWrongAppDialogue(app, index)),
    ...['', 'ARC184GATE40END256', 'END256GATE40ARC184', 'NOPE']
      .flatMap((input, index) => getChapterSevenLoginDialogue(input, index > 1, index > 1, index)),
  ];
  assert.doesNotMatch(lines.join('\n'), /[\u3400-\u9fff]/);
});

test('Chapter 7 dialogue is wired to entry, phone navigation, FaceSpace evidence, Mom, and archive login', () => {
  assert.match(sceneSource, /chapter === 7[^]*CHAPTER_SEVEN_DIALOGUE\.entry/);
  assert.match(phoneSource, /getChapterSevenWrongAppDialogue/);
  assert.match(phoneSource, /getChapterSevenCompanionDialogue/);
  assert.match(phoneSource, /CHAPTER_SEVEN_DIALOGUE\.messagesOpened/);
  assert.match(socialSource, /getChapterSevenMaraPostDialogue/);
  assert.match(socialSource, /getChapterSevenClueDialogue/);
  assert.match(socialSource, /getChapterSevenNoiseDialogue\('noah-profile'/);
  assert.match(messagesSource, /CHAPTER_SEVEN_DIALOGUE\.momPlacesRead/);
  assert.match(messagesSource, /CHAPTER_SEVEN_DIALOGUE\.momMappingRead/);
  assert.match(messagesSource, /getChapterSevenLoginDialogue/);
  assert.match(messagesSource, /CHAPTER_SEVEN_DIALOGUE\.completed/);
  assert.match(messagesSource, /completePuzzleChapter\(prev, 7, \{ unlockedAdminLogin: true, loggedIntoAdmin: true \}\)/);
});
