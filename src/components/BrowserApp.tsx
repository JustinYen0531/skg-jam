import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans overflow-hidden" id="browser-root">
      
      {/* Top Address and Search Bar */}
      <div className="bg-slate-800 p-2.5 border-b border-slate-700 space-y-2" id="browser-top-nav">
        
        {/* Archive Timeline Slider */}
        <div className="bg-slate-950 p-1.5 rounded flex items-center justify-between text-[10px] border border-slate-800" id="wayback-slider-box">
          <span className="flex items-center gap-1 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>WAYBACK SNAPSHOT:</span>
          </span>
          <div className="flex items-center gap-3 font-mono">
            <button
              onClick={() => handleYearChange(2026)}
              className={`px-2 py-0.5 rounded transition-all font-bold ${
                selectedYear === 2026 
                  ? 'bg-red-500 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              id="slider-2026"
            >
              2026 (CURRENT)
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => handleYearChange(2014)}
              className={`px-2 py-0.5 rounded transition-all font-bold ${
                selectedYear === 2014 
                  ? 'bg-amber-500 text-black shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              id="slider-2014"
            >
              2014 (ARCHIVE)
            </button>
          </div>
        </div>

        {/* Address Input Box */}
        <div className="flex items-center gap-1.5" id="url-search-form">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={addressBar}
              onChange={(e) => setAddressBar(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-300 px-3 py-1.5 pr-8 rounded border border-slate-700 font-mono focus:outline-none"
              id="browser-address-input"
            />
            <button type="button" onClick={() => setAddressBar('http://www.skg-automation.com')} className="absolute right-2 text-slate-500 hover:text-white" id="url-reset">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Browser Content area */}
      <div className="flex-1 overflow-y-auto p-3 bg-slate-950 font-sans" id="browser-viewport">
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
            <div className="space-y-4" id="indie-2014">
              
              <div className="border-b border-amber-500/20 pb-2 flex items-center justify-between">
                <div>
                  <h1 className="font-display font-black text-base text-amber-400">SILVER KITE GAMES</h1>
                  <p className="text-[9px] text-slate-400">Crafting flying experiences that matter</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                    LAOS_PARTNER_MEMBER
                  </span>
                </div>
              </div>

              {/* Developer Blogs */}
              <div className="space-y-3.5 text-xs" id="indie-blogs">
                <h3 className="font-display font-bold text-xs text-amber-400/80 uppercase tracking-wider">LATEST BLOG LOGS</h3>
                
                {/* Blog 1 */}
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-800 pb-1">
                    <span className="text-amber-400 font-bold">Log: Skyline 256 Completion Build</span>
                    <span className="text-slate-500">2014-03-08 • Noah Kade</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-300">
                    Skyline 256 isn't an infinite game. I've received a lot of criticism about this. Elias says infinite modes increase monetization loop duration. But I believe every flight deserves a touchdown. 
                  </p>
                  <p className="text-[10px] leading-relaxed text-slate-300 font-bold text-amber-200">
                    Once you cross the 37th pipe section, you enter our calibrated flight channel. Successfully navigate all 256 gates, and the simulation terminates correctly, writing your complete flag.
                  </p>
                </div>

                {/* Blog 2 */}
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-800 pb-1">
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <HeartCrack className="w-3.5 h-3.5" /> Log: The Recall Decision
                    </span>
                    <span className="text-slate-500">2014-04-14 • Noah Kade</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-300">
                    It's official. Government authorities are recalling all Lumen Arc devices due to battery heating issues. It feels like a commercial setup by the larger mobile brands. 
                  </p>
                  <p className="text-[10px] leading-relaxed text-slate-300">
                    Our database server for leaderboards is shutting down. Elias is already restructuring our organization to "SKG Automation" to execute AI web scrapping and monetize our catalog. I'm completely devastated.
                  </p>
                </div>
              </div>

              {/* Wayback / Download Section */}
              <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg space-y-2 text-xs" id="browser-archive-box">
                <h4 className="font-display font-bold text-amber-300 flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>PRESERVED APPLICATION SOURCE</span>
                </h4>
                <p className="text-[10px] text-slate-300">
                  The final original build of Skyline 256 compiled for LAOS.
                </p>

                {progress.archiveDownloaded ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold py-1 text-[11px] font-mono" id="download-success">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Skyline256_LAOS_Final.ipa DOWNLOADED SUCCESSFULLY</span>
                  </div>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs transition-all flex items-center justify-center gap-1 shadow"
                    id="download-ipa-button"
                  >
                    Download Skyline256_LAOS_Final.ipa
                  </button>
                )}
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
