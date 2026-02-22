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
      ? 'text-amber-500'
      : r.statusCode >= 200 && r.statusCode < 300
        ? 'text-emerald-500'
        : r.statusCode >= 400
          ? 'text-red-500'
          : 'text-slate-500';

  const providerColor = PROVIDER_COLORS[r.provider] || '#71717a';

  return (
    <button
      onClick={() => setSelectedId(isSelected ? null : r.id)}
      className={cn(
        'w-full text-left px-4 py-2.5 border-b border-slate-100 transition-all duration-200 flex items-center gap-3 group',
        index === 0 && 'animate-slide-in',
        isSelected && 'bg-violet-50 border-l-[3px] border-l-violet-500 shadow-inner shadow-violet-500/5',
        !isSelected && 'hover:bg-slate-50/80',
        isStreaming && !isSelected && 'animate-shimmer'
      )}
    >
      {/* Status dot */}
      <div className="shrink-0 w-6 flex justify-center">
        {r.statusCode === null ? (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse-dot shadow-sm shadow-amber-400/50" />
        ) : (
          <span className={cn('font-mono text-[11px] font-bold', statusColor)}>
            {r.statusCode}
          </span>
        )}
      </div>

      {/* Provider badge */}
      <div
        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm"
        style={{
          backgroundColor: `${providerColor}18`,
          border: `1px solid ${providerColor}30`,
          color: providerColor,
        }}
      >
        {r.provider === 'anthropic' ? 'ANT' : r.provider === 'openai' ? 'OAI' : 'GEM'}
      </div>

      {/* Model name */}
      <span className="text-[11px] text-slate-700 font-mono font-medium truncate min-w-0 max-w-[160px]">
        {r.model || 'unknown'}
      </span>

      {/* Context badges */}
      <div className="flex items-center gap-1 shrink-0">
        {r.totalMessageCount > 0 && (
          <span className="text-[9px] text-slate-400 font-mono">{r.totalMessageCount}msg</span>
        )}
        {r.hasThinkingBlocks && (
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-sm shadow-pink-400/50" title="Thinking" />
        )}
        {r.hasToolUse && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="Tool Use" />
        )}
        {r.hasCacheControl && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" title="Cache" />
        )}
      </div>

      {/* Path */}
      <span className="text-[10px] text-slate-300 font-mono truncate flex-1 min-w-0">
        {r.path}
      </span>

      {/* Streaming indicator */}
      {isStreaming && (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-md shadow-amber-400/20 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
          <span className="text-[9px] text-white font-bold">STREAMING</span>
        </span>
      )}

      {/* Duration */}
      <span className="text-[11px] text-slate-500 font-mono w-14 text-right shrink-0">
        {formatDuration(r.duration)}
      </span>

      {/* Tokens */}
      <span className="text-[11px] text-slate-400 font-mono w-14 text-right shrink-0">
        {r.outputTokens > 0 ? formatTokens(r.outputTokens) : '-'}
      </span>

      {/* Cost */}
      <span className={cn(
        'text-[11px] font-mono w-14 text-right shrink-0 font-medium',
        r.estimatedCost > 0.01 ? 'text-emerald-600' : 'text-slate-300'
      )}>
        {r.estimatedCost > 0 ? formatCost(r.estimatedCost) : '-'}
      </span>

      {/* Time */}
      <span className="text-[10px] text-slate-300 font-mono w-14 text-right shrink-0">
        {formatTime(r.startedAt)}
      </span>
    </button>
  );
}
