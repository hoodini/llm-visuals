'use client';

import { useFilteredRequests } from '@/hooks/use-request-store';
import { formatDuration, formatTokens, formatTime, PROVIDER_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function ActivityFeed() {
  const requests = useFilteredRequests();
  const recent = requests.slice(0, 20);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-1 p-3">
      <div className="flex items-center gap-2 px-2 mb-3">
        <Zap className="w-3.5 h-3.5 text-violet-500" />
        <span className="text-[10px] text-[#9f95b8] uppercase tracking-widest font-bold">Live Activity</span>
      </div>
      {recent.map((r, i) => {
        const isStreaming = !r.completedAt && r.isStreaming;
        const providerColor = PROVIDER_COLORS[r.provider];

        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all',
              isStreaming
                ? 'bg-violet-500/[0.04] border border-violet-200/40'
                : 'hover:bg-violet-50/50 rounded-xl'
            )}
          >
            <div className={cn(
              'shrink-0 p-1 rounded-md',
              r.completedAt ? 'text-[#9f95b8]' : 'text-violet-500'
            )}>
              {r.completedAt ? (
                <ArrowDownLeft className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
            </div>

            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: providerColor }}
            />

            <span className="font-mono text-[#4c4460] truncate max-w-[140px] font-medium text-[11px]">
              {r.model || 'unknown'}
            </span>

            {isStreaming && (
              <span className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse-dot" />
                <span className="text-[9px] text-violet-500 font-mono font-medium">LIVE</span>
              </span>
            )}

            <span className="flex-1" />

            {r.outputTokens > 0 && (
              <span className="font-mono text-[#c4b5d9] font-medium text-[11px]">
                {formatTokens(r.outputTokens)}
              </span>
            )}

            <span className="font-mono text-[#9f95b8] w-14 text-right text-[11px]">
              {formatDuration(r.duration)}
            </span>

            <span className="font-mono text-[#c4b5d9] w-14 text-right text-[10px]">
              {formatTime(r.startedAt)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
