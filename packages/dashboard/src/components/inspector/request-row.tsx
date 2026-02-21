'use client';

import type { RequestRecord } from '@/lib/types';
import { useRequestStore } from '@/hooks/use-request-store';
import { cn, formatDuration, formatTokens, formatCost, formatTime, PROVIDER_COLORS } from '@/lib/utils';

export function RequestRow({ record: r }: { record: RequestRecord }) {
  const selectedId = useRequestStore((s) => s.selectedId);
  const setSelectedId = useRequestStore((s) => s.setSelectedId);
  const streamingText = useRequestStore((s) => s.streamingChunks.get(r.id));
  const isStreaming = !r.completedAt && r.isStreaming;
  const isSelected = selectedId === r.id;

  const statusColor =
    r.statusCode === null
      ? 'text-amber-400'
      : r.statusCode >= 200 && r.statusCode < 300
        ? 'text-emerald-400'
        : r.statusCode >= 400
          ? 'text-red-400'
          : 'text-zinc-400';

  return (
    <button
      onClick={() => setSelectedId(isSelected ? null : r.id)}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors flex items-center gap-3 group',
        isSelected && 'bg-zinc-900/80 border-l-2 border-l-violet-500'
      )}
    >
      {/* Status */}
      <div className={cn('font-mono text-xs w-8 shrink-0', statusColor)}>
        {r.statusCode ?? (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot inline-block" />
        )}
      </div>

      {/* Provider badge */}
      <div
        className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0"
        style={{
          backgroundColor: `${PROVIDER_COLORS[r.provider]}15`,
          color: PROVIDER_COLORS[r.provider],
        }}
      >
        {r.provider.slice(0, 3)}
      </div>

      {/* Model */}
      <span className="text-xs text-zinc-300 font-mono truncate min-w-0 max-w-[180px]">
        {r.model || 'unknown'}
      </span>

      {/* Path */}
      <span className="text-xs text-zinc-600 font-mono truncate flex-1 min-w-0">
        {r.method} {r.path}
      </span>

      {/* Streaming indicator */}
      {isStreaming && (
        <span className="text-[10px] text-amber-400 flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
          streaming
        </span>
      )}

      {/* Duration */}
      <span className="text-xs text-zinc-500 font-mono w-16 text-right shrink-0">
        {formatDuration(r.duration)}
      </span>

      {/* Tokens */}
      <span className="text-xs text-zinc-500 font-mono w-16 text-right shrink-0">
        {r.outputTokens > 0 ? formatTokens(r.outputTokens) + ' tok' : '-'}
      </span>

      {/* Cost */}
      <span className="text-xs text-zinc-500 font-mono w-16 text-right shrink-0">
        {r.estimatedCost > 0 ? formatCost(r.estimatedCost) : '-'}
      </span>

      {/* Time */}
      <span className="text-[10px] text-zinc-600 font-mono w-16 text-right shrink-0">
        {formatTime(r.startedAt)}
      </span>
    </button>
  );
}
