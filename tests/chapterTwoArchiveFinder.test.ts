import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const finder = readFileSync(new URL('../src/components/ChapterTwoArchiveFinder.tsx', import.meta.url), 'utf8');
const browser = readFileSync(new URL('../src/components/BrowserApp.tsx', import.meta.url), 'utf8');

test('Chapter 2 recovers the old build through package-type deduction', () => {
  assert.match(finder, /'ipa' \| 'ipx' \| 'ipp' \| 'ips' \| 'zip'/);
  assert.match(finder, /Skyline256_LAOS_Final\.ipa/);
  assert.match(finder, /selectedPackage === 'ipa'/);
  assert.match(finder, /Native barometric altitude sensor input required/);
  assert.match(finder, /Required device/);
  assert.match(finder, /Lumen Arc/);
  assert.match(finder, /onDownload/);
});

test('Browser exposes the Chapter 2 archive route but locks SKG before Chapter 5', () => {
  assert.match(browser, /ChapterTwoArchiveFinder/);
  assert.match(browser, /chapter-two-archive-entry/);
  assert.match(browser, /canUseProgressionAction\('browser-skg-history', progress\)/);
  assert.match(browser, /setSearchedKeyword\('skg-locked'\)/);
  assert.match(browser, /No useful company identifier has been recovered yet/);
});
