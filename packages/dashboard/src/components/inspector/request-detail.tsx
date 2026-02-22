'use client';

import { useState } from 'react';
import { useRequestStore, useSelectedRequest } from '@/hooks/use-request-store';
import {
  cn,
  formatDuration,
  formatTokens,
  formatCost,
  PROVIDER_COLORS,
  PROVIDER_LABELS,
} from '@/lib/utils';
import { X, Clock, Coins, Zap, FileText, Wrench, MessageSquare, Code2, Microscope, Layers, Database } from 'lucide-react';
import { ContextViewer } from './context-viewer';

type Tab = 'overview' | 'context' | 'request' | 'response' | 'system' | 'tools' | 'headers';

export function RequestDetail() {
  const selectedId = useRequestStore((s) => s.selectedId);
  const request = useSelectedRequest();
  const streamingText = useRequestStore((s) =>
    selectedId ? s.streamingChunks.get(selectedId) : undefined
  );
  const setSelectedId = useRequestStore((s) => s.setSelectedId);
  const [tab, setTab] = useState<Tab>('overview');

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-[#131317] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
          <Microscope className="w-5 h-5 text-[#3a3a42]" />
        </div>
        <div className="text-center">
          <p className="text-sm text-[#55555e]">Select a request to inspect</p>
          <p className="text-xs text-[#3a3a42] mt-1">Click any row for details</p>
        </div>
      </div>
    );
  }

  const isStreaming = !request.completedAt && request.isStreaming;
  const providerColor = PROVIDER_COLORS[request.provider];
  const msgCount = request.parsedMessages?.length || request.totalMessageCount || 0;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'context', label: `Context (${msgCount})`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'System', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'request', label: 'Request', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'response', label: 'Response', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'tools', label: `Tools (${request.tools?.length || 0})`, icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'headers', label: 'Headers', icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: providerColor }}>
            {PROVIDER_LABELS[request.provider]}
          </span>
          <span className="text-sm font-mono text-[#8b8b96]">{request.model}</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
              <span className="text-[10px] font-mono">STREAMING</span>
            </span>
          )}
        </div>
        <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors">
          <X className="w-4 h-4 text-[#3a3a42]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 px-4 py-1.5 border-b border-[rgba(255,255,255,0.04)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0',
              tab === t.id
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                : 'text-[#3a3a42] hover:text-[#55555e]'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Duration" value={formatDuration(request.duration)} icon={<Clock className="w-3.5 h-3.5" />} accent="text-blue-400" />
              <StatCard label="TTFB" value={formatDuration(request.ttfb)} icon={<Zap className="w-3.5 h-3.5" />} accent="text-amber-400" />
              <StatCard label="Input Tokens" value={formatTokens(request.inputTokens)} icon={<MessageSquare className="w-3.5 h-3.5" />} accent="text-cyan-400" />
              <StatCard label="Output Tokens" value={formatTokens(request.outputTokens)} icon={<MessageSquare className="w-3.5 h-3.5" />} accent="text-violet-400" />
              <StatCard label="Tokens/sec" value={request.tokensPerSecond ? `${request.tokensPerSecond}` : '-'} icon={<Zap className="w-3.5 h-3.5" />} accent="text-pink-400" />
              <StatCard label="Cost" value={formatCost(request.estimatedCost)} icon={<Coins className="w-3.5 h-3.5" />} accent="text-emerald-400" />
            </div>

            {(request.cacheReadTokens > 0 || request.cacheCreationTokens > 0) && (
              <div className="card p-3 border-l-2 border-l-amber-500/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <Database className="w-3 h-3 text-amber-400" />
                  <span className="text-[9px] text-amber-400 uppercase tracking-wider font-bold">Cache</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {request.cacheReadTokens > 0 && (
                    <div><div className="text-[9px] text-[#55555e]">Read</div><div className="text-sm font-mono text-amber-300">{formatTokens(request.cacheReadTokens)}</div></div>
                  )}
                  {request.cacheCreationTokens > 0 && (
                    <div><div className="text-[9px] text-[#55555e]">Write</div><div className="text-sm font-mono text-amber-300">{formatTokens(request.cacheCreationTokens)}</div></div>
                  )}
                </div>
              </div>
            )}

            {msgCount > 0 && (
              <div className="card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#55555e]">Context Chain</span>
                  <button onClick={() => setTab('context')} className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors">View →</button>
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-sm font-mono text-foreground">{msgCount} messages</span>
                  {request.hasToolUse && <Badge label="Tool Use" color="emerald" />}
                  {request.hasThinkingBlocks && <Badge label="Thinking" color="pink" />}
                  {request.hasImages && <Badge label="Images" color="orange" />}
                  {request.hasCacheControl && <Badge label="Cached" color="amber" />}
                </div>
              </div>
            )}

            <div className="card p-3">
              <div className="text-[9px] text-[#3a3a42] uppercase tracking-wider mb-1">Endpoint</div>
              <div className="font-mono text-sm text-[#8b8b96]">{request.method} {request.url}</div>
            </div>

            {(request.fullResponseText || streamingText) && (
              <div className="card p-3">
                <div className="text-[9px] text-[#3a3a42] uppercase tracking-wider mb-2">Response Preview</div>
                <div className="text-sm text-[#8b8b96] whitespace-pre-wrap break-words max-h-64 overflow-y-auto font-mono leading-relaxed">
                  {request.fullResponseText || streamingText}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'context' && <ContextViewer request={request} />}

        {tab === 'system' && (
          <div>
            {request.systemPrompt ? (
              <div className="card border-l-2 border-l-amber-500/30">
                <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.04)]">
                  <span className="text-xs text-amber-400 font-medium">System Prompt</span>
                  <span className="text-[10px] text-[#3a3a42] ml-2">{request.systemPrompt.length.toLocaleString()} chars</span>
                </div>
                <pre className="p-4 text-sm text-[#8b8b96] whitespace-pre-wrap break-words font-mono leading-relaxed">{request.systemPrompt}</pre>
              </div>
            ) : (
              <div className="text-sm text-[#3a3a42] text-center py-8">No system prompt</div>
            )}
          </div>
        )}

        {tab === 'request' && <JsonViewer json={request.requestBody} label="Request Body" />}
        {tab === 'response' && (
          <div className="space-y-3">
            {request.fullResponseText && (
              <div className="card p-4">
                <div className="text-[9px] text-[#3a3a42] uppercase tracking-wider mb-2">Full Response</div>
                <pre className="text-sm text-[#8b8b96] whitespace-pre-wrap break-words font-mono leading-relaxed">{request.fullResponseText}</pre>
              </div>
            )}
            {request.responseBody && <JsonViewer json={request.responseBody} label="Raw Response" />}
          </div>
        )}

        {tab === 'tools' && (
          <div className="space-y-2">
            {!request.tools || request.tools.length === 0 ? (
              <div className="text-sm text-[#3a3a42] text-center py-8">No tools defined</div>
            ) : (
              request.tools.map((tool, i) => (
                <div key={i} className="card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono text-sm text-foreground">{tool.name}</span>
                  </div>
                  {tool.description && <p className="text-xs text-[#55555e] mb-2">{tool.description}</p>}
                  {(tool.input_schema != null || tool.parameters != null) && (
                    <details className="group">
                      <summary className="text-[10px] text-[#3a3a42] cursor-pointer hover:text-[#55555e] transition-colors">Schema</summary>
                      <pre className="mt-2 text-xs text-[#55555e] bg-[#0d0d12] rounded-lg p-3 overflow-x-auto font-mono">
                        {JSON.stringify(tool.input_schema || tool.parameters, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'headers' && (
          <div className="space-y-3">
            <HeaderTable label="Request Headers" headers={request.requestHeaders} />
            {Object.keys(request.responseHeaders).length > 0 && <HeaderTable label="Response Headers" headers={request.responseHeaders} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/8 border-emerald-500/15',
    pink: 'text-pink-400 bg-pink-500/8 border-pink-500/15',
    orange: 'text-orange-400 bg-orange-500/8 border-orange-500/15',
    amber: 'text-amber-400 bg-amber-500/8 border-amber-500/15',
  };
  return <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border', colorMap[color])}>{label}</span>;
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className={accent}>{icon}</div>
      <div>
        <div className="text-[9px] text-[#3a3a42] uppercase tracking-wider">{label}</div>
        <div className="text-sm font-mono text-foreground text-tabular">{value}</div>
      </div>
    </div>
  );
}

function JsonViewer({ json, label }: { json: string; label: string }) {
  let formatted: string;
  try { formatted = JSON.stringify(JSON.parse(json), null, 2); } catch { formatted = json; }
  return (
    <div className="card">
      <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-[10px] text-[#3a3a42] uppercase tracking-wider">{label}</span>
      </div>
      <pre className="p-4 text-xs text-[#55555e] overflow-x-auto font-mono leading-relaxed max-h-[600px] overflow-y-auto">{formatted}</pre>
    </div>
  );
}

function HeaderTable({ label, headers }: { label: string; headers: Record<string, string> }) {
  return (
    <div className="card">
      <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-[10px] text-[#3a3a42] uppercase tracking-wider">{label}</span>
      </div>
      <div className="divide-y divide-[rgba(255,255,255,0.03)]">
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="px-4 py-1.5 flex gap-4">
            <span className="text-xs text-[#3a3a42] font-mono shrink-0 w-44">{key}</span>
            <span className={cn('text-xs font-mono break-all', value === '[REDACTED]' ? 'text-red-400/60' : 'text-[#55555e]')}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
