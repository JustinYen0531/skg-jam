import React from 'react';
import { BadgePercent, MapPin, PackageCheck, SlidersHorizontal } from 'lucide-react';

export type AmazeMartDepartment = 'all' | 'deals' | 'tech' | 'home' | 'trending';
export type AmazeMartPriceFilter = 'all' | 'under-25' | 'rated-45';

interface AmazeMartSidebarProps {
  department: AmazeMartDepartment;
  priceFilter: AmazeMartPriceFilter;
  searchMode: boolean;
  onDepartmentChange: (department: AmazeMartDepartment) => void;
  onPriceFilterChange: (filter: AmazeMartPriceFilter) => void;
}

const DEPARTMENTS: readonly { id: AmazeMartDepartment; label: string; count: string }[] = [
  { id: 'all', label: 'All departments', count: '9' },
  { id: 'deals', label: 'Deals & clearance', count: '5' },
  { id: 'tech', label: 'Electronics', count: '5' },
  { id: 'home', label: 'Home & living', count: '4' },
  { id: 'trending', label: 'Trending now', count: '3' },
];

const PRICE_FILTERS: readonly { id: AmazeMartPriceFilter; label: string }[] = [
  { id: 'all', label: 'Any price' },
  { id: 'under-25', label: 'Under $25' },
  { id: 'rated-45', label: '4.5★ & up' },
];

export const AmazeMartSidebar: React.FC<AmazeMartSidebarProps> = ({
  department,
  priceFilter,
  searchMode,
  onDepartmentChange,
  onPriceFilterChange,
}) => (
  <aside className="sticky top-0 space-y-2.5" aria-label="AmazeMart shopping filters" id="am-sidebar">
    <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/80" id="am-sidebar-departments">
      <header className="flex items-center gap-1.5 border-b border-slate-800 px-2.5 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-slate-300">
        <SlidersHorizontal className="h-3 w-3 text-amber-400" /> Shop departments
      </header>
      <nav className="space-y-0.5 p-1.5" aria-label="Shop departments">
        {DEPARTMENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={searchMode}
            onClick={() => onDepartmentChange(item.id)}
            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[8px] transition-colors ${department === item.id ? 'bg-amber-400/10 text-amber-300' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'} disabled:cursor-default disabled:opacity-45`}
            data-am-department={item.id}
          >
            <span>{item.label}</span><span className="font-mono text-[6px] text-slate-600">{item.count}</span>
          </button>
        ))}
      </nav>
    </section>

    <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/80" id="am-sidebar-filters">
      <header className="border-b border-slate-800 px-2.5 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-slate-300">Quick filters</header>
      <div className="space-y-1 p-2">
        {PRICE_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={searchMode}
            onClick={() => onPriceFilterChange(item.id)}
            className="flex w-full items-center gap-1.5 rounded py-1 text-left text-[8px] text-slate-500 disabled:cursor-default disabled:opacity-45"
            data-am-price-filter={item.id}
          >
            <span className={`h-2.5 w-2.5 rounded-full border ${priceFilter === item.id ? 'border-amber-300 bg-amber-300 shadow-[inset_0_0_0_2px_#0f172a]' : 'border-slate-600'}`} />
            <span>{item.label}</span>
          </button>
        ))}
        {searchMode && <p className="border-t border-slate-800 pt-1.5 text-[6px] leading-relaxed text-slate-600">Broad-match search is temporarily ignoring storefront filters.</p>}
      </div>
    </section>

    <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5" id="am-sidebar-delivery">
      <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-300"><MapPin className="h-3 w-3 text-amber-400" /> Deliver to Harborview</div>
      <p className="mt-1.5 text-[7px] leading-relaxed text-slate-500">Next estimated window<br /><span className="font-mono text-slate-300">08:00–11:00*</span></p>
      <div className="mt-2 flex items-center gap-1 border-t border-slate-800 pt-2 text-[6px] text-emerald-400/70"><PackageCheck className="h-3 w-3" /> 2,481 couriers nearby-ish</div>
    </section>

    <section className="rounded-lg border border-amber-400/15 bg-gradient-to-br from-amber-400/[0.08] to-slate-900/70 p-2.5" id="am-sidebar-sponsored">
      <div className="flex items-center gap-1 text-[6px] font-mono uppercase tracking-wider text-amber-300/70"><BadgePercent className="h-3 w-3" /> Member-ish</div>
      <p className="mt-1 text-[8px] font-bold leading-snug text-slate-300">Pay less shipping by buying considerably more.</p>
      <p className="mt-1.5 text-[5px] leading-relaxed text-slate-600">Terms, fees, minimums, and new terms may apply before checkout.</p>
    </section>
  </aside>
);
