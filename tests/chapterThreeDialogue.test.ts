import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CHAPTER_THREE_DIALOGUE,
  getChapterThreeCompanionDialogue,
  getChapterThreeSearchResponse,
  getChapterThreeSellerCodeResponse,
  getChapterThreeStorefrontDistractionDialogue,
  getChapterThreeWrongAppDialogue,
  type ChapterThreeStorefrontDistraction,
} from '../src/lib/chapterThreeDialogue';

test('Chapter 3 hands off to Deliveries without spoiling the Chapter 4 contents', () => {
  assert.deepEqual(CHAPTER_THREE_DIALOGUE.approvedEndingA, [
    'The seller sent something.',
    'Whatever it is, it is waiting in Deliveries.',
  ]);
  assert.doesNotMatch(CHAPTER_THREE_DIALOGUE.sellerMatched.join(' '), /no device|screenshots?|image packet/i);
});

test('search and seller replies separate known evidence from future answers', () => {
  assert.equal(getChapterThreeSearchResponse('Lumen Arc').kind, 'lumen_arc');
  assert.equal(getChapterThreeSearchResponse('Skyline256_LAOS_Final.ipa').kind, 'known_file');
  assert.equal(getChapterThreeSearchResponse('SKG').kind, 'unknown_company');
  assert.equal(getChapterThreeSearchResponse('Mara Vale').kind, 'unknown_person');
  assert.doesNotMatch(getChapterThreeSearchResponse('SKG').lines.join(' '), /games|automation/i);

  assert.equal(getChapterThreeSellerCodeResponse('184').kind, 'correct');
  assert.equal(getChapterThreeSellerCodeResponse('40').kind, 'gate');
  assert.equal(getChapterThreeSellerCodeResponse('1.84').kind, 'price');
  assert.equal(getChapterThreeSellerCodeResponse('ALT184GATE40END256').kind, 'future_code');
});

test('storefront noise is grouped but does not collapse into one reaction', () => {
  const kinds: readonly ChapterThreeStorefrontDistraction[] = ['product', 'department', 'price', 'delivery', 'member'];
  const reactions = kinds.map((kind) => getChapterThreeStorefrontDistractionDialogue(kind, 0)[0]);
  assert.equal(new Set(reactions).size, kinds.length);
  assert.notDeepEqual(
    getChapterThreeStorefrontDistractionDialogue('product', 0),
    getChapterThreeStorefrontDistractionDialogue('product', 1),
  );
  assert.notDeepEqual(getChapterThreeCompanionDialogue(0), getChapterThreeCompanionDialogue(1));
  assert.match(getChapterThreeWrongAppDialogue('viewtube', 0)[0], /recording/i);
});

test('all Chapter 3 protagonist dialogue is English-only', () => {
  const kinds: readonly ChapterThreeStorefrontDistraction[] = ['product', 'department', 'price', 'delivery', 'member'];
  const apps = ['browser', 'viewtube', 'flappy', 'social', 'messages', 'screenshots', 'about'] as const;
  const lines = [
    ...Object.values(CHAPTER_THREE_DIALOGUE).flat(),
    ...kinds.flatMap((kind, index) => getChapterThreeStorefrontDistractionDialogue(kind, index)),
    ...apps.flatMap((app, index) => getChapterThreeWrongAppDialogue(app, index)),
    ...Array.from({ length: 5 }, (_, index) => getChapterThreeCompanionDialogue(index)).flat(),
    ...['', 'Lumen Arc', 'Skyline256_LAOS_Final.ipa', 'SKG', 'Mara Vale', '184', 'old phone', 'wrong'].flatMap((query, index) => getChapterThreeSearchResponse(query, index).lines),
    ...['', '184', '40', '42', '1.84', '256', 'ALT184GATE40END256', '99'].flatMap((code) => getChapterThreeSellerCodeResponse(code).lines),
  ];
  for (const line of lines) assert.doesNotMatch(line, /[\u3400-\u9fff]/, line);
});

test('Chapter 3 dialogue is wired through scene, phone, marketplace, and seller relay', () => {
  const scene = readFileSync(new URL('../src/components/MetaInteractionScene.tsx', import.meta.url), 'utf8');
  const phone = readFileSync(new URL('../src/components/PhoneSimulator.tsx', import.meta.url), 'utf8');
  const mart = readFileSync(new URL('../src/components/AmazeMart.tsx', import.meta.url), 'utf8');
  const messages = readFileSync(new URL('../src/components/MessagesApp.tsx', import.meta.url), 'utf8');

  assert.match(scene, /chapter === 3 && previousChapter !== 2/);
  assert.match(scene, /previousChapter === 3 && chapter === 4/);
  assert.match(scene, /CHAPTER_THREE_DIALOGUE\.approvedEndingA/);
  assert.match(phone, /getChapterThreeWrongAppDialogue/);
  assert.match(phone, /getChapterThreeCompanionDialogue/);
  assert.doesNotMatch(phone, /CHAPTER_THREE_DIALOGUE\.signatureAvailable/);
  assert.match(mart, /getChapterThreeSearchResponse/);
  assert.match(mart, /CHAPTER_THREE_DIALOGUE\.sellerRevealed/);
  assert.match(mart, /CHAPTER_THREE_DIALOGUE\.riskCancelled/);
  assert.doesNotMatch(mart, /completePuzzleChapter\(prev, 3/);
  assert.match(messages, /getChapterThreeSellerCodeResponse/);
  assert.match(messages, /CHAPTER_THREE_DIALOGUE\.sellerMatched/);
  assert.match(phone, /const handleSellerVerified[\s\S]{0,240}completePuzzleChapter\(prev, 3/);
  assert.doesNotMatch(messages, /RETURN TO AMAZEMART|messages-return-amazemart/);
});
