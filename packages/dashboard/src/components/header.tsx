'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { Activity, Wifi, WifiOff, Zap, DollarSign, Timer, Eye } from 'lucide-react';
import { cn, formatCost, formatTokens } from '@/lib/utils';

export function Header() {
  const wsStatus = useRequestStore((s) => s.wsStatus);
  const metrics = useRequestStore((s) => s.metrics);

  return (
    <header className="h-14 border-b border-white/[0.04] flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-950/20 via-background to-blue-950/20 animate-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Eye className="w-5 h-5 text-violet-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-400 rounded-full animate-pulse-dot" />
          </div>
          <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            LLM Visuals
          </h1>
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Observatory</span>
      </div>

      <div className="relative flex items-center gap-5 text-sm">
        {metrics && metrics.totalRequests > 0 && (
          <>
            {/* Live request counter */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/[0.08] border border-violet-500/10">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-mono text-sm font-bold text-violet-300 animate-count-up">
                {metrics.totalRequests}
              </span>
              <span className="text-[10px] text-violet-500 uppercase">reqs</span>
            </div>

            {/* Token counter */}
            <div className="flex items-center gap-2 text-zinc-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-xs">
                {formatTokens(metrics.totalInputTokens + metrics.totalOutputTokens)}
              </span>
              <span className="text-[10px] text-zinc-600">tokens</span>
            </div>

            {/* Cost counter */}
            {metrics.totalCost > 0 && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-xs text-emerald-300">
                  {formatCost(metrics.totalCost)}
                </span>
              </div>
            )}

            {/* Active streams */}
            {metrics.activeStreams > 0 && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/[0.08] border border-amber-500/10">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot" />
                <span className="font-mono text-xs text-amber-300">{metrics.activeStreams}</span>
                <span className="text-[10px] text-amber-500">live</span>
              </div>
            )}
          </>
        )}

        {/* Connection status */}
        <div
          className={cn(
            'flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-full transition-all duration-500',
            wsStatus === 'connected' && 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/10',
            wsStatus === 'connecting' && 'bg-amber-500/[0.08] text-amber-400 border border-amber-500/10',
            wsStatus === 'disconnected' && 'bg-red-500/[0.08] text-red-400 border border-red-500/10'
          )}
        >
          {wsStatus === 'connected' ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {wsStatus === 'connected' ? 'live' : wsStatus}
        </div>
      </div>
    </header>
  );
}
