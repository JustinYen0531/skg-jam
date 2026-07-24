import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectChapterOneEvidence,
  getChapterOneEvidenceCount,
} from '../src/lib/chapterOneEvidence';
import { getChapterSnapshot } from '../src/lib/chapterProgress';

test('Chapter 1 evidence counts independently and completes only at two of two', () => {
  const start = getChapterSnapshot(1);
  const ipaFirst = collectChapterOneEvidence(start, 'legacy-ipa');

  assert.equal(getChapterOneEvidenceCount(start), 0);
  assert.equal(getChapterOneEvidenceCount(ipaFirst), 1);
  assert.equal(ipaFirst.currentChapter, 1);
  assert.equal(ipaFirst.discoveredLegacyIpa, true);
  assert.equal(ipaFirst.discoveredLegacyPassage, false);

  const complete = collectChapterOneEvidence(ipaFirst, 'legacy-passage');
  assert.equal(getChapterOneEvidenceCount(complete), 2);
  assert.equal(complete.currentChapter, 2);
  assert.equal(complete.discoveredLegacyPassage, true);
  assert.equal(complete.discoveredLegacyIpa, true);
  assert.equal(complete.watchedVideo, true);
});

test('reselecting one clue never advances and later chapters cannot mutate it', () => {
  const start = getChapterSnapshot(1);
  const once = collectChapterOneEvidence(start, 'legacy-passage');
  const repeated = collectChapterOneEvidence(once, 'legacy-passage');
  const chapterTwo = getChapterSnapshot(2);

  assert.equal(getChapterOneEvidenceCount(repeated), 1);
  assert.equal(repeated.currentChapter, 1);
  assert.strictEqual(collectChapterOneEvidence(chapterTwo, 'legacy-ipa'), chapterTwo);
});
