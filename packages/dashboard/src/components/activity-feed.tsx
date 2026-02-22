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
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] text-[#55555e] uppercase tracking-widest font-bold">Live Activity</span>
      </div>
      {recent.map((r, i) => {
        const isStreaming = !r.completedAt && r.isStreaming;
        const providerColor = PROVIDER_COLORS[r.provider];

        return (
          <div
            key={r.id}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all',
              i === 0 && 'animate-slide-in',
              isStreaming
                ? 'bg-amber-500/[0.04] border border-amber-500/10'
                : 'hover:bg-[rgba(255,255,255,0.02)]'
            )}
          >
            {/* Direction arrow */}
            <div className={cn(
              'shrink-0 p-1 rounded-md',
              r.completedAt ? 'text-[#3a3a42]' : 'text-amber-400'
            )}>
              {r.completedAt ? (
                <ArrowDownLeft className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
            </div>

            {/* Provider dot */}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: providerColor }}
            />

            {/* Model */}
            <span className="font-mono text-[#8b8b96] truncate max-w-[140px] font-medium text-[11px]">
              {r.model || 'unknown'}
            </span>

            {/* Streaming indicator */}
            {isStreaming && (
              <span className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
                <span className="text-[9px] text-amber-400 font-mono">LIVE</span>
              </span>
            )}

            <span className="flex-1" />

            {/* Tokens */}
            {r.outputTokens > 0 && (
              <span className="font-mono text-[#3a3a42] font-medium text-[11px]">
                {formatTokens(r.outputTokens)}
              </span>
            )}

            {/* Duration */}
            <span className="font-mono text-[#55555e] w-14 text-right text-[11px]">
              {formatDuration(r.duration)}
            </span>

            {/* Time */}
            <span className="font-mono text-[#2a2a32] w-14 text-right text-[10px]">
              {formatTime(r.startedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
