import React, { useMemo, useState } from 'react';
import { Archive, ChevronLeft, FileArchive, Search, TriangleAlert } from 'lucide-react';
import audio from '../lib/audio';

type ArchiveFormat = 'ipa' | 'apk' | 'jar' | 'sis' | 'zip';

interface ArchiveRecord {
  name: string;
  platform: string;
  year: string;
  status: string;
  target?: boolean;
}

const ARCHIVE_FORMATS: readonly { id: ArchiveFormat; extension: string; label: string }[] = [
  { id: 'ipa', extension: '.ipa', label: 'iOS application packages' },
  { id: 'apk', extension: '.apk', label: 'Android application packages' },
  { id: 'jar', extension: '.jar', label: 'Java mobile archives' },
  { id: 'sis', extension: '.sis', label: 'Symbian installers' },
  { id: 'zip', extension: '.zip', label: 'Compressed collections' },
];

const ARCHIVE_RECORDS: Readonly<Record<ArchiveFormat, readonly ArchiveRecord[]>> = {
  ipa: [
    { name: 'AuroraDrift_1.4.2.ipa', platform: 'iOS 5', year: '2012', status: 'Mirror unavailable' },
    { name: 'PocketWeather_2.1.ipa', platform: 'iOS 4', year: '2011', status: 'Signature missing' },
    { name: 'Skyline256_demo_03.ipa', platform: 'LAOS / iOS', year: '2013', status: 'Incomplete upload' },
    { name: 'Skyline256_LAOS_Final.ipa', platform: 'LAOS 4.1', year: '2014', status: 'Compatibility check', target: true },
    { name: 'Skyline_256_localization.ipa', platform: 'iOS 6', year: '2014', status: 'Language data only' },
    { name: 'SkyRun256_testflight.ipa', platform: 'iOS 6', year: '2013', status: 'Expired signature' },
  ],
  apk: [
    { name: 'CinderKart_1.3.9.apk', platform: 'Android 2.3', year: '2012', status: 'Mirror unavailable' },
    { name: 'MarbleRelay_demo.apk', platform: 'Android 4.0', year: '2013', status: 'Metadata only' },
    { name: 'NeonCourier_HD.apk', platform: 'Android 4.1', year: '2014', status: 'Checksum only' },
    { name: 'TunnelSprint_release17.apk', platform: 'Android 2.2', year: '2011', status: 'Mirror offline' },
  ],
  jar: [
    { name: 'NightBus_J2ME.jar', platform: 'Java ME', year: '2008', status: 'Manifest damaged' },
    { name: 'OrbitDrop_176x208.jar', platform: 'MIDP 2.0', year: '2007', status: 'Mirror unavailable' },
    { name: 'TowerSignal_S40.jar', platform: 'Series 40', year: '2009', status: 'Certificate expired' },
    { name: 'Windward_MIDP2.jar', platform: 'Java ME', year: '2010', status: 'Metadata only' },
  ],
  sis: [
    { name: 'ClockworkVale_N95.sis', platform: 'Symbian S60', year: '2008', status: 'Certificate expired' },
    { name: 'HarborLights_S60v3.sis', platform: 'Symbian S60', year: '2009', status: 'Mirror unavailable' },
    { name: 'PaperGlider_UIQ3.sis', platform: 'Symbian UIQ', year: '2007', status: 'Package damaged' },
    { name: 'StaticGarden_E71.sis', platform: 'Symbian S60', year: '2010', status: 'Metadata only' },
  ],
  zip: [
    { name: 'lost_mobile_catalog_2012.zip', platform: 'Mixed', year: '2012', status: 'Index only' },
    { name: 'manual_scans_batch_07.zip', platform: 'Documents', year: '2016', status: 'Mirror unavailable' },
    { name: 'skyline256_presskit_2014.zip', platform: 'Press assets', year: '2014', status: 'Archive damaged' },
    { name: 'touch_arcade_mirrors_03.zip', platform: 'Mixed', year: '2010', status: 'Takedown hold' },
  ],
};

interface ChapterTwoArchiveFinderProps {
  attempted: boolean;
  onCompatibilityDiscovered: () => void;
}

export const ChapterTwoArchiveFinder: React.FC<ChapterTwoArchiveFinderProps> = ({ attempted, onCompatibilityDiscovered }) => {
  const [selectedFormat, setSelectedFormat] = useState<ArchiveFormat>('zip');
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(false);

  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return ARCHIVE_RECORDS[selectedFormat];
    return ARCHIVE_RECORDS[selectedFormat].filter((record) => record.name.toLowerCase().includes(normalizedQuery));
  }, [query, selectedFormat]);

  const chooseFormat = (format: ArchiveFormat) => {
    audio.playTick();
    setSelectedFormat(format);
    setQuery('');
    setSelectedFile(false);
  };

  const attemptToOpen = () => {
    audio.play('ui.disabled');
    if (!attempted) onCompatibilityDiscovered();
  };

  if (selectedFile) {
    return (
      <section className="mx-auto max-w-xl space-y-3" id="chapter-two-archive-record">
        <button type="button" onClick={() => { audio.playTick(); setSelectedFile(false); }} className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-slate-300">
          <ChevronLeft className="h-3 w-3" /> Back to .ipa records
        </button>
        <article className="overflow-hidden rounded-md border border-white/[0.08] bg-slate-900/55">
          <header className="border-b border-white/[0.07] px-4 py-3">
            <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-slate-500">Package record / AR-2014-0414</div>
            <h2 className="mt-1 flex items-center gap-2 font-mono text-[12px] font-semibold text-slate-200"><FileArchive className="h-4 w-4 text-slate-500" /> Skyline256_LAOS_Final.ipa</h2>
          </header>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 px-4 py-3 text-[9px]">
            <div><span className="block text-slate-600">Package type</span><span className="text-slate-300">IPA application package</span></div>
            <div><span className="block text-slate-600">Indexed</span><span className="text-slate-300">14 Apr 2014</span></div>
            <div><span className="block text-slate-600">Build target</span><span className="text-slate-300">LAOS 4.1</span></div>
            <div><span className="block text-slate-600">Integrity</span><span className="text-slate-300">Archive complete</span></div>
          </div>
        </article>

        {attempted ? (
          <div className="rounded-md border border-rose-400/25 bg-rose-400/[0.06] p-3" id="chapter-two-device-unsupported">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-100"><TriangleAlert className="h-4 w-4" /> This device cannot open this package</div>
            <p className="mt-1.5 text-[9px] leading-relaxed text-slate-400">IPA application packages are not supported on the current device.</p>
            <div className="mt-2 border-t border-rose-200/10 pt-2 text-[9px] text-slate-300">Compatible hardware required: <span className="font-semibold text-slate-100">Lumen Arc</span> running LAOS 4.1 with its native altitude sensor.</div>
          </div>
        ) : (
          <button type="button" onClick={attemptToOpen} className="w-full rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-800" id="chapter-two-open-ipa">
            Open preserved package
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl space-y-4" id="chapter-two-archive-finder">
      <header className="rounded-md border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-950/40 px-4 py-4">
        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-100"><Archive className="h-4 w-4 text-slate-400" /> Old Game File Index</div>
        <p className="mt-1.5 max-w-md text-[9px] leading-relaxed text-slate-400">A community-maintained index of discontinued mobile games, public mirrors, demo builds, manuals, and package metadata.</p>
        <div className="mt-3 flex gap-4 border-t border-white/[0.06] pt-2 font-mono text-[8px] text-slate-600"><span>18,406 records</span><span>2004–2016</span><span>Mirrors checked monthly</span></div>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${selectedFormat.toUpperCase()} filenames`} className="w-full rounded-md border border-white/[0.08] bg-black/20 py-2 pl-9 pr-3 text-[10px] text-slate-300 outline-none placeholder:text-slate-600 focus:border-slate-600" id="chapter-two-archive-search" />
      </div>

      <nav className="flex flex-wrap gap-1.5 border-b border-white/[0.07] pb-2" aria-label="Package formats" id="chapter-two-package-formats">
        {ARCHIVE_FORMATS.map((format) => (
          <button key={format.id} type="button" onClick={() => chooseFormat(format.id)} className={`rounded-full border px-2.5 py-1 text-[9px] transition-colors ${selectedFormat === format.id ? 'border-slate-500 bg-slate-700/50 text-slate-100' : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700 hover:text-slate-300'}`} data-package-format={format.id} title={format.label}>
            {format.extension}
          </button>
        ))}
      </nav>

      <div className="overflow-hidden rounded-md border border-white/[0.07] bg-black/15" id={`chapter-two-${selectedFormat}-records`}>
        <div className="grid grid-cols-[minmax(0,1fr)_72px_42px_90px] gap-2 border-b border-white/[0.07] px-3 py-1.5 text-[7px] font-semibold uppercase tracking-wider text-slate-600">
          <span>Filename</span><span>Platform</span><span>Year</span><span>Status</span>
        </div>
        {visibleRecords.length > 0 ? visibleRecords.map((record) => (
          <button key={record.name} type="button" disabled={!record.target} onClick={() => { audio.playTick(); setSelectedFile(true); }} className="grid w-full grid-cols-[minmax(0,1fr)_72px_42px_90px] gap-2 border-b border-white/[0.05] px-3 py-2 text-left text-[8px] last:border-b-0 enabled:hover:bg-white/[0.035] disabled:cursor-default" data-archive-file={record.name}>
            <span className="truncate font-mono text-slate-300">{record.name}</span><span className="truncate text-slate-500">{record.platform}</span><span className="text-slate-500">{record.year}</span><span className="truncate text-slate-600">{record.status}</span>
          </button>
        )) : (
          <div className="px-3 py-8 text-center text-[9px] text-slate-600">No filenames in this category match your search.</div>
        )}
      </div>
      <p className="text-[8px] leading-relaxed text-slate-600">This index preserves catalog information. Some original mirrors are unavailable, incomplete, unsigned, or require discontinued hardware.</p>
    </section>
  );
};
