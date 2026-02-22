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
import { X, Clock, Coins, Zap, FileText, Wrench, MessageSquare, Code2, Microscope, Layers, Database, Copy, Check } from 'lucide-react';
import { ContextViewer } from './context-viewer';
import { useCopyToClipboard } from '@/hooks/use-copy';

type Tab = 'overview' | 'context' | 'request' | 'response' | 'system' | 'tools' | 'headers';

export function RequestDetail() {
  const selectedId = useRequestStore((s) => s.selectedId);
  const request = useSelectedRequest();
  const streamingText = useRequestStore((s) =>
    selectedId ? s.streamingChunks.get(selectedId) : undefined
  );
  const setSelectedId = useRequestStore((s) => s.setSelectedId);
  const [tab, setTab] = useState<Tab>('overview');
  const { copiedId, copy } = useCopyToClipboard();

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200/40 flex items-center justify-center">
          <Microscope className="w-5 h-5 text-[#9f95b8]" />
        </div>
        <div className="text-center">
          <p className="text-sm text-[#4c4460]">Select a request to inspect</p>
          <p className="text-xs text-[#9f95b8] mt-1">Click any row for details</p>
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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(124,58,237,0.06)]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: providerColor }}>
            {PROVIDER_LABELS[request.provider]}
          </span>
          <span className="text-sm font-mono text-[#4c4460]">{request.model}</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-violet-500">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse-dot" />
              <span className="text-[10px] font-mono">STREAMING</span>
            </span>
          )}
        </div>
        <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-violet-50 rounded-lg transition-colors">
          <X className="w-4 h-4 text-[#9f95b8]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 px-4 py-1.5 border-b border-[rgba(124,58,237,0.06)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0',
              tab === t.id
                ? 'bg-violet-500/10 text-violet-600 border border-violet-500/15'
                : 'text-[#9f95b8] hover:text-[#4c4460]'
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
              <StatCard label="Duration" value={formatDuration(request.duration)} icon={<Clock className="w-3.5 h-3.5" />} accent="text-blue-500" />
              <StatCard label="TTFB" value={formatDuration(request.ttfb)} icon={<Zap className="w-3.5 h-3.5" />} accent="text-violet-500" />
              <StatCard label="Input Tokens" value={formatTokens(request.inputTokens)} icon={<MessageSquare className="w-3.5 h-3.5" />} accent="text-cyan-500" />
              <StatCard label="Output Tokens" value={formatTokens(request.outputTokens)} icon={<MessageSquare className="w-3.5 h-3.5" />} accent="text-purple-500" />
              <StatCard label="Tokens/sec" value={request.tokensPerSecond ? `${request.tokensPerSecond}` : '-'} icon={<Zap className="w-3.5 h-3.5" />} accent="text-pink-500" />
              <StatCard label="Cost" value={formatCost(request.estimatedCost)} icon={<Coins className="w-3.5 h-3.5" />} accent="text-emerald-500" />
            </div>

            {(request.cacheReadTokens > 0 || request.cacheCreationTokens > 0) && (
              <div className="card p-3 border-l-2 border-l-violet-400/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <Database className="w-3 h-3 text-violet-500" />
                  <span className="text-[9px] text-violet-500 uppercase tracking-wider font-bold">Cache</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {request.cacheReadTokens > 0 && (
                    <div><div className="text-[9px] text-[#9f95b8]">Read</div><div className="text-sm font-mono text-violet-600">{formatTokens(request.cacheReadTokens)}</div></div>
                  )}
                  {request.cacheCreationTokens > 0 && (
                    <div><div className="text-[9px] text-[#9f95b8]">Write</div><div className="text-sm font-mono text-violet-600">{formatTokens(request.cacheCreationTokens)}</div></div>
                  )}
                </div>
              </div>
            )}

            {msgCount > 0 && (
              <div className="card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9f95b8]">Context Chain</span>
                  <button onClick={() => setTab('context')} className="text-[10px] text-violet-500 hover:text-violet-400 transition-colors font-medium">View →</button>
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-sm font-mono text-foreground">{msgCount} messages</span>
                  {request.hasToolUse && <Badge label="Tool Use" color="emerald" />}
                  {request.hasThinkingBlocks && <Badge label="Thinking" color="pink" />}
                  {request.hasImages && <Badge label="Images" color="orange" />}
                  {request.hasCacheControl && <Badge label="Cached" color="violet" />}
                </div>
              </div>
            )}

            <div className="card p-3">
              <div className="text-[9px] text-[#9f95b8] uppercase tracking-wider mb-1">Endpoint</div>
              <div className="font-mono text-sm text-[#4c4460]">{request.method} {request.url}</div>
            </div>

            {(request.fullResponseText || streamingText) && (
              <div className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[9px] text-[#9f95b8] uppercase tracking-wider">Response Preview</div>
                  {request.fullResponseText && (
                    <button
                      onClick={() => copy(request.fullResponseText, 'response-preview')}
                      className="p-1 rounded-md hover:bg-violet-50 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === 'response-preview' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#9f95b8] hover:text-violet-500" />
                      )}
                    </button>
                  )}
                </div>
                <div className="text-sm text-[#4c4460] whitespace-pre-wrap break-words max-h-64 overflow-y-auto font-mono leading-relaxed">
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
              <div className="card border-l-2 border-l-violet-400/30">
                <div className="px-4 py-2 border-b border-[rgba(124,58,237,0.06)] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-violet-500 font-medium">System Prompt</span>
                    <span className="text-[10px] text-[#9f95b8] ml-2">{request.systemPrompt.length.toLocaleString()} chars</span>
                  </div>
                  <button
                    onClick={() => copy(request.systemPrompt!, 'system-prompt')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-violet-50 transition-colors group"
                    title="Copy system prompt"
                  >
                    {copiedId === 'system-prompt' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#9f95b8] group-hover:text-violet-500" />
                        <span className="text-[10px] text-[#9f95b8] group-hover:text-violet-500 font-medium">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-sm text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed">{request.systemPrompt}</pre>
              </div>
            ) : (
              <div className="text-sm text-[#9f95b8] text-center py-8">No system prompt</div>
            )}
          </div>
        )}

        {tab === 'request' && <JsonViewer json={request.requestBody} label="Request Body" onCopy={copy} copiedId={copiedId} />}
        {tab === 'response' && (
          <div className="space-y-3">
            {request.fullResponseText && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[9px] text-[#9f95b8] uppercase tracking-wider">Full Response</div>
                  <button
                    onClick={() => copy(request.fullResponseText, 'full-response')}
                    className="p-1 rounded-md hover:bg-violet-50 transition-colors"
                    title="Copy response"
                  >
                    {copiedId === 'full-response' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#9f95b8]" />
                    )}
                  </button>
                </div>
                <pre className="text-sm text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed">{request.fullResponseText}</pre>
              </div>
            )}
            {request.responseBody && <JsonViewer json={request.responseBody} label="Raw Response" onCopy={copy} copiedId={copiedId} />}
          </div>
        )}

        {tab === 'tools' && (
          <div className="space-y-2">
            {!request.tools || request.tools.length === 0 ? (
              <div className="text-sm text-[#9f95b8] text-center py-8">No tools defined</div>
            ) : (
              request.tools.map((tool, i) => (
                <div key={i} className="card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-violet-500" />
                    <span className="font-mono text-sm text-foreground">{tool.name}</span>
                  </div>
                  {tool.description && <p className="text-xs text-[#9f95b8] mb-2">{tool.description}</p>}
                  {(tool.input_schema != null || tool.parameters != null) && (
                    <details className="group">
                      <summary className="text-[10px] text-[#c4b5d9] cursor-pointer hover:text-[#9f95b8] transition-colors">Schema</summary>
                      <pre className="mt-2 text-xs text-[#4c4460] bg-violet-50/50 rounded-lg p-3 overflow-x-auto font-mono">
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
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200/50',
    pink: 'text-pink-600 bg-pink-50 border-pink-200/50',
    orange: 'text-orange-600 bg-orange-50 border-orange-200/50',
    violet: 'text-violet-600 bg-violet-50 border-violet-200/50',
  };
  return <span className={cn('px-1.5 py-0.5 rounded-md text-[9px] font-semibold border', colorMap[color])}>{label}</span>;
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className={accent}>{icon}</div>
      <div>
        <div className="text-[9px] text-[#9f95b8] uppercase tracking-wider">{label}</div>
        <div className="text-sm font-mono text-foreground text-tabular">{value}</div>
      </div>
    </div>
  );
}

function JsonViewer({ json, label, onCopy, copiedId }: { json: string; label: string; onCopy: (text: string, id: string) => void; copiedId: string | null }) {
  let formatted: string;
  try { formatted = JSON.stringify(JSON.parse(json), null, 2); } catch { formatted = json; }
  const copyId = `json-${label.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div className="card">
      <div className="px-4 py-2 border-b border-[rgba(124,58,237,0.06)] flex items-center justify-between">
        <span className="text-[10px] text-[#9f95b8] uppercase tracking-wider">{label}</span>
        <button
          onClick={() => onCopy(formatted, copyId)}
          className="p-1 rounded-md hover:bg-violet-50 transition-colors"
          title={`Copy ${label.toLowerCase()}`}
        >
          {copiedId === copyId ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-[#9f95b8]" />
          )}
        </button>
      </div>
      <pre className="p-4 text-xs text-[#4c4460] overflow-x-auto font-mono leading-relaxed max-h-[600px] overflow-y-auto">{formatted}</pre>
    </div>
  );
}

function HeaderTable({ label, headers }: { label: string; headers: Record<string, string> }) {
  return (
    <div className="card">
      <div className="px-4 py-2 border-b border-[rgba(124,58,237,0.06)]">
        <span className="text-[10px] text-[#9f95b8] uppercase tracking-wider">{label}</span>
      </div>
      <div className="divide-y divide-[rgba(124,58,237,0.04)]">
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="px-4 py-1.5 flex gap-4">
            <span className="text-xs text-[#9f95b8] font-mono shrink-0 w-44">{key}</span>
            <span className={cn('text-xs font-mono break-all', value === '[REDACTED]' ? 'text-red-400' : 'text-[#4c4460]')}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
