import React, { useEffect, useRef, useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction, completePuzzleChapter } from '../lib/chapterProgress';
import { ChapterTwoArchiveFinder } from './ChapterTwoArchiveFinder';
import { BrowserPortalNoise } from './BrowserPortalNoise';
import { useMetaInteraction } from './MetaInteractionScene';
import {
  CHAPTER_TWO_DIALOGUE,
  getChapterTwoPortalDistractionDialogue,
  getChapterTwoSearchResponse,
  type ChapterTwoPortalDistraction,
} from '../lib/chapterTwoDialogue';
import {
  CHAPTER_FIVE_DIALOGUE,
  getChapterFiveArchiveDetailDialogue,
  getChapterFiveBotDialogue,
  getChapterFiveCorporateDetailDialogue,
  getChapterFiveDecoyDialogue,
  getChapterFiveDeadFragmentDialogue,
  getChapterFiveEmptyYearDialogue,
  getChapterFiveOffTopicDialogue,
  getChapterFivePortalDialogue,
  getChapterFiveRepeatedTraceDialogue,
  getChapterFiveTraceDialogue,
  type ChapterFiveBotTopic,
  type ChapterFiveArchiveDetailId,
  type ChapterFiveCorporateDetailId,
  type ChapterFiveDecoyResultId,
  type ChapterFiveNoahTraceId,
  type ChapterFiveSearchResultId,
} from '../lib/chapterFiveDialogue';
import { Search, RotateCcw, Clock, Download, ArrowRight, ShieldCheck, HeartCrack, Bot } from 'lucide-react';

// SearchFinder disambiguation for "SKG" (puzzle 5). Seven decoys plus one real
// bridge — the real one sits at index 4 and quietly dates itself to a games
// studio, nudging the player toward the 2014 archive. Pure texture; nothing
// here advances a puzzle. See docs/CONTENT_EXPANSION_HANDOFF.md §4.2.
const SEARCHFINDER_RESULTS: readonly { id: ChapterFiveSearchResultId; title: string; url: string; blurb: string; bridge?: boolean }[] = [
  { id: 'smart-kitchen', title: 'Smart Kitchen Group — Connected Cookware & Recipes', url: 'smartkitchengroup.example · Sponsored', blurb: 'Your fridge, but it has opinions. Subscribe to your own groceries.' },
  { id: 'secure-key', title: 'Secure Key Gateway (SKG) — Enterprise Auth Middleware', url: 'docs.securekeygateway.example', blurb: 'API reference for SKG token rotation. Last updated 3 years ago.' },
  { id: 'knowledge-grid', title: 'Skyline Knowledge Grid — B2B Data Orchestration', url: 'skg-grid.example', blurb: 'Synergize your unstructured data lakes into actionable outcome…' },
  { id: 'kinetic-goods', title: 'Sustainable Kinetic Goods — Ethical Motion Products', url: 'skg.eco', blurb: 'We make things that move, responsibly. Carbon-neutral since last Tuesday.' },
  { id: 'skg-automation', title: 'SKG Automation — Legacy Asset Monetization', url: 'skg-automation.com', blurb: 'Formerly a games studio (2009–2014). Now 1.2M+ apps under automated management.', bridge: true },
  { id: 'slang', title: '"skg" in Slang Dictionary — 4 conflicting definitions', url: 'urbanslang.example/skg', blurb: 'Nobody agrees. Three of them are just typos.' },
  { id: 'airport', title: 'SKG Regional Airport — Departures & Arrivals', url: 'fly-skg.example', blurb: 'Live board. Two gates. One perpetually delayed.' },
  { id: 'mirror', title: 'Index of /pub/mirrors/skg.tar.gz', url: 'ftp.oldmirror.example', blurb: 'Directory listing · 1 file · permission denied' },
] as const;

// Off-topic filler results: whatever the player searches for that has
// nothing to do with SKG lands here instead of the disambiguation list, so
// the SKG bridge stays hidden unless the search term is actually relevant.
const OFFTOPIC_RESULTS: readonly { title: string; url: string; blurb: string }[] = [
  { title: 'Best Productivity Apps for 2026 — Ranked', url: 'techlist.example', blurb: '17 apps that will change absolutely nothing about how you work.' },
  { title: 'Weather Today — Local Forecast', url: 'weathernow.example', blurb: 'Mostly cloudy with a chance of push notifications.' },
  { title: 'Deals Near You — Sponsored', url: 'dealzone.example · Sponsored', blurb: 'Prices so low we had to automate the apology emails.' },
  { title: 'Is My Smart Fridge Judging Me? — Forum Thread', url: 'community.example/t/48213', blurb: '212 replies · last reply 3 hours ago' },
] as const;

const isSkgRelated = (query: string) => query.includes('skg') || query.includes('silver') || query.includes('kite');

// Decorative trending chips keep SearchFinder lived-in. Chapter 2 replaces one
// chip with a quiet archive lead; it is not a task card or a different layout.
const BROWSER_LANDING_TRENDING: readonly string[] = [
  'why did my fridge unsubscribe me',
  'is a recalled device still technically mine',
  'class action status: battery heating',
  'how to tell if a memory is real',
] as const;

// The unstaffed support bot's canned replies (puzzle 4–5). Every path is a
// dead end; the point is to let the player feel that nobody is home in 2026.
const ARC_BOT_REPLIES = {
  ownership: 'Ownership is a legacy concept. All catalog assets are managed programmatically for maximum monetization efficiency. Your sentiment has been logged. Ticket #AUTO-7731 — status: resolved.',
  creator: 'Creator metadata was not retained during asset onboarding. No personnel records are available. Would you like a procedurally generated portrait instead? [ Y ] [ also Y ]',
  restore: 'Downgrades reduce lifetime ad exposure and are not supported. Have you considered upgrading your expectations instead?',
  freeform: "I've escalated this to a human specialist. (No human specialists are currently, or ever, scheduled.) Your request has been archived. It will be processed never.",
} as const;

const NOAH_TRACE_IDS = ['studio-credit', 'developer-note', 'cofounder-credit'] as const;

interface BrowserAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

export const BrowserApp: React.FC<BrowserAppProps> = ({ progress, updateProgress }) => {
  const metaInteraction = useMetaInteraction();
  // No search performed yet: the app opens on a SearchFinder-branded home
  // page, not the SKG Automation destination. The player must type and
  // submit "SKG" themselves before the disambiguation results ever appear.
  const [addressBar, setAddressBar] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [scrubYear, setScrubYear] = useState(2026);
  const [searchedKeyword, setSearchedKeyword] = useState<string | null>(null);
  // True only once the player has clicked through the disambiguation list
  // to the real bridge result — decoupled from searchedKeyword so typing the
  // literal word "skg" into the search box can't skip the puzzle by
  // accidentally matching the same sentinel.
  const [viewingSkgSite, setViewingSkgSite] = useState(false);
  const [archiveFinderOpen, setArchiveFinderOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const [botReply, setBotReply] = useState('');
  const [botInput, setBotInput] = useState('');
  const [foundNoahTraces, setFoundNoahTraces] = useState<ChapterFiveNoahTraceId[]>(
    progress.discoveredSKGHistory ? [...NOAH_TRACE_IDS] : [],
  );
  const chapterTwoSearchAttempt = useRef(0);
  const portalDistractionAttempt = useRef(0);
  const chapterFiveSearchAttempt = useRef(0);
  const chapterFiveOffTopicAttempt = useRef(0);
  const chapterFivePortalAttempt = useRef(0);
  const chapterFiveEmptyYearAttempt = useRef(0);
  const chapterFiveDecoyAttempts = useRef<Record<ChapterFiveDecoyResultId, number>>({
    'smart-kitchen': 0,
    'secure-key': 0,
    'knowledge-grid': 0,
    'kinetic-goods': 0,
    slang: 0,
    airport: 0,
    mirror: 0,
  });
  const chapterFiveTraceRepeatAttempts = useRef<Record<ChapterFiveNoahTraceId, number>>({
    'studio-credit': 0,
    'developer-note': 0,
    'cofounder-credit': 0,
  });
  const chapterFiveCorporateAttempts = useRef<Record<ChapterFiveCorporateDetailId, number>>({
    stats: 0,
    leadership: 0,
    footer: 0,
  });
  const chapterFiveArchiveAttempts = useRef<Record<ChapterFiveArchiveDetailId, number>>({
    'lumen-arc': 0,
    'why-256': 0,
    'hidden-route': 0,
    recall: 0,
    'guestbook-warning': 0,
  });
  const chapterFiveDeadFragmentAttempt = useRef(0);
  const chapterFiveSearchFocused = useRef(false);
  const chapterFiveCorporateSpoken = useRef(false);
  const chapterFiveSnapshotSpoken = useRef(false);
  const chapterFiveCompletedHere = useRef(false);
  const chapterFiveRevisitSpoken = useRef(false);
  const landingDialogueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterFiveCorporateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (landingDialogueTimer.current) clearTimeout(landingDialogueTimer.current);
    if (chapterFiveCorporateTimer.current) clearTimeout(chapterFiveCorporateTimer.current);
  }, []);

  useEffect(() => {
    if ((progress.currentChapter !== 2 && progress.currentChapter !== 5) || !metaInteraction.active || searchedKeyword !== null || archiveFinderOpen) return;
    landingDialogueTimer.current = setTimeout(() => {
      metaInteraction.speak(
        progress.currentChapter === 2
          ? CHAPTER_TWO_DIALOGUE.searchFinderVisible
          : CHAPTER_FIVE_DIALOGUE.searchFinderVisible,
      );
      landingDialogueTimer.current = null;
    }, 650);
    return () => {
      if (landingDialogueTimer.current) clearTimeout(landingDialogueTimer.current);
      landingDialogueTimer.current = null;
    };
  }, [archiveFinderOpen, metaInteraction.active, metaInteraction.speak, progress.currentChapter, searchedKeyword]);

  useEffect(() => {
    if (progress.discoveredSKGHistory) setFoundNoahTraces([...NOAH_TRACE_IDS]);
    else if (progress.currentChapter === 5) setFoundNoahTraces([]);
  }, [progress.currentChapter, progress.discoveredSKGHistory]);

  useEffect(() => {
    if (progress.currentChapter !== 5) return;
    chapterFiveCompletedHere.current = false;
    chapterFiveRevisitSpoken.current = false;
  }, [progress.currentChapter]);

  useEffect(() => {
    if (
      progress.currentChapter !== 6
      || !progress.discoveredSKGHistory
      || !metaInteraction.active
      || !viewingSkgSite
      || selectedYear !== 2014
      || chapterFiveCompletedHere.current
      || chapterFiveRevisitSpoken.current
    ) return;
    chapterFiveRevisitSpoken.current = true;
    metaInteraction.speak(CHAPTER_FIVE_DIALOGUE.completedRevisit);
  }, [metaInteraction.active, metaInteraction.speak, progress.currentChapter, progress.discoveredSKGHistory, selectedYear, viewingSkgSite]);

  const speakChapterTwo = (lines: readonly string[]) => {
    if (progress.currentChapter === 2 && metaInteraction.active) metaInteraction.speak(lines);
  };

  const speakChapterFive = (lines: readonly string[]) => {
    if (progress.currentChapter === 5 && metaInteraction.active && lines.length > 0) metaInteraction.speak(lines);
  };

  const handlePortalDistraction = (kind: ChapterTwoPortalDistraction, elementId: string) => {
    metaInteraction.tapElement(elementId, () => {
      audio.play('ui.disabled');
      if (progress.currentChapter === 2) {
        speakChapterTwo(getChapterTwoPortalDistractionDialogue(kind, portalDistractionAttempt.current));
        portalDistractionAttempt.current += 1;
      } else if (progress.currentChapter === 5) {
        speakChapterFive(getChapterFivePortalDialogue(chapterFivePortalAttempt.current));
        chapterFivePortalAttempt.current += 1;
      }
    });
  };

  const openSkgResult = () => {
    audio.playTick();
    setViewingSkgSite(true);
    setSearchedKeyword('skg');
    setSelectedYear(2026);
    setScrubYear(2026);
    setAddressBar('http://www.skg-automation.com');
    speakChapterFive(CHAPTER_FIVE_DIALOGUE.bridgeOpened);
    if (progress.currentChapter === 5 && metaInteraction.active && !chapterFiveCorporateSpoken.current) {
      chapterFiveCorporateSpoken.current = true;
      if (chapterFiveCorporateTimer.current) clearTimeout(chapterFiveCorporateTimer.current);
      chapterFiveCorporateTimer.current = setTimeout(() => {
        metaInteraction.speak(CHAPTER_FIVE_DIALOGUE.corporateVisible);
        chapterFiveCorporateTimer.current = null;
      }, 1700);
    }
  };

  const openArchiveFinder = () => {
    audio.playTick();
    setViewingSkgSite(false);
    setSearchedKeyword(null);
    setArchiveFinderOpen(true);
    setAddressBar('archivefinder://legacy-game-packages');
    speakChapterTwo(CHAPTER_TWO_DIALOGUE.archiveLeadSelected);
  };

  const askBot = (reply: string, topic: ChapterFiveBotTopic) => {
    audio.play('ui.disabled');
    setBotReply(reply);
    speakChapterFive(getChapterFiveBotDialogue(topic));
  };

  const submitBotFreeform = (e: React.FormEvent) => {
    e.preventDefault();
    audio.play('ui.disabled');
    setBotReply(ARC_BOT_REPLIES.freeform);
    setBotInput('');
    speakChapterFive(getChapterFiveBotDialogue('freeform'));
  };

  const handleChapterFiveSearchFocus = () => {
    if (chapterFiveSearchFocused.current) return;
    chapterFiveSearchFocused.current = true;
    speakChapterFive(CHAPTER_FIVE_DIALOGUE.searchFocused);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = addressBar.toLowerCase().trim();
    if (progress.currentChapter === 2 && metaInteraction.active) {
      metaInteraction.speak(getChapterTwoSearchResponse(addressBar, chapterTwoSearchAttempt.current).lines);
      chapterTwoSearchAttempt.current += 1;
    }
    if (!query) return;
    if (progress.currentChapter === 5 && metaInteraction.active) {
      if (isSkgRelated(query)) {
        if (chapterFiveSearchAttempt.current === 0) speakChapterFive(CHAPTER_FIVE_DIALOGUE.relatedSearch);
        chapterFiveSearchAttempt.current += 1;
      } else {
        speakChapterFive(getChapterFiveOffTopicDialogue(chapterFiveOffTopicAttempt.current));
        chapterFiveOffTopicAttempt.current += 1;
      }
    }
    if (isSkgRelated(query) && !canUseProgressionAction('browser-skg-history', progress)) {
      audio.play('search.noResult');
      setViewingSkgSite(false);
      setArchiveFinderOpen(false);
      setSearchedKeyword('skg-locked');
      return;
    }
    // Every submitted query lands on the SearchFinder results page, "SKG"
    // included — there is no shortcut. Reaching SKG Automation always means
    // spotting and clicking the bridge result below.
    audio.playTick();
    setViewingSkgSite(false);
    setArchiveFinderOpen(false);
    setSearchedKeyword(query);
    setSelectedYear(2026);
    setScrubYear(2026);
    setAddressBar(`https://www.searchfinder.com?q=${encodeURIComponent(query)}`);
  };

  const handleYearChange = (year: number) => {
    // An old drive seeking to another year (§4.7).
    audio.play('archive.yearSwitch');
    if (chapterFiveCorporateTimer.current) {
      clearTimeout(chapterFiveCorporateTimer.current);
      chapterFiveCorporateTimer.current = null;
    }
    setSelectedYear(year);
    if (viewingSkgSite) {
      setAddressBar(year === 2026 ? 'http://www.skg-automation.com' : 'http://web.archive.org/web/2014/silverkitegames.com');
    }
    if (year === 2014) speakChapterFive(CHAPTER_FIVE_DIALOGUE.archiveLoaded);
  };

  const handleSnapshotInteraction = () => {
    if (chapterFiveSnapshotSpoken.current) return;
    chapterFiveSnapshotSpoken.current = true;
    speakChapterFive(CHAPTER_FIVE_DIALOGUE.snapshotNoticed);
  };

  // The reel begins in 2026. The preserved 2014 capture is the only old page;
  // every other year deliberately lands on an empty archive response.
  const handleScrub = (year: number) => {
    setScrubYear(year);
    if (year === selectedYear) return;
    if (year === 2014 || year === 2026) {
      handleYearChange(year);
    } else {
      audio.play('leaderboard.rowPass');
      setSelectedYear(year);
      setAddressBar(`http://web.archive.org/web/${year}/silverkitegames.com`);
      speakChapterFive(getChapterFiveEmptyYearDialogue(year, chapterFiveEmptyYearAttempt.current));
      chapterFiveEmptyYearAttempt.current += 1;
    }
  };

  const handleChapterFiveDecoy = (resultId: ChapterFiveDecoyResultId) => {
    audio.play('ui.disabled');
    const attempt = chapterFiveDecoyAttempts.current[resultId];
    speakChapterFive(getChapterFiveDecoyDialogue(resultId, attempt));
    chapterFiveDecoyAttempts.current[resultId] = attempt + 1;
  };

  const handleChapterFiveCorporateDetail = (detailId: ChapterFiveCorporateDetailId) => {
    audio.playTick();
    const attempt = chapterFiveCorporateAttempts.current[detailId];
    speakChapterFive(getChapterFiveCorporateDetailDialogue(detailId, attempt));
    chapterFiveCorporateAttempts.current[detailId] = attempt + 1;
  };

  const handleChapterFiveArchiveDetail = (detailId: ChapterFiveArchiveDetailId) => {
    audio.playTick();
    const attempt = chapterFiveArchiveAttempts.current[detailId];
    speakChapterFive(getChapterFiveArchiveDetailDialogue(detailId, attempt));
    chapterFiveArchiveAttempts.current[detailId] = attempt + 1;
  };

  const handleChapterFiveDeadFragment = () => {
    audio.play('ui.disabled');
    speakChapterFive(getChapterFiveDeadFragmentDialogue(chapterFiveDeadFragmentAttempt.current));
    chapterFiveDeadFragmentAttempt.current += 1;
  };

  const handleNoahTrace = (traceId: ChapterFiveNoahTraceId) => {
    if (foundNoahTraces.includes(traceId)) {
      audio.play('ui.disabled');
      const attempt = chapterFiveTraceRepeatAttempts.current[traceId];
      speakChapterFive(getChapterFiveRepeatedTraceDialogue(traceId, attempt));
      chapterFiveTraceRepeatAttempts.current[traceId] = attempt + 1;
      return;
    }
    audio.playTick();
    const next = [...foundNoahTraces, traceId];
    setFoundNoahTraces(next);
    if (next.length === NOAH_TRACE_IDS.length) {
      chapterFiveCompletedHere.current = true;
      speakChapterFive(CHAPTER_FIVE_DIALOGUE.completed);
      updateProgress((prev) => completePuzzleChapter(prev, 5, { discoveredSKGHistory: true }));
    } else {
      speakChapterFive(getChapterFiveTraceDialogue(traceId, next.length - 1));
    }
  };

  const renderNoahTrace = (traceId: ChapterFiveNoahTraceId) => {
    const found = foundNoahTraces.includes(traceId);
    return (
      <button
        type="button"
        onClick={() => handleNoahTrace(traceId)}
        data-meta-immediate="true"
        data-meta-hit-recovery="true"
        className={`inline-flex min-h-6 touch-manipulation items-center px-1 font-bold underline decoration-2 underline-offset-2 transition-colors ${
          found
            ? 'bg-[#b8e6ad] text-[#24551d] decoration-[#24551d]'
            : 'bg-[#fff2a8] text-[#0000cc] decoration-[#0000cc] hover:bg-[#ffe56b]'
        }`}
        data-noah-trace={traceId}
        data-noah-found={found ? 'true' : 'false'}
        aria-label={`${found ? 'Recovered' : 'Recover'} Noah Kade reference`}
      >
        Noah Kade{found ? ' ✓' : ''}
      </button>
    );
  };

  const handleDownload = () => {
    // Transfer chirp first, then the file settles — both on the audio clock.
    audio.play('archive.downloadStart');
    audio.play('archive.downloadComplete', { delay: 0.5 });
    updateProgress((prev) => completePuzzleChapter(prev, 2, { archiveDownloaded: true }));
  };

  const handleCompatibilityDiscovered = () => {
    updateProgress((prev) => completePuzzleChapter(prev, 2, { archiveDownloaded: true }));
  };

  return (
    <div className="flex flex-col h-full bg-[#101218] text-slate-100 font-sans overflow-hidden" id="browser-root">

      {/* Top chrome: an ordinary modern browser */}
      <div className="bg-[#171a21] p-2.5 border-b border-white/[0.06] space-y-2" id="browser-top-nav">

        {/* The Snapshot reel belongs to the SKG site, not Browser/Wayback itself. */}
        {viewingSkgSite && (
          <div className="space-y-1" id="wayback-slider-box">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Snapshot</span>
            </span>
            <span
              className={`font-mono font-bold tracking-wide ${
                scrubYear === 2014 ? 'text-amber-200' : scrubYear === 2026 ? 'text-white' : 'text-slate-500'
              }`}
              id="wayback-year-label"
            >
              {scrubYear === 2014 ? '2014 · Archive' : scrubYear === 2026 ? '2026 · Current' : `${scrubYear} · no snapshot`}
            </span>
          </div>
          <input
            type="range"
            min={2009}
            max={2026}
            step={1}
            value={scrubYear}
            list="wayback-years"
            onPointerDown={handleSnapshotInteraction}
            onFocus={handleSnapshotInteraction}
            onChange={(e) => handleScrub(Number(e.target.value))}
            className="w-full h-1.5 appearance-none rounded-full cursor-pointer bg-gradient-to-r from-amber-800/40 via-white/[0.08] to-white/[0.08] accent-amber-300
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-amber-200 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:shadow-black/40 [&::-webkit-slider-thumb]:cursor-grab
              [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-200 [&::-moz-range-thumb]:border-0"
            id="wayback-scrubber"
            aria-label="Drag the reel to an archived year"
          />
          <datalist id="wayback-years">
            {Array.from({ length: 18 }, (_, i) => 2009 + i).map((y) => (
              <option key={y} value={y} />
            ))}
          </datalist>
          </div>
        )}

        {/* Address pill */}
        <div className="flex items-center gap-1.5" id="url-search-form">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={addressBar}
              onChange={(e) => setAddressBar(e.target.value)}
              onFocus={handleChapterFiveSearchFocus}
              placeholder="Search the web or an archived address…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full bg-[#0d0f14] text-xs text-slate-300 px-3.5 py-1.5 pr-8 rounded-full border border-white/[0.07] focus:outline-none focus:border-white/20"
              id="browser-address-input"
            />
            <button
              type="button"
              onClick={() => { audio.playTick(); setAddressBar(''); setSearchedKeyword(null); setViewingSkgSite(false); setArchiveFinderOpen(false); setSelectedYear(2026); setScrubYear(2026); }}
              className="absolute right-2.5 text-slate-500 hover:text-white"
              id="url-reset"
              aria-label="Return to browser home"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Browser Content area */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#0d0f14] font-sans" id="browser-viewport">
        {archiveFinderOpen ? (
          <div className="grid min-h-full grid-cols-[minmax(112px,0.72fr)_minmax(300px,1.7fr)_minmax(112px,0.72fr)] items-start gap-3" id="archive-portal-layout">
            <BrowserPortalNoise surface="archive" side="left" onDistraction={handlePortalDistraction} />
            <ChapterTwoArchiveFinder
              attempted={progress.archiveDownloaded}
              dialogueActive={progress.currentChapter === 2}
              onCompatibilityDiscovered={handleCompatibilityDiscovered}
            />
            <BrowserPortalNoise surface="archive" side="right" onDistraction={handlePortalDistraction} />
          </div>
        ) : searchedKeyword === null ? (
          /* Browser home: a SearchFinder-branded landing page. Nothing here
             names SKG — the player has to type and search it themselves. */
          <div className="grid min-h-full grid-cols-[minmax(112px,0.72fr)_minmax(300px,1.7fr)_minmax(112px,0.72fr)] items-start gap-3 pb-4" id="browser-landing">
            <BrowserPortalNoise surface="search" side="left" onDistraction={handlePortalDistraction} />
            <main className="space-y-3" id="searchfinder-main-column">
              <header className="overflow-hidden rounded-lg border border-blue-400/10 bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-950/70 px-5 py-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-black tracking-tight">
                  <span className="text-blue-400">Search</span><span className="text-slate-300">Finder</span>
                </div>
                <p className="mt-1.5 text-[9px] text-slate-500">The web, exactly as advertisers want you to see it.</p>
                <div className="mx-auto mt-4 flex max-w-[330px] items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 text-left text-[8px] text-slate-600">
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">Search from the address bar above</span>
                  <span className="font-mono text-[6px] text-slate-700">PRIVATE MODE: OFF</span>
                </div>
              </header>

              <section className="rounded-md border border-white/[0.07] bg-slate-900/30 p-3" id="browser-landing-trending">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500">Trending Today</h2>
                  <span className="font-mono text-[6px] text-slate-700">personalized for this device</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(progress.currentChapter === 2
                    ? [...BROWSER_LANDING_TRENDING.slice(0, 2), 'I want to find an old game file', BROWSER_LANDING_TRENDING[3]]
                    : BROWSER_LANDING_TRENDING
                  ).map((topic, index) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={topic === 'I want to find an old game file' ? openArchiveFinder : () => handlePortalDistraction('trending', `search-trending-${index}`)}
                      className="flex min-h-10 w-full items-center gap-2 rounded border border-slate-800/70 bg-slate-950/35 px-2.5 py-2 text-left text-[8px] leading-snug text-slate-400 hover:border-slate-700 hover:bg-slate-900/55"
                      id={topic === 'I want to find an old game file' ? 'chapter-two-archive-entry' : `search-trending-${index}`}
                    >
                      <span className="font-mono text-[7px] text-slate-700">0{index + 1}</span><span>{topic}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-[1.15fr_0.85fr] gap-2.5" id="searchfinder-editorial-feed">
                <article className="rounded-md border border-white/[0.07] bg-slate-900/30 p-3">
                  <div className="font-mono text-[6px] uppercase tracking-wider text-blue-300/50">Top story · Technology</div>
                  <h2 className="mt-1.5 text-[11px] font-semibold leading-snug text-slate-200">The internet is getting easier to search and harder to remember</h2>
                  <p className="mt-1.5 text-[8px] leading-relaxed text-slate-500">New recommendation systems promise instant answers while independent pages continue disappearing from public indexes.</p>
                  <div className="mt-2 text-[6px] text-slate-700">6 min read · 1,842 reactions</div>
                </article>
                <div className="space-y-2">
                  <article className="rounded-md border border-white/[0.07] bg-slate-900/30 p-2.5">
                    <div className="text-[6px] uppercase tracking-wider text-slate-600">Quick read</div>
                    <h3 className="mt-1 text-[8px] leading-snug text-slate-300">Subscription fatigue now has a subscription tracker</h3>
                    <p className="mt-1 text-[6px] text-slate-700">Business · 3 min</p>
                  </article>
                  <article className="rounded-md border border-white/[0.07] bg-slate-900/30 p-2.5">
                    <div className="text-[6px] uppercase tracking-wider text-slate-600">Most shared</div>
                    <h3 className="mt-1 text-[8px] leading-snug text-slate-300">Seven household devices that no longer need accounts</h3>
                    <p className="mt-1 text-[6px] text-slate-700">Lifestyle · 8 min</p>
                  </article>
                </div>
              </section>

              <footer className="flex items-center justify-between border-t border-white/[0.05] px-1 pt-2 font-mono text-[6px] text-slate-700">
                <span>About · Privacy · Advertise · Remove result</span><span>SearchFinder Portal 2026.7</span>
              </footer>
            </main>
            <BrowserPortalNoise surface="search" side="right" onDistraction={handlePortalDistraction} />
          </div>
        ) : selectedYear === 2026 ? (
          /* Year 2026: Modern corporate slop */
          viewingSkgSite ? (
            <div className="space-y-4" id="corporate-2026">
              
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-blue-900/40 to-slate-800 p-4 rounded-lg border border-slate-800 space-y-1.5">
                <div className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest uppercase">SKG Automation Corp</div>
                <h2 className="font-display font-black text-base text-white leading-tight">
                  Empowering Tomorrow Through Automated Asset Solutions.
                </h2>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Our system crawls global digital inventory catalog domains, repackaging historical brand assets using advanced LLM-guided processes for maximum monetization efficiency.
                </p>
              </div>

              {/* Company statistics block */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <button type="button" onClick={() => handleChapterFiveCorporateDetail('stats')} className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <div className="text-cyan-400 font-black font-mono">1.2M+</div>
                  <div className="text-[9px] text-slate-500">Apps Auto-Replaced</div>
                </button>
                <button type="button" onClick={() => handleChapterFiveCorporateDetail('stats')} className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <div className="text-cyan-400 font-black font-mono">100%</div>
                  <div className="text-[9px] text-slate-500">Unstaffed Humanless Operations</div>
                </button>
              </div>

              {/* Faceless leadership: perfectly uniform, nobody home */}
              <button type="button" onClick={() => handleChapterFiveCorporateDetail('leadership')} className="block w-full bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2 text-left">
                <h3 className="font-display font-bold text-slate-300 text-xs border-b border-slate-800 pb-1">Leadership Matrix</h3>
                <div className="flex items-center justify-around py-1">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-600 rotate-45"></div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-slate-600"></div>
                  </div>
                </div>
                <p className="text-[9px] text-center text-slate-600 font-mono">Portraits generated on request. No personnel records available.</p>
              </button>

              {/* Corporate Services Block */}
              <div className="space-y-2 text-xs" id="corp-services">
                <h3 className="font-display font-bold text-slate-300 text-xs border-b border-slate-800 pb-1">Services Matrix</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  SKG Automation owns and maintains over 14,000 legacy mobile apps. We deploy programmatically optimized micro-transactions and ads over original assets.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    audio.playTick();
                    setBotOpen((open) => {
                      if (!open) speakChapterFive(CHAPTER_FIVE_DIALOGUE.botOpened);
                      return !open;
                    });
                  }}
                  className="w-full bg-blue-950/20 border border-blue-900/40 p-2.5 rounded text-[10px] text-blue-300 flex items-center justify-between hover:bg-blue-950/40"
                  id="skg-bot-trigger"
                >
                  <span>Need legacy app support queries? Contact our unstaffed bot.</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${botOpen ? 'rotate-90' : ''}`} />
                </button>

                {botOpen && (
                  <div className="border border-slate-800 rounded-lg bg-slate-950/70 overflow-hidden" id="skg-bot-portal">
                    <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" /> SKG Automation · Legacy Asset Support Node
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 mt-0.5">
                        STATUS: OPERATIONAL · HUMAN AGENTS: 0 · EST. WAIT: —
                      </div>
                    </div>
                    <div className="p-3 space-y-2.5">
                      <div className="flex gap-2 text-[10px] text-slate-300 leading-snug">
                        <span className="font-mono font-bold text-cyan-400 shrink-0">ARC-BOT ▸</span>
                        <span>{botReply || 'Hello, valued asset stakeholder. I am ARC-BOT, your unstaffed resolution assistant. How may I optimize your inquiry today?'}</span>
                      </div>
                      <div className="grid gap-1.5">
                        <button type="button" onClick={() => askBot(ARC_BOT_REPLIES.ownership, 'ownership')} className="text-left text-[10px] px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700">
                          I want to claim ownership of a legacy app
                        </button>
                        <button type="button" onClick={() => askBot(ARC_BOT_REPLIES.creator, 'creator')} className="text-left text-[10px] px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700">
                          Who created the original Skyline game?
                        </button>
                        <button type="button" onClick={() => askBot(ARC_BOT_REPLIES.restore, 'restore')} className="text-left text-[10px] px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700">
                          Restore the old version of the game
                        </button>
                      </div>
                      <form onSubmit={submitBotFreeform} className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={botInput}
                          onChange={(e) => setBotInput(e.target.value)}
                          placeholder="Describe your issue…"
                          className="flex-1 bg-[#0d0f14] text-[10px] text-slate-300 px-2.5 py-1.5 rounded border border-slate-800 focus:outline-none focus:border-slate-600 placeholder-slate-600"
                          id="skg-bot-input"
                        />
                        <button type="submit" className="px-3 rounded bg-slate-800 text-[10px] font-bold text-slate-300 hover:bg-slate-700">Send</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => handleChapterFiveCorporateDetail('footer')} className="block w-full text-[8px] text-center text-slate-600 font-mono border-t border-slate-900 pt-3">
                Established 2009. Reinvented 2014. No Human Personnel Maintained.
              </button>
            </div>
          ) : (
            <div className="space-y-3" id="browser-generic-result">
              <div className="flex items-center gap-1.5 text-[15px] font-black tracking-tight">
                <span className="text-blue-400">Search</span><span className="text-slate-300">Finder</span>
              </div>
              <div className="text-[9px] font-mono text-slate-500 border-b border-slate-800 pb-2">
                {searchedKeyword === 'skg-locked'
                  ? 'No useful company identifier has been recovered yet.'
                  : `No exact match for "${searchedKeyword}". About 47,300,000 related results (0.38 seconds)`}
              </div>
              <div className="space-y-3">
                {(searchedKeyword !== 'skg-locked' && isSkgRelated(searchedKeyword ?? '') ? SEARCHFINDER_RESULTS : OFFTOPIC_RESULTS).map((result) => (
                  <button
                    key={result.title}
                    type="button"
                    onClick={'bridge' in result && result.bridge
                      ? openSkgResult
                      : 'id' in result
                        ? () => handleChapterFiveDecoy(result.id as ChapterFiveDecoyResultId)
                        : () => audio.play('ui.disabled')}
                    className="block w-full text-left rounded p-2 transition-colors hover:bg-white/[0.03]"
                    id={'id' in result ? `search-result-${result.id}` : undefined}
                  >
                    <div className="text-[11px] leading-tight text-[#8ab4f8] font-medium">{result.title}</div>
                    <div className="text-[9px] font-mono text-emerald-500/80 mt-0.5">{result.url}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{result.blurb}</div>
                  </button>
                ))}
              </div>
              <div className="text-[8px] text-center text-slate-600 font-mono pt-1">
                Results ranked by advertiser priority · Gooooooooogle-adjacent
              </div>
            </div>
          )
        ) : viewingSkgSite && selectedYear !== 2014 ? (
          <div className="flex min-h-full items-center justify-center py-12" id="wayback-no-screenshot">
            <div className="w-full max-w-sm border border-dashed border-slate-700 bg-slate-950/50 px-6 py-10 text-center font-mono">
              <Clock className="mx-auto mb-3 h-7 w-7 text-slate-600" />
              <div className="text-xs font-bold tracking-[0.16em] text-slate-400">NO SCREENSHOT AVAILABLE</div>
              <div className="mt-2 text-[9px] text-slate-600">No capture was preserved for {selectedYear}.</div>
            </div>
          </div>
        ) : (
          /* Year 2014: Original indie developer site (Silver Kite Games) */
          viewingSkgSite ? (
            <div className="space-y-4 web-archive-1998 bg-[#fbf7e8] text-[#1c1c1c] -m-3 p-4" id="indie-2014">

              {/* Wayback toolbar remnant — the preservation frame is part of the story */}
              <div className="bg-[#ececec] border border-[#b5b5b5] text-[9px] font-sans text-[#444]" id="wayback-chrome">
                <div className="px-2 py-1 border-b border-[#cdcdcd] flex items-center justify-between gap-2">
                  <span className="font-bold text-[#333]">⟲ INTERNET ARCHIVE · WAYBACK MACHINE</span>
                  <span className="text-[#777] shrink-0">Saved 4 times · 2013–2014</span>
                </div>
                <div className="px-2 py-1 flex items-center gap-1.5 text-[8px] text-[#0000cc]">
                  <span className="text-[#555]">‹</span>
                  <span className="cursor-default">2013-06-02</span>
                  <span className="cursor-default">2013-11-20</span>
                  <span className="cursor-default">2014-04-02</span>
                  <span className="bg-[#003366] text-white px-1 cursor-default">2014-04-14</span>
                  <span className="text-[#555]">›</span>
                </div>
                <div className="px-2 py-1 border-t border-[#cdcdcd] text-[8px] text-[#666] leading-relaxed">
                  This snapshot may be incomplete. 3 images missing · 1 stylesheet partial · JavaScript disabled in archive view.<br />
                  This page is preserved because someone chose to save it.
                </div>
              </div>

              <div className="border-b-2 border-[#8a835f] pb-2 flex items-center justify-between">
                <div>
                  <h1 className="font-black text-lg text-[#003366]">SILVER KITE GAMES</h1>
                  <p className="text-[10px] text-[#555] italic">Crafting flying experiences that matter</p>
                  <p className="mt-1 text-[9px] font-sans text-[#444]">
                    Studio design &amp; code: {renderNoahTrace('studio-credit')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-[#fff8d0] text-[#7a5c00] px-1.5 py-0.5 border border-[#c9b45a] font-sans">
                    LAOS_PARTNER_MEMBER
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border border-[#c9b45a] bg-[#fff8d0] px-2 py-1 font-sans text-[9px] text-[#6f5a14]" id="noah-trace-progress">
                <span>Recovered name references</span>
                <span className="font-bold">{foundNoahTraces.length} / {NOAH_TRACE_IDS.length}</span>
              </div>

              {/* Old-web nav strip (decorative dead links) */}
              <div className="text-[10px] font-sans space-x-2 text-[#0000cc]">
                <span className="underline cursor-default">Home</span>
                <span className="text-[#888]">|</span>
                <span className="underline cursor-default">Dev Blog</span>
                <span className="text-[#888]">|</span>
                <span className="underline cursor-default">Games</span>
                <span className="text-[#888]">|</span>
                <button type="button" onClick={handleChapterFiveDeadFragment} className="underline line-through text-[#888]">Forum (offline)</button>
              </div>

              {/* Developer Blogs */}
              <div className="space-y-3.5 text-xs" id="indie-blogs">
                <h3 className="font-bold text-xs text-[#003366] uppercase tracking-wider">LATEST BLOG LOGS</h3>

                {/* Blog A — 2013 partnership. Warm, hopeful, before the fall. */}
                <div className="bg-white p-3 border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-sans border-b border-[#ddd] pb-1">
                    <button type="button" onClick={() => handleChapterFiveArchiveDetail('lumen-arc')} className="text-[#0000cc] underline font-bold">Log: We're partnering with Lumen Arc!</button>
                    <span className="text-[#777]">2013-06-02 • Noah Kade</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    Signed the deal today. A handheld that wants to keep you company for a lifetime, not for a fiscal quarter. This is the platform of the future. I actually believe that.
                  </p>
                  <button type="button" onClick={handleChapterFiveDeadFragment} className="flex items-center gap-1.5 border border-[#9aa] bg-[#fdfdfd] px-2 py-3 text-[10px] text-[#556] font-sans w-fit">
                    <span className="inline-block w-3.5 h-3.5 border border-[#9aa] text-[9px] leading-[13px] text-center text-[#c33] shrink-0">✕</span>
                    <span className="italic">launch_party_group_photo.jpg — image not archived</span>
                  </button>
                </div>

                {/* Blog B — 2013 design philosophy. "256 is a promise." */}
                <div className="bg-white p-3 border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-sans border-b border-[#ddd] pb-1">
                    <button type="button" onClick={() => handleChapterFiveArchiveDetail('why-256')} className="text-[#0000cc] underline font-bold">Log: Why 256, and why it ends</button>
                    <span className="text-[#777]">2013-11-20 • SilverKite_Games</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    People keep asking for an infinite mode. I keep saying no. A flight that never lands isn't freedom, it's a treadmill. 256 gates, then you're done. That number isn't a limit. It's a promise I intend to keep.
                  </p>
                </div>

                {/* Blog C — 2014 completion build (original) */}
                <div className="bg-white p-3 border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-sans border-b border-[#ddd] pb-1">
                    <span className="text-[#0000cc] underline font-bold">Log: Skyline 256 Completion Build</span>
                    <span className="text-[#777]">2014-03-08 • SilverKite_Games</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    Skyline 256 isn't an infinite game. I've received a lot of criticism about this. Elias says infinite modes increase monetization loop duration. But I believe every flight deserves a touchdown.
                  </p>
                  <p className="text-[10px] font-sans text-[#444]">
                    Completion build maintained by {renderNoahTrace('developer-note')}.
                  </p>
                  {/* Broken image placeholder — asset never archived */}
                  <button type="button" onClick={handleChapterFiveDeadFragment} className="flex items-center gap-1.5 border border-[#9aa] bg-[#fdfdfd] px-2 py-3 text-[10px] text-[#556] font-sans w-fit">
                    <span className="inline-block w-3.5 h-3.5 border border-[#9aa] text-[9px] leading-[13px] text-center text-[#c33] shrink-0">✕</span>
                    <span className="italic">nk_altitude_final_184.gif — image not archived</span>
                  </button>
                  <p className="text-[11px] leading-relaxed font-bold text-[#7a2e00]">
                    Once you cross the 40th pipe section, you enter our calibrated flight channel. Successfully navigate all 256 gates, and the simulation terminates correctly, writing your complete flag.
                  </p>
                </div>

                {/* Blog D — 2014 hidden-route foreshadow. Non-actionable: no numbers, no mechanism. */}
                <div className="bg-white p-3 border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-sans border-b border-[#ddd] pb-1">
                    <button type="button" onClick={() => handleChapterFiveArchiveDetail('hidden-route')} className="text-[#0000cc] underline font-bold">Log: I left something in the last build</button>
                    <span className="text-[#777]">2014-04-02 • SilverKite_Games</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    I'm not going to explain it here. If you ever read the source the way it was meant to be read, you'll already know where to look. Some doors only open for the person patient enough to stop pushing.
                  </p>
                  <button type="button" onClick={handleChapterFiveDeadFragment} className="flex items-center gap-1.5 border border-[#9aa] bg-[#fdfdfd] px-2 py-3 text-[10px] text-[#556] font-sans w-fit">
                    <span className="inline-block w-3.5 h-3.5 border border-[#9aa] text-[9px] leading-[13px] text-center text-[#c33] shrink-0">✕</span>
                    <span className="italic">family_2014_do_not_publish.jpg — image not archived</span>
                  </button>
                </div>

                {/* Blog E — 2014 recall (original) */}
                <div className="bg-white p-3 border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-sans border-b border-[#ddd] pb-1">
                    <button type="button" onClick={() => handleChapterFiveArchiveDetail('recall')} className="text-[#aa2222] underline font-bold flex items-center gap-1">
                      <HeartCrack className="w-3.5 h-3.5" /> Log: The Recall Decision
                    </button>
                    <span className="text-[#777]">2014-04-14 • SilverKite_Games</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    It's official. Government authorities are recalling all Lumen Arc devices due to battery heating issues. It feels like a commercial setup by the larger mobile brands.
                  </p>
                  {/* Broken image placeholder — asset never archived */}
                  <button type="button" onClick={handleChapterFiveDeadFragment} className="flex items-center gap-1.5 border border-[#9aa] bg-[#fdfdfd] px-2 py-3 text-[10px] text-[#556] font-sans w-fit">
                    <span className="inline-block w-3.5 h-3.5 border border-[#9aa] text-[9px] leading-[13px] text-center text-[#c33] shrink-0">✕</span>
                    <span className="italic">recall_notice_scan.jpg — image not archived</span>
                  </button>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    Our database server for leaderboards is shutting down. Elias is already restructuring our organization to "SKG Automation" to execute AI web scrapping and monetize our catalog. I'm completely devastated.
                  </p>
                </div>
              </div>

              {/* Guestbook remnant — a crowd from 2014, mostly recovered as fragments */}
              <div className="bg-white border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] p-3 space-y-1.5" id="indie-guestbook">
                <h3 className="font-bold text-[10px] text-[#003366] uppercase tracking-wider border-b border-[#ddd] pb-1">
                  Guestbook · 6 of 214 entries recovered
                </h3>
                <div className="space-y-1 text-[10px] text-[#333] font-sans leading-relaxed">
                  <div><span className="text-[#0000cc] font-bold">xX_skydiver_Xx</span> <span className="text-[#999]">(2013)</span> — "finished all 256 last night. cried a little. thank you."</div>
                  <div><span className="text-[#0000cc] font-bold">m_k</span> <span className="text-[#999]">(2014)</span> — "proud of you. always."</div>
                  <div><span className="text-[#0000cc] font-bold">guest_00417</span> <span className="text-[#999]">(2014)</span> — "wait it ENDS?? games can do that??"</div>
                  <button type="button" onClick={() => handleChapterFiveArchiveDetail('guestbook-warning')} className="block text-left text-[#999] italic">[entry corrupted] — "▓▓▓▓ below zero ▓▓▓▓ don't submit it"</button>
                  <div><span className="text-[#0000cc] font-bold">silverkite_admin</span> <span className="text-[#999]">(2014)</span> — "forum going read-only. servers won't last the year."</div>
                  <div className="text-[#999] italic">[entry expired] — message no longer available</div>
                </div>
              </div>

              {/* Wayback / Download Section */}
              <div className="bg-[#f4eeda] border-2 border-[#8a835f] p-3 space-y-2 text-xs" id="browser-archive-box">
                <h4 className="font-bold text-[#5c4a00] flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>PRESERVED APPLICATION SOURCE</span>
                </h4>
                <p className="text-[10px] text-[#333]">
                  The final original build of Skyline 256 compiled for LAOS.
                </p>

                {progress.archiveDownloaded ? (
                  <div className="flex items-center gap-2 text-[#0a7a3c] font-bold py-1 text-[11px] font-sans" id="download-success">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Skyline256_LAOS_Final.ipa DOWNLOADED SUCCESSFULLY</span>
                  </div>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="w-full py-2 bg-gradient-to-b from-[#fdfaf0] to-[#d9d2b0] hover:from-white hover:to-[#e5dfc0] text-[#333] font-bold border-2 border-[#8a835f] shadow-[2px_2px_0_#b8b28c] text-xs font-sans active:translate-y-px transition-all flex items-center justify-center gap-1"
                    id="download-ipa-button"
                  >
                    Download Skyline256_LAOS_Final.ipa
                  </button>
                )}
              </div>

              {/* Old-web footer: visitor counter and a bounced webmaster address */}
              <div className="text-center text-[10px] font-sans text-[#555] space-y-1 border-t border-[#c8c2a0] pt-2">
                <div>Co-founder &amp; lead designer: {renderNoahTrace('cofounder-credit')}</div>
                <div>
                  You are visitor <span className="bg-black text-[#33ff33] font-mono px-1 tracking-[0.2em]">0018437</span> since 2009
                </div>
                <div className="italic">Last updated 2014-04-14 · webmaster@silverkite.example (mail bounced)</div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs" id="browser-generic-result-past">
              <span>Generic Search Results for "{searchedKeyword}". No historical snapshot entries found. Try searching for "SKG".</span>
            </div>
          )
        )}
      </div>

    </div>
  );
};
