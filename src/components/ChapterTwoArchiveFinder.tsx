import React, { useState } from 'react';
import { Download, FileArchive, Search, ShieldCheck } from 'lucide-react';
import audio from '../lib/audio';

type ArchivePackage = 'ipa' | 'ipx' | 'ipp' | 'ips' | 'zip';

const PACKAGE_TYPES: readonly { id: ArchivePackage; extension: string; label: string }[] = [
  { id: 'ipx', extension: '.ipx', label: 'Install profile exchange' },
  { id: 'ipp', extension: '.ipp', label: 'Incremental patch package' },
  { id: 'ipa', extension: '.ipa', label: 'Application install archive' },
  { id: 'ips', extension: '.ips', label: 'System crash report' },
  { id: 'zip', extension: '.zip', label: 'Generic compressed bundle' },
];

interface ChapterTwoArchiveFinderProps {
  downloaded: boolean;
  onDownload: () => void;
}

/** Chapter 2's evidence path: infer the package suffix before the filename appears. */
export const ChapterTwoArchiveFinder: React.FC<ChapterTwoArchiveFinderProps> = ({ downloaded, onDownload }) => {
  const [selectedPackage, setSelectedPackage] = useState<ArchivePackage | null>(null);
  const [selectedFile, setSelectedFile] = useState(false);

  const choosePackage = (packageType: ArchivePackage) => {
    audio.playTick();
    setSelectedPackage(packageType);
    setSelectedFile(false);
  };

  if (selectedFile) {
    return (
      <section className="space-y-3" id="chapter-two-archive-record">
        <div className="rounded border border-amber-400/25 bg-amber-400/[0.06] p-3">
          <div className="font-mono text-[8px] tracking-[0.18em] text-amber-200/70">PRESERVED PACKAGE RECORD</div>
          <h2 className="mt-1 flex items-center gap-2 text-sm font-bold text-amber-100"><FileArchive className="h-4 w-4" /> Skyline256_LAOS_Final.ipa</h2>
        </div>
        <div className="space-y-2 rounded border border-slate-700 bg-slate-900/60 p-3 text-[10px] leading-relaxed text-slate-300">
          <div className="flex justify-between gap-3"><span className="text-slate-500">Build target</span><span className="font-mono text-slate-100">LAOS 4.1</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Required device</span><span className="font-mono text-slate-100">Lumen Arc</span></div>
          <div className="border-t border-slate-700 pt-2 text-amber-100/90">Native barometric altitude sensor input required. Touch-only devices are not supported.</div>
        </div>
        {downloaded ? (
          <div className="flex items-center gap-2 rounded border border-emerald-400/25 bg-emerald-400/[0.07] p-2.5 text-[10px] font-bold text-emerald-200" id="chapter-two-download-success">
            <ShieldCheck className="h-4 w-4" /> Skyline256_LAOS_Final.ipa saved to local archive
          </div>
        ) : (
          <button type="button" onClick={onDownload} className="flex w-full items-center justify-center gap-2 rounded border border-amber-300/30 bg-amber-200/10 px-3 py-2.5 text-[11px] font-bold text-amber-100 hover:bg-amber-200/15" id="chapter-two-download-ipa">
            <Download className="h-4 w-4" /> Download preserved build
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-3" id="chapter-two-archive-finder">
      <div className="rounded border border-white/[0.08] bg-slate-900/70 p-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white"><Search className="h-4 w-4 text-blue-300" /> Archive Finder</div>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">Old game data is indexed by package suffix. Match the archive type before opening its file list.</p>
      </div>
      <div className="grid grid-cols-1 gap-1.5" id="chapter-two-package-types">
        {PACKAGE_TYPES.map((packageType) => (
          <button key={packageType.id} type="button" onClick={() => choosePackage(packageType.id)} className={`flex items-center justify-between rounded border px-3 py-2 text-left transition-colors ${selectedPackage === packageType.id ? 'border-blue-300/50 bg-blue-400/10 text-blue-100' : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600'}`} data-package-type={packageType.id}>
            <span className="font-mono text-[11px] font-bold">{packageType.extension}</span><span className="text-[9px] text-slate-500">{packageType.label}</span>
          </button>
        ))}
      </div>
      {selectedPackage === 'ipa' && (
        <div className="space-y-1.5 rounded border border-slate-700 bg-black/20 p-2" id="chapter-two-ipa-results">
          <div className="px-1 text-[8px] font-mono tracking-[0.14em] text-slate-500">4 PACKAGE RECORDS</div>
          <button type="button" onClick={() => { audio.playTick(); setSelectedFile(true); }} className="w-full rounded border border-amber-300/25 bg-amber-200/[0.07] px-2.5 py-2 text-left font-mono text-[10px] text-amber-100 hover:bg-amber-200/[0.13]" id="chapter-two-skyline-ipa">Skyline256_LAOS_Final.ipa</button>
          <div className="px-2.5 py-1 text-[9px] text-slate-500">Skyline256_demo_03.ipa · incomplete</div>
          <div className="px-2.5 py-1 text-[9px] text-slate-500">Skyline_256_localization.ipa · language pack</div>
          <div className="px-2.5 py-1 text-[9px] text-slate-500">SkyRun256_testflight.ipa · expired signature</div>
        </div>
      )}
      {selectedPackage !== null && selectedPackage !== 'ipa' && <div className="rounded border border-slate-800 bg-black/20 p-2.5 text-[10px] text-slate-500" id="chapter-two-wrong-package">No complete Skyline build recorded under this package type.</div>}
    </section>
  );
};
