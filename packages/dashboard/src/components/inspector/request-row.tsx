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
    r.statusCode === null ? 'text-amber-400'
    : r.statusCode >= 200 && r.statusCode < 300 ? 'text-emerald-400'
    : r.statusCode >= 400 ? 'text-red-400'
    : 'text-[#55555e]';

  const providerColor = PROVIDER_COLORS[r.provider] || '#55555e';

  return (
    <button
      onClick={() => setSelectedId(isSelected ? null : r.id)}
      className={cn(
        'w-full text-left px-4 py-2 border-b border-[rgba(255,255,255,0.025)] transition-all flex items-center gap-3 group',
        index === 0 && 'animate-slide-in',
        isSelected && 'bg-amber-500/[0.04] border-l-2 border-l-amber-400',
        !isSelected && 'hover:bg-[rgba(255,255,255,0.015)]',
        isStreaming && !isSelected && 'stream-line'
      )}
    >
      {/* Status */}
      <div className="shrink-0 w-6 flex justify-center">
        {r.statusCode === null ? (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot" />
        ) : (
          <span className={cn('font-mono text-[11px] font-medium text-tabular', statusColor)}>{r.statusCode}</span>
        )}
      </div>

      {/* Provider */}
      <span
        className="text-[10px] font-bold uppercase tracking-wider shrink-0 w-8 text-tabular"
        style={{ color: providerColor }}
      >
        {r.provider === 'anthropic' ? 'ANT' : r.provider === 'openai' ? 'OAI' : 'GEM'}
      </span>

      {/* Model */}
      <span className="text-[11px] text-[#8b8b96] font-mono truncate min-w-0 max-w-[160px]">
        {r.model || 'unknown'}
      </span>

      {/* Context dots */}
      <div className="flex items-center gap-1 shrink-0">
        {r.totalMessageCount > 0 && <span className="text-[9px] text-[#3a3a42] font-mono">{r.totalMessageCount}m</span>}
        {r.hasThinkingBlocks && <span className="w-1 h-1 rounded-full bg-pink-400/70" />}
        {r.hasToolUse && <span className="w-1 h-1 rounded-full bg-emerald-400/70" />}
        {r.hasCacheControl && <span className="w-1 h-1 rounded-full bg-amber-400/70" />}
      </div>

      {/* Path */}
      <span className="text-[10px] text-[#2a2a32] font-mono truncate flex-1 min-w-0">{r.path}</span>

      {/* Streaming */}
      {isStreaming && (
        <span className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
          <span className="text-[9px] text-amber-400 font-mono">STREAM</span>
        </span>
      )}

      {/* Duration */}
      <span className="text-[11px] text-[#55555e] font-mono w-14 text-right shrink-0 text-tabular">{formatDuration(r.duration)}</span>

      {/* Tokens */}
      <span className="text-[11px] text-[#3a3a42] font-mono w-14 text-right shrink-0 text-tabular">
        {r.outputTokens > 0 ? formatTokens(r.outputTokens) : '-'}
      </span>

      {/* Cost */}
      <span className={cn(
        'text-[11px] font-mono w-14 text-right shrink-0 text-tabular',
        r.estimatedCost > 0.01 ? 'text-emerald-500/60' : 'text-[#2a2a32]'
      )}>
        {r.estimatedCost > 0 ? formatCost(r.estimatedCost) : '-'}
      </span>

      {/* Time */}
      <span className="text-[10px] text-[#2a2a32] font-mono w-14 text-right shrink-0 text-tabular">{formatTime(r.startedAt)}</span>
    </button>
  );
}
