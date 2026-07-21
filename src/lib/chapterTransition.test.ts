import test from 'node:test';
import assert from 'node:assert/strict';
import { getChapterTransition, getAdvancedChapterTransition, getChapterEntryTransition } from './chapterTransition';
import { getChapterEnvironment } from './chapterEnvironment';
import type { PuzzleChapter } from '../types';

test('evidence label is the zero-padded completed chapter number', () => {
  assert.equal(getChapterTransition(1).evidenceLabel, 'EVIDENCE 01');
  assert.equal(getChapterTransition(9).evidenceLabel, 'EVIDENCE 09');
  assert.equal(getChapterTransition(10).evidenceLabel, 'EVIDENCE 10');
});

test('title reuses the curated caseLabel for the completed chapter', () => {
  for (let c = 1 as PuzzleChapter; c <= 10; c = (c + 1) as PuzzleChapter) {
    assert.equal(getChapterTransition(c).title, getChapterEnvironment(c).caseLabel);
  }
});

test('a single-step advance commemorates the chapter that was just completed', () => {
  const data = getAdvancedChapterTransition(1, 2);
  assert.ok(data);
  assert.equal(data.completedChapter, 1);
  assert.equal(data.evidenceLabel, 'EVIDENCE 01');
});

test('the last inter-chapter advance is completing chapter 9 to enter chapter 10', () => {
  const data = getAdvancedChapterTransition(9, 10);
  assert.ok(data);
  assert.equal(data.completedChapter, 9);
  assert.equal(data.title, getChapterEnvironment(9).caseLabel);
});

test('no transition on first mount (no chapter change)', () => {
  assert.equal(getAdvancedChapterTransition(1, 1), null);
  assert.equal(getAdvancedChapterTransition(5, 5), null);
});

test('the first Chapter 1 home arrival uses a case transition, not false evidence', () => {
  const data = getChapterEntryTransition(1);
  assert.equal(data.evidenceLabel, 'CASE 01');
  assert.equal(data.title, getChapterEnvironment(1).caseLabel);
});

test('no transition for debug multi-jumps or backwards resets', () => {
  assert.equal(getAdvancedChapterTransition(1, 5), null); // jump forward > 1
  assert.equal(getAdvancedChapterTransition(10, 1), null); // restart loop
  assert.equal(getAdvancedChapterTransition(4, 3), null); // step backward
});
