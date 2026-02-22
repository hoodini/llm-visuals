'use client';

import { useState } from 'react';
import { useRequestStore, useSelectedRequest } from '@/hooks/use-request-store';
import {
  cn,
  formatDuration,
  formatTokens,
  formatCost,
  formatTime,
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
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center border border-violet-200/50 shadow-lg shadow-violet-500/10">
          <Microscope className="w-7 h-7 text-violet-500" />
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500 font-semibold">Select a request to inspect</p>
          <p className="text-xs text-slate-300 mt-1">Click any row to see full details</p>
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase shadow-sm"
            style={{
              backgroundColor: `${providerColor}15`,
              color: providerColor,
              border: `1px solid ${providerColor}25`,
            }}
          >
            {PROVIDER_LABELS[request.provider]}
          </div>
          <span className="text-sm font-mono text-slate-700 font-medium">{request.model}</span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />
              Streaming
            </span>
          )}
        </div>
        <button
          onClick={() => setSelectedId(null)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-slate-200/60 overflow-x-auto bg-white/50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0',
              tab === t.id
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Duration"
                value={formatDuration(request.duration)}
                icon={<Clock className="w-4 h-4" />}
                color="text-blue-500"
                bgColor="bg-blue-50"
              />
              <StatCard
                label="TTFB"
                value={formatDuration(request.ttfb)}
                icon={<Zap className="w-4 h-4" />}
                color="text-violet-500"
                bgColor="bg-violet-50"
              />
              <StatCard
                label="Input Tokens"
                value={formatTokens(request.inputTokens)}
                icon={<MessageSquare className="w-4 h-4" />}
                color="text-cyan-500"
                bgColor="bg-cyan-50"
              />
              <StatCard
                label="Output Tokens"
                value={formatTokens(request.outputTokens)}
                icon={<MessageSquare className="w-4 h-4" />}
                color="text-pink-500"
                bgColor="bg-pink-50"
              />
              <StatCard
                label="Tokens/sec"
                value={request.tokensPerSecond ? `${request.tokensPerSecond}` : '-'}
                icon={<Zap className="w-4 h-4" />}
                color="text-amber-500"
                bgColor="bg-amber-50"
              />
              <StatCard
                label="Cost"
                value={formatCost(request.estimatedCost)}
                icon={<Coins className="w-4 h-4" />}
                color="text-emerald-500"
                bgColor="bg-emerald-50"
              />
            </div>

            {/* Cache info */}
            {(request.cacheReadTokens > 0 || request.cacheCreationTokens > 0) && (
              <div className="glass-card rounded-xl p-3 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] text-amber-600 uppercase tracking-wider font-bold">Cache</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {request.cacheReadTokens > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-400">Cache Read</div>
                      <div className="text-sm font-mono text-amber-600 font-bold">{formatTokens(request.cacheReadTokens)}</div>
                    </div>
                  )}
                  {request.cacheCreationTokens > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-400">Cache Write</div>
                      <div className="text-sm font-mono text-amber-600 font-bold">{formatTokens(request.cacheCreationTokens)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Context summary */}
            {msgCount > 0 && (
              <div className="glass-card rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-medium">Context Chain</div>
                  <button
                    onClick={() => setTab('context')}
                    className="text-[10px] text-violet-500 hover:text-violet-600 transition-colors font-semibold"
                  >
                    View full chain →
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-sm font-mono text-slate-700 font-bold">{msgCount} messages</span>
                  {request.hasToolUse && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold">Tool Use</span>
                  )}
                  {request.hasThinkingBlocks && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-pink-50 text-pink-600 border border-pink-200 font-bold">Thinking</span>
                  )}
                  {request.hasImages && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-orange-50 text-orange-600 border border-orange-200 font-bold">Images</span>
                  )}
                  {request.hasCacheControl && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-amber-50 text-amber-600 border border-amber-200 font-bold">Cached</span>
                  )}
                </div>
              </div>
            )}

            {/* Path */}
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1 font-medium">Endpoint</div>
              <div className="font-mono text-sm text-slate-700 font-medium">
                {request.method} {request.url}
              </div>
            </div>

            {/* Response preview */}
            {(request.fullResponseText || streamingText) && (
              <div className="glass-card rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-2 font-medium">Response Preview</div>
                <div className="text-sm text-slate-600 whitespace-pre-wrap break-words max-h-64 overflow-y-auto font-mono leading-relaxed">
                  {request.fullResponseText || streamingText}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'context' && (
          <ContextViewer request={request} />
        )}

        {tab === 'system' && (
          <div className="space-y-3">
            {request.systemPrompt ? (
              <div className="glass-card rounded-xl border-l-[3px] border-amber-400">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="text-xs text-amber-600 font-bold">System Prompt</span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    {request.systemPrompt.length.toLocaleString()} chars
                  </span>
                </div>
                <pre className="p-4 text-sm text-slate-600 whitespace-pre-wrap break-words overflow-x-auto font-mono leading-relaxed">
                  {request.systemPrompt}
                </pre>
              </div>
            ) : (
              <div className="text-sm text-slate-400 text-center py-8">No system prompt</div>
            )}
          </div>
        )}

        {tab === 'request' && (
          <JsonViewer json={request.requestBody} label="Request Body" />
        )}

        {tab === 'response' && (
          <div className="space-y-3">
            {request.fullResponseText && (
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-2 font-medium">Full Response Text</div>
                <pre className="text-sm text-slate-600 whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {request.fullResponseText}
                </pre>
              </div>
            )}
            {request.responseBody && (
              <JsonViewer json={request.responseBody} label="Raw Response Body" />
            )}
          </div>
        )}

        {tab === 'tools' && (
          <div className="space-y-3">
            {!request.tools || request.tools.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-8">No tools defined</div>
            ) : (
              request.tools.map((tool, i) => (
                <div key={i} className="glass-card rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-violet-500" />
                    <span className="font-mono text-sm text-slate-700 font-bold">{tool.name}</span>
                  </div>
                  {tool.description && (
                    <p className="text-xs text-slate-500 mb-3">{tool.description}</p>
                  )}
                  {(tool.input_schema != null || tool.parameters != null) && (
                    <details className="group">
                      <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors font-medium">
                        Schema
                      </summary>
                      <pre className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 overflow-x-auto font-mono border border-slate-100">
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
          <div className="space-y-4">
            <HeaderTable label="Request Headers" headers={request.requestHeaders} />
            {Object.keys(request.responseHeaders).length > 0 && (
              <HeaderTable label="Response Headers" headers={request.responseHeaders} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3 glow-border">
      <div className={cn('p-2 rounded-lg', bgColor)}>
        <div className={color}>{icon}</div>
      </div>
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</div>
        <div className="text-sm font-mono text-slate-700 font-bold">{value}</div>
      </div>
    </div>
  );
}

function JsonViewer({ json, label }: { json: string; label: string }) {
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    formatted = json;
  }

  return (
    <div className="glass-card rounded-xl">
      <div className="px-4 py-2 border-b border-slate-100">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <pre className="p-4 text-xs text-slate-500 overflow-x-auto font-mono leading-relaxed max-h-[600px] overflow-y-auto">
        {formatted}
      </pre>
    </div>
  );
}

function HeaderTable({ label, headers }: { label: string; headers: Record<string, string> }) {
  return (
    <div className="glass-card rounded-xl">
      <div className="px-4 py-2 border-b border-slate-100">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="px-4 py-2 flex gap-4">
            <span className="text-xs text-slate-400 font-mono shrink-0 w-48">{key}</span>
            <span
              className={cn(
                'text-xs font-mono break-all',
                value === '[REDACTED]' ? 'text-red-400' : 'text-slate-600'
              )}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
