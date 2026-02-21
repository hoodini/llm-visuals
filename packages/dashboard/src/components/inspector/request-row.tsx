'use client';

import type { RequestRecord } from '@/lib/types';
import { useRequestStore } from '@/hooks/use-request-store';
import { cn, formatDuration, formatTokens, formatCost, formatTime, PROVIDER_COLORS } from '@/lib/utils';

export function RequestRow({ record: r, index }: { record: RequestRecord; index: number }) {
  const selectedId = useRequestStore((s) => s.selectedId);
  const setSelectedId = useRequestStore((s) => s.setSelectedId);
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

  const providerColor = PROVIDER_COLORS[r.provider] || '#71717a';

  return (
    <button
      onClick={() => setSelectedId(isSelected ? null : r.id)}
      className={cn(
        'w-full text-left px-4 py-2.5 border-b border-white/[0.02] transition-all duration-200 flex items-center gap-3 group',
        index === 0 && 'animate-slide-in',
        isSelected && 'bg-violet-500/[0.06] border-l-2 border-l-violet-500',
        !isSelected && 'hover:bg-white/[0.02]',
        isStreaming && !isSelected && 'animate-shimmer'
      )}
    >
      {/* Status dot */}
      <div className="shrink-0 w-6 flex justify-center">
        {r.statusCode === null ? (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse-dot" />
        ) : (
          <span className={cn('font-mono text-[11px] font-medium', statusColor)}>
            {r.statusCode}
          </span>
        )}
      </div>

      {/* Provider badge with color accent */}
      <div
        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border"
        style={{
          backgroundColor: `${providerColor}10`,
          borderColor: `${providerColor}20`,
          color: providerColor,
        }}
      >
        {r.provider === 'anthropic' ? 'ANT' : r.provider === 'openai' ? 'OAI' : 'GEM'}
      </div>

      {/* Model name */}
      <span className="text-[11px] text-zinc-300 font-mono truncate min-w-0 max-w-[160px]">
        {r.model || 'unknown'}
      </span>

      {/* Path - subtle */}
      <span className="text-[10px] text-zinc-700 font-mono truncate flex-1 min-w-0">
        {r.path}
      </span>

      {/* Streaming indicator */}
      {isStreaming && (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/[0.08] border border-amber-500/10 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
          <span className="text-[9px] text-amber-400 font-medium">STREAMING</span>
        </span>
      )}

      {/* Duration */}
      <span className="text-[11px] text-zinc-500 font-mono w-14 text-right shrink-0">
        {formatDuration(r.duration)}
      </span>

      {/* Tokens */}
      <span className="text-[11px] text-zinc-600 font-mono w-14 text-right shrink-0">
        {r.outputTokens > 0 ? formatTokens(r.outputTokens) : '-'}
      </span>

      {/* Cost - green tint */}
      <span className={cn(
        'text-[11px] font-mono w-14 text-right shrink-0',
        r.estimatedCost > 0.01 ? 'text-emerald-500/70' : 'text-zinc-700'
      )}>
        {r.estimatedCost > 0 ? formatCost(r.estimatedCost) : '-'}
      </span>

      {/* Time */}
      <span className="text-[10px] text-zinc-700 font-mono w-14 text-right shrink-0">
        {formatTime(r.startedAt)}
      </span>
    </button>
  );
}
