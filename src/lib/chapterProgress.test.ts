import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEBUG_CHAPTERS,
  getChapterAdvanceGuide,
  getChapterSnapshot,
  getChapterById,
  canUseProgressionAction,
  completePuzzleChapter,
} from './chapterProgress';

test('every chapter has an English-only guide for reaching the next stage', () => {
  for (const chapter of DEBUG_CHAPTERS) {
    const guide = getChapterAdvanceGuide(chapter.id);
    const guideText = [guide.nextLabel, guide.objective, ...guide.steps, guide.completion].join(' ');

    assert.equal(guide.chapter, chapter.id);
    assert.ok(guide.steps.length >= 2);
    assert.doesNotMatch(guideText, /[\u3400-\u9fff]/u);
  }
});

test('Chapter 1 guide describes the real ViewTube path into Chapter 2', () => {
  const guide = getChapterAdvanceGuide(1);

  assert.equal(guide.nextLabel, 'CHAPTER 02');
  assert.match(guide.steps.join(' '), /ViewTube/);
  assert.match(guide.steps.join(' '), /ARC_184/);
  assert.match(guide.completion, /Lumen Arc/);
});

test('Chapter 8 developer guide lists every restoration question and answer', () => {
  const guide = getChapterAdvanceGuide(8);

  assert.equal(guide.answers?.length, 8);
  assert.deepEqual(
    guide.answers?.map(({ answer }) => answer),
    [
      'SILVER KITE',
      'THE OPEN DOOR · PAGE 256',
      'HARBOR LOOKOUT · 184',
      'OLD STATION GATE · 40',
      'FIRST REVIEW · 2019',
      'SEA GLASS',
      'THE LUMEN ARC STACK',
      'THE WINDOW SEAT',
    ],
  );
});

test('defines exactly ten ordered GDD puzzle chapters', () => {
  assert.equal(DEBUG_CHAPTERS.length, 10);
  assert.deepEqual(DEBUG_CHAPTERS.map((chapter) => chapter.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('each chapter snapshot records its own chapter and resets ending state', () => {
  for (const chapter of DEBUG_CHAPTERS) {
    const snapshot = getChapterSnapshot(chapter.id);
    assert.equal(snapshot.currentChapter, chapter.id);
    assert.equal(snapshot.completedGame, false);
    assert.equal(snapshot.selectedEnding, null);
  }
});

test('chapter snapshots accumulate discoveries instead of leaking future discoveries backwards', () => {
  assert.equal(getChapterSnapshot(1).watchedVideo, false);
  assert.equal(getChapterSnapshot(2).watchedVideo, true);
  assert.equal(getChapterSnapshot(3).archiveDownloaded, true);
  assert.equal(getChapterSnapshot(4).discoveredOriginalTitle, false);
  assert.equal(getChapterSnapshot(5).discoveredOriginalTitle, true);
  assert.equal(getChapterSnapshot(6).discoveredSKGHistory, true);
  assert.equal(getChapterSnapshot(7).discoveredNoahQA, false);
  assert.equal(getChapterSnapshot(7).discoveredMaraAltitude184, false);
  assert.equal(getChapterSnapshot(7).loggedIntoAdmin, false);
  assert.equal(getChapterSnapshot(8).discoveredMaraAltitude184, true);
  assert.equal(getChapterSnapshot(8).discoveredMaraGate40, true);
  assert.equal(getChapterSnapshot(8).discoveredMaraEnd256, true);
  assert.equal(getChapterSnapshot(8).loggedIntoAdmin, true);
  assert.equal(getChapterSnapshot(8).unlockedAdminLogin, true);
  assert.equal(getChapterSnapshot(9).chapterNineRestorePhase, 'idle');
  assert.equal(getChapterSnapshot(9).chapterNineProfileChoice, null);
  assert.equal(getChapterSnapshot(9).chapterNinePasswordVerified, false);
  assert.equal(getChapterSnapshot(9).chapterNineDownloadState, 'idle');
  assert.equal(getChapterSnapshot(9).chapterNineDeletedAppIds?.length, 0);
  assert.equal(getChapterSnapshot(10).chapterNineRestorePhase, 'rebooted');
  assert.equal(getChapterSnapshot(10).chapterNineDeletedAppIds?.length, 7);
  assert.equal(getChapterSnapshot(10).chapterNineArcaneSilent, true);
  assert.equal(getChapterSnapshot(10).unlockedCodeRoute, true);
});

test('chapter completion advances exactly one chapter and stores earned evidence', () => {
  const chapterFour = getChapterSnapshot(4);
  const result = completePuzzleChapter(chapterFour, 4, { discoveredOriginalTitle: true });

  assert.equal(result.currentChapter, 5);
  assert.equal(result.discoveredOriginalTitle, true);
});

test('out-of-order completion cannot skip chapters or leak future evidence', () => {
  const chapterFour = getChapterSnapshot(4);
  const result = completePuzzleChapter(chapterFour, 8, { loggedIntoAdmin: true });

  assert.strictEqual(result, chapterFour);
  assert.equal(result.currentChapter, 4);
  assert.equal(result.loggedIntoAdmin, false);
});

test('the final chapter remains ten when its completion evidence is recorded', () => {
  const chapterTen = getChapterSnapshot(10);
  const result = completePuzzleChapter(chapterTen, 10, { unlockedCodeRoute: true });

  assert.equal(result.currentChapter, 10);
});

test('chapter metadata supplies a target phone app for debug navigation', () => {
  for (const chapter of DEBUG_CHAPTERS) {
    assert.ok(getChapterById(chapter.id).targetApp);
  }
});

test('normal player cannot use guessed archive credentials before the clue is unlocked', () => {
  const early = getChapterSnapshot(2);
  const chapterSeven = getChapterSnapshot(7);
  const ready = {
    ...chapterSeven,
    discoveredMaraAltitude184: true,
    discoveredMaraGate40: true,
    discoveredMaraEnd256: true,
  };

  assert.equal(canUseProgressionAction('admin-login', early), false);
  assert.equal(canUseProgressionAction('admin-login', { ...ready, discoveredMaraEnd256: false }), false);
  assert.equal(canUseProgressionAction('admin-login', ready), false);
  assert.equal(canUseProgressionAction('admin-login', { ...ready, unlockedAdminLogin: true }), true);
});

test('normal player gates guessed searches while debug snapshots can unlock them in sequence', () => {
  assert.equal(canUseProgressionAction('viewtube-arc-search', getChapterSnapshot(1)), true);
  assert.equal(canUseProgressionAction('amazemart-lumen-search', getChapterSnapshot(1)), false);
  assert.equal(canUseProgressionAction('amazemart-lumen-search', getChapterSnapshot(2)), true);
  assert.equal(canUseProgressionAction('browser-skg-history', getChapterSnapshot(3)), false);
  assert.equal(canUseProgressionAction('browser-skg-history', getChapterSnapshot(4)), false);
  assert.equal(canUseProgressionAction('browser-skg-history', getChapterSnapshot(5)), true);
  assert.equal(canUseProgressionAction('social-noah-search', getChapterSnapshot(4)), false);
  assert.equal(canUseProgressionAction('social-noah-search', getChapterSnapshot(6)), true);
});

test('ARC_184 search follows the Chapter 1 phase instead of a stale leaderboard flag', () => {
  const chapterOne = getChapterSnapshot(1);
  assert.equal(canUseProgressionAction('viewtube-arc-search', {
    ...chapterOne,
    seenLeaderboard: false,
  }), true);
  assert.equal(canUseProgressionAction('viewtube-arc-search', {
    ...chapterOne,
    phase: 'intro_game',
    seenLeaderboard: false,
  }), false);
});
