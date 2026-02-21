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

type RightPanel = 'metrics' | 'detail' | 'feed';

export default function Dashboard() {
  useWebSocket();

  const selectedId = useRequestStore((s) => s.selectedId);
  const hasRequests = useRequestStore((s) => s.orderedIds.length > 0);
  const [rightPanel, setRightPanel] = useState<RightPanel>('metrics');

  const showDetail = selectedId !== null;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground noise-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Request list */}
        <div className="w-[58%] border-r border-white/[0.03] flex flex-col overflow-hidden">
          <RequestList />
        </div>

        {/* Right panel */}
        <div className="w-[42%] flex flex-col overflow-hidden">
          {/* Panel switcher tabs */}
          {hasRequests && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.03]">
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
                      if (tab.id !== 'detail') {
                        useRequestStore.getState().setSelectedId(null);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                      isActive
                        ? 'bg-white/[0.05] text-zinc-200 border border-white/[0.06]'
                        : 'text-zinc-600 hover:text-zinc-400'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {showDetail || rightPanel === 'detail' ? (
              <RequestDetail />
            ) : rightPanel === 'feed' ? (
              <div className="h-full overflow-y-auto">
                <ActivityFeed />
              </div>
            ) : (
              <MetricsPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
