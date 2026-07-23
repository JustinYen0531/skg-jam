import React, { useEffect, useRef, useState } from 'react';
import { Crown, RefreshCw, Sparkles, Trophy, X } from 'lucide-react';
import { motion } from 'motion/react';
import audio from '../lib/audio';
import { isSuspiciousLeaderboardEntry, type PublicLeaderboardEntry } from '../lib/leaderboard';

interface LeaderboardPanelProps {
  entries: PublicLeaderboardEntry[];
  playerBestScore: number;
  beatPercentage: number;
  onRetry: () => void;
  onClose: () => void;
  suspiciousRunsEnabled: boolean;
  onSuspiciousRunSelected: () => void;
}

const rankLabel = (rank: number) => `#${String(rank).padStart(2, '0')}`;

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  entries,
  playerBestScore,
  beatPercentage,
  onRetry,
  onClose,
  suspiciousRunsEnabled,
  onSuspiciousRunSelected,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const mountedAtRef = useRef(0);
  const seenRowsRef = useRef(new Set<string>());
  const lastPercentRef = useRef(beatPercentage);
  const [selectedRun, setSelectedRun] = useState<PublicLeaderboardEntry | null>(null);
  const [showTitleIntro, setShowTitleIntro] = useState(false);

  useEffect(() => {
    if (!showTitleIntro) return;
    const timer = window.setTimeout(onSuspiciousRunSelected, 2200);
    return () => window.clearTimeout(timer);
  }, [showTitleIntro, onSuspiciousRunSelected]);

  // §4.2 rowPass: only your own row and story rows announce themselves as
  // they scroll into view; the anonymous filler stays silent.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    mountedAtRef.current = performance.now();
    const rows = list.querySelectorAll(
      '[data-entry-kind="player"], [data-entry-kind="featured"], [data-entry-kind="named"]',
    );
    const observer = new IntersectionObserver((intersections) => {
      intersections.forEach((intersection) => {
        if (!intersection.isIntersecting) return;
        const key = intersection.target.getAttribute('data-row-key') ?? '';
        if (seenRowsRef.current.has(key)) return;
        seenRowsRef.current.add(key);
        // Rows already visible when the panel opens were not "passed".
        if (performance.now() - mountedAtRef.current < 400) return;
        audio.play('leaderboard.rowPass');
      });
    }, { root: list, threshold: 0.6 });
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [entries]);

  // §4.2 percent: the fake stat only dings when it actually changes while
  // the panel is open; the engine adds its own cooldown on top.
  useEffect(() => {
    if (lastPercentRef.current !== beatPercentage) {
      lastPercentRef.current = beatPercentage;
      audio.play('leaderboard.percent');
    }
  }, [beatPercentage]);

  return (
  <div
    className="absolute inset-0 z-30 overflow-hidden bg-[#070511] text-slate-100 flex flex-col font-sans"
    id="leaderboard-panel"
  >
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.24),transparent_38%),radial-gradient(circle_at_90%_25%,rgba(34,211,238,0.16),transparent_32%)]"></div>

    <header className="relative shrink-0 px-3 py-2 border-b border-fuchsia-500/25 bg-black/25 backdrop-blur-md flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-600 to-cyan-400 flex items-center justify-center shadow-[0_0_18px_rgba(139,92,246,0.65)]">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black tracking-tight truncate">GLOBAL NEURAL RANKING</div>
          <div className="text-[8px] font-mono tracking-[0.18em] text-cyan-300">AI-VERIFIED FLIGHT EXCELLENCE</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRetry}
          className="min-h-8 px-2.5 rounded-xl border border-violet-400/35 bg-violet-500/15 text-[9px] font-black text-violet-100 flex items-center gap-1 hover:bg-violet-500/25"
          id="retry-button"
        >
          <RefreshCw className="w-3 h-3" /> RETRY
        </button>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-slate-400 flex items-center justify-center hover:text-white hover:bg-white/10"
          title="Close leaderboard"
          id="leaderboard-close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>

    <div className="relative shrink-0 grid grid-cols-3 gap-1.5 px-3 py-2">
      <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-2 py-1.5">
        <div className="text-[7px] font-black tracking-widest text-cyan-300">YOUR BEST</div>
        <div className="text-xl font-black leading-none mt-0.5 text-white">{playerBestScore}</div>
      </div>
      <div className="rounded-[18px] border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1.5">
        <div className="text-[7px] font-black tracking-widest text-fuchsia-300">PLAYERS BEATEN</div>
        <div className="text-xl font-black leading-none mt-0.5 text-white">{beatPercentage}<span className="text-xs text-fuchsia-300">%</span></div>
      </div>
      <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-2 py-1.5">
        <div className="text-[7px] font-black tracking-widest text-amber-300">TOP SCORE</div>
        <div className="text-xl font-black leading-none mt-0.5 text-white">184</div>
      </div>
    </div>

    <div className="relative mx-3 flex-1 min-h-0 rounded-xl border border-white/10 bg-black/30 overflow-hidden flex flex-col shadow-[0_0_30px_rgba(76,29,149,0.18)]">
      <div className="shrink-0 grid grid-cols-[44px_1fr_58px] items-center px-2.5 py-1.5 text-[8px] font-black tracking-widest text-slate-500 border-b border-white/10 bg-white/[0.03]">
        <span>RANK</span><span>FLYER ID</span><span className="text-right">SCORE</span>
      </div>
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain" id="leaderboard-scroll-list">
        {entries.map((entry) => {
          const isPlayer = entry.kind === 'player';
          const isFeatured = entry.kind === 'featured';
          const isNamed = entry.kind === 'named';
          const isSuspicious = suspiciousRunsEnabled && isSuspiciousLeaderboardEntry(entry);
          const rowClassName = `relative grid grid-cols-[44px_1fr_58px] items-center min-h-9 w-full px-2.5 py-1.5 border-b text-[10px] ${
            isPlayer
              ? 'sticky top-0 bottom-0 z-10 border-cyan-300/40 bg-gradient-to-r from-cyan-500/25 via-violet-500/20 to-fuchsia-500/20 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
              : isFeatured
                ? 'border-amber-300/30 bg-gradient-to-r from-amber-400/15 to-fuchsia-500/10'
                : 'border-white/[0.05] odd:bg-white/[0.025]'
          } ${isSuspicious ? 'cursor-pointer overflow-hidden text-left shadow-[inset_0_0_12px_rgba(139,92,246,0.09)] transition-[filter,background-color] duration-200 hover:brightness-125 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyan-300/80' : ''}`;

          const rowContent = (
            <>
              {isSuspicious && (
                <span
                  className="pointer-events-none absolute inset-y-1 left-0 w-0.5 rounded-full bg-cyan-200/70 shadow-[0_0_8px_rgba(103,232,249,0.9)] animate-pulse"
                  aria-hidden="true"
                />
              )}
              <span className={`relative font-mono font-black ${isFeatured ? 'text-amber-300' : isPlayer ? 'text-cyan-300' : 'text-slate-500'}`}>
                {rankLabel(entry.rank)}
              </span>
              <div className="relative flex items-center gap-1.5 min-w-0">
                <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[7px] font-black ${
                  isPlayer ? 'bg-cyan-300 text-slate-950' : isFeatured ? 'bg-amber-300 text-slate-950' : isNamed ? 'bg-violet-500/30 text-violet-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isPlayer ? 'YOU' : isFeatured ? <Crown className="w-3 h-3" /> : isNamed ? entry.name.slice(0, 2).toUpperCase() : 'AV'}
                </span>
                <span className={`truncate font-bold ${isPlayer ? 'text-white' : isFeatured ? 'text-amber-100' : isNamed ? 'text-violet-200' : 'text-slate-400'}`}>{entry.name}</span>
                {isPlayer && <span className="text-[7px] px-1 py-0.5 rounded bg-cyan-300 text-slate-950 font-black">LIVE BEST</span>}
                {isFeatured && <span className="text-[7px] px-1 py-0.5 rounded bg-amber-300/15 border border-amber-300/25 text-amber-200 font-black">TRENDING</span>}
              </div>
              <span className={`relative text-right text-sm font-black tabular-nums ${isPlayer ? 'text-cyan-200' : isFeatured ? 'text-amber-300' : isSuspicious ? 'text-violet-100 drop-shadow-[0_0_5px_rgba(196,181,253,0.8)]' : 'text-white'}`}>{entry.score}</span>
            </>
          );

          if (isSuspicious) {
            return (
              <button
                type="button"
                key={entry.id}
                className={rowClassName}
                data-entry-kind={entry.kind}
                data-row-key={entry.id}
                data-suspicious-run="true"
                aria-label={`Open rank ${entry.rank} run by ${entry.name}`}
                onClick={() => {
                  if (selectedRun) return;
                  audio.play('ui.primaryTap');
                  setSelectedRun(entry);
                  setShowTitleIntro(false);
                }}
              >
                {rowContent}
              </button>
            );
          }

          return (
            <div
              key={entry.id}
              className={rowClassName}
              data-entry-kind={entry.kind}
              data-row-key={entry.id}
            >
              {rowContent}
            </div>
          );
        })}
      </div>
    </div>

    <div className="relative shrink-0 mx-3 my-2 rounded-[18px] border border-fuchsia-400/25 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/15 to-cyan-500/15 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[8px] font-black tracking-widest text-fuchsia-300"><Sparkles className="w-3 h-3" /> PERFORMANCE MIRACLE DETECTED</div>
          <div className="text-xs font-black text-white mt-0.5">You defeated {beatPercentage}% of all totally real flyers!</div>
        </div>
        <div className="w-24 h-2 rounded-full overflow-hidden bg-black/40 border border-white/10 shrink-0">
          <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-300" style={{ width: `${Math.max(3, beatPercentage)}%` }}></div>
        </div>
      </div>
    </div>

    {selectedRun && !showTitleIntro && (
      <motion.div
        className="absolute inset-0 z-50 flex items-center justify-center bg-[#030309]/95 p-5 text-center backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.24 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="anomaly-question"
        id="leaderboard-anomaly-prompt"
      >
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.28, ease: 'easeOut' }}
          className="w-full max-w-[320px] rounded-2xl border border-white/10 bg-[#0b0a16] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
        >
          <div className="mb-4 grid grid-cols-[42px_1fr_54px] items-center rounded-lg border border-violet-400/20 bg-violet-500/[0.07] px-2.5 py-2 text-left text-[10px]">
            <span className="font-mono font-black text-slate-500">{rankLabel(selectedRun.rank)}</span>
            <span className="truncate font-bold text-violet-100">{selectedRun.name}</span>
            <span className="text-right text-sm font-black text-cyan-200">{selectedRun.score}</span>
          </div>
          <p id="anomaly-question" className="text-sm font-black leading-snug text-white">
            THE FIRST FEW RECORDS LOOK STRANGE.
            <span className="mt-1 block text-cyan-200">IGNORE THEM?</span>
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              autoFocus
              onClick={() => {
                audio.play('ui.close');
                setSelectedRun(null);
                setShowTitleIntro(false);
              }}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] text-xs font-black tracking-[0.22em] text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              id="ignore-anomaly-yes"
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => {
                audio.play('ui.primaryTap');
                setShowTitleIntro(true);
              }}
              className="min-h-11 w-full rounded-xl border border-cyan-300/40 bg-cyan-300/[0.08] text-xs font-black tracking-[0.22em] text-cyan-100 shadow-[inset_0_0_14px_rgba(34,211,238,0.08)] transition-colors hover:bg-cyan-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              id="ignore-anomaly-no"
            >
              NO
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}

    {selectedRun && showTitleIntro && (
      <motion.div
        className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#030309] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        id="game-title-intro"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, letterSpacing: '0.08em' }}
          animate={{ opacity: 1, scale: 1, letterSpacing: '0.02em' }}
          transition={{ delay: 0.25, duration: 0.85, ease: 'easeOut' }}
          className="relative px-6 font-black uppercase leading-[0.9] text-white"
        >
          <div className="text-[clamp(1.7rem,6vw,4.5rem)]">Game <span className="text-cyan-300">Quest</span>ing,</div>
          <div className="mt-2 text-[clamp(1.7rem,6vw,4.5rem)]"><span className="text-cyan-300">Quest</span>ioning Game</div>
          <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
        </motion.div>
      </motion.div>
    )}
  </div>
  );
};
