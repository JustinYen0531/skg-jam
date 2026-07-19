import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { ShoppingBag, Search, Package, CheckCircle, Smartphone } from 'lucide-react';

interface AmazeMartProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onOpenScreenshots: () => void;
}

export const AmazeMart: React.FC<AmazeMartProps> = ({ progress, updateProgress, onOpenScreenshots }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(progress.orderedPhone);
  const [ordering, setOrdering] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playTick();
    if (searchQuery.toLowerCase().includes('lumen') || searchQuery.toLowerCase().includes('arc')) {
      setSearched(true);
    }
  };

  const handleBuy = () => {
    setOrdering(true);
    audio.playUnlock();
    
    setTimeout(() => {
      setOrdering(false);
      updateProgress((prev) => ({
        ...prev,
        orderedPhone: true,
        deliveredPhone: true, // immediately delivered!
      }));
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-indigo-950/20 text-slate-100 font-sans overflow-hidden" id="amazemart-root">
      
      {/* AmazeMart Header */}
      <div className="bg-amber-500 p-3 flex items-center justify-between border-b border-amber-600/50" id="am-header">
        <div className="flex items-center gap-1 font-display font-extrabold tracking-tight text-indigo-950 text-base">
          <ShoppingBag className="w-5 h-5 text-indigo-950 fill-amber-500" />
          <span>AmazeMart</span>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-[200px] ml-4 relative">
          <input
            type="text"
            placeholder="Search recalled phones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-amber-950/20 text-xs text-indigo-950 placeholder-amber-900/60 px-2.5 py-1.5 pr-8 rounded border border-amber-600 focus:outline-none font-medium"
            id="am-search-input"
          />
          <button type="submit" className="absolute right-2 top-2 text-indigo-900" id="am-search-submit">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-3" id="am-body">
        {!searched ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3" id="am-blank">
            <Smartphone className="w-12 h-12 text-slate-700" />
            <div className="text-sm font-medium text-slate-400">Search "Lumen Arc" to locate any leftover inventory.</div>
            <div className="text-[10px] text-slate-600">The device they took away from everyone.</div>
          </div>
        ) : (
          <div className="space-y-4" id="am-results">
            {/* If we have not ordered it yet */}
            {!progress.deliveredPhone ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3" id="am-item-card">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-slate-950 rounded border border-slate-800 flex items-center justify-center relative">
                    <Smartphone className="w-8 h-8 text-amber-500/70" />
                    <span className="absolute bottom-1 right-1 bg-red-600 text-[7px] text-white px-1 py-0.2 rounded font-mono">RECALLED</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-slate-400">Collector's Liquidation Stock</div>
                    <h3 className="font-display font-bold text-sm text-white">
                      Lumen Arc Mobile Console (Obsolete Package)
                    </h3>
                    <div className="text-xs text-amber-400 font-bold">$0.00 <span className="text-[9px] text-slate-500 line-through">$399.00</span></div>
                    <div className="text-[10px] text-slate-400 font-mono">Seller: OldStockCollectibles (100% positive rating)</div>
                  </div>
                </div>

                <div className="text-[10px] bg-slate-950 p-2 rounded text-slate-400 leading-relaxed border border-slate-800">
                  <span className="font-bold text-amber-400">⚠️ Item Warning Note:</span> Battery components fully deactivated. Due to strict government recall laws, we CANNOT ship the physical operational phone. Instead, you will receive the official **Lumen Arc Developer Kit & Captured Printed Screenshot Folder** containing full technical specification printouts of the legacy system interface.
                </div>

                <button
                  disabled={ordering}
                  onClick={handleBuy}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                  id="am-buy-button"
                >
                  <Package className="w-4 h-4" />
                  {ordering ? 'INITIATING TRANSIT SECURE...' : 'ORDER INSTANT SCHEMATICS DELIVERY'}
                </button>
              </div>
            ) : (
              /* Already ordered and delivered! */
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-4 text-center space-y-3 shadow-lg" id="am-delivery-success">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-emerald-400">UNBOXING SUCCESSFUL!</h3>
                  <p className="text-xs text-slate-300">
                    The package was immediately downloaded to your desktop space! We cannot run the 12-year-old console, but we have extracted the printout sheet directory.
                  </p>
                </div>
                
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-left text-[10px] text-slate-400 space-y-1 font-mono">
                  <div>📁 EXTRACTED: <span className="text-amber-400">Lumen_Arc_Screenshots.zip</span></div>
                  <div>📄 FILE_A: Skyline256_Icon_Specs.png</div>
                  <div>📄 FILE_B: Silver_Kite_Engine_Coordinates.png</div>
                  <div>📄 FILE_C: Developer_Profile_Favorite_Number.png</div>
                </div>

                <button
                  onClick={onOpenScreenshots}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs transition-colors shadow-lg"
                  id="am-open-screens"
                >
                  EXAMINE EXTRACTED SCHEMATICS NOW
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
