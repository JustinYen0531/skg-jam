import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('ViewTube keeps its body scrollable inside the phone flex layout', () => {
  const source = readFileSync('src/components/ViewTube.tsx', 'utf8');

  assert.match(source, /className="min-h-0 flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden" id="viewtube-root"/);
  assert.match(source, /className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 space-y-4" id="vt-body"/);
});

test('Meta wheel gestures relay to a scrollable phone list', () => {
  const source = readFileSync('src/components/MetaInteractionScene.tsx', 'utf8');

  assert.match(source, /event\.preventDefault\(\);\s*scrollable\.scrollBy\(\{ top: event\.deltaY, behavior: 'auto' \}\);/);
});

test('ViewTube loads its archived discussion in deterministic batches', () => {
  const source = readFileSync('src/components/ViewTube.tsx', 'utf8');

  assert.match(source, /Array\.from\(\{ length: 114 \}/);
  assert.match(source, /const COMMENT_LOAD_BATCH_SIZE = 12/);
  assert.match(source, /const \[visibleArchiveComments, setVisibleArchiveComments\] = useState\(0\)/);
  assert.match(source, /setVisibleArchiveComments\(\(visible\) => Math\.min\(/);
  assert.match(source, /VT_COMMENT_ARCHIVE\.slice\(0, visibleArchiveComments\)/);
  assert.match(source, /onClick=\{loadMoreComments\}/);
  assert.doesNotMatch(source, /onClick=\{\(\) => audio\.play\('ui\.disabled'\)\}/);
});
