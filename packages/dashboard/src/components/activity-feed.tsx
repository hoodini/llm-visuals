'use client';

import { useFilteredRequests } from '@/hooks/use-request-store';
import { formatDuration, formatTokens, formatTime, PROVIDER_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Clock, Zap } from 'lucide-react';

export function ActivityFeed() {
  const requests = useFilteredRequests();
  const recent = requests.slice(0, 20);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-1 p-3">
      <div className="flex items-center gap-2 px-2 mb-2">
        <Zap className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Live Activity</span>
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
              isStreaming ? 'bg-amber-500/[0.03] border border-amber-500/5' : 'hover:bg-white/[0.02]'
            )}
          >
            {/* Direction arrow */}
            <div className={cn(
              'shrink-0',
              r.completedAt ? 'text-zinc-700' : 'text-amber-500'
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
            <span className="font-mono text-zinc-400 truncate max-w-[140px]">
              {r.model || 'unknown'}
            </span>

            {/* Streaming indicator */}
            {isStreaming && (
              <span className="flex items-center gap-1 text-amber-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
              </span>
            )}

            <span className="flex-1" />

            {/* Tokens */}
            {r.outputTokens > 0 && (
              <span className="font-mono text-zinc-600">
                {formatTokens(r.outputTokens)}
              </span>
            )}

            {/* Duration */}
            <span className="font-mono text-zinc-600 w-14 text-right">
              {formatDuration(r.duration)}
            </span>

            {/* Time */}
            <span className="font-mono text-zinc-700 w-14 text-right text-[10px]">
              {formatTime(r.startedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
