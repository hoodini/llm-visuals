'use client';

import { useWebSocket } from '@/hooks/use-websocket';
import { Header } from '@/components/header';
import { RequestList } from '@/components/inspector/request-list';
import { RequestDetail } from '@/components/inspector/request-detail';
import { MetricsPanel } from '@/components/metrics/metrics-panel';
import { ActivityFeed } from '@/components/activity-feed';
import { useRequestStore } from '@/hooks/use-request-store';
import { useState } from 'react';
import { BarChart3, Microscope, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import BackgroundEffects from '@/components/three-background';

type RightPanel = 'metrics' | 'detail' | 'feed';

export default function Dashboard() {
  useWebSocket();

  const selectedId = useRequestStore((s) => s.selectedId);
  const hasRequests = useRequestStore((s) => s.orderedIds.length > 0);
  const [rightPanel, setRightPanel] = useState<RightPanel>('metrics');

  const showDetail = selectedId !== null;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <BackgroundEffects />
      <Header />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <div className="w-[58%] border-r border-[rgba(124,58,237,0.06)] flex flex-col overflow-hidden">
          <RequestList />
        </div>

        <div className="w-[42%] flex flex-col overflow-hidden bg-white/70 backdrop-blur-sm">
          {hasRequests && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-[rgba(124,58,237,0.06)]">
              {([
                { id: 'metrics' as const, label: 'Metrics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
                { id: 'detail' as const, label: 'Inspector', icon: <Microscope className="w-3.5 h-3.5" /> },
                { id: 'feed' as const, label: 'Feed', icon: <Radio className="w-3.5 h-3.5" /> },
              ]).map((tab) => {
                const isActive =
                  tab.id === 'detail'
                    ? showDetail || rightPanel === 'detail'
                    : !showDetail && rightPanel === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setRightPanel(tab.id);
                      if (tab.id !== 'detail') useRequestStore.getState().setSelectedId(null);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                      isActive
                        ? 'bg-violet-500/10 text-violet-600 border border-violet-500/15'
                        : 'text-[#9f95b8] hover:text-[#4c4460] hover:bg-violet-50/50'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={showDetail ? 'detail' : rightPanel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex-1 overflow-hidden"
            >
              {showDetail || rightPanel === 'detail' ? (
                <RequestDetail />
              ) : rightPanel === 'feed' ? (
                <div className="h-full overflow-y-auto"><ActivityFeed /></div>
              ) : (
                <MetricsPanel />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
