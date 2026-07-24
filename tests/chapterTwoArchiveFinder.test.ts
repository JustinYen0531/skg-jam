import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const finder = readFileSync(new URL('../src/components/ChapterTwoArchiveFinder.tsx', import.meta.url), 'utf8');
const browser = readFileSync(new URL('../src/components/BrowserApp.tsx', import.meta.url), 'utf8');

test('Chapter 2 uses five real archive formats inside a credible file index', () => {
  assert.match(finder, /'ipa' \| 'apk' \| 'jar' \| 'sis' \| 'zip'/);
  assert.doesNotMatch(finder, /'ipx'|'ipp'|'ips'/);
  assert.match(finder, /Old Game File Index/);
  assert.match(finder, /community-maintained index of discontinued mobile games/);
  assert.match(finder, /Search \$\{selectedFormat\.toUpperCase\(\)\} filenames/);
  assert.match(finder, /CinderKart_1\.3\.9\.apk/);
  assert.match(finder, /NightBus_J2ME\.jar/);
  assert.match(finder, /HarborLights_S60v3\.sis/);
  assert.match(finder, /lost_mobile_catalog_2012\.zip/);
  assert.match(finder, /disabled=\{!record\.target\}/);
});

test('the Skyline IPA is not highlighted and reveals an unsupported-device message', () => {
  assert.match(finder, /Skyline256_LAOS_Final\.ipa/);
  assert.doesNotMatch(finder, /amber/);
  assert.doesNotMatch(finder, /saved to local archive/i);
  assert.doesNotMatch(finder, /record\.target \?/);
  assert.match(finder, /This device cannot open this package/);
  assert.match(finder, /IPA application packages are not supported on the current device/);
  assert.match(finder, /Lumen Arc/);
  assert.match(finder, /onCompatibilityDiscovered/);
  assert.match(finder, /Reading compatibility record/);
  assert.match(finder, /metaInteraction\.speak\(CHAPTER_TWO_DIALOGUE\.compatibilityBlocked,\s*revealCompatibilityError\)/);
});

test('Browser exposes the Chapter 2 archive route but locks SKG before Chapter 5', () => {
  assert.match(browser, /ChapterTwoArchiveFinder/);
  assert.match(browser, /chapter-two-archive-entry/);
  assert.match(browser, /canUseProgressionAction\('browser-skg-history', progress\)/);
  assert.match(browser, /setSearchedKeyword\('skg-locked'\)/);
  assert.match(browser, /No useful company identifier has been recovered yet/);
});
