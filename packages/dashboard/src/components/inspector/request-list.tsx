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
      {/* Search + filters */}
      <div className="p-3 border-b border-[rgba(255,255,255,0.04)] flex items-center gap-3 bg-[#0a0a0f]/60">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3a3a42]" />
          <input
            type="text"
            placeholder="Search models, prompts, responses..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full bg-[#0d0d12] border border-[rgba(255,255,255,0.05)] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-foreground placeholder:text-[#3a3a42] focus:outline-none focus:border-amber-500/25 focus:ring-1 focus:ring-amber-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['anthropic', 'openai', 'gemini'] as const).map((p) => {
            const cfg = {
              anthropic: { active: 'text-orange-400 border-orange-500/20 bg-orange-500/8', label: 'ANT' },
              openai: { active: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/8', label: 'OAI' },
              gemini: { active: 'text-blue-400 border-blue-500/20 bg-blue-500/8', label: 'GEM' },
            };
            const isActive = filters.provider === p;
            return (
              <button
                key={p}
                onClick={() => setFilters({ provider: isActive ? null : p })}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border',
                  isActive
                    ? cfg[p].active
                    : 'border-transparent text-[#3a3a42] hover:text-[#55555e]'
                )}
              >
                {cfg[p].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Column headers */}
      {hasAnyRequests && (
        <div className="flex items-center gap-3 px-4 py-1 text-[9px] text-[#3a3a42] uppercase tracking-widest font-medium border-b border-[rgba(255,255,255,0.03)]">
          <span className="w-6 text-center">ST</span>
          <span className="w-8">SRC</span>
          <span className="max-w-[160px]">Model</span>
          <span className="flex-1">Path</span>
          <span className="w-14 text-right">Time</span>
          <span className="w-14 text-right">Tokens</span>
          <span className="w-14 text-right">Cost</span>
          <span className="w-14 text-right">When</span>
        </div>
      )}

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {!hasAnyRequests ? (
          <SetupGuide />
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 animate-fade-in">
            <p className="text-sm text-[#55555e]">No matching requests</p>
            <p className="text-xs text-[#3a3a42]">Try adjusting your filters</p>
          </div>
        ) : (
          requests.map((r, i) => <RequestRow key={r.id} record={r} index={i} />)
        )}
      </div>

      {/* Status bar */}
      {hasAnyRequests && (
        <div className="px-4 py-1.5 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[10px] text-[#3a3a42] font-mono">
          <span>{requests.length} requests</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            Proxy connected
          </span>
        </div>
      )}
    </div>
  );
}
