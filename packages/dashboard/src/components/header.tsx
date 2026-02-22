'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { Activity, Wifi, WifiOff, DollarSign } from 'lucide-react';
import { cn, formatCost, formatTokens } from '@/lib/utils';

export function Header() {
  const wsStatus = useRequestStore((s) => s.wsStatus);
  const metrics = useRequestStore((s) => s.metrics);

  return (
    <header className="h-14 border-b border-violet-100/80 flex items-center justify-between px-6 shrink-0 relative bg-white/95 backdrop-blur-xl z-20">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/20 via-fuchsia-400/10 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
          <span className="text-white text-sm font-bold font-display">V</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="font-display text-[15px] font-bold tracking-tight text-foreground">
            LLM Visuals
          </h1>
          <span className="text-[9px] text-violet-400 font-mono font-medium tracking-[0.2em]">LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-tabular">
        {metrics && metrics.totalRequests > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-foreground">{metrics.totalRequests}</span>
              <span className="text-[9px] text-[#9f95b8] font-medium">requests</span>
            </div>

            <div className="w-px h-4 bg-violet-200/50" />

            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-violet-400" />
              <span className="font-mono text-xs text-[#4c4460]">{formatTokens(metrics.totalInputTokens + metrics.totalOutputTokens)}</span>
              <span className="text-[9px] text-[#9f95b8] font-medium">tokens</span>
            </div>

            {metrics.totalCost > 0 && (
              <>
                <div className="w-px h-4 bg-violet-200/50" />
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500" />
                  <span className="font-mono text-xs font-medium text-emerald-600">{formatCost(metrics.totalCost)}</span>
                </div>
              </>
            )}

            {metrics.activeStreams > 0 && (
              <>
                <div className="w-px h-4 bg-violet-200/50" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse-dot" />
                  <span className="font-mono text-xs font-medium text-violet-600">{metrics.activeStreams} streaming</span>
                </div>
              </>
            )}
          </>
        )}

        <div className="w-px h-4 bg-violet-200/50" />

        <div className={cn(
          'flex items-center gap-1.5 text-[10px] font-mono uppercase font-semibold tracking-wide',
          wsStatus === 'connected' && 'text-emerald-600',
          wsStatus === 'connecting' && 'text-amber-600',
          wsStatus === 'disconnected' && 'text-red-400'
        )}>
          {wsStatus === 'connected' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {wsStatus === 'connected' ? 'connected' : wsStatus}
        </div>
      </div>
    </header>
  );
}
