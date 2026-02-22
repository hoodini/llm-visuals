'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { Activity, Wifi, WifiOff, Zap, DollarSign, Eye } from 'lucide-react';
import { cn, formatCost, formatTokens } from '@/lib/utils';

export function Header() {
  const wsStatus = useRequestStore((s) => s.wsStatus);
  const metrics = useRequestStore((s) => s.metrics);

  return (
    <header className="h-12 border-b border-[rgba(124,58,237,0.06)] flex items-center justify-between px-5 shrink-0 relative bg-white/90 backdrop-blur-md z-20">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/10">
          <Eye className="w-4 h-4 text-violet-500" />
        </div>
        <h1 className="font-display text-[14px] font-bold tracking-tight text-foreground">
          LLM Visuals
        </h1>
        <span className="text-[9px] text-[#9f95b8] font-mono uppercase tracking-[0.15em]">OBS</span>
      </div>

      <div className="flex items-center gap-3 text-tabular">
        {metrics && metrics.totalRequests > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-violet-500" />
              <span className="font-mono text-xs font-bold text-foreground">{metrics.totalRequests}</span>
              <span className="text-[9px] text-[#9f95b8]">REQ</span>
            </div>

            <div className="w-px h-3 bg-[rgba(124,58,237,0.08)]" />

            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#9f95b8]" />
              <span className="font-mono text-xs text-[#4c4460]">{formatTokens(metrics.totalInputTokens + metrics.totalOutputTokens)}</span>
            </div>

            {metrics.totalCost > 0 && (
              <>
                <div className="w-px h-3 bg-[rgba(124,58,237,0.08)]" />
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500/70" />
                  <span className="font-mono text-xs text-emerald-600">{formatCost(metrics.totalCost)}</span>
                </div>
              </>
            )}

            {metrics.activeStreams > 0 && (
              <>
                <div className="w-px h-3 bg-[rgba(124,58,237,0.08)]" />
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse-dot" />
                  <span className="font-mono text-xs text-violet-600">{metrics.activeStreams}</span>
                  <span className="text-[9px] text-violet-400">LIVE</span>
                </div>
              </>
            )}
          </>
        )}

        <div className="w-px h-3 bg-[rgba(124,58,237,0.08)]" />

        <div className={cn(
          'flex items-center gap-1.5 text-[10px] font-mono uppercase font-medium',
          wsStatus === 'connected' && 'text-emerald-600',
          wsStatus === 'connecting' && 'text-amber-600',
          wsStatus === 'disconnected' && 'text-red-400'
        )}>
          {wsStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {wsStatus === 'connected' ? 'live' : wsStatus}
        </div>
      </div>
    </header>
  );
}
