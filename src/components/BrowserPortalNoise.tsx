import React from 'react';
import { Activity, Archive, BadgePercent, CloudSun, MessageSquareText, Newspaper, Radio, ShieldCheck } from 'lucide-react';

type PortalSurface = 'search' | 'archive';
type PortalSide = 'left' | 'right';

interface BrowserPortalNoiseProps {
  surface: PortalSurface;
  side: PortalSide;
}

const SEARCH_HEADLINES = [
  ['Morning commute apps quietly raise subscription prices', 'Technology · 18 min'],
  ['City council approves another waterfront redesign study', 'Local · 42 min'],
  ['Why everyone is suddenly collecting obsolete chargers', 'Culture · 1 hr'],
] as const;

const SEARCH_POSTS = [
  ['@softreset', 'does anyone else miss websites that simply ended'],
  ['@harborwatch', 'fog rolled in before the forecast again'],
  ['@receiptbox', 'my smart kettle sent me a terms update'],
] as const;

const ARCHIVE_NOTES = [
  ['Why signed mobile builds stop opening', 'Preservation guide · 6 min'],
  ['The carrier portals that vanished overnight', 'Field notes · 9 min'],
  ['Reading device names from damaged manifests', 'Workshop · 4 min'],
] as const;

const ARCHIVE_POSTS = [
  ['pixel_sleeper', 'Trying to identify a 176×208 racing game from one screenshot.'],
  ['checksumkid', 'Uploaded a clean catalog scan. The actual mirror is still gone.'],
  ['s60collector', 'Found the box, manual, and receipt. Naturally, no installer.'],
] as const;

const RailCard: React.FC<React.PropsWithChildren<{ title: string; icon?: React.ReactNode; label?: string }>> = ({ title, icon, label, children }) => (
  <section className="overflow-hidden rounded-md border border-white/[0.07] bg-slate-900/35" data-browser-noise-card={title}>
    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-2.5 py-2">
      <div className="flex min-w-0 items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {icon}<span className="truncate">{title}</span>
      </div>
      {label && <span className="shrink-0 font-mono text-[6px] uppercase text-slate-600">{label}</span>}
    </div>
    <div className="p-2.5">{children}</div>
  </section>
);

export const BrowserPortalNoise: React.FC<BrowserPortalNoiseProps> = ({ surface, side }) => {
  if (surface === 'search' && side === 'left') {
    return (
      <aside className="space-y-2.5" aria-label="SearchFinder news and local information" id="searchfinder-left-rail">
        <RailCard title="Morning Brief" icon={<Newspaper className="h-3 w-3" />} label="Live">
          <div className="space-y-2.5">
            {SEARCH_HEADLINES.map(([headline, meta], index) => (
              <article key={headline} className="border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
                <div className="mb-1 font-mono text-[7px] text-blue-300/60">0{index + 1}</div>
                <h3 className="text-[8px] leading-snug text-slate-300">{headline}</h3>
                <p className="mt-1 text-[6px] text-slate-600">{meta}</p>
              </article>
            ))}
          </div>
        </RailCard>
        <RailCard title="Harborview" icon={<CloudSun className="h-3 w-3" />} label="Weather">
          <div className="flex items-end justify-between">
            <div><div className="text-xl font-light text-slate-200">9°</div><div className="text-[7px] text-slate-500">Clouds after midnight</div></div>
            <div className="text-right font-mono text-[6px] leading-relaxed text-slate-600">H 13°<br />L 6°</div>
          </div>
        </RailCard>
        <RailCard title="Market Pulse" icon={<Activity className="h-3 w-3" />} label="Delayed">
          <div className="space-y-1.5 font-mono text-[7px]">
            <div className="flex justify-between"><span className="text-slate-500">TECH100</span><span className="text-emerald-400/70">+0.42%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">MEDIA</span><span className="text-rose-400/70">-1.08%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">ARCHIVE</span><span className="text-slate-500">—</span></div>
          </div>
        </RailCard>
      </aside>
    );
  }

  if (surface === 'search') {
    return (
      <aside className="space-y-2.5" aria-label="SearchFinder community and sponsored information" id="searchfinder-right-rail">
        <RailCard title="Around the Web" icon={<MessageSquareText className="h-3 w-3" />} label="Posts">
          <div className="space-y-2.5">
            {SEARCH_POSTS.map(([handle, post]) => (
              <article key={handle} className="border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
                <div className="font-mono text-[7px] text-cyan-300/60">{handle}</div>
                <p className="mt-1 text-[8px] leading-snug text-slate-400">{post}</p>
              </article>
            ))}
          </div>
        </RailCard>
        <RailCard title="CloudShelf Pro" icon={<BadgePercent className="h-3 w-3" />} label="Sponsored">
          <p className="text-[8px] leading-relaxed text-slate-400">Store every memory forever.* Search none of them successfully.</p>
          <div className="mt-2 rounded border border-blue-400/15 bg-blue-400/[0.05] px-2 py-1.5 text-center text-[7px] font-semibold text-blue-200/70">Try 14 days free</div>
          <p className="mt-1.5 text-[5px] leading-tight text-slate-700">*Forever subject to plan availability and revised storage limits.</p>
        </RailCard>
        <RailCard title="Signal Desk" icon={<Radio className="h-3 w-3" />} label="Auto">
          <div className="space-y-1.5 text-[7px] text-slate-500">
            <div className="flex justify-between"><span>News refresh</span><span className="text-emerald-400/60">online</span></div>
            <div className="flex justify-between"><span>Personalization</span><span>98%</span></div>
            <div className="flex justify-between"><span>Useful results</span><span>pending</span></div>
          </div>
        </RailCard>
      </aside>
    );
  }

  if (side === 'left') {
    return (
      <aside className="space-y-2.5" aria-label="Archive preservation articles and index status" id="archive-left-rail">
        <RailCard title="Preservation Desk" icon={<Newspaper className="h-3 w-3" />} label="Articles">
          <div className="space-y-2.5">
            {ARCHIVE_NOTES.map(([headline, meta]) => (
              <article key={headline} className="border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
                <h3 className="text-[8px] leading-snug text-slate-300">{headline}</h3>
                <p className="mt-1 text-[6px] text-slate-600">{meta}</p>
              </article>
            ))}
          </div>
        </RailCard>
        <RailCard title="Index Health" icon={<Activity className="h-3 w-3" />} label="30 days">
          <div className="space-y-2 font-mono text-[7px]">
            <div><div className="flex justify-between text-slate-500"><span>Metadata</span><span>92%</span></div><div className="mt-1 h-1 overflow-hidden rounded bg-slate-800"><div className="h-full w-[92%] bg-slate-500" /></div></div>
            <div><div className="flex justify-between text-slate-500"><span>Mirrors</span><span>34%</span></div><div className="mt-1 h-1 overflow-hidden rounded bg-slate-800"><div className="h-full w-[34%] bg-slate-600" /></div></div>
            <div><div className="flex justify-between text-slate-500"><span>Signatures</span><span>11%</span></div><div className="mt-1 h-1 overflow-hidden rounded bg-slate-800"><div className="h-full w-[11%] bg-slate-700" /></div></div>
          </div>
        </RailCard>
        <RailCard title="Browse Years" icon={<Archive className="h-3 w-3" />}>
          <div className="grid grid-cols-3 gap-1 font-mono text-[7px] text-slate-500">
            {['2004', '2007', '2009', '2011', '2014', '2016'].map((year) => <span key={year} className="rounded border border-white/[0.05] px-1 py-1 text-center">{year}</span>)}
          </div>
        </RailCard>
      </aside>
    );
  }

  return (
    <aside className="space-y-2.5" aria-label="Archive community activity and service notices" id="archive-right-rail">
      <RailCard title="Community Notes" icon={<MessageSquareText className="h-3 w-3" />} label="Recent">
        <div className="space-y-2.5">
          {ARCHIVE_POSTS.map(([handle, post]) => (
            <article key={handle} className="border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
              <div className="font-mono text-[7px] text-violet-300/60">{handle}</div>
              <p className="mt-1 text-[8px] leading-snug text-slate-400">{post}</p>
            </article>
          ))}
        </div>
      </RailCard>
      <RailCard title="RecoverLab" icon={<ShieldCheck className="h-3 w-3" />} label="Sponsored">
        <p className="text-[8px] leading-relaxed text-slate-400">Mail us your unreadable drives. We return the files, a report, or a very confident invoice.</p>
        <div className="mt-2 text-[7px] font-semibold text-slate-300">Diagnostics from $89</div>
      </RailCard>
      <RailCard title="Rights & Removal" icon={<ShieldCheck className="h-3 w-3" />} label="Notice">
        <p className="text-[7px] leading-relaxed text-slate-500">Records describe historical software. Availability does not imply permission, compatibility, safety, or continued existence.</p>
      </RailCard>
    </aside>
  );
};
