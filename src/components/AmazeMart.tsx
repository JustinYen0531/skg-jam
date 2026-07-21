import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction, completePuzzleChapter } from '../lib/chapterProgress';
import { createFeedSeed, shuffleFeed } from '../lib/pseudoFeed';
import {
  isLumenArcSearch,
  isSellerCodeAccepted,
  shouldRevealSuppressedSeller,
} from '../lib/amazemartPuzzle';
import {
  ShoppingBag,
  Search,
  Package,
  CheckCircle,
  Smartphone,
  Star,
  Truck,
  Flame,
  AlertTriangle,
  ChevronDown,
  MessageCircle,
  Send,
  FileSignature,
} from 'lucide-react';

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

type MerchantPhase = 'browsing' | 'risk-confirm' | 'notification' | 'relay' | 'ready-to-sign';

export const AmazeMart: React.FC<AmazeMartProps> = ({ progress, updateProgress, onOpenScreenshots }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(progress.deliveredPhone);
  const [searchError, setSearchError] = useState('');
  const [sellerRevealed, setSellerRevealed] = useState(false);
  const [sellerExpanded, setSellerExpanded] = useState(false);
  const [merchantPhase, setMerchantPhase] = useState<MerchantPhase>('browsing');
  const [sellerCode, setSellerCode] = useState('');
  const [sellerCodeError, setSellerCodeError] = useState('');
  const [recommendedProducts] = useState(() => shuffleFeed(AMAZEMART_PRODUCTS, createFeedSeed('amazemart')));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playTick();
    if (isLumenArcSearch(searchQuery)) {
      if (!canUseProgressionAction('amazemart-lumen-search', progress)) {
        audio.playGlitch();
        setSearchError('IMPRESSIVE GUESS. UNFORTUNATELY, THE STORY HAS NOT SHIPPED THAT CLUE YET.');
        return;
      }
      setSearchError('');
      setSearched(true);
      setSellerRevealed(false);
      setSellerExpanded(false);
      setMerchantPhase('browsing');
      setSellerCode('');
      setSellerCodeError('');
      return;
    }

    setSearchError('NO CERTIFIED INVENTORY MATCHED THAT SEARCH. THE RECOMMENDATION ENGINE HAS IMPROVISED INSTEAD.');
  };

  const handleResultsScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!searched || sellerRevealed || progress.deliveredPhone) return;
    if (shouldRevealSuppressedSeller(event.currentTarget)) {
      setSellerRevealed(true);
      audio.playGlitch();
    }
  };

  const handleAcceptRisk = () => {
    // The over-happy checkout jingle now stops at a suspicious seller relay
    // instead of completing the chapter automatically.
    audio.play('amazemart.purchase');
    setMerchantPhase('notification');
  };

  const handleSellerVerification = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSellerCodeAccepted(sellerCode)) {
      setSellerCodeError('');
      setMerchantPhase('ready-to-sign');
      audio.play('amazemart.delivery');
      return;
    }

    audio.playGlitch();
    setSellerCodeError('MISMATCH. USE THE SCORE ATTACHED TO THE IMPOSSIBLE RUN.');
  };

  const handleSignDelivery = () => {
    audio.playTick();
    updateProgress((prev) => completePuzzleChapter(prev, 3, {
      orderedPhone: true,
      deliveredPhone: true,
    }));
    onOpenScreenshots();
  };

  return (
    <div className="relative flex flex-col h-full bg-indigo-950/20 text-slate-100 font-sans overflow-hidden" id="amazemart-root">
      
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
      <div className="flex-1 overflow-y-auto p-3" id="am-body" onScroll={handleResultsScroll}>
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
            {!progress.deliveredPhone ? (
              <>
                <section className="rounded-lg border border-slate-800 bg-slate-900 p-3" id="am-search-summary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[8px] font-mono text-slate-500">SEARCH RESULTS FOR</div>
                      <h2 className="text-sm font-black text-white">“Lumen Arc”</h2>
                    </div>
                    <span className="rounded bg-amber-500/10 px-2 py-1 text-[8px] font-bold text-amber-300">0 CERTIFIED MATCHES</span>
                  </div>
                  <p className="mt-2 text-[9px] leading-relaxed text-slate-400">Results broadened automatically. Some marketplace records may be omitted by Trust &amp; Safety.</p>
                </section>

                <div className="grid grid-cols-2 gap-2" id="am-search-decoys">
                  {recommendedProducts.slice(0, 8).map((product) => (
                    <article key={`search-${product.id}`} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                      <div className={`relative flex h-16 items-center justify-center bg-gradient-to-br ${product.gradient}`}>
                        <span className="text-3xl text-white/90 drop-shadow-lg">{product.symbol}</span>
                        <span className="absolute left-1.5 top-1.5 rounded bg-slate-950/80 px-1.5 py-0.5 text-[7px] font-black text-white">SPONSORED</span>
                      </div>
                      <div className="p-2">
                        <h3 className="line-clamp-2 min-h-6 text-[10px] font-bold leading-tight text-slate-100">{product.name}</h3>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400">{product.price}</span>
                          <span className="text-[7px] text-slate-500">NOT A MATCH</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {!sellerRevealed ? (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-3 text-center" id="am-hidden-results-hint">
                    <div className="text-[9px] font-mono text-slate-500">KEEP SCROLLING · 3 MARKETPLACE RECORDS STILL FILTERED</div>
                  </div>
                ) : (
                  <article className="overflow-hidden rounded-lg border border-red-500/45 bg-red-950/20 shadow-[0_0_24px_rgba(239,68,68,0.12)]" id="am-suppressed-seller">
                    <button
                      type="button"
                      onClick={() => { audio.playTick(); setSellerExpanded((current) => !current); }}
                      className="flex w-full items-center gap-3 p-3 text-left"
                      id="am-expand-seller"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-red-500/30 bg-slate-950">
                        <Smartphone className="h-6 w-6 text-red-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-[8px] font-black tracking-wider text-red-300"><AlertTriangle className="h-3 w-3" /> DANGEROUS · UNVERIFIED SELLER</div>
                        <h3 className="mt-0.5 text-xs font-bold text-white">Lumen Arc Recovery Lot — “Complete”</h3>
                        <div className="mt-1 text-[9px] font-mono text-slate-400">coldboot_17 · rating unavailable · $1.84</div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-red-300 transition-transform ${sellerExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {sellerExpanded && (
                      <div className="space-y-3 border-t border-red-500/20 p-3" id="am-seller-details">
                        <div className="rounded border border-red-500/25 bg-slate-950 p-2 text-[9px] leading-relaxed text-slate-300">
                          Physical battery disabled. Seller claims the surviving developer packet can reconstruct the original interface. AmazeMart cannot verify the item, seller, delivery, or meaning of “reconstruct.”
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[8px] text-slate-400">
                          <div className="rounded bg-slate-950 p-1.5">NO REFUNDS</div>
                          <div className="rounded bg-slate-950 p-1.5">NO WARRANTY</div>
                          <div className="rounded bg-slate-950 p-1.5">NO COMMON SENSE</div>
                        </div>
                        {merchantPhase === 'browsing' && (
                          <button
                            type="button"
                            onClick={() => setMerchantPhase('risk-confirm')}
                            className="flex w-full items-center justify-center gap-1.5 rounded bg-amber-500 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                            id="am-buy-button"
                          >
                            <Package className="h-4 w-4" /> ORDER INSTANT
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                )}

                {(merchantPhase === 'relay' || merchantPhase === 'ready-to-sign') && (
                  <section className="overflow-hidden rounded-lg border border-cyan-400/30 bg-slate-950" id="am-seller-relay">
                    <div className="flex items-center justify-between border-b border-cyan-400/20 bg-cyan-400/10 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-200"><MessageCircle className="h-3.5 w-3.5" /> SELLER RELAY · coldboot_17</div>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    </div>
                    <div className="space-y-2 p-3 font-mono text-[9px]">
                      <div className="max-w-[85%] rounded bg-slate-800 p-2 text-slate-200">Buyer check. What score belongs to the impossible runner?</div>
                      {merchantPhase === 'ready-to-sign' ? (
                        <>
                          <div className="ml-auto max-w-[70%] rounded bg-cyan-500/20 p-2 text-right text-cyan-100">184</div>
                          <div className="max-w-[90%] rounded bg-emerald-500/10 p-2 text-emerald-200">MATCH. SCHEMATIC PACKET DELIVERED. SIGN TO RELEASE IMAGE SET.</div>
                          <button
                            type="button"
                            onClick={handleSignDelivery}
                            className="flex w-full items-center justify-center gap-1.5 rounded bg-emerald-400 py-2 font-sans text-xs font-black text-slate-950 hover:bg-emerald-300"
                            id="am-sign-delivery"
                          >
                            <FileSignature className="h-4 w-4" /> SIGN FOR DELIVERY
                          </button>
                        </>
                      ) : (
                        <form onSubmit={handleSellerVerification} className="space-y-2" id="am-seller-code-form">
                          <div className="flex gap-1.5">
                            <input
                              value={sellerCode}
                              onChange={(event) => setSellerCode(event.target.value)}
                              inputMode="numeric"
                              autoComplete="off"
                              placeholder="ENTER SCORE"
                              className="min-w-0 flex-1 rounded border border-cyan-400/25 bg-slate-900 px-2 py-2 text-xs text-white outline-none focus:border-cyan-300"
                              id="am-seller-code"
                            />
                            <button type="submit" className="rounded bg-cyan-400 px-3 text-slate-950 hover:bg-cyan-300" id="am-submit-code" aria-label="Send score">
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                          {sellerCodeError && <div className="text-[8px] text-red-300" id="am-seller-code-error">{sellerCodeError}</div>}
                        </form>
                      )}
                    </div>
                  </section>
                )}
              </>
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

      {merchantPhase === 'risk-confirm' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-sm" id="am-risk-confirmation">
          <div className="w-full max-w-sm rounded-xl border border-red-400/40 bg-slate-900 p-4 text-center shadow-2xl">
            <AlertTriangle className="mx-auto h-9 w-9 text-red-400" />
            <h2 className="mt-2 font-display text-base font-black text-white">ARE YOU SURE?</h2>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-300">This seller is unverified. The listing may be fraudulent, unsafe, imaginary, or all three.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMerchantPhase('browsing')} className="rounded border border-slate-600 py-2 text-[10px] font-bold text-slate-300" id="am-risk-cancel">GO BACK</button>
              <button type="button" onClick={handleAcceptRisk} className="rounded bg-red-500 py-2 text-[10px] font-black text-white hover:bg-red-400" id="am-risk-accept">I ACCEPT THE RISK</button>
            </div>
          </div>
        </div>
      )}

      {merchantPhase === 'notification' && (
        <button
          type="button"
          onClick={() => { audio.playTick(); setMerchantPhase('relay'); }}
          className="absolute right-3 top-14 z-20 flex w-[min(300px,calc(100%-24px))] items-center gap-2 rounded-lg border border-cyan-300/30 bg-slate-950/95 p-3 text-left shadow-2xl"
          id="am-seller-notification"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/15"><MessageCircle className="h-4 w-4 text-cyan-300" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-[8px] font-mono text-cyan-300">AMAZEMART SELLER RELAY · NOW</div>
            <div className="truncate text-[10px] font-bold text-white">coldboot_17 sent you a buyer check.</div>
          </div>
          <span className="text-xs text-cyan-300">OPEN</span>
        </button>
      )}

    </div>
  );
};
