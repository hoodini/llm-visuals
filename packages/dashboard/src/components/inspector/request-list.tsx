'use client';

import { useRequestStore, useFilteredRequests } from '@/hooks/use-request-store';
import { RequestRow } from './request-row';
import { SetupGuide } from '../setup-guide';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RequestList() {
  const requests = useFilteredRequests();
  const filters = useRequestStore((s) => s.filters);
  const setFilters = useRequestStore((s) => s.setFilters);

  const hasAnyRequests = useRequestStore((s) => s.orderedIds.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filter bar */}
      <div className="p-3 border-b border-slate-200/60 flex items-center gap-3 bg-white/70 backdrop-blur-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search models, prompts, responses..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['anthropic', 'openai', 'gemini'] as const).map((p) => {
            const colors = {
              anthropic: { active: 'bg-orange-500 text-white shadow-lg shadow-orange-500/25', label: 'Anthropic' },
              openai: { active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25', label: 'OpenAI' },
              gemini: { active: 'bg-blue-500 text-white shadow-lg shadow-blue-500/25', label: 'Gemini' },
            };
            const isActive = filters.provider === p;
            return (
              <button
                key={p}
                onClick={() => setFilters({ provider: isActive ? null : p })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                  isActive
                    ? colors[p].active
                    : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                )}
              >
                {colors[p].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Column headers */}
      {hasAnyRequests && (
        <div className="flex items-center gap-3 px-4 py-1.5 text-[9px] text-slate-400 uppercase tracking-widest font-semibold border-b border-slate-100 bg-slate-50/80">
          <span className="w-6 text-center">ST</span>
          <span className="w-10">SRC</span>
          <span className="max-w-[160px]">Model</span>
          <span className="flex-1">Path</span>
          <span className="w-14 text-right">Time</span>
          <span className="w-14 text-right">Tokens</span>
          <span className="w-14 text-right">Cost</span>
          <span className="w-14 text-right">When</span>
        </div>
      )}

      {/* Request rows or setup guide */}
      <div className="flex-1 overflow-y-auto bg-white/40">
        {!hasAnyRequests ? (
          <SetupGuide />
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 animate-fade-in">
            <p className="text-sm font-medium">No matching requests</p>
            <p className="text-xs text-slate-300">Try adjusting your filters</p>
          </div>
        ) : (
          requests.map((r, i) => <RequestRow key={r.id} record={r} index={i} />)
        )}
      </div>

      {/* Bottom status bar */}
      {hasAnyRequests && (
        <div className="px-4 py-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-white/70 backdrop-blur-sm">
          <span>{requests.length} requests shown</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            Proxy connected
          </span>
        </div>
      )}
    </div>
  );
}
