import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const portal = readFileSync(new URL('../src/components/BrowserPortalNoise.tsx', import.meta.url), 'utf8');
const browser = readFileSync(new URL('../src/components/BrowserApp.tsx', import.meta.url), 'utf8');
const archive = readFileSync(new URL('../src/components/ChapterTwoArchiveFinder.tsx', import.meta.url), 'utf8');

test('SearchFinder uses three-column commercial portal furniture', () => {
  assert.match(browser, /id="browser-landing"/);
  assert.match(browser, /id="searchfinder-main-column"/);
  assert.match(browser, /grid-cols-\[minmax\(112px,0\.72fr\)_minmax\(300px,1\.7fr\)_minmax\(112px,0\.72fr\)\]/);
  assert.match(browser, /<BrowserPortalNoise surface="search" side="left" onDistraction=\{handlePortalDistraction\} \/>/);
  assert.match(browser, /<BrowserPortalNoise surface="search" side="right" onDistraction=\{handlePortalDistraction\} \/>/);
  assert.match(browser, /searchfinder-editorial-feed/);
  assert.match(browser, /Top story · Technology/);
  assert.match(browser, /Trending Today/);
});

test('portal rails contain ordinary news, posts, weather, ads, and status noise', () => {
  assert.match(portal, /id="searchfinder-left-rail"/);
  assert.match(portal, /id="searchfinder-right-rail"/);
  assert.match(portal, /Morning Brief/);
  assert.match(portal, /Harborview/);
  assert.match(portal, /Market Pulse/);
  assert.match(portal, /Around the Web/);
  assert.match(portal, /Sponsored/);
  assert.match(portal, /CloudShelf Pro/);
  assert.doesNotMatch(portal, /Recommended/);
  assert.doesNotMatch(portal, /completePuzzleChapter|updateProgress/);
  assert.match(portal, /data-browser-noise-interactive/);
  assert.match(portal, /onDistraction\('weather', 'search-noise-weather'\)/);
  assert.match(portal, /onDistraction\('market', 'search-noise-market'\)/);
  assert.match(browser, /handlePortalDistraction\('trending', `search-trending-\$\{index\}`\)/);
});

test('Archive Finder receives distinct preservation and community side noise', () => {
  assert.match(browser, /id="archive-portal-layout"/);
  assert.match(browser, /<BrowserPortalNoise surface="archive" side="left" onDistraction=\{handlePortalDistraction\} \/>/);
  assert.match(browser, /<BrowserPortalNoise surface="archive" side="right" onDistraction=\{handlePortalDistraction\} \/>/);
  assert.match(portal, /id="archive-left-rail"/);
  assert.match(portal, /id="archive-right-rail"/);
  assert.match(portal, /Preservation Desk/);
  assert.match(portal, /Index Health/);
  assert.match(portal, /Community Notes/);
  assert.match(portal, /Rights & Removal/);
});

test('Archive Finder central column carries catalog context without highlighting the answer', () => {
  assert.match(archive, /id="archive-index-overview"/);
  assert.match(archive, /id="archive-popular-searches"/);
  assert.match(archive, /Browse package formats/);
  assert.match(archive, /showing \{visibleRecords\.length\} \/ \{ARCHIVE_RECORDS\[selectedFormat\]\.length\}/);
  assert.match(archive, /id="archive-catalog-notes"/);
  assert.doesNotMatch(archive, /Recommended/);
  assert.doesNotMatch(archive, /record\.target \?/);
  assert.match(archive, /id=\{`chapter-two-format-\$\{format\.id\}`\}/);
  assert.match(archive, /metaInteraction\.tapElement\(`chapter-two-format-\$\{format\.id\}`/);
});
