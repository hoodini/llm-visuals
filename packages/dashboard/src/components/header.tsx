'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const wsStatus = useRequestStore((s) => s.wsStatus);
  const metrics = useRequestStore((s) => s.metrics);

  return (
    <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-400" />
          <h1 className="text-base font-semibold tracking-tight">LLM Visuals</h1>
        </div>
        <span className="text-xs text-zinc-500 font-mono">observatory</span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        {metrics && (
          <>
            <div className="flex items-center gap-2 text-zinc-400">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-mono">{metrics.totalRequests}</span>
              <span className="text-zinc-600">requests</span>
            </div>
            {metrics.activeStreams > 0 && (
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot" />
                <span className="font-mono">{metrics.activeStreams}</span>
                <span className="text-amber-600">streaming</span>
              </div>
            )}
          </>
        )}
        <div
          className={cn(
            'flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full',
            wsStatus === 'connected' && 'bg-emerald-950/50 text-emerald-400',
            wsStatus === 'connecting' && 'bg-amber-950/50 text-amber-400',
            wsStatus === 'disconnected' && 'bg-red-950/50 text-red-400'
          )}
        >
          {wsStatus === 'connected' ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          {wsStatus}
        </div>
      </div>
    </header>
  );
}
