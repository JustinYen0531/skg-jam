import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const browser = readFileSync(new URL('../src/components/BrowserApp.tsx', import.meta.url), 'utf8');
const chapterProgress = readFileSync(new URL('../src/lib/chapterProgress.ts', import.meta.url), 'utf8');

test('the Snapshot reel appears only after the SKG result is opened', () => {
  assert.match(browser, /\{viewingSkgSite && \(\s*<div className="space-y-1" id="wayback-slider-box">/);
  assert.match(browser, /const \[scrubYear, setScrubYear\] = useState\(2026\)/);
  assert.match(browser, /min=\{2009\}/);
  assert.match(browser, /max=\{2026\}/);
});

test('unpreserved years land on a no-screenshot page', () => {
  assert.match(browser, /setSelectedYear\(year\);\s*setAddressBar\(`http:\/\/web\.archive\.org\/web\/\$\{year\}\/silverkitegames\.com`\)/);
  assert.match(browser, /id="wayback-no-screenshot"/);
  assert.match(browser, /NO SCREENSHOT AVAILABLE/);
  assert.match(browser, /No capture was preserved for \{selectedYear\}/);
});

test('reaching 2014 does not complete Chapter 5', () => {
  const yearHandler = browser.slice(browser.indexOf('const handleYearChange'), browser.indexOf('const handleScrub'));
  assert.doesNotMatch(yearHandler, /completePuzzleChapter/);
  assert.match(yearHandler, /setSelectedYear\(year\)/);
});

test('three distinct body references are required and the dated byline is not a trace', () => {
  assert.match(browser, /const NOAH_TRACE_IDS = \['studio-credit', 'developer-note', 'cofounder-credit'\] as const/);
  assert.match(browser, /data-noah-trace=\{traceId\}/);
  assert.match(browser, /underline decoration-2 underline-offset-2/);
  assert.match(browser, /renderNoahTrace\('studio-credit'\)/);
  assert.match(browser, /renderNoahTrace\('developer-note'\)/);
  assert.match(browser, /renderNoahTrace\('cofounder-credit'\)/);
  assert.match(browser, /2013-06-02 • Noah Kade/);
  assert.doesNotMatch(browser, /data-noah-trace[^>]*2013-06-02/);
});

test('the bottom Noah reference survives Meta projection and advances on click', () => {
  const traceButton = browser.slice(browser.indexOf('const renderNoahTrace'), browser.indexOf('const handleDownload'));

  assert.match(traceButton, /onClick=\{\(\) => handleNoahTrace\(traceId\)\}/);
  assert.match(traceButton, /data-meta-immediate="true"/);
  assert.match(traceButton, /data-meta-hit-recovery="true"/);
  assert.match(traceButton, /inline-flex min-h-6 touch-manipulation/);
  assert.match(browser, /Co-founder &amp; lead designer: \{renderNoahTrace\('cofounder-credit'\)\}/);
});

test('Chapter 5 advances only after all three name references are found', () => {
  const traceHandler = browser.slice(browser.indexOf('const handleNoahTrace'), browser.indexOf('const renderNoahTrace'));
  assert.match(traceHandler, /const next = \[\.\.\.foundNoahTraces, traceId\]/);
  assert.match(traceHandler, /if \(next\.length === NOAH_TRACE_IDS\.length\)/);
  assert.match(traceHandler, /completePuzzleChapter\(prev, 5, \{ discoveredSKGHistory: true \}\)/);
  assert.match(browser, /id="noah-trace-progress"/);
  assert.match(chapterProgress, /Find and select all three highlighted Noah Kade references/);
});
