import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import { Search, RotateCcw, Clock, Download, ArrowRight, ShieldCheck, HeartCrack } from 'lucide-react';

interface BrowserAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

export const BrowserApp: React.FC<BrowserAppProps> = ({ progress, updateProgress }) => {
  const [addressBar, setAddressBar] = useState('http://www.skg-automation.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [searchedKeyword, setSearchedKeyword] = useState('skg');
  const [archiveError, setArchiveError] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playTick();
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('skg') || query.includes('silver') || query.includes('kite')) {
      setSearchedKeyword('skg');
      setAddressBar(selectedYear === 2026 ? 'http://www.skg-automation.com' : 'http://web.archive.org/web/2014/silverkitegames.com');
    } else {
      setSearchedKeyword(query);
      setAddressBar(`https://www.searchfinder.com?q=${encodeURIComponent(query)}`);
    }
  };

  const handleYearChange = (year: number) => {
    if (year === 2014 && !canUseProgressionAction('browser-skg-history', progress)) {
      audio.playGlitch();
      setArchiveError('2014 IS STILL THERE. YOUR CHARACTER JUST HAS NOT EARNED THE BOOKMARK YET.');
      return;
    }

    setArchiveError('');
    audio.playUnlock();
    setSelectedYear(year);
    if (searchedKeyword === 'skg') {
      setAddressBar(year === 2026 ? 'http://www.skg-automation.com' : 'http://web.archive.org/web/2014/silverkitegames.com');
      updateProgress((prev) => ({ ...prev, discoveredSKGHistory: true }));
    }
  };

  const handleDownload = () => {
    audio.playSuccess();
    updateProgress((prev) => ({ ...prev, archiveDownloaded: true }));
  };

  return (
    <div className="flex flex-col h-full bg-[#101218] text-slate-100 font-sans overflow-hidden" id="browser-root">

      {/* Top chrome: an ordinary modern browser */}
      <div className="bg-[#171a21] p-2.5 border-b border-white/[0.06] space-y-2" id="browser-top-nav">

        {/* Archive timeline: a modern segmented control */}
        <div className="flex items-center justify-between text-[10px]" id="wayback-slider-box">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Snapshot</span>
          </span>
          <div className="flex rounded-full bg-white/[0.06] p-0.5">
            <button
              onClick={() => handleYearChange(2026)}
              className={`px-3 py-1 rounded-full transition-colors font-medium ${
                selectedYear === 2026
                  ? 'bg-[#2a2f3a] text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              id="slider-2026"
            >
              2026 · Current
            </button>
            <button
              onClick={() => handleYearChange(2014)}
              className={`px-3 py-1 rounded-full transition-colors font-medium ${
                selectedYear === 2014
                  ? 'bg-[#4a4432] text-amber-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              id="slider-2014"
            >
              2014 · Archive
            </button>
          </div>
        </div>

        {/* Address pill */}
        <div className="flex items-center gap-1.5" id="url-search-form">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={addressBar}
              onChange={(e) => setAddressBar(e.target.value)}
              className="w-full bg-[#0d0f14] text-xs text-slate-300 px-3.5 py-1.5 pr-8 rounded-full border border-white/[0.07] focus:outline-none focus:border-white/20"
              id="browser-address-input"
            />
            <button type="button" onClick={() => setAddressBar('http://www.skg-automation.com')} className="absolute right-2.5 text-slate-500 hover:text-white" id="url-reset">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Browser Content area */}
      {archiveError && (
        <div className="mx-3 mt-2 rounded-lg border border-amber-500/25 bg-[#1a1712] p-2 text-[9px] font-mono text-amber-200/90" id="browser-archive-error">
          {archiveError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 bg-[#0d0f14] font-sans" id="browser-viewport">
        {selectedYear === 2026 ? (
          /* Year 2026: Modern corporate slop */
          searchedKeyword === 'skg' ? (
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
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <div className="text-cyan-400 font-black font-mono">1.2M+</div>
                  <div className="text-[9px] text-slate-500">Apps Auto-Replaced</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <div className="text-cyan-400 font-black font-mono">100%</div>
                  <div className="text-[9px] text-slate-500">Unstaffed Humanless Operations</div>
                </div>
              </div>

              {/* Faceless leadership: perfectly uniform, nobody home */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
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
              </div>

              {/* Corporate Services Block */}
              <div className="space-y-2 text-xs" id="corp-services">
                <h3 className="font-display font-bold text-slate-300 text-xs border-b border-slate-800 pb-1">Services Matrix</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  SKG Automation owns and maintains over 14,000 legacy mobile apps. We deploy programmatically optimized micro-transactions and ads over original assets.
                </p>
                <div className="bg-blue-950/20 border border-blue-900/40 p-2.5 rounded text-[10px] text-blue-300 flex items-center justify-between">
                  <span>Need legacy app support queries? Contact our unstaffed bot.</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-[8px] text-center text-slate-600 font-mono border-t border-slate-900 pt-3">
                Established 2009. Reinvented 2014. No Human Personnel Maintained.
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs" id="browser-generic-result">
              <span>Generic Search Results for "{searchedKeyword}". No matches found. Try searching for "SKG".</span>
            </div>
          )
        ) : (
          /* Year 2014: Original indie developer site (Silver Kite Games) */
          searchedKeyword === 'skg' ? (
            <div className="space-y-4 web-archive-1998 bg-[#fbf7e8] text-[#1c1c1c] -m-3 p-4" id="indie-2014">

              {/* Wayback toolbar remnant */}
              <div className="bg-[#ececec] border border-[#b5b5b5] px-2 py-1 text-[9px] font-sans text-[#444] flex items-center justify-between gap-2">
                <span>ARCHIVED SNAPSHOT · 2014-04-14 · some page elements failed to load</span>
                <span className="text-[#c33] shrink-0">3 images missing</span>
              </div>

              <div className="border-b-2 border-[#8a835f] pb-2 flex items-center justify-between">
                <div>
                  <h1 className="font-black text-lg text-[#003366]">SILVER KITE GAMES</h1>
                  <p className="text-[10px] text-[#555] italic">Crafting flying experiences that matter</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-[#fff8d0] text-[#7a5c00] px-1.5 py-0.5 border border-[#c9b45a] font-sans">
                    LAOS_PARTNER_MEMBER
                  </span>
                </div>
              </div>

              {/* Old-web nav strip (decorative dead links) */}
              <div className="text-[10px] font-sans space-x-2 text-[#0000cc]">
                <span className="underline cursor-default">Home</span>
                <span className="text-[#888]">|</span>
                <span className="underline cursor-default">Dev Blog</span>
                <span className="text-[#888]">|</span>
                <span className="underline cursor-default">Games</span>
                <span className="text-[#888]">|</span>
                <span className="underline line-through text-[#888] cursor-default">Forum (offline)</span>
              </div>

              {/* Developer Blogs */}
              <div className="space-y-3.5 text-xs" id="indie-blogs">
                <h3 className="font-bold text-xs text-[#003366] uppercase tracking-wider">LATEST BLOG LOGS</h3>

                {/* Blog 1 */}
                <div className="bg-white p-3 border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-sans border-b border-[#ddd] pb-1">
                    <span className="text-[#0000cc] underline font-bold">Log: Skyline 256 Completion Build</span>
                    <span className="text-[#777]">2014-03-08 • Noah Kade</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    Skyline 256 isn't an infinite game. I've received a lot of criticism about this. Elias says infinite modes increase monetization loop duration. But I believe every flight deserves a touchdown.
                  </p>
                  {/* Broken image placeholder — asset never archived */}
                  <div className="flex items-center gap-1.5 border border-[#9aa] bg-[#fdfdfd] px-2 py-3 text-[10px] text-[#556] font-sans w-fit">
                    <span className="inline-block w-3.5 h-3.5 border border-[#9aa] text-[9px] leading-[13px] text-center text-[#c33] shrink-0">✕</span>
                    <span className="italic">nk_altitude_final_184.gif — image not archived</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-bold text-[#7a2e00]">
                    Once you cross the 40th pipe section, you enter our calibrated flight channel. Successfully navigate all 256 gates, and the simulation terminates correctly, writing your complete flag.
                  </p>
                </div>

                {/* Blog 2 */}
                <div className="bg-white p-3 border border-[#bab48f] shadow-[2px_2px_0_#d8d2ac] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-sans border-b border-[#ddd] pb-1">
                    <span className="text-[#aa2222] underline font-bold flex items-center gap-1">
                      <HeartCrack className="w-3.5 h-3.5" /> Log: The Recall Decision
                    </span>
                    <span className="text-[#777]">2014-04-14 • Noah Kade</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    It's official. Government authorities are recalling all Lumen Arc devices due to battery heating issues. It feels like a commercial setup by the larger mobile brands.
                  </p>
                  {/* Broken image placeholder — asset never archived */}
                  <div className="flex items-center gap-1.5 border border-[#9aa] bg-[#fdfdfd] px-2 py-3 text-[10px] text-[#556] font-sans w-fit">
                    <span className="inline-block w-3.5 h-3.5 border border-[#9aa] text-[9px] leading-[13px] text-center text-[#c33] shrink-0">✕</span>
                    <span className="italic">recall_notice_scan.jpg — image not archived</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#222]">
                    Our database server for leaderboards is shutting down. Elias is already restructuring our organization to "SKG Automation" to execute AI web scrapping and monetize our catalog. I'm completely devastated.
                  </p>
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
