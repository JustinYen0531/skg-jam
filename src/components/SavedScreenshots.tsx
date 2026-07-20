import React, { useState } from 'react';
import { GameProgress } from '../types';
import audio from '../lib/audio';
import { completePuzzleChapter } from '../lib/chapterProgress';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, RotateCw, X, ZoomIn } from 'lucide-react';

interface SavedScreenshotsProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

export const SavedScreenshots: React.FC<SavedScreenshotsProps> = ({ progress, updateProgress }) => {
  const [activeSheet, setActiveSheet] = useState<number | null>(null);

  const sheets = [
    {
      id: 1,
      title: 'Lumen Arc Home Screen Printout',
      subtitle: 'Capturing state of the original LAOS App Catalog (circa 2014)',
      angle: -4,
      bg: 'bg-[#faf6e8]', // warm paper look
      textColor: 'text-amber-950',
      content: (
        <div className="space-y-4 text-amber-900 font-sans p-2">
          <div className="border-b-2 border-amber-900/20 pb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold">SPEC: LAOS_UI_METRIC_71</span>
            <span className="text-[10px] bg-amber-200 text-amber-800 px-1 rounded">2014-04-12</span>
          </div>

          <div className="flex items-center gap-3 bg-white/40 p-2.5 rounded border border-amber-900/10">
            {/* Old App Icon */}
            <div className="w-12 h-12 bg-amber-950 rounded-xl flex flex-col items-center justify-center border-2 border-amber-900/20 relative shadow-inner">
              <div className="text-[8px] font-mono text-amber-200 font-bold uppercase tracking-widest scale-75">SKG</div>
              <div className="w-5 h-5 bg-amber-400 rounded-full border border-amber-900 mt-1 relative">
                <div className="absolute w-1 h-1 bg-black rounded-full top-1 right-1"></div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-700 font-bold">App Catalog Listing #412</div>
              <h4 className="font-display font-black text-sm text-amber-950">SKG: Skyline 256</h4>
              <p className="text-[9px] text-amber-800">Developer ID: <span className="underline font-mono">SilverKite_Games</span></p>
            </div>
          </div>

          <p className="text-[10px] leading-relaxed">
            *Note:* Unlike normal endless games, <span className="font-bold">Skyline 256</span> requires the player to navigate exactly 256 gates to trigger the final termination buffer.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Calibration Schematic: Flight Coordinates',
      subtitle: 'Mapping mechanical parameters within the physics loop',
      angle: 3,
      bg: 'bg-[#f0f9ff]', // light blue blueprint paper
      textColor: 'text-sky-950',
      content: (
        <div className="space-y-3 text-sky-900 font-sans p-2">
          <div className="border-b-2 border-sky-900/20 pb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold">SYS_MAP: ENGINE_COORD_104</span>
            <span className="text-[10px] bg-sky-200 text-sky-800 px-1 rounded font-bold">CALIBRATED</span>
          </div>

          <div className="space-y-2 text-[10px] font-mono bg-sky-950/5 p-2 rounded border border-sky-900/10">
            <div className="flex justify-between border-b border-sky-900/10 pb-1">
              <span className="font-bold">PARAMETER</span>
              <span className="font-bold">DEFINITION & LIMITS</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>🚀 ALTITUDE (ALT)</span>
              <span className="font-bold text-sky-950">Y-axis bounds [0 - 256m]</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>🚪 GATE (GATE)</span>
              <span className="font-bold text-sky-950">Obstacle sequence [0 - 256]</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>🏁 END (END)</span>
              <span className="font-bold text-sky-950">Signed integer overflow limit</span>
            </div>
          </div>

          <div className="text-[9px] leading-relaxed text-sky-800 border-t border-sky-900/10 pt-2 italic">
            "These three variables compose the core execution frame of Noah's test flight module. ALT, GATE, and END must align."
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Magazine Q&A Excerpt',
      subtitle: 'Hand-marked section of an obsolete mobile industry catalog',
      angle: -1,
      bg: 'bg-[#fafaf9]', // simple white paper
      textColor: 'text-stone-900',
      content: (
        <div className="space-y-4 text-stone-900 font-sans p-2">
          <div className="border-b-2 border-stone-200 pb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold text-stone-400">ARCHIVE_DOC: SK_INTERVIEW_09</span>
            <span className="text-[10px] text-stone-500 italic">Page 18</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-800">Q: Why did you call your game 'Skyline 256'?</div>
            <p className="text-[10px] leading-relaxed text-stone-600 bg-stone-100 p-2 rounded border border-stone-200">
              <span className="font-bold text-stone-900">Noah Kade:</span> "Because 256 represents the ultimate gate, the final ceiling. The game has an ending. No one was ever meant to flap forever. If you must know, my favorite numbers are <span className="bg-yellow-200 px-1 py-0.5 rounded font-bold font-mono text-black">184-40-256</span>. They map directly to how the flight path connects our parameters."
            </p>
          </div>

          <p className="text-[9px] text-red-600 leading-tight border-t border-dashed border-red-200 pt-2">
            ✏️ *Handwritten scribbled pen note in the margin:* "Mara, these numbers compose our paths. Remember they map directly to our ALT, GATE, and END parameters."
          </p>
        </div>
      ),
    },
  ];

  const handleZoom = (idx: number) => {
    // Paper coming closer under glass; the clue chime only on the first
    // sheet that actually unlocks something (§4.7, §4.8).
    audio.play('screenshot.zoom');
    if (idx === 0 && !progress.discoveredOriginalTitle) {
      audio.play('story.clueUnlock', { delay: 0.25 });
    }
    setActiveSheet(idx);

    if (idx === 0) {
      updateProgress((prev) => completePuzzleChapter(prev, 4, { discoveredOriginalTitle: true }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--laos-bg)] text-[var(--laos-text)] font-sans overflow-hidden" id="screenshots-root">

      {/* Viewer chrome: this app arrived with the migration and still draws
          itself in the old system's language. The paper is the only warmth. */}
      <div className="bg-[var(--laos-surface)] p-3 border-b border-[var(--laos-line)] flex items-center justify-between" id="spec-header">
        <div className="flex items-center gap-1.5 font-laos font-semibold text-xs text-[var(--laos-text)] tracking-wide">
          <FileText className="w-4 h-4 text-[var(--laos-dim)]" strokeWidth={1.5} />
          <span>Lumen Arc Printed Schematics</span>
        </div>
        <span className="laos-label text-[8px] border border-[var(--laos-line-dim)] bg-[var(--laos-bg)] px-2 py-0.5">
          STATUS: EXAMINING 3 SHEETS
        </span>
      </div>

      {/* Grid of papers */}
      <div className="flex-1 p-3.5 flex flex-col justify-center gap-3 relative overflow-y-auto" id="spec-workspace">
        <div className="font-laos text-[10px] text-[var(--laos-dim)] text-center">
          Click any printed paper to zoom in and read the structural details closely.
        </div>

        {/* Paper Cards overlapping layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative" id="spec-pile">
          {sheets.map((sheet, index) => (
            <motion.div
              key={sheet.id}
              onClick={() => handleZoom(index)}
              whileHover={{ scale: 1.02, rotate: sheet.angle * 0.8 }}
              style={{ rotate: `${sheet.angle}deg` }}
              className={`relative paper-texture paper-crease p-3 rounded-sm shadow-[0_10px_24px_rgba(0,0,0,0.45)] cursor-pointer border border-black/20 flex flex-col justify-between ${sheet.bg} ${sheet.textColor} min-h-[95px] overflow-hidden`}
            >
              {/* Staple in the top-left corner */}
              <span className="absolute -top-0.5 left-6 w-3 h-1.5 bg-gradient-to-b from-stone-400 to-stone-600 rounded-sm rotate-[8deg] shadow-sm pointer-events-none"></span>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-black text-xs leading-tight">{sheet.title}</h4>
                  <p className="text-[8px] opacity-70 leading-normal">{sheet.subtitle}</p>
                </div>
                <ZoomIn className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </div>
              <div className="text-[8px] text-right font-mono opacity-50 mt-1">SHEET_0{sheet.id}_PRINT</div>
            </motion.div>
          ))}
        </div>

        {/* Zoomed Overlay Detail Modal */}
        <AnimatePresence>
          {activeSheet !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 p-4 flex flex-col justify-center z-50 font-sans"
              id="spec-modal"
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className={`paper-texture halftone-zoom p-4 rounded-sm shadow-2xl max-h-full overflow-y-auto flex flex-col justify-between ${sheets[activeSheet].bg} ${sheets[activeSheet].textColor}`}
              >
                <div>
                  <div className="flex justify-between items-start border-b border-current pb-2 mb-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-mono opacity-60">PRINTED SCHEMATIC EXCERPT</span>
                      <h3 className="font-display font-black text-sm">{sheets[activeSheet].title}</h3>
                    </div>
                    <button
                      onClick={() => {
                        audio.play('phone.modalClose');
                        setActiveSheet(null);
                      }}
                      className="p-1 rounded-full hover:bg-black/10 transition-colors"
                      id="spec-close-button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {sheets[activeSheet].content}
                </div>

                <div className="mt-4 border-t border-dashed border-current/20 pt-2 flex justify-between items-center text-[9px] opacity-60 font-mono">
                  <span>UNBOXED DIRECTORY SOURCE: EXTRACED_LUMEN_ARC.ZIP</span>
                  <span>SHEET_0{sheets[activeSheet].id}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
