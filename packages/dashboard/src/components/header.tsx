'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { Activity, Wifi, WifiOff, Zap, DollarSign, Eye } from 'lucide-react';
import { cn, formatCost, formatTokens } from '@/lib/utils';

export function Header() {
  const wsStatus = useRequestStore((s) => s.wsStatus);
  const metrics = useRequestStore((s) => s.metrics);

  return (
    <header className="h-12 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between px-5 shrink-0 relative bg-[#0a0a0f]/80">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/10">
          <Eye className="w-4 h-4 text-amber-400" />
        </div>
        <h1 className="font-display text-[13px] font-bold tracking-tight text-foreground">
          LLM Visuals
        </h1>
        <span className="text-[9px] text-[#3a3a42] font-mono uppercase tracking-[0.15em]">OBS</span>
      </div>

      <div className="flex items-center gap-3 text-tabular">
        {metrics && metrics.totalRequests > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="font-mono text-xs font-bold text-foreground">{metrics.totalRequests}</span>
              <span className="text-[9px] text-[#55555e]">REQ</span>
            </div>

            <div className="w-px h-3 bg-[rgba(255,255,255,0.05)]" />

            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#55555e]" />
              <span className="font-mono text-xs text-[#8b8b96]">{formatTokens(metrics.totalInputTokens + metrics.totalOutputTokens)}</span>
            </div>

            {metrics.totalCost > 0 && (
              <>
                <div className="w-px h-3 bg-[rgba(255,255,255,0.05)]" />
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500/50" />
                  <span className="font-mono text-xs text-emerald-400">{formatCost(metrics.totalCost)}</span>
                </div>
              </>
            )}

            {metrics.activeStreams > 0 && (
              <>
                <div className="w-px h-3 bg-[rgba(255,255,255,0.05)]" />
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
                  <span className="font-mono text-xs text-amber-400">{metrics.activeStreams}</span>
                  <span className="text-[9px] text-amber-500/50">LIVE</span>
                </div>
              </>
            )}
          </>
        )}

        <div className="w-px h-3 bg-[rgba(255,255,255,0.05)]" />

        <div className={cn(
          'flex items-center gap-1.5 text-[10px] font-mono uppercase',
          wsStatus === 'connected' && 'text-emerald-500',
          wsStatus === 'connecting' && 'text-amber-500',
          wsStatus === 'disconnected' && 'text-red-400/70'
        )}>
          {wsStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {wsStatus === 'connected' ? 'live' : wsStatus}
        </div>
      </div>
    </header>
  );
}
