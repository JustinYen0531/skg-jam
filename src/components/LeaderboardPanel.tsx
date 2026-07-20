import React, { useEffect, useRef } from 'react';
import { Crown, RefreshCw, Sparkles, Trophy, X, Zap } from 'lucide-react';
import audio from '../lib/audio';
import type { PublicLeaderboardEntry } from '../lib/leaderboard';

interface LeaderboardPanelProps {
  entries: PublicLeaderboardEntry[];
  playerBestScore: number;
  beatPercentage: number;
  onRetry: () => void;
  onClose: () => void;
  onInvestigate: () => void;
}

const rankLabel = (rank: number) => `#${String(rank).padStart(2, '0')}`;

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  entries,
  playerBestScore,
  beatPercentage,
  onRetry,
  onClose,
  onInvestigate,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const mountedAtRef = useRef(0);
  const seenRowsRef = useRef(new Set<string>());
  const lastPercentRef = useRef(beatPercentage);

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

          return (
            <div
              key={entry.id}
              className={`grid grid-cols-[44px_1fr_58px] items-center min-h-9 px-2.5 py-1.5 border-b text-[10px] ${
                isPlayer
                  ? 'sticky top-0 bottom-0 z-10 border-cyan-300/40 bg-gradient-to-r from-cyan-500/25 via-violet-500/20 to-fuchsia-500/20 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                  : isFeatured
                    ? 'border-amber-300/30 bg-gradient-to-r from-amber-400/15 to-fuchsia-500/10'
                    : 'border-white/[0.05] odd:bg-white/[0.025]'
              }`}
              data-entry-kind={entry.kind}
              data-row-key={entry.id}
            >
              <span className={`font-mono font-black ${isFeatured ? 'text-amber-300' : isPlayer ? 'text-cyan-300' : 'text-slate-500'}`}>
                {rankLabel(entry.rank)}
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[7px] font-black ${
                  isPlayer ? 'bg-cyan-300 text-slate-950' : isFeatured ? 'bg-amber-300 text-slate-950' : isNamed ? 'bg-violet-500/30 text-violet-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isPlayer ? 'YOU' : isFeatured ? <Crown className="w-3 h-3" /> : isNamed ? entry.name.slice(0, 2).toUpperCase() : 'AV'}
                </span>
                <span className={`truncate font-bold ${isPlayer ? 'text-white' : isFeatured ? 'text-amber-100' : isNamed ? 'text-violet-200' : 'text-slate-400'}`}>{entry.name}</span>
                {isPlayer && <span className="text-[7px] px-1 py-0.5 rounded bg-cyan-300 text-slate-950 font-black">LIVE BEST</span>}
                {isFeatured && <span className="text-[7px] px-1 py-0.5 rounded bg-amber-300/15 border border-amber-300/25 text-amber-200 font-black">TRENDING</span>}
              </div>
              <span className={`text-right text-sm font-black tabular-nums ${isPlayer ? 'text-cyan-200' : isFeatured ? 'text-amber-300' : 'text-white'}`}>{entry.score}</span>
            </div>
          );
        })}
      </div>
    </div>

    <div className="relative shrink-0 mx-3 mt-2 rounded-[18px] border border-fuchsia-400/25 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/15 to-cyan-500/15 px-3 py-2">
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

    <div className="relative shrink-0 mx-3 my-2 rounded-xl border border-violet-400/25 bg-black/55 px-3 py-2 flex items-center justify-between gap-3" id="protagonist-monologue">
      <div className="min-w-0">
        <p className="text-[10px] italic text-violet-100 truncate">“Everyone stops near 40. ARC_184 has 184. That cannot be normal.”</p>
        <p className="text-[8px] text-violet-400 mt-0.5">The replay may explain what the ranking refuses to.</p>
      </div>
      <button
        onClick={onInvestigate}
        className="min-h-8 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-[9px] font-black flex items-center gap-1 shrink-0 shadow-[0_0_14px_rgba(217,70,239,0.35)]"
        id="go-investigate"
      >
        <Zap className="w-3 h-3 fill-current" /> INVESTIGATE
      </button>
    </div>
  </div>
  );
};
