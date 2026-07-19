import React, { useState, useEffect } from 'react';
import { GameProgress, ActiveApp } from '../types';
import audio from '../lib/audio';
import { FlappyGame } from './FlappyGame';
import { ViewTube } from './ViewTube';
import { AmazeMart } from './AmazeMart';
import { SavedScreenshots } from './SavedScreenshots';
import { BrowserApp } from './BrowserApp';
import { SocialApp } from './SocialApp';
import { MessagesApp } from './MessagesApp';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Wifi, Battery, Smartphone, MessageSquare, 
  Tv, ShoppingCart, Globe, Users, FolderHeart, Info, ShieldAlert, CheckCircle2
} from 'lucide-react';

interface PhoneSimulatorProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ 
  progress, updateProgress, onMuteToggle, isMuted 
}) => {
  const [activeApp, setActiveApp] = useState<ActiveApp>('flappy');
  const [currentTime, setCurrentTime] = useState('01:36');

  // Real-time clock simulator for phone status bar
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchApp = (app: ActiveApp) => {
    audio.playTick();
    setActiveApp(app);
  };

  const handleHomeButton = () => {
    audio.playTick();
    setActiveApp('home');
  };

  return (
    <div className="relative w-[340px] h-[670px] bg-slate-900 rounded-[48px] border-[10px] border-slate-800 shadow-2xl flex flex-col overflow-hidden ring-4 ring-slate-800/20" id="phone-bezel">
      
      {/* Phone Camera Notch/Speaker */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-1.5" id="phone-notch">
        <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
        <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800"></div>
      </div>

      {/* Phone Status Bar */}
      <div className="h-8 bg-black/85 px-6 flex items-center justify-between text-[10px] text-slate-300 font-mono z-40" id="phone-status-bar">
        <span>{currentTime}</span>
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-slate-400" />
          <span className="text-[8px] font-bold">LTE</span>
          <div className="flex items-center gap-0.5 ml-1">
            <Battery className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>97%</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Screen Area */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden" id="phone-display">
        <AnimatePresence mode="wait">
          {activeApp === 'home' && (
            /* HOME LAUNCHER DESKTOP */
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 overflow-y-auto"
              id="phone-desktop"
            >
              <div className="space-y-4">
                
                {/* Greeting / Mission Widget */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-1 mt-4" id="home-widget">
                  <div className="text-[8px] font-mono text-indigo-400 uppercase tracking-wider font-bold">INVESTIGATION DESK</div>
                  <h3 className="font-display font-black text-xs text-white">SKG: SCOREKEEPER</h3>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Analyze clues across apps to find the bypass sequence and overcome score 37.
                  </p>

                  {/* Dynamic checklist to guide players */}
                  <div className="pt-2 border-t border-white/5 space-y-1 text-[9px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${progress.deathsAt37 >= 1 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                      <span className={progress.deathsAt37 >= 1 ? 'line-through text-slate-500' : 'text-slate-300'}>
                        Die at pipe 37 to trigger the discrepancy
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${progress.watchedVideo ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                      <span className={progress.watchedVideo ? 'line-through text-slate-500' : 'text-slate-300'}>
                        Examine ARC_184's run video in ViewTube
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${progress.deliveredPhone ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className={progress.deliveredPhone ? 'line-through text-slate-500' : 'text-slate-300'}>
                        Buy the obsolete schematics folder in AmazeMart
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${progress.unlockedCodeRoute ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className={progress.unlockedCodeRoute ? 'line-through text-slate-500' : 'text-slate-300'}>
                        Decrypt Mother's Silver Kite Messenger login
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid of Apps */}
                <div className="grid grid-cols-4 gap-y-4 gap-x-2 pt-2" id="home-apps-grid">
                  
                  {/* Flappy / Skyline Game Icon */}
                  <button 
                    onClick={() => handleLaunchApp('flappy')}
                    className="flex flex-col items-center justify-center space-y-1 text-center group"
                    id="launcher-game"
                  >
                    <div className="w-12 h-12 bg-amber-400 border border-black rounded-xl flex items-center justify-center shadow-lg relative group-hover:scale-105 transition-transform">
                      <div className="w-5 h-5 bg-pink-500 rounded-full border border-black flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[7px] px-1 rounded scale-90">UPDATED</span>
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">
                      {progress.unlockedCodeRoute ? 'Skyline 256' : 'Flappy Someth.'}
                    </span>
                  </button>

                  {/* ViewTube App */}
                  <button 
                    onClick={() => handleLaunchApp('viewtube')}
                    className="flex flex-col items-center justify-center space-y-1 text-center group"
                    id="launcher-viewtube"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Tv className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">ViewTube</span>
                  </button>

                  {/* AmazeMart App */}
                  <button 
                    onClick={() => handleLaunchApp('amazemart')}
                    className="flex flex-col items-center justify-center space-y-1 text-center group"
                    id="launcher-amazemart"
                  >
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-5 h-5 text-indigo-950" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">AmazeMart</span>
                  </button>

                  {/* Browser Wayback Web Snapshot */}
                  <button 
                    onClick={() => handleLaunchApp('browser')}
                    className="flex flex-col items-center justify-center space-y-1 text-center group"
                    id="launcher-browser"
                  >
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-md border border-slate-700 group-hover:scale-105 transition-transform">
                      <Globe className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">Wayback</span>
                  </button>

                  {/* FaceSpace Social */}
                  <button 
                    onClick={() => handleLaunchApp('social')}
                    className="flex flex-col items-center justify-center space-y-1 text-center group"
                    id="launcher-social"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">FaceSpace</span>
                  </button>

                  {/* Messages App */}
                  <button 
                    onClick={() => handleLaunchApp('messages')}
                    className="flex flex-col items-center justify-center space-y-1 text-center group"
                    id="launcher-messages"
                  >
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5 text-white" />
                      {!progress.unlockedCodeRoute && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">Messages</span>
                  </button>

                  {/* Obsolete Printed Screenshots (Only unlocked after ordering on AmazeMart) */}
                  <button 
                    disabled={!progress.deliveredPhone}
                    onClick={() => handleLaunchApp('screenshots')}
                    className={`flex flex-col items-center justify-center space-y-1 text-center group ${
                      !progress.deliveredPhone ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                    id="launcher-screenshots"
                  >
                    <div className="w-12 h-12 bg-stone-700 rounded-xl flex items-center justify-center shadow-md border border-stone-600 group-hover:scale-105 transition-transform">
                      <FolderHeart className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">Schematics</span>
                  </button>

                  {/* Concept Information / Stop Killing Games */}
                  <button 
                    onClick={() => handleLaunchApp('about')}
                    className="flex flex-col items-center justify-center space-y-1 text-center group"
                    id="launcher-about"
                  >
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md border border-slate-800 group-hover:scale-105 transition-transform">
                      <Info className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 truncate max-w-full">Concept</span>
                  </button>

                </div>
              </div>

              {/* Home Bezel bottom indicator */}
              <div className="text-[9px] text-center text-slate-600 font-mono pb-2">
                MODEL: ARC_LITE_PH • OS: LAOS_V12.1
              </div>
            </motion.div>
          )}

          {activeApp === 'flappy' && (
            <motion.div
              key="flappy"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0"
            >
              <FlappyGame 
                progress={progress} 
                updateProgress={updateProgress} 
                onHome={handleHomeButton} 
              />
            </motion.div>
          )}

          {activeApp === 'viewtube' && (
            <motion.div
              key="viewtube"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0"
            >
              <ViewTube progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'amazemart' && (
            <motion.div
              key="amazemart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0"
            >
              <AmazeMart 
                progress={progress} 
                updateProgress={updateProgress} 
                onOpenScreenshots={() => setActiveApp('screenshots')} 
              />
            </motion.div>
          )}

          {activeApp === 'screenshots' && (
            <motion.div
              key="screenshots"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0"
            >
              <SavedScreenshots progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'browser' && (
            <motion.div
              key="browser"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0"
            >
              <BrowserApp progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0"
            >
              <SocialApp progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0"
            >
              <MessagesApp progress={progress} updateProgress={updateProgress} />
            </motion.div>
          )}

          {activeApp === 'about' && (
            /* CONCEPTS / LORE PAGE */
            <motion.div
              key="about"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-slate-900 p-4 overflow-y-auto space-y-4 text-slate-100 font-sans"
              id="concept-info-page"
            >
              <div className="border-b border-slate-800 pb-2 flex items-center gap-2 mt-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="font-display font-black text-sm text-white">THE STOP KILLING GAMES CONCEPT</h2>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p>
                  <strong className="text-white">SKG: Scorekeeper</strong> is a creative interactive homage to the global <strong className="text-amber-400">"Stop Killing Games"</strong> campaign, exploring game preservation and consumer ownership rights.
                </p>

                <p>
                  Today, large automation and gaming corporations hold massive software catalog assets. When a device becomes obsolete or a backend server turns off, decades of human creativity, original art, and stories are programmatically replaced by high-yield slop, or erased entirely.
                </p>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1 font-mono text-[10px] text-slate-400">
                  <div className="font-bold text-white uppercase text-[11px] mb-1 text-amber-500">How to Play Guide:</div>
                  <div>1. Open **Flappy Something** and die at 37 points.</div>
                  <div>2. Examine the controversial replay in **ViewTube**.</div>
                  <div>3. Search and order the obsolete schematic in **AmazeMart**.</div>
                  <div>4. Use **Wayback Browser** (2014) to investigate Silver Kite Games.</div>
                  <div>5. Explore Noah Kade's FaceSpace and message archives.</div>
                  <div>6. Fly matching altitude sequences near Gate 37.</div>
                </div>

                <p className="text-[10px] text-slate-500 font-mono">
                  Created for digital preservation awareness. Thank you for exploring.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Physical iPhone Home Button bar */}
      <div className="h-10 bg-black flex items-center justify-center border-t border-slate-900" id="phone-footer">
        <button
          onClick={handleHomeButton}
          className="w-1/3 h-1 bg-slate-600 rounded-full hover:bg-white active:bg-slate-400 transition-colors"
          title="Home Screen"
          id="home-swipe-indicator"
        />
      </div>

    </div>
  );
};
