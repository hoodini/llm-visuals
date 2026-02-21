'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { RequestRow } from './request-row';
import { Search, Filter } from 'lucide-react';

export function RequestList() {
  const requests = useRequestStore((s) => s.getFilteredRequests());
  const filters = useRequestStore((s) => s.filters);
  const setFilters = useRequestStore((s) => s.setFilters);

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filter bar */}
      <div className="p-3 border-b border-zinc-800 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search requests, models, prompts..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['anthropic', 'openai', 'gemini'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilters({ provider: filters.provider === p ? null : p })}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filters.provider === p
                  ? p === 'anthropic'
                    ? 'bg-orange-500/20 text-orange-400'
                    : p === 'openai'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {p === 'anthropic' ? 'Anthropic' : p === 'openai' ? 'OpenAI' : 'Gemini'}
            </button>
          ))}
        </div>
      </div>

      {/* Request rows */}
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
            <Filter className="w-10 h-10 text-zinc-700" />
            <p className="text-sm">No requests captured yet</p>
            <p className="text-xs text-zinc-600 max-w-xs text-center">
              Configure your LLM client to use the proxy and start making requests
            </p>
          </div>
        ) : (
          requests.map((r) => <RequestRow key={r.id} record={r} />)
        )}
      </div>
    </div>
  );
}
