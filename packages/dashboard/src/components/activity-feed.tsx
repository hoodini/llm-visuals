'use client';

import { useFilteredRequests } from '@/hooks/use-request-store';
import { formatDuration, formatTokens, formatTime, PROVIDER_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';

export function ActivityFeed() {
  const requests = useFilteredRequests();
  const recent = requests.slice(0, 20);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-1 p-3">
      <div className="flex items-center gap-2 px-2 mb-3">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 shadow-md shadow-violet-500/20">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Live Activity</span>
      </div>
      {recent.map((r, i) => {
        const isStreaming = !r.completedAt && r.isStreaming;
        const providerColor = PROVIDER_COLORS[r.provider];

        return (
          <div
            key={r.id}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all',
              i === 0 && 'animate-slide-in',
              isStreaming
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm'
                : 'hover:bg-slate-50 rounded-xl'
            )}
          >
            {/* Direction arrow */}
            <div className={cn(
              'shrink-0 p-1 rounded-md',
              r.completedAt ? 'text-slate-400 bg-slate-50' : 'text-amber-500 bg-amber-50'
            )}>
              {r.completedAt ? (
                <ArrowDownLeft className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
            </div>

            {/* Provider dot */}
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: providerColor }}
            />

            {/* Model */}
            <span className="font-mono text-slate-600 truncate max-w-[140px] font-medium">
              {r.model || 'unknown'}
            </span>

            {/* Streaming indicator */}
            {isStreaming && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                <span className="text-[9px] text-white font-bold">LIVE</span>
              </span>
            )}

            <span className="flex-1" />

            {/* Tokens */}
            {r.outputTokens > 0 && (
              <span className="font-mono text-slate-400 font-medium">
                {formatTokens(r.outputTokens)}
              </span>
            )}

            {/* Duration */}
            <span className="font-mono text-slate-400 w-14 text-right">
              {formatDuration(r.duration)}
            </span>

            {/* Time */}
            <span className="font-mono text-slate-300 w-14 text-right text-[10px]">
              {formatTime(r.startedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
