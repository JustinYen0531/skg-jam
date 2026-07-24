import React, { useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import {
  collectChapterOneEvidence as applyChapterOneEvidence,
  getChapterOneEvidenceCount,
} from '../lib/chapterOneEvidence';
import { useMetaInteraction } from './MetaInteractionScene';
import { ArcRunReplay } from './ArcRunReplay';
import {
  ARC_RUN_TIMELINE_DURATION_MS,
  canExitArcRunFullscreen,
  getArcRunTimelineProgress,
} from '../lib/arcRunReplay';
import { createFeedSeed, shuffleFeed } from '../lib/pseudoFeed';
import {
  CHAPTER_ONE_DIALOGUE,
  DialogueLines,
  getChapterOneCommentDialogue,
  getChapterOneIrrelevantVideoDialogue,
  getChapterOneSearchResponse,
} from '../lib/chapterOneDialogue';
import { hasRememberedChapterTenAfterword } from '../lib/chapterTenAfterword';
import { Search, Play, Pause, ThumbsUp, MessageSquare, Share2, AlertTriangle, Radio, TrendingUp, Lock, X, Maximize2, ChevronRight } from 'lucide-react';

const VIEWTUBE_FEED = [
  { id: 'vt-1', title: 'I Let An Algorithm Plan My Entire Morning', channel: 'EverydayMax', views: '2.4M views', age: '6 hours ago', duration: '12:08', label: 'LIFE+', gradient: 'from-fuchsia-700 via-purple-700 to-cyan-600' },
  { id: 'vt-2', title: 'The Cloud That Looked Exactly Like My Boss', channel: 'WeatherWitness', views: '418K views', age: '1 day ago', duration: '8:44', label: 'TREND', gradient: 'from-sky-500 via-blue-600 to-indigo-900' },
  { id: 'vt-3', title: 'Top 37 Mobile Games You Already Forgot', channel: 'ByteSizedGaming', views: '891K views', age: '3 days ago', duration: '18:37', label: 'GAME', gradient: 'from-amber-500 via-orange-600 to-red-800' },
  { id: 'vt-4', title: 'LIVE: Downtown Pigeon Cam — Camera 04', channel: 'CityWindow', views: '8.2K watching', age: 'LIVE', duration: 'LIVE', label: 'LIVE', gradient: 'from-emerald-600 via-teal-700 to-slate-950' },
  { id: 'vt-5', title: 'Restoring a Phone Nobody Remembers', channel: 'QuietRepair', views: '73K views', age: '2 weeks ago', duration: '24:16', label: 'TECH', gradient: 'from-slate-500 via-slate-700 to-black' },
  { id: 'vt-6', title: 'One Hour of Extremely Productive Keyboard Sounds', channel: 'DeepFocusNow', views: '5.1M views', age: '8 months ago', duration: '1:00:00', label: 'FOCUS', gradient: 'from-indigo-700 via-violet-900 to-black' },
  { id: 'vt-7', title: 'Can A Bird Understand Level Design?', channel: 'GameThinkDaily', views: '206K views', age: '4 days ago', duration: '10:52', label: 'ESSAY', gradient: 'from-lime-500 via-emerald-700 to-cyan-900' },
  { id: 'vt-8', title: 'Five Products That Disappeared Without Explanation', channel: 'ListMachine', views: '1.7M views', age: '1 week ago', duration: '15:09', label: 'DOC', gradient: 'from-rose-700 via-red-900 to-slate-950' },
  { id: 'vt-9', title: 'Ambient Mall Music From A Closed Food Court', channel: 'MemoryLoop', views: '334K views', age: '2 years ago', duration: '2:41:18', label: 'MIX', gradient: 'from-pink-400 via-cyan-500 to-indigo-800' },
  { id: 'vt-10', title: 'World Record Attempts That Ended Strangely', channel: 'ReplayCabinet', views: '962K views', age: '5 days ago', duration: '21:37', label: 'SPORT', gradient: 'from-yellow-500 via-red-600 to-purple-950' },
] as const;

const GATE_40_DANMAKU = [
  { text: 'WAIT WAIT WAIT', top: 8, size: 17, duration: 2.8, delay: 0, mode: 'scroll' },
  { text: 'HOW DID HE PASS 40??', top: 17, size: 20, duration: 3.2, delay: 0.05, mode: 'scroll' },
  { text: 'THERE IS A WALL THERE', top: 28, size: 13, duration: 2.5, delay: 0.12, mode: 'scroll' },
  { text: 'fake fake fake fake fake', top: 39, size: 11, duration: 3.5, delay: 0, mode: 'scroll' },
  { text: 'DID ANYONE SEE THAT', top: 51, size: 18, duration: 2.7, delay: 0.18, mode: 'scroll' },
  { text: 'NO CUT???', top: 65, size: 22, duration: 3.1, delay: 0.08, mode: 'scroll' },
  { text: 'rewind it', top: 78, size: 12, duration: 2.4, delay: 0.24, mode: 'scroll' },
  { text: 'HE WENT THROUGH THE PIPE', top: 88, size: 16, duration: 3.7, delay: 0.04, mode: 'scroll' },
  { text: '40 → 41', top: 34, size: 25, duration: 2.4, delay: 0.4, mode: 'center' },
  { text: 'WHAT', top: 58, size: 28, duration: 2.1, delay: 0.7, mode: 'center' },
  { text: 'pause at 0:41', top: 12, size: 12, duration: 3.3, delay: 0.55, mode: 'scroll' },
  { text: 'COLLIDER IS HARDCODED', top: 23, size: 14, duration: 3.8, delay: 0.34, mode: 'scroll' },
  { text: 'my game always kills me here', top: 44, size: 10, duration: 3.1, delay: 0.62, mode: 'scroll' },
  { text: 'EMULATOR MOD', top: 71, size: 19, duration: 2.6, delay: 0.48, mode: 'scroll' },
  { text: 'the score changed', top: 83, size: 13, duration: 3.2, delay: 0.78, mode: 'scroll' },
  { text: 'THAT WAS NOT THE GAP', top: 6, size: 16, duration: 2.9, delay: 0.92, mode: 'scroll' },
  { text: 'I CANNOT SEE', top: 31, size: 21, duration: 2.5, delay: 1.05, mode: 'scroll' },
  { text: 'move the comments!!', top: 55, size: 11, duration: 3.6, delay: 0.96, mode: 'scroll' },
  { text: '184 IS REAL', top: 74, size: 23, duration: 2.8, delay: 1.12, mode: 'scroll' },
  { text: 'rewind rewind rewind', top: 91, size: 14, duration: 3, delay: 1.2, mode: 'scroll' },
  { text: '???', top: 47, size: 32, duration: 1.9, delay: 1.35, mode: 'center' },
  { text: 'NO WAY', top: 19, size: 26, duration: 2.2, delay: 1.55, mode: 'center' },
  { text: 'frame skip?', top: 62, size: 12, duration: 3.4, delay: 1.42, mode: 'scroll' },
  { text: 'HE IS STILL ALIVE', top: 80, size: 18, duration: 2.7, delay: 1.68, mode: 'scroll' },
] as const;

const AMBIENT_DANMAKU = [
  { text: 'clean run so far', top: 14, size: 10, duration: 9.5, delay: -2.1 },
  { text: 'he makes this look easy', top: 31, size: 12, duration: 11, delay: -7.4 },
  { text: 'what version is this?', top: 52, size: 9, duration: 8.8, delay: -4.8 },
  { text: '184 incoming', top: 72, size: 13, duration: 10.4, delay: -8.9 },
  { text: 'nice recovery', top: 86, size: 10, duration: 12, delay: -1.2 },
  { text: 'watch Gate 40', top: 22, size: 11, duration: 10.8, delay: -5.7 },
] as const;

// Chapter 1 comment section. Only the ARC reply and the final IPA archive lead
// advance the puzzle. Everything here is pure
// texture: FORESHADOW rows imply later beats without ever printing a usable
// answer; NOISE rows are the crowd that isn't here to help you. See
// docs/CONTENT_EXPANSION_HANDOFF.md §3 for the non-spoiler boundary.
// tier drives the visual weight: 'foreshadow' rows are legible-but-muted with a
// hairline margin; 'noise' rows are the faintest, single-thought crowd chatter.
type FeedComment = { handle: string; age: string; text: string; tier: 'foreshadow' | 'noise' };

// Rendered above SkyFlapMaster (load-bearing #1): pure crowd, no signal.
const VT_COMMENTS_TOP: readonly FeedComment[] = [
  { handle: '_gg_', age: '5y ago', text: 'first', tier: 'noise' },
  { handle: 'algorithm_victim', age: '3 weeks ago', text: "who's here in 2026 💀 the algorithm really said “remember this?”", tier: 'noise' },
  { handle: 'passing_through', age: '1 month ago', text: 'why is this in my recommended twelve years later', tier: 'noise' },
] as const;

// Rendered between the ARC reply and the ordinary Legacy-build folklore.
const VT_COMMENTS_MID: readonly FeedComment[] = [
  { handle: 'quietframes', age: '11y ago', text: 'whatever happened to the person who actually made the original? one final update, then just... gone. nobody ever talks about them.', tier: 'foreshadow' },
  { handle: 'pixel_grief', age: '9y ago', text: 'the compression on this is a war crime, i genuinely cannot see anything', tier: 'noise' },
  { handle: 'warranty_void', age: '10y ago', text: 'old uploads from this version keep disappearing. half the links in this thread are dead now.', tier: 'foreshadow' },
  { handle: 'uncle_of_the_year', age: '8y ago', text: 'my nephew could clear 40 in his sleep, 184 is just sweaty', tier: 'noise' },
  { handle: 'former_QA_maybe', age: '12y ago', text: "he's not tapping randomly. watch the rhythm. it's like he's reading a map only he can see.", tier: 'foreshadow' },
] as const;

// Rendered between the ordinary folklore and the bottom archive filename.
const VT_COMMENTS_LOW: readonly FeedComment[] = [
  { handle: 'ratio_enjoyer', age: '7y ago', text: "L + ratio + it's fake + didn't watch", tier: 'noise' },
  { handle: 'mall_ghost_2011', age: '10y ago', text: 'old heads know this used to be a game you could FINISH. like it had an ending. an actual one. not this infinite ad slop.', tier: 'foreshadow' },
  { handle: 'sticky_screen', age: '6y ago', text: "tapped so hard my screen has ARC_184's fingerprints on it now", tier: 'noise' },
  { handle: 'not_a_bot_i_swear', age: '9y ago', text: 'has anyone scrolled the leaderboard all the way to the BOTTOM? it does something weird down there. like the sort just gives up.', tier: 'foreshadow' },
  { handle: 'three_g_summary', age: '5y ago', text: 'gatekept, gaslit, girlbossed his way past gate 40', tier: 'noise' },
] as const;

// Authored crowd rows that trail before the two collectible leads.
const VT_COMMENTS_TAIL: readonly FeedComment[] = [
  { handle: 'keeps_receipts', age: '12y ago', text: "my mum saved old games too. never said why. she's not really... around to ask anymore.", tier: 'foreshadow' },
  { handle: 'taking_notes', age: '8y ago', text: 'downloading an entire dead operating system to beat a bird game is certified insane behavior and i am taking notes', tier: 'noise' },
  { handle: 'dead_link_collector', age: '8y ago', text: 'this got swallowed by some "automation" company. they gut old apps, staple ads on the corpse, call it a business model. classic.', tier: 'foreshadow' },
  { handle: 'here_for_replies', age: '6y ago', text: 'this comment section is genuinely more entertaining than the run', tier: 'noise' },
  { handle: 'FreeC0ins_Daily', age: '3y ago', text: '🔥 WANT UNLIMITED COINS?? check my profile for the mod 🔥', tier: 'noise' },
  { handle: 'cardboardbox_archive', age: '7y ago', text: 'the original store page listed it under a totally different name. three letters. i forget which. someone renamed the whole thing.', tier: 'foreshadow' },
  { handle: 'streambrain_2026', age: '2 weeks ago', text: 'chat is this real', tier: 'noise' },
  { handle: 'soft_reset', age: '9y ago', text: "i don't think 184 was even the point for this guy. feels like he was trying to show us the score isn't the score.", tier: 'foreshadow' },
  { handle: 'wholesome_100', age: '5y ago', text: 'the real world record is the friends we ratioed along the way', tier: 'noise' },
  { handle: 'latekeeper', age: '6y ago', text: "if you have to ask how he did it, the answer won't help you yet. find the build first. everything else is downstream.", tier: 'foreshadow' },
  { handle: 'above_it_all', age: '4y ago', text: 'imagine caring this much about a flappy clone', tier: 'noise' },
] as const;

const ARCHIVE_COMMENT_TEXT = [
  'the autoplay thumbnail made this look like a cooking video somehow',
  'came for the bird, stayed for everyone arguing about one pipe',
  'why does this upload have more lore than most games',
  'my old phone would have melted before score ten',
  'the comment timestamp rabbit hole is wild',
  'this is exactly the kind of video the algorithm resurfaces at 3am',
  'not convinced, but i did replay that gate six times',
  'someone please make a normal tutorial for this game',
  'the UI on that old device looks strangely clean',
  'i miss when comments were just people being confused together',
  'the bird had better posture than i do',
  'watching this at work with the sound off feels illegal',
] as const;

// The visible discussion starts with authored context, then opens into a long
// but deliberately non-progression archive. Every row is deterministic: the
// player can browse it without receiving future puzzle answers.
const VT_COMMENT_ARCHIVE: readonly FeedComment[] = Array.from({ length: 114 }, (_, index) => ({
  handle: `archive_viewer_${(index + 1).toString().padStart(3, '0')}`,
  age: `${2 + ((index * 7) % 11)}y ago`,
  text: ARCHIVE_COMMENT_TEXT[index % ARCHIVE_COMMENT_TEXT.length],
  tier: 'noise' as const,
}));

const COMMENT_LOAD_BATCH_SIZE = 12;

const VtCommentRow: React.FC<{
  comment: FeedComment;
  onSelect?: (comment: FeedComment) => void;
}> = ({ comment, onSelect }) => {
  if (comment.tier === 'foreshadow') {
    const className = 'w-full border-l border-slate-800/70 pl-2.5 text-left space-y-0.5 transition-colors hover:border-slate-600 hover:bg-slate-900/35';
    const content = (
      <>
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
          <span className="font-bold text-slate-400">{comment.handle}</span>
          <span>{comment.age}</span>
        </div>
        <p className="text-[11px] leading-snug text-slate-400">{comment.text}</p>
      </>
    );
    return onSelect ? (
      <button type="button" className={className} onClick={() => onSelect(comment)} data-vt-comment={comment.handle}>
        {content}
      </button>
    ) : <div className={className}>{content}</div>;
  }
  const className = 'flex w-full gap-1.5 text-left text-[10px] leading-snug text-slate-500 transition-colors hover:bg-slate-900/35 hover:text-slate-400';
  const content = (
    <>
      <span className="font-mono font-bold text-slate-600 shrink-0">{comment.handle}</span>
      <span className="min-w-0">{comment.text}</span>
    </>
  );
  return onSelect ? (
    <button type="button" className={className} onClick={() => onSelect(comment)} data-vt-comment={comment.handle}>
      {content}
    </button>
  ) : <div className={className}>{content}</div>;
};

const formatReplayTime = (elapsedMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface ViewTubeProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  /** Developer chapter previews may inspect the Chapter 1 evidence directly. */
  developerPreview?: boolean;
}

export const ViewTube: React.FC<ViewTubeProps> = ({ progress, updateProgress, developerPreview = false }) => {
  const metaInteraction = useMetaInteraction();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(progress.viewTubeSearchedArc);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [replayPaused, setReplayPaused] = useState(false);
  const [replayElapsedMs, setReplayElapsedMs] = useState(0);
  const [replayFullscreenOpen, setReplayFullscreenOpen] = useState(false);
  const [replayExitUnlocked, setReplayExitUnlocked] = useState(false);
  const [replayControlsVisible, setReplayControlsVisible] = useState(true);
  const [replayCycle, setReplayCycle] = useState(0);
  const [searchError, setSearchError] = useState('');
  const [barrageActive, setBarrageActive] = useState(false);
  const [barrageCycle, setBarrageCycle] = useState(0);
  const [visibleArchiveComments, setVisibleArchiveComments] = useState(0);
  const [publicizeTraceRemoved, setPublicizeTraceRemoved] = useState(false);
  const [recommendedVideos] = useState(() => shuffleFeed(VIEWTUBE_FEED, createFeedSeed('viewtube')));
  const chapterOneSearchAttempt = useRef(0);
  const chapterOneVideoAttempt = useRef(0);
  const chapterOneCommentAttempt = useRef(0);
  const replayExitUnlockedRef = useRef(false);
  const replayControlsTimerRef = useRef<number | null>(null);
  const remainingArchiveComments = VT_COMMENT_ARCHIVE.length - visibleArchiveComments;
  const chapterOneEvidenceCount = getChapterOneEvidenceCount(progress);
  const publicizeTraceRemembered = hasRememberedChapterTenAfterword('publicize');

  useEffect(() => {
    if (!isPlayingVideo || !publicizeTraceRemembered || publicizeTraceRemoved) return;
    const timer = window.setTimeout(() => setPublicizeTraceRemoved(true), 3600);
    return () => window.clearTimeout(timer);
  }, [isPlayingVideo, publicizeTraceRemembered, publicizeTraceRemoved]);

  const loadMoreComments = () => {
    audio.playTick();
    setVisibleArchiveComments((visible) => Math.min(
      VT_COMMENT_ARCHIVE.length,
      visible + COMMENT_LOAD_BATCH_SIZE,
    ));
  };

  const speakChapterOne = (lines: DialogueLines) => {
    if (progress.currentChapter === 1 && metaInteraction.active) {
      metaInteraction.speak(lines);
    }
  };

  const reactToComment = (comment: FeedComment) => {
    audio.playTick();
    speakChapterOne(getChapterOneCommentDialogue(comment.handle, chapterOneCommentAttempt.current));
    chapterOneCommentAttempt.current += 1;
  };

  const collectChapterOneEvidence = (kind: 'legacy-passage' | 'legacy-ipa') => {
    audio.playTick();
    if (progress.currentChapter !== 1) return;
    if (kind === 'legacy-passage' && !progress.watchedVideo && !replayExitUnlocked) {
      speakChapterOne(CHAPTER_ONE_DIALOGUE.videoReady);
      return;
    }

    const alreadyCollected = kind === 'legacy-passage'
      ? progress.discoveredLegacyPassage
      : progress.discoveredLegacyIpa;
    if (alreadyCollected) {
      speakChapterOne(CHAPTER_ONE_DIALOGUE.evidenceAlreadyCollected);
      return;
    }

    const completesPair = kind === 'legacy-passage'
      ? progress.discoveredLegacyIpa
      : progress.discoveredLegacyPassage;
    const lead = kind === 'legacy-passage'
      ? CHAPTER_ONE_DIALOGUE.legacyPassageLead
      : CHAPTER_ONE_DIALOGUE.ipaLead;
    speakChapterOne(completesPair ? [...lead, ...CHAPTER_ONE_DIALOGUE.evidenceComplete] : lead);

    updateProgress((prev) => applyChapterOneEvidence(prev, kind));
  };

  const performSearch = () => {
    audio.play('key.enter');
    const query = searchQuery.toLowerCase().trim();
    if (progress.currentChapter === 1 && metaInteraction.active) {
      const response = getChapterOneSearchResponse(searchQuery, chapterOneSearchAttempt.current);
      chapterOneSearchAttempt.current += 1;
      metaInteraction.speak(response.lines);

      if (!response.isArcSearch) {
        audio.play('search.noResult');
        setSearchError('NO RELEVANT RESULT FOR THE CURRENT INVESTIGATION.');
        return;
      }

      if (!developerPreview && !canUseProgressionAction('viewtube-arc-search', progress)) {
        audio.play('search.noResult');
        setSearchError('THAT NAME IS INTERESTING. YOUR CHARACTER HAS NOT SEEN IT YET.');
        return;
      }

      audio.play('search.found');
      setSearchError('');
      setHasSearched(true);
      updateProgress((prev) => ({ ...prev, viewTubeSearchedArc: true }));
      return;
    }

    if (query.includes('arc') || query.includes('184')) {
      if (!developerPreview && !canUseProgressionAction('viewtube-arc-search', progress)) {
        audio.play('search.noResult');
        setSearchError('THAT NAME IS INTERESTING. YOUR CHARACTER HAS NOT SEEN IT YET.');
        return;
      }
      audio.play('search.found');
      setSearchError('');
      setHasSearched(true);
      updateProgress((prev) => ({ ...prev, viewTubeSearchedArc: true }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  useEffect(() => metaInteraction.registerInput('vt-search-input', {
    getValue: () => searchQuery,
    onChange: setSearchQuery,
    onSubmit: performSearch,
  }), [metaInteraction.registerInput, searchQuery, progress, updateProgress]);

  const startVideo = () => {
    // Old player relay click; the compressed recording floor engages. The
    // replay now plays inline in the card so the page stays one scrollable
    // column (video → info → comments); fullscreen is an optional expand.
    audio.play('viewtube.videoStart');
    setIsPlayingVideo(true);
    setReplayPaused(false);
    setReplayElapsedMs(0);
    setReplayExitUnlocked(false);
    replayExitUnlockedRef.current = false;
    setReplayControlsVisible(true);
    setReplayCycle((cycle) => cycle + 1);
    speakChapterOne(CHAPTER_ONE_DIALOGUE.videoStarted);
  };

  const revealReplayControls = useCallback(() => {
    setReplayControlsVisible(true);
    if (replayControlsTimerRef.current !== null) {
      window.clearTimeout(replayControlsTimerRef.current);
    }
    replayControlsTimerRef.current = null;
    if (!replayPaused) {
      replayControlsTimerRef.current = window.setTimeout(() => {
        setReplayControlsVisible(false);
        replayControlsTimerRef.current = null;
      }, 1800);
    }
  }, [replayPaused]);

  const toggleReplayPaused = () => {
    const nextPaused = !replayPaused;
    audio.play('viewtube.pause');
    setReplayPaused(nextPaused);
    setReplayControlsVisible(true);
    if (nextPaused) speakChapterOne(CHAPTER_ONE_DIALOGUE.videoPaused);
  };

  const replayFromStart = () => {
    audio.play('viewtube.videoStart');
    setReplayPaused(false);
    setReplayElapsedMs(0);
    setReplayControlsVisible(true);
    setBarrageActive(false);
    setReplayCycle((cycle) => cycle + 1);
  };

  const activateReplay = () => {
    if (replayPaused && replayExitUnlocked) {
      replayFromStart();
      return;
    }
    toggleReplayPaused();
  };

  const unlockReplayExit = () => {
    setReplayPaused(true);
    setReplayControlsVisible(true);
    if (replayExitUnlockedRef.current) return;
    replayExitUnlockedRef.current = true;
    setReplayExitUnlocked(true);
    audio.play('viewtube.pause');
    speakChapterOne(CHAPTER_ONE_DIALOGUE.videoEvidence);
    updateProgress((prev) => ({ ...prev, watchedVideo: true }));
  };

  const openReplayFullscreen = () => {
    audio.playTick();
    setReplayFullscreenOpen(true);
    setReplayControlsVisible(true);
  };

  // Fullscreen is now an optional expand: closing simply returns to the inline
  // player (keeping playback state) rather than pausing or jumping the page.
  const closeReplayFullscreen = useCallback(() => {
    audio.playTick();
    setReplayFullscreenOpen(false);
    setReplayControlsVisible(true);
  }, []);

  useEffect(() => {
    if (!replayFullscreenOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeReplayFullscreen();
        return;
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        activateReplay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeReplayFullscreen, replayFullscreenOpen, replayPaused, revealReplayControls]);

  useEffect(() => () => {
    if (replayControlsTimerRef.current !== null) {
      window.clearTimeout(replayControlsTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (replayFullscreenOpen) revealReplayControls();
  }, [replayFullscreenOpen, replayPaused, revealReplayControls]);

  const renderReplayPlayer = (fullscreen: boolean) => {
    const hudVisible = replayControlsVisible || replayPaused;
    const timelinePercent = getArcRunTimelineProgress(replayElapsedMs) * 100;
    const displayElapsed = formatReplayTime(replayElapsedMs * 2);
    const displayDuration = formatReplayTime(ARC_RUN_TIMELINE_DURATION_MS * 2);

    return (
      <div
        className={`${fullscreen ? 'absolute inset-0 z-[80] h-full w-full' : 'absolute inset-0'} flex flex-col justify-between overflow-hidden bg-black text-left text-white ${hudVisible ? 'cursor-default' : 'cursor-none'}`}
        onClick={activateReplay}
        onMouseMove={revealReplayControls}
        onPointerMove={revealReplayControls}
        role="button"
        tabIndex={0}
        data-fullscreen-lock={fullscreen ? (replayExitUnlocked ? 'unlocked' : 'locked') : 'released'}
        id="vt-player-active"
        aria-label={replayPaused && replayExitUnlocked ? 'Replay archived replay' : replayPaused ? 'Resume archived replay' : 'Pause archived replay'}
      >
        <div className="absolute inset-0 bg-black" id="vt-arc-replay-surface">
          <ArcRunReplay
            key={replayCycle}
            active={isPlayingVideo}
            paused={replayPaused}
            initialElapsedMs={replayElapsedMs}
            onProgress={(elapsedMs) => {
              setReplayElapsedMs(elapsedMs);
              if (canExitArcRunFullscreen(elapsedMs)) unlockReplayExit();
            }}
            onBarrageChange={(isActive) => {
              setBarrageActive(isActive);
              if (isActive) {
                setBarrageCycle((cycle) => cycle + 1);
                audio.play('viewtube.barrage');
              }
            }}
            onPausePoint={unlockReplayExit}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(130,70,30,0.08),transparent_16%,transparent_82%,rgba(20,30,55,0.13))] mix-blend-color"
            id="vt-aged-video-wash"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          id="vt-ambient-danmaku"
          aria-hidden="true"
        >
          {AMBIENT_DANMAKU.map((dan, index) => (
            <span
              key={`${dan.text}-${index}`}
              style={{
                top: `${dan.top}%`,
                fontSize: `${dan.size}px`,
                animationName: 'danmaku-run',
                animationDuration: `${dan.duration}s`,
                animationDelay: `${dan.delay}s`,
                animationIterationCount: 'infinite',
                animationPlayState: replayPaused ? 'paused' : 'running',
              }}
              className="absolute left-0 whitespace-nowrap font-bold text-white/85 [animation-timing-function:linear] [text-shadow:1px_1px_1px_rgba(0,0,0,.85)]"
            >
              {dan.text}
            </span>
          ))}
        </div>

        {barrageActive && (
          <div
            key={barrageCycle}
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
            id="vt-gate40-danmaku-barrage"
            aria-hidden="true"
          >
            {GATE_40_DANMAKU.map((dan, index) => (
              <span
                key={`${dan.text}-${index}`}
                style={{
                  top: `${dan.top}%`,
                  left: dan.mode === 'center' ? '50%' : '0',
                  fontSize: `${dan.size}px`,
                  animationName: dan.mode === 'center' ? 'danmaku-hold' : 'danmaku-run',
                  animationDuration: `${dan.duration}s`,
                  animationDelay: `${dan.delay}s`,
                  animationPlayState: replayPaused ? 'paused' : 'running',
                }}
                className="absolute left-0 whitespace-nowrap font-black text-white [animation-fill-mode:both] [animation-timing-function:linear] [text-shadow:1px_1px_1px_rgba(0,0,0,.9)]"
              >
                {dan.text}
              </span>
            ))}
          </div>
        )}

        {replayPaused && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" id="vt-replay-paused">
            <span className="font-mono text-[clamp(32px,7vw,76px)] font-black tracking-[0.18em] text-white [text-shadow:0_3px_6px_rgba(0,0,0,.9)]">Ⅱ</span>
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between bg-gradient-to-b from-black/80 via-black/35 to-transparent px-5 pb-10 pt-4 transition-opacity duration-200 ${hudVisible ? 'opacity-100' : 'opacity-0'}`}
          id="vt-fullscreen-top-hud"
        >
          <div className="min-w-0 pr-4 [text-shadow:0_2px_4px_rgba(0,0,0,.9)]">
            <div className="truncate text-sm font-bold sm:text-base">ARC_184 — CONTROVERSIAL GATE 40 RUN</div>
            <div className="mt-0.5 font-mono text-[10px] text-white/60">ARCHIVED MOBILE CAPTURE · 240p</div>
          </div>
          {fullscreen && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeReplayFullscreen();
              }}
              className="pointer-events-auto flex h-10 items-center gap-2 rounded-full border border-white/45 bg-black/55 px-3 text-xs font-bold text-white backdrop-blur-md hover:bg-white/15"
              data-exit-unlocked={replayExitUnlocked ? 'true' : 'false'}
              id="vt-fullscreen-exit"
              aria-label="Exit fullscreen replay"
            >
              <X className="h-4 w-4" />
              <span>EXIT</span>
            </button>
          )}
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-4 pb-4 pt-14 transition-opacity duration-200 ${hudVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={(event) => event.stopPropagation()}
          id="vt-player-controls"
        >
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25 shadow-[0_1px_5px_rgba(0,0,0,0.9)]" id="vt-replay-timeline">
            <div
              className="h-full rounded-full bg-[#ff1f1f] shadow-[0_0_8px_rgba(255,31,31,0.65)] transition-[width] duration-75"
              style={{ width: `${timelinePercent}%` }}
              data-timeline-progress={timelinePercent.toFixed(3)}
              id="vt-replay-timeline-progress"
            />
          </div>
          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              onClick={activateReplay}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15"
              id="vt-replay-play-pause"
              aria-label={replayPaused && replayExitUnlocked ? 'Replay from beginning' : replayPaused ? 'Resume replay' : 'Pause replay'}
            >
              {replayPaused ? <Play className="h-5 w-5 fill-white" /> : <Pause className="h-5 w-5 fill-white" />}
            </button>
            <span className="font-mono text-xs [text-shadow:0_2px_4px_rgba(0,0,0,.9)]" id="vt-replay-timecode">
              {displayElapsed} / {displayDuration}
            </span>
            <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-white/65">
              {!replayExitUnlocked && <Lock className="h-3 w-3" />}
              {replayExitUnlocked ? 'GATE 41 REACHED' : 'GATE 40 EVIDENCE RUN'}
            </span>
            {!fullscreen && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openReplayFullscreen();
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/15"
                id="vt-fullscreen-enter"
                aria-label="Expand replay to fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-0 flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden" id="viewtube-root">
      
      {/* ViewTube Header */}
      <div className="bg-red-700 p-3 flex items-center justify-between" id="vt-header">
        <div className="flex items-center gap-1.5 font-display font-black tracking-tight text-white text-base">
          <div className="bg-white text-red-700 px-1.5 py-0.5 rounded font-black text-xs">V</div>
          <span>ViewTube</span>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-[220px] ml-4 relative">
          <input
            type="text"
            placeholder="Search Creator or Video..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => speakChapterOne(CHAPTER_ONE_DIALOGUE.searchFocused)}
            className="w-full bg-red-950/40 text-xs text-white placeholder-red-300 px-2.5 py-1.5 pr-8 rounded border border-red-800 focus:outline-none focus:border-red-500 font-mono"
            id="vt-search-input"
          />
          <button type="submit" className="absolute right-2 top-2 text-red-300 hover:text-white" id="vt-search-submit">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Main Container */}
      {searchError && (
        <div className="mx-3 mt-2 rounded border border-red-500/30 bg-red-950/30 p-2 text-[9px] font-mono text-red-300" id="vt-search-error">
          ⚠ {searchError}
        </div>
      )}
      <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 space-y-4" id="vt-body">
        {!hasSearched ? (
          <div className="space-y-3" id="vt-home-feed">
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[9px] font-bold whitespace-nowrap" id="vt-topic-chips">
              {['For You', 'Gaming', 'Live', 'Documentary', 'Repair', 'Recently Uploaded'].map((topic, index) => (
                <span key={topic} className={`px-2.5 py-1 rounded-full border ${index === 0 ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
                  {topic}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                audio.playTick();
                speakChapterOne(getChapterOneIrrelevantVideoDialogue(chapterOneVideoAttempt.current));
                chapterOneVideoAttempt.current += 1;
              }}
              className="w-full text-left rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl"
              id="vt-featured-video"
            >
              <div className={`h-28 bg-gradient-to-br ${recommendedVideos[0].gradient} relative p-3 flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black tracking-widest bg-black/50 px-1.5 py-0.5 rounded">FEATURED FOR YOU</span>
                  <span className="text-[8px] font-mono bg-black/70 px-1.5 py-0.5 rounded">{recommendedVideos[0].duration}</span>
                </div>
                <div className="flex justify-center">
                  <div className="w-11 h-11 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>
                <span className="text-[8px] font-black tracking-[0.2em] text-white/80">{recommendedVideos[0].label}</span>
              </div>
              <div className="p-2.5">
                <h2 className="text-xs font-bold leading-tight text-white">{recommendedVideos[0].title}</h2>
                <div className="text-[9px] text-slate-400 mt-1">{recommendedVideos[0].channel} · {recommendedVideos[0].views} · {recommendedVideos[0].age}</div>
              </div>
            </button>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-xs font-bold"><TrendingUp className="w-3.5 h-3.5 text-red-500" /> Recommended</div>
              <span className="text-[8px] text-slate-500 font-mono">REFRESHED JUST NOW</span>
            </div>

            <div className="grid grid-cols-2 gap-2" id="vt-recommendations">
              {recommendedVideos.slice(1, 9).map((video) => (
                <button
                  type="button"
                  key={video.id}
                  onClick={() => {
                    audio.playTick();
                    speakChapterOne(getChapterOneIrrelevantVideoDialogue(chapterOneVideoAttempt.current));
                    chapterOneVideoAttempt.current += 1;
                  }}
                  className="min-w-0 text-left rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80"
                >
                  <div className={`h-16 bg-gradient-to-br ${video.gradient} relative p-1.5`}>
                    <span className="absolute left-1.5 top-1.5 text-[7px] font-black bg-black/45 px-1 rounded">{video.label}</span>
                    <span className={`absolute right-1 bottom-1 text-[7px] font-mono px-1 rounded ${video.duration === 'LIVE' ? 'bg-red-600 text-white' : 'bg-black/75 text-white'}`}>{video.duration}</span>
                    {video.duration === 'LIVE' && <Radio className="absolute w-3.5 h-3.5 left-2 bottom-1.5 text-white animate-pulse" />}
                  </div>
                  <div className="p-2">
                    <h3 className="text-[10px] leading-tight font-bold text-slate-100 line-clamp-2">{video.title}</h3>
                    <div className="text-[8px] text-slate-500 mt-1 truncate">{video.channel}</div>
                    <div className="text-[8px] text-slate-600 truncate">{video.views} · {video.age}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                audio.playTick();
                setSearchQuery('ARC_184');
                speakChapterOne(CHAPTER_ONE_DIALOGUE.rumorSelected);
              }}
              className="w-full text-left rounded-lg border border-red-900/50 bg-red-950/20 p-2.5 flex items-center gap-2"
              id="vt-rumor-suggestion"
            >
              <div className="w-8 h-8 rounded bg-red-700/60 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4" /></div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-200">People are searching for an erased record run</div>
                <div className="text-[9px] font-mono text-red-300">Trending query: ARC_184 · tap to place in search</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4" id="vt-search-results">
            
            {/* Controversial Video Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden" id="vt-video-card">
              
              {/* Fake Player Viewport */}
              <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden" id="vt-player">
                {isPlayingVideo ? (
                  replayFullscreenOpen ? (
                    <div className="flex h-full w-full items-center justify-center bg-black font-mono text-[10px] tracking-[0.2em] text-white/45" id="vt-fullscreen-placeholder">
                      FULLSCREEN EVIDENCE PLAYBACK ACTIVE
                    </div>
                  ) : renderReplayPlayer(false)
                ) : (
                  <button 
                    onClick={startVideo}
                    className="flex flex-col items-center justify-center space-y-2 group hover:scale-105 transition-transform"
                    id="vt-play-trigger"
                  >
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-500 transition-colors">
                      <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                    </div>
                    <span className="text-xs text-slate-300 font-bold bg-black/60 px-2 py-0.5 rounded">
                      Play Controversial Run
                    </span>
                  </button>
                )}
              </div>

              {/* Video Info details */}
              <div className="p-3 space-y-1.5 border-t border-slate-800" id="vt-info">
                <h2 className="font-display font-bold text-sm text-white">
                  I BROKE THE UNBEATABLE FLAPPY GAME — 184 POINTS WORLD RECORD
                </h2>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>ARC_184 • 14,832 views • 12 years ago</span>
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Checked
                  </span>
                </div>

                <div className="flex gap-4 border-t border-b border-slate-800/60 py-2 my-2 text-xs text-slate-300">
                  <button className="flex items-center gap-1 hover:text-white" onClick={() => audio.playTick()}>
                    <ThumbsUp className="w-4 h-4 text-slate-400" /> 1.2k
                  </button>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MessageSquare className="w-4 h-4" /> 142 Comments
                  </div>
                  <button className="flex items-center gap-1 hover:text-white ml-auto" onClick={() => audio.playTick()}>
                    <Share2 className="w-4 h-4 text-slate-400" /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Video Comment Section */}
            <div className="space-y-3" id="vt-comments">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <h3 className="text-xs font-bold text-slate-300">Discussion (142)</h3>
                <span
                  className="font-mono text-[9px] font-bold tracking-[0.16em] text-cyan-400"
                  id="vt-evidence-counter"
                  data-evidence-count={chapterOneEvidenceCount}
                >
                  EVIDENCE {chapterOneEvidenceCount}/2
                </span>
              </div>
              
              <div className="space-y-3.5 text-xs" id="vt-comment-list">
                {/* Crowd noise above the reveal — the point is a long scroll of
                    people not helping before the actual lead shows up. */}
                {VT_COMMENTS_TOP.map((comment) => (
                  <VtCommentRow key={comment.handle} comment={comment} onSelect={reactToComment} />
                ))}

                {/* More crowd + foreshadow, pulled forward from where it used
                    to trail the reveal, so the load-bearing reply isn't the
                    first real comment a player's eye lands on. */}
                {VT_COMMENTS_TAIL.map((comment) => (
                  <VtCommentRow key={comment.handle} comment={comment} onSelect={reactToComment} />
                ))}

                {/* Comment 1 — load-bearing: ARC_184 reply advances the puzzle */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-purple-400">SkyFlapMaster</span>
                    <span>12y ago</span>
                  </div>
                  <p className="text-slate-200">
                    This is 100% fake. At score 40, there is a hardcoded collision barrier. I inspected the bytecode. He is either using an emulator modification or spoofing values.
                  </p>
                  <button
                    type="button"
                    className="group flex w-full items-center gap-2 rounded border border-yellow-950 bg-slate-950 p-1.5 text-left text-[10px] text-yellow-400 transition-all duration-150 mt-1 hover:border-yellow-600/70 hover:bg-slate-900 hover:shadow-[0_0_0_1px_rgba(234,179,8,0.28),0_2px_10px_rgba(0,0,0,0.35)] active:scale-[0.99]"
                    id="vt-arc-reply"
                    data-evidence-collected={progress.discoveredLegacyPassage}
                    onClick={() => collectChapterOneEvidence('legacy-passage')}
                  >
                    <span className="min-w-0 flex-1">
                      💬 **ARC_184 replied**: No emulator edits. No scripts. Gate 40 to 41 was passable in the old Legacy build. That is the version in this recording.
                    </span>
                    {progress.discoveredLegacyPassage ? (
                      <span className="shrink-0 font-mono text-[8px] text-emerald-400">COLLECTED</span>
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-yellow-500/60 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    )}
                  </button>
                </div>

                {publicizeTraceRemembered && (
                  <div
                    className={`rounded border p-2.5 font-mono text-[10px] transition-colors ${
                      publicizeTraceRemoved
                        ? 'border-rose-900/45 bg-rose-950/15 text-rose-200/55'
                        : 'border-cyan-700/55 bg-cyan-950/20 text-cyan-100'
                    }`}
                    id="chapter-ten-publicize-easter-egg"
                    data-trace-status={publicizeTraceRemoved ? 'removed' : 'live'}
                  >
                    {publicizeTraceRemoved ? (
                      <span>ARCHIVE WITNESS · COMMENT REMOVED BY AUTHOR</span>
                    ) : (
                      <><span className="font-bold text-cyan-300">ARCHIVE WITNESS · NOW</span><p className="mt-1 leading-snug">I saved the Gate 40 crossing. If this disappears, the mirror was real.</p></>
                    )}
                  </div>
                )}

                {/* Foreshadow + noise between the first two leads */}
                {VT_COMMENTS_MID.map((comment) => (
                  <VtCommentRow key={comment.handle} comment={comment} onSelect={reactToComment} />
                ))}

                {/* Ordinary version folklore: deliberately no hardware answer. */}
                <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/40 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-amber-400">legacy_runner</span>
                    <span>11y ago</span>
                  </div>
                  <p className="text-slate-200">
                    People keep arguing about the score, but this upload clearly is not the current build. Half the old mirrors are gone, so good luck proving which release it was.
                  </p>
                </div>

                {/* Foreshadow + noise before the archive tip */}
                {VT_COMMENTS_LOW.map((comment) => (
                  <VtCommentRow key={comment.handle} comment={comment} onSelect={reactToComment} />
                ))}

                {VT_COMMENT_ARCHIVE.slice(0, visibleArchiveComments).map((comment) => (
                  <VtCommentRow key={comment.handle} comment={comment} onSelect={reactToComment} />
                ))}
              </div>

              {remainingArchiveComments > 0 ? (
                <button
                  type="button"
                  onClick={loadMoreComments}
                  className="w-full border-t border-slate-800/50 py-2 text-[10px] font-mono text-slate-500 hover:text-slate-300"
                  id="vt-comments-load-more"
                  data-comments-remaining={remainingArchiveComments}
                >
                  {visibleArchiveComments === 0
                    ? `View ${remainingArchiveComments} more comments`
                    : `View ${Math.min(COMMENT_LOAD_BATCH_SIZE, remainingArchiveComments)} more · ${remainingArchiveComments} remaining`}
                </button>
              ) : (
                <div className="border-t border-slate-800/50 py-2 text-center text-[10px] font-mono text-slate-600" id="vt-comments-complete">
                  All archived comments loaded
                </div>
              )}

              {/* The second required lead stays at the absolute bottom of the
                  discussion, beneath every optional archive batch. */}
              <button
                type="button"
                className="group w-full rounded border border-cyan-950 bg-slate-950 p-2.5 text-left transition-all hover:border-cyan-600/70 hover:bg-slate-900"
                id="vt-ipa-evidence"
                data-evidence-collected={progress.discoveredLegacyIpa}
                onClick={() => collectChapterOneEvidence('legacy-ipa')}
              >
                <span className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
                  <span className="font-bold text-blue-400">WaybackLover · 10y ago</span>
                  {progress.discoveredLegacyIpa && (
                    <span className="text-[8px] text-emerald-400">COLLECTED</span>
                  )}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-slate-200">
                  The old original IPA is still indexed on Internet Archive:
                  {' '}
                  <span className="font-mono font-bold text-cyan-400 underline decoration-cyan-500/70 underline-offset-2">
                    Skyline256_LAOS_Final.ipa
                  </span>
                </span>
              </button>
            </div>

          </div>
        )}
      </div>

      {isPlayingVideo && replayFullscreenOpen && typeof document !== 'undefined'
        ? (() => {
            const phoneSurface = document.getElementById('phone-bezel');
            return phoneSurface ? createPortal(renderReplayPlayer(true), phoneSurface) : null;
          })()
        : null}

      {/* Embedded CSS for the Gate 40 comment flood. Text deliberately has no
          pill, panel, or grey mask: the unreadability is the narrative beat. */}
      <style>{`
        @keyframes danmaku-run {
          0% { opacity: 0; transform: translateX(680px); }
          5% { opacity: 1; }
          94% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-115%); }
        }
        @keyframes danmaku-hold {
          0% { opacity: 0; transform: translateX(-50%) scale(0.82); }
          12% { opacity: 1; transform: translateX(-50%) scale(1); }
          82% { opacity: 1; transform: translateX(-50%) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) scale(1.04); }
        }
      `}</style>
    </div>
  );
};
