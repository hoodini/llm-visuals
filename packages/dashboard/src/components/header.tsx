'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { Activity, Wifi, WifiOff, Zap, DollarSign, Timer, Eye } from 'lucide-react';
import { cn, formatCost, formatTokens } from '@/lib/utils';

export function Header() {
  const wsStatus = useRequestStore((s) => s.wsStatus);
  const metrics = useRequestStore((s) => s.metrics);

  return (
    <header className="h-16 border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
      {/* Vibrant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-50 via-white to-pink-50" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 opacity-60" />

      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse-dot border-2 border-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight gradient-text">
              LLM Visuals
            </h1>
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.2em]">Observatory</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-4 text-sm">
        {metrics && metrics.totalRequests > 0 && (
          <>
            {/* Live request counter */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span className="font-mono text-sm font-bold text-white animate-count-up">
                {metrics.totalRequests}
              </span>
              <span className="text-[10px] text-violet-200 uppercase">reqs</span>
            </div>

            {/* Token counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/60">
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-mono text-xs font-semibold text-cyan-700">
                {formatTokens(metrics.totalInputTokens + metrics.totalOutputTokens)}
              </span>
              <span className="text-[10px] text-cyan-400">tokens</span>
            </div>

            {/* Cost counter */}
            {metrics.totalCost > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-mono text-xs font-semibold text-emerald-700">
                  {formatCost(metrics.totalCost)}
                </span>
              </div>
            )}

            {/* Active streams */}
            {metrics.activeStreams > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-amber-400/25">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />
                <span className="font-mono text-xs font-bold text-white">{metrics.activeStreams}</span>
                <span className="text-[10px] text-amber-100">live</span>
              </div>
            )}
          </>
        )}

        {/* Connection status */}
        <div
          className={cn(
            'flex items-center gap-2 text-[11px] font-mono px-3 py-1.5 rounded-full transition-all duration-500 font-semibold',
            wsStatus === 'connected' && 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
            wsStatus === 'connecting' && 'bg-amber-50 text-amber-600 border border-amber-200/60',
            wsStatus === 'disconnected' && 'bg-red-50 text-red-500 border border-red-200/60'
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
