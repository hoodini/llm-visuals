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
    <div className="flex flex-col h-screen bg-background text-foreground bright-mesh-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left panel: Request list */}
        <div className="w-[58%] border-r border-slate-200/60 flex flex-col overflow-hidden">
          <RequestList />
        </div>

        {/* Right panel */}
        <div className="w-[42%] flex flex-col overflow-hidden bg-slate-50/50">
          {/* Panel switcher tabs */}
          {hasRequests && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200/60 bg-white/60 backdrop-blur-sm">
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
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
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
