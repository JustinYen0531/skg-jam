import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const readComponent = (name: string) =>
  readFileSync(new URL(`../src/components/${name}.tsx`, import.meta.url), 'utf8');

test('normal interactions connect every chapter completion from one through nine', () => {
  const expectedCompletions: ReadonlyArray<readonly [string, readonly number[]]> = [
    ['ViewTube', [1]],
    ['BrowserApp', [2, 5]],
    ['AmazeMart', [3]],
    ['SavedScreenshots', [4]],
    ['SocialApp', [6]],
    ['MessagesApp', [7, 8, 9]],
  ];

  for (const [component, chapters] of expectedCompletions) {
    const source = readComponent(component);
    for (const chapter of chapters) {
      assert.match(source, new RegExp(`completePuzzleChapter\\(prev, ${chapter}(?:,|\\))`));
    }
  }
});

test('normal app flow no longer mutates currentChapter with skip-ahead arithmetic', () => {
  const sources = ['ViewTube', 'BrowserApp', 'AmazeMart', 'SavedScreenshots', 'SocialApp', 'MessagesApp']
    .map(readComponent)
    .join('\n');

  assert.doesNotMatch(sources, /Math\.max\(prev\.currentChapter/);
  assert.doesNotMatch(sources, /unlockedCodeRoute:\s*true[\s\S]{0,120}loggedIntoAdmin:\s*true/);
});
