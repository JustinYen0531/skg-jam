import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('developer panel shows the chapter advance guide instead of evidence and raw flags', () => {
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.match(appSource, /id="debug-chapter-guide"/);
  assert.match(appSource, /getChapterAdvanceGuide\(progress\.currentChapter\)/);
  assert.match(appSource, /CHAPTER \{progress\.currentChapter\.toString\(\)\.padStart\(2, '0'\)\} → \{chapterAdvanceGuide\.nextLabel\}/);
  assert.match(appSource, /id="chapter-guide-steps"/);
  assert.match(appSource, /Advances when/);
  assert.doesNotMatch(appSource, /EVIDENCE RECORDINGS/);
  assert.doesNotMatch(appSource, /id="debug-progress-flags"/);
  assert.doesNotMatch(appSource, /id="clues-feed"/);
});
