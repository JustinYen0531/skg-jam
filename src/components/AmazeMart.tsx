import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction, completePuzzleChapter } from '../lib/chapterProgress';
import { createFeedSeed, shuffleFeed } from '../lib/pseudoFeed';
import { ShoppingBag, Search, Package, CheckCircle, Smartphone, Star, Truck, Flame } from 'lucide-react';

const AMAZEMART_PRODUCTS = [
  { id: 'am-1', name: 'Cloud-Shaped Bedside Humidifier', price: '$18.49', oldPrice: '$34.00', rating: '4.7', reviews: '8,421', badge: '42% OFF', symbol: '☁', gradient: 'from-sky-300 to-indigo-500' },
  { id: 'am-2', name: 'Seven-Port Universal Mystery Adapter', price: '$11.99', oldPrice: '$19.99', rating: '4.3', reviews: '2,108', badge: 'BESTSELLER', symbol: '⌁', gradient: 'from-slate-400 to-slate-800' },
  { id: 'am-3', name: 'AI Morning Routine Smart Mug', price: '$29.00', oldPrice: '$89.00', rating: '4.1', reviews: '17,503', badge: 'LIMITED', symbol: '☕', gradient: 'from-amber-300 to-orange-700' },
  { id: 'am-4', name: 'Pocket Projector — Cinema Anywhere', price: '$46.20', oldPrice: '$129.00', rating: '4.6', reviews: '951', badge: '64% OFF', symbol: '▣', gradient: 'from-purple-500 to-slate-950' },
  { id: 'am-5', name: 'Ergonomic Gaming Pillow Pro Max', price: '$22.75', oldPrice: '$44.90', rating: '4.8', reviews: '31,116', badge: 'HOT', symbol: '✦', gradient: 'from-fuchsia-500 to-violet-900' },
  { id: 'am-6', name: 'Tiny Indoor Weather Station', price: '$16.08', oldPrice: '$25.00', rating: '4.4', reviews: '4,650', badge: 'DEAL', symbol: '⌁', gradient: 'from-emerald-400 to-cyan-800' },
  { id: 'am-7', name: 'Retro Handheld With 9999 Games', price: '$13.37', oldPrice: '$79.99', rating: '3.9', reviews: '62,003', badge: 'VIRAL', symbol: '✚', gradient: 'from-lime-400 to-emerald-800' },
  { id: 'am-8', name: 'Selfie Lamp With Confidence Mode', price: '$9.84', oldPrice: '$21.00', rating: '4.5', reviews: '11,204', badge: 'TRENDING', symbol: '☼', gradient: 'from-yellow-200 to-pink-500' },
  { id: 'am-9', name: 'Wireless Sleep Headphones Headband', price: '$15.59', oldPrice: '$31.00', rating: '4.6', reviews: '7,902', badge: 'CHOICE', symbol: '♫', gradient: 'from-blue-500 to-indigo-950' },
] as const;

interface AmazeMartProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onOpenScreenshots: () => void;
}

export const AmazeMart: React.FC<AmazeMartProps> = ({ progress, updateProgress, onOpenScreenshots }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(progress.orderedPhone);
  const [ordering, setOrdering] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [recommendedProducts] = useState(() => shuffleFeed(AMAZEMART_PRODUCTS, createFeedSeed('amazemart')));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playTick();
    if (searchQuery.toLowerCase().includes('lumen') || searchQuery.toLowerCase().includes('arc')) {
      if (!canUseProgressionAction('amazemart-lumen-search', progress)) {
        audio.playGlitch();
        setSearchError('IMPRESSIVE GUESS. UNFORTUNATELY, THE STORY HAS NOT SHIPPED THAT CLUE YET.');
        return;
      }
      setSearchError('');
      setSearched(true);
    }
  };

  const handleBuy = () => {
    setOrdering(true);
    audio.playUnlock();
    
    setTimeout(() => {
      setOrdering(false);
      updateProgress((prev) => completePuzzleChapter(prev, 3, {
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
      {searchError && (
        <div className="mx-3 mt-2 rounded border border-red-500/30 bg-red-950/30 p-2 text-[9px] font-mono text-red-300" id="am-search-error">
          ⚠ {searchError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3" id="am-body">
        {!searched ? (
          <div className="space-y-3" id="am-storefront">
            <section className="rounded-xl overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-indigo-950 p-3 relative" id="am-deal-banner">
              <div className="absolute -right-5 -top-6 w-24 h-24 rounded-full bg-white/25"></div>
              <div className="relative flex justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-1 text-[8px] font-black tracking-widest"><Flame className="w-3 h-3 fill-current" /> TODAY ONLY-ish</div>
                  <h2 className="text-lg font-black leading-none mt-1">EVERYTHING<br />MUST SHIP</h2>
                  <p className="text-[9px] font-bold mt-1 opacity-75">Up to 73% off things selected by something.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-indigo-950 text-amber-300 flex flex-col items-center justify-center border-4 border-white/40 rotate-6 shadow-lg">
                  <span className="text-[8px] font-black">SAVE</span>
                  <span className="text-xl font-black">73%</span>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-5 gap-1 text-center" id="am-categories">
              {[
                ['⚡', 'Deals'], ['⌕', 'Tech'], ['⌂', 'Home'], ['✦', 'Trending'], ['▦', 'More'],
              ].map(([symbol, label]) => (
                <div key={label} className="rounded-lg bg-slate-900 border border-slate-800 p-1.5">
                  <div className="text-base leading-none">{symbol}</div>
                  <div className="text-[7px] text-slate-400 mt-1 truncate">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> Flash recommendations</h2>
              <span className="text-[8px] text-amber-400 font-mono">ENDS 00:43:19</span>
            </div>

            <div className="grid grid-cols-2 gap-2" id="am-product-feed">
              {recommendedProducts.slice(0, 8).map((product, index) => (
                <article key={product.id} className="rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                  <div className={`h-20 bg-gradient-to-br ${product.gradient} relative flex items-center justify-center`}>
                    <span className="text-4xl text-white/90 drop-shadow-lg">{product.symbol}</span>
                    <span className={`absolute left-1.5 top-1.5 text-[7px] font-black px-1.5 py-0.5 rounded ${index % 3 === 0 ? 'bg-red-600 text-white' : 'bg-amber-300 text-slate-950'}`}>{product.badge}</span>
                  </div>
                  <div className="p-2">
                    <h3 className="text-[10px] leading-tight font-bold text-slate-100 line-clamp-2 min-h-6">{product.name}</h3>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-sm font-black text-amber-400">{product.price}</span>
                      <span className="text-[8px] line-through text-slate-600">{product.oldPrice}</span>
                    </div>
                    <div className="flex justify-between mt-1 text-[8px] text-slate-500">
                      <span className="flex items-center gap-0.5 text-amber-300"><Star className="w-2.5 h-2.5 fill-current" /> {product.rating} ({product.reviews})</span>
                      <span className="flex items-center gap-0.5"><Truck className="w-2.5 h-2.5" /> tomorrow*</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button
              onClick={() => { audio.playTick(); setSearchQuery('Lumen Arc'); }}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-center gap-2 text-left"
              id="am-recalled-suggestion"
            >
              <div className="w-9 h-9 rounded bg-slate-950 border border-amber-500/30 flex items-center justify-center shrink-0"><Smartphone className="w-4 h-4 text-amber-400" /></div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-white">Customers researching discontinued hardware also searched</div>
                <div className="text-[9px] text-amber-400 font-mono">Lumen Arc · recalled electronics · collector inventory</div>
              </div>
            </button>
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
