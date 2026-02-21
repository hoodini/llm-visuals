'use client';

import { useWebSocket } from '@/hooks/use-websocket';
import { Header } from '@/components/header';
import { RequestList } from '@/components/inspector/request-list';
import { RequestDetail } from '@/components/inspector/request-detail';
import { MetricsPanel } from '@/components/metrics/metrics-panel';
import { useRequestStore } from '@/hooks/use-request-store';
import { useState } from 'react';
import { BarChart3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

type RightPanel = 'metrics' | 'detail';

export default function Dashboard() {
  useWebSocket();

  const selectedId = useRequestStore((s) => s.selectedId);
  const [rightPanel, setRightPanel] = useState<RightPanel>('metrics');

  // Auto-switch to detail when a request is selected
  const showDetail = selectedId !== null;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Request list */}
        <div className="w-[60%] border-r border-zinc-800 flex flex-col overflow-hidden">
          <RequestList />
        </div>

        {/* Right panel: Metrics or Detail */}
        <div className="w-[40%] flex flex-col overflow-hidden">
          {/* Panel switcher */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-800">
            <button
              onClick={() => setRightPanel('metrics')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                rightPanel === 'metrics' && !showDetail
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Metrics
            </button>
            <button
              onClick={() => setRightPanel('detail')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                showDetail || rightPanel === 'detail'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <List className="w-3.5 h-3.5" />
              Inspector
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {showDetail || rightPanel === 'detail' ? (
              <RequestDetail />
            ) : (
              <MetricsPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
