import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CHAPTER_TWO_DIALOGUE,
  getChapterTwoCompanionDialogue,
  getChapterTwoFormatDialogue,
  getChapterTwoPortalDistractionDialogue,
  getChapterTwoSearchResponse,
  getChapterTwoWrongAppDialogue,
  type ChapterTwoArchiveFormat,
  type ChapterTwoPortalDistraction,
} from '../src/lib/chapterTwoDialogue';

test('Chapter 2 uses the approved A maternal-memory ending', () => {
  assert.deepEqual(CHAPTER_TWO_DIALOGUE.maternalMemory, [
    'Mom had one. I remember the silver edge beside the kitchen sink.',
    'I do not know where it went. I need another way to find one.',
  ]);
});

test('archive format reactions guide by evidence without naming the answer early', () => {
  const formats: readonly ChapterTwoArchiveFormat[] = ['zip', 'apk', 'jar', 'sis', 'ipa'];
  const reactions = formats.map((format) => getChapterTwoFormatDialogue(format));
  assert.equal(new Set(reactions.map((lines) => lines.join('|'))).size, formats.length);
  assert.match(getChapterTwoFormatDialogue('apk').join(' '), /Android/);
  assert.match(getChapterTwoFormatDialogue('jar').join(' '), /Java/);
  assert.match(getChapterTwoFormatDialogue('sis').join(' '), /mobile platform/);
  assert.doesNotMatch(getChapterTwoFormatDialogue('ipa').join(' '), /correct|answer/i);
});

test('Chapter 2 search responses respect the evidence boundary', () => {
  assert.equal(getChapterTwoSearchResponse('').kind, 'empty');
  assert.equal(getChapterTwoSearchResponse('Skyline256_LAOS_Final.ipa').kind, 'known_filename');
  assert.match(getChapterTwoSearchResponse('Skyline256_LAOS_Final.ipa').lines[0], /comment/);
  assert.equal(getChapterTwoSearchResponse('Lumen Arc').kind, 'lumen_arc');
  assert.equal(getChapterTwoSearchResponse('SKG').kind, 'future_company');
  assert.equal(getChapterTwoSearchResponse('Silver Kite Games').kind, 'future_company');
  assert.equal(getChapterTwoSearchResponse('Noah Kade').kind, 'future_person');
  assert.equal(getChapterTwoSearchResponse('Mara Vale').kind, 'future_person');
  assert.equal(getChapterTwoSearchResponse('Gate 40').kind, 'gate_40');
});

test('repeat Chapter 2 interactions retain companionship and wrong-app context', () => {
  assert.notDeepEqual(getChapterTwoCompanionDialogue(0), getChapterTwoCompanionDialogue(1));
  assert.match(getChapterTwoWrongAppDialogue('viewtube', 0)[0], /video/);
  assert.match(getChapterTwoWrongAppDialogue('flappy', 0)[0], /forty/);
  assert.match(getChapterTwoWrongAppDialogue('amazemart', 0)[0], /hardware/);
});

test('commercial portal distractions share categories without collapsing into one reaction', () => {
  const kinds: readonly ChapterTwoPortalDistraction[] = [
    'trending', 'news', 'weather', 'market', 'community', 'sponsored', 'archive_noise',
  ];
  const firstReactions = kinds.map((kind) => getChapterTwoPortalDistractionDialogue(kind, 0)[0]);
  assert.equal(new Set(firstReactions).size, kinds.length);
  assert.notDeepEqual(
    getChapterTwoPortalDistractionDialogue('trending', 0),
    getChapterTwoPortalDistractionDialogue('trending', 1),
  );
  assert.match(getChapterTwoPortalDistractionDialogue('weather', 0)[0], /Cold|forecast/);
  assert.match(getChapterTwoPortalDistractionDialogue('sponsored', 0)[0], /trial|advertisement/);
});

test('all Chapter 2 protagonist dialogue is English-only', () => {
  const formats: readonly ChapterTwoArchiveFormat[] = ['zip', 'apk', 'jar', 'sis', 'ipa'];
  const distractions: readonly ChapterTwoPortalDistraction[] = [
    'trending', 'news', 'weather', 'market', 'community', 'sponsored', 'archive_noise',
  ];
  const apps = ['flappy', 'viewtube', 'amazemart', 'social', 'messages', 'screenshots', 'about'] as const;
  const lines = [
    ...Object.values(CHAPTER_TWO_DIALOGUE).flat(),
    ...formats.flatMap((format) => getChapterTwoFormatDialogue(format)),
    ...distractions.flatMap((kind, index) => getChapterTwoPortalDistractionDialogue(kind, index)),
    ...apps.flatMap((app, index) => getChapterTwoWrongAppDialogue(app, index)),
    ...Array.from({ length: 6 }, (_, index) => getChapterTwoCompanionDialogue(index)).flat(),
    ...[
      '', 'Skyline256_LAOS_Final.ipa', 'Lumen Arc', 'SKG', 'Silver Kite Games',
      'Noah Kade', 'Mara Vale', 'Gate 40', 'another old game',
    ].flatMap((query, index) => getChapterTwoSearchResponse(query, index).lines),
  ];

  for (const line of lines) assert.doesNotMatch(line, /[\u3400-\u9fff]/, line);
});

test('Chapter 2 dialogue is wired through the transcript, phone, browser, and archive', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const phone = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const browser = readFileSync(new URL('../src/components/BrowserApp.tsx', import.meta.url), 'utf8');
  const finder = readFileSync(new URL('../src/components/ChapterTwoArchiveFinder.tsx', import.meta.url), 'utf8');

  assert.match(scene, /chapter === 2\) setDialogueLines\(CHAPTER_TWO_DIALOGUE\.entry\)/);
  assert.match(scene, /previousChapter === 2 && chapter === 3/);
  assert.match(scene, /setDialogueLines\(CHAPTER_TWO_DIALOGUE\.maternalMemory\)/);
  assert.match(scene, /\['text', 'search', 'password', 'email', 'tel', 'url', 'number'\]\.includes\(element\.type\)/);
  assert.match(phone, /getChapterTwoWrongAppDialogue/);
  assert.match(phone, /getChapterTwoCompanionDialogue/);
  assert.match(phone, /CHAPTER_TWO_DIALOGUE\.browserOpened/);
  assert.match(browser, /getChapterTwoSearchResponse/);
  assert.match(browser, /CHAPTER_TWO_DIALOGUE\.searchFinderVisible/);
  assert.match(browser, /CHAPTER_TWO_DIALOGUE\.archiveLeadSelected/);
  assert.match(browser, /getChapterTwoPortalDistractionDialogue/);
  assert.match(browser, /metaInteraction\.tapElement\(elementId/);
  assert.match(finder, /getChapterTwoFormatDialogue/);
  assert.match(finder, /metaInteraction\.tapElement\(`chapter-two-format-\$\{format\.id\}`/);
  assert.match(finder, /registerInput\('chapter-two-archive-search'/);
  assert.match(finder, /CHAPTER_TWO_DIALOGUE\.archiveSearchFocused/);
  assert.match(finder, /CHAPTER_TWO_DIALOGUE\.fileOpened/);
  assert.match(finder, /CHAPTER_TWO_DIALOGUE\.compatibilityBlocked/);

  const attemptStart = finder.indexOf('const attemptToOpen =');
  const unsupportedDialogue = finder.indexOf('CHAPTER_TWO_DIALOGUE.compatibilityBlocked', attemptStart);
  const completion = finder.indexOf('onCompatibilityDiscovered()', attemptStart);
  assert.ok(attemptStart >= 0 && unsupportedDialogue > attemptStart && completion > unsupportedDialogue);
});
