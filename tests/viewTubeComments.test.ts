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

test('Chapter 1 requires two comment clues without naming the later hardware', () => {
  const source = readFileSync('src/components/ViewTube.tsx', 'utf8');

  assert.match(source, /id="vt-evidence-counter"/);
  assert.match(source, /EVIDENCE \{chapterOneEvidenceCount\}\/2/);
  assert.match(source, /id="vt-arc-reply"/);
  assert.match(source, /Gate 40 to 41 was passable in the old Legacy build/);
  assert.match(source, /id="vt-ipa-evidence"/);
  assert.match(source, /Skyline256_LAOS_Final\.ipa/);
  assert.match(source, /collectChapterOneEvidence\('legacy-passage'\)/);
  assert.match(source, /collectChapterOneEvidence\('legacy-ipa'\)/);
  assert.doesNotMatch(source, /Lumen Arc/i);

  const archiveRows = source.indexOf('VT_COMMENT_ARCHIVE.slice(0, visibleArchiveComments)');
  const loadMore = source.indexOf('id="vt-comments-load-more"');
  const ipaLead = source.indexOf('id="vt-ipa-evidence"');
  assert.ok(archiveRows >= 0 && loadMore > archiveRows && ipaLead > loadMore);
});

test('ordinary comments are interactive but never change evidence progress', () => {
  const source = readFileSync('src/components/ViewTube.tsx', 'utf8');

  assert.match(source, /data-vt-comment=\{comment\.handle\}/);
  assert.match(source, /onSelect=\{reactToComment\}/);
  assert.match(source, /getChapterOneCommentDialogue\(comment\.handle/);
  assert.doesNotMatch(
    source,
    /const reactToComment[\s\S]{0,500}(applyChapterOneEvidence|completePuzzleChapter)/,
  );
});

test('developer Chapter 1 previews can inspect ARC_184 without weakening the normal spoiler gate', () => {
  const viewTube = readFileSync('src/components/ViewTube.tsx', 'utf8');
  const phone = readFileSync('src/components/PhoneSimulator.tsx', 'utf8');

  assert.match(viewTube, /developerPreview\?: boolean/);
  assert.match(viewTube, /!developerPreview && !canUseProgressionAction\('viewtube-arc-search', progress\)/);
  assert.match(phone, /<ViewTube[\s\S]{0,260}developerPreview=\{Boolean\(debugTargetApp\)\}/);
});
