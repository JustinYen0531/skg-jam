import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const mart = readFileSync(new URL('../src/components/AmazeMart.tsx', import.meta.url), 'utf8');
const sidebar = readFileSync(new URL('../src/components/AmazeMartSidebar.tsx', import.meta.url), 'utf8');

test('AmazeMart separates its product surface from a narrow right sidebar', () => {
  assert.match(mart, /id="am-commerce-layout"/);
  assert.match(mart, /grid-cols-\[minmax\(0,1fr\)_132px\]/);
  assert.match(mart, /<main className="min-w-0" id="am-commerce-main">/);
  assert.match(mart, /<AmazeMartSidebar/);
  assert.doesNotMatch(mart, /id="am-categories"/);
});

test('sidebar contains real departments, filters, delivery context, and commercial noise', () => {
  assert.match(sidebar, /id="am-sidebar"/);
  assert.match(sidebar, /id="am-sidebar-departments"/);
  assert.match(sidebar, /Deals & clearance/);
  assert.match(sidebar, /Electronics/);
  assert.match(sidebar, /Home & living/);
  assert.match(sidebar, /id="am-sidebar-filters"/);
  assert.match(sidebar, /Under \$25/);
  assert.match(sidebar, /4\.5★ & up/);
  assert.match(sidebar, /Deliver to Harborview/);
  assert.match(sidebar, /id="am-sidebar-sponsored"/);
});

test('storefront filters products while story search keeps its complete scrolling route', () => {
  assert.match(mart, /AMAZEMART_DEPARTMENT_PRODUCTS/);
  assert.match(mart, /const storefrontProducts = recommendedProducts\.filter/);
  assert.match(mart, /storefrontProducts\.slice\(0, 8\)/);
  assert.match(mart, /searchMode=\{searched\}/);
  assert.match(sidebar, /disabled=\{searchMode\}/);
  assert.match(sidebar, /Broad-match search is temporarily ignoring storefront filters/);
  assert.match(mart, /className="flex-1 overflow-y-auto p-3" id="am-body" onScroll=\{handleResultsScroll\}/);
  assert.match(mart, /id="am-search-decoys"[\s\S]*recommendedProducts\.slice\(0, 8\)/);
  assert.match(mart, /shouldRevealSuppressedSeller\(event\.currentTarget\)/);
});

test('sidebar remains storefront-only and cannot mutate chapter progress', () => {
  assert.doesNotMatch(sidebar, /completePuzzleChapter|updateProgress|sellerRevealed|merchantPhase/);
  assert.doesNotMatch(sidebar, /Recommended/);
});
