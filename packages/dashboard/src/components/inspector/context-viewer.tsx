'use client';

import type { ParsedMessage, ContentBlock, ResponseBlock, RequestRecord } from '@/lib/types';
import { cn, formatTokens } from '@/lib/utils';
import {
  User,
  Bot,
  Shield,
  Wrench,
  Brain,
  Image,
  ChevronDown,
  ChevronRight,
  FileText,
  ArrowRight,
  Sparkles,
  Database,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bgColor: string; borderColor: string }> = {
  system: { icon: <Shield className="w-3.5 h-3.5" />, label: 'System', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  developer: { icon: <Shield className="w-3.5 h-3.5" />, label: 'Developer', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  user: { icon: <User className="w-3.5 h-3.5" />, label: 'User', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  assistant: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Assistant', color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  tool: { icon: <Wrench className="w-3.5 h-3.5" />, label: 'Tool', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  model: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Model', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
};

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] || { icon: <MessageSquare className="w-3.5 h-3.5" />, label: role, color: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
}

function ContentBlockView({ block, index }: { block: ContentBlock; index: number }) {
  const [expanded, setExpanded] = useState(false);

  switch (block.type) {
    case 'text': {
      const text = block.text || '';
      const isLong = text.length > 300;
      return (
        <div className="text-sm text-slate-600 whitespace-pre-wrap break-words font-mono leading-relaxed">
          {isLong && !expanded ? text.slice(0, 300) + '...' : text}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-xs text-violet-500 hover:text-violet-600 transition-colors font-semibold"
            >
              {expanded ? 'Show less' : `Show all (${text.length.toLocaleString()} chars)`}
            </button>
          )}
        </div>
      );
    }
    case 'thinking':
      return (
        <div className="rounded-xl border border-pink-200 bg-pink-50/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Brain className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs text-pink-600 font-semibold">Thinking Block</span>
            <span className="text-[10px] text-slate-400 ml-auto">
              {(block.thinkingText || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-slate-500 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
              {block.thinkingText}
            </pre>
          )}
        </div>
      );
    case 'tool_use':
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-700 font-mono font-bold">{block.toolName}</span>
            {block.toolId && <span className="text-[10px] text-slate-400 font-mono">#{block.toolId.slice(-6)}</span>}
            {expanded ? <ChevronDown className="w-3 h-3 text-slate-400 ml-auto" /> : <ChevronRight className="w-3 h-3 text-slate-400 ml-auto" />}
          </button>
          {expanded && block.toolInput && (
            <pre className="px-3 pb-3 text-xs text-slate-500 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.toolInput}
            </pre>
          )}
        </div>
      );
    case 'tool_result':
      return (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-xs text-cyan-600 font-semibold">Tool Result</span>
            {block.toolId && <span className="text-[10px] text-slate-400 font-mono">#{block.toolId.slice(-6)}</span>}
            <span className="text-[10px] text-slate-400 ml-auto">
              {(block.text || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-slate-500 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.text}
            </pre>
          )}
        </div>
      );
    case 'image':
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50/50">
          <Image className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs text-orange-600 font-semibold">Image</span>
          <span className="text-[10px] text-slate-400">{block.mediaType || 'image/*'}</span>
          {block.imageSource && block.imageSource !== '[base64]' && (
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{block.imageSource}</span>
          )}
          {block.imageSource === '[base64]' && <span className="text-[10px] text-slate-400">base64 encoded</span>}
        </div>
      );
    default:
      return (
        <div className="text-xs text-slate-400 font-mono">
          {block.text?.slice(0, 200) || `[${block.type}]`}
        </div>
      );
  }
}

function MessageCard({ message, index, total }: { message: ParsedMessage; index: number; total: number }) {
  const config = getRoleConfig(message.role);

  return (
    <div className={cn('relative pl-6')}>
      {/* Timeline connector */}
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-200" />
      <div className={cn('absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 shadow-sm', config.borderColor, config.bgColor)} />

      <div className={cn('glass-card rounded-xl border', config.borderColor, 'mb-3')}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
          <div className={cn('flex items-center gap-1.5', config.color)}>
            {config.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
          </div>
          {message.name && (
            <span className="text-[10px] text-slate-400 font-mono">({message.name})</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {message.cacheControl && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                <Database className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[9px] text-amber-600 font-bold uppercase">{message.cacheControl}</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-mono">~{formatTokens(message.tokenEstimate)} tok</span>
            <span className="text-[10px] text-slate-300">#{index + 1}/{total}</span>
          </div>
        </div>

        {/* Content blocks */}
        <div className="p-3 space-y-2">
          {message.contentBlocks.map((block, bi) => (
            <ContentBlockView key={bi} block={block} index={bi} />
          ))}
          {message.contentBlocks.length === 0 && (
            <span className="text-xs text-slate-300 italic">Empty message</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseBlockView({ block }: { block: ResponseBlock }) {
  const [expanded, setExpanded] = useState(block.type === 'text');

  if (block.type === 'thinking') {
    return (
      <div className="rounded-xl border border-pink-200 bg-pink-50/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Brain className="w-3.5 h-3.5 text-pink-500" />
          <span className="text-xs text-pink-600 font-semibold">Thinking</span>
          <span className="text-[10px] text-slate-400 ml-auto">
            {(block.thinkingText || '').length.toLocaleString()} chars
          </span>
          {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
        </button>
        {expanded && (
          <pre className="px-3 pb-3 text-xs text-slate-500 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
            {block.thinkingText}
          </pre>
        )}
      </div>
    );
  }

  if (block.type === 'tool_use') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-700 font-mono font-bold">{block.toolName}</span>
          {expanded ? <ChevronDown className="w-3 h-3 text-slate-400 ml-auto" /> : <ChevronRight className="w-3 h-3 text-slate-400 ml-auto" />}
        </button>
        {expanded && block.toolInput && (
          <pre className="px-3 pb-3 text-xs text-slate-500 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
            {block.toolInput}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm text-slate-600 whitespace-pre-wrap break-words font-mono leading-relaxed">
      {block.text}
    </div>
  );
}

export function ContextViewer({ request }: { request: RequestRecord }) {
  const messages = request.parsedMessages || [];
  const responseBlocks = request.responseBlocks || [];

  if (messages.length === 0 && !request.systemPrompt) {
    return (
      <div className="text-sm text-slate-400 text-center py-8">
        No context data available
      </div>
    );
  }

  const totalEstTokens = messages.reduce((sum, m) => sum + m.tokenEstimate, 0);

  return (
    <div className="space-y-4">
      {/* Context summary bar */}
      <div className="glass-card rounded-xl p-3 glow-border">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Context Chain</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500 font-mono font-medium">
              {messages.length} messages
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500 font-mono font-medium">
              ~{formatTokens(totalEstTokens)} input tok
            </span>
            {request.hasCacheControl && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] text-amber-600 font-mono font-bold">
                Cache Control
              </span>
            )}
            {request.hasThinkingBlocks && (
              <span className="px-2 py-0.5 rounded-md bg-pink-50 border border-pink-200 text-[10px] text-pink-600 font-mono font-bold">
                Thinking
              </span>
            )}
            {request.hasToolUse && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-600 font-mono font-bold">
                Tool Use
              </span>
            )}
            {request.hasImages && (
              <span className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[10px] text-orange-600 font-mono font-bold">
                Images
              </span>
            )}
          </div>
        </div>
        {/* Token breakdown bar */}
        {messages.length > 0 && (
          <div className="mt-3">
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              {messages.map((m, i) => {
                const width = totalEstTokens > 0 ? (m.tokenEstimate / totalEstTokens) * 100 : 0;
                return width > 0.5 ? (
                  <div
                    key={i}
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: m.role === 'system' || m.role === 'developer' ? '#f59e0b'
                        : m.role === 'user' ? '#3b82f6'
                        : m.role === 'assistant' ? '#8b5cf6'
                        : m.role === 'tool' ? '#22c55e'
                        : '#71717a',
                      opacity: 0.8,
                    }}
                    title={`${m.role}: ~${m.tokenEstimate} tokens`}
                  />
                ) : null;
              })}
            </div>
            <div className="flex gap-3 mt-1.5 flex-wrap">
              {(['system', 'user', 'assistant', 'tool'] as const).map((role) => {
                const count = messages.filter((m) => m.role === role || (role === 'system' && m.role === 'developer')).length;
                if (count === 0) return null;
                const config = getRoleConfig(role);
                return (
                  <span key={role} className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <span
                      className="w-2 h-2 rounded-full shadow-sm"
                      style={{
                        backgroundColor: role === 'system' ? '#f59e0b'
                          : role === 'user' ? '#3b82f6'
                          : role === 'assistant' ? '#8b5cf6'
                          : '#22c55e',
                      }}
                    />
                    {count} {config.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* System prompt */}
      {request.systemPrompt && messages.every((m) => m.role !== 'system' && m.role !== 'developer') && (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-200" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-amber-200 bg-amber-50 shadow-sm" />
          <div className="glass-card rounded-xl border border-amber-200 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">System Prompt</span>
            </div>
            <pre className="p-3 text-sm text-slate-600 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
              {request.systemPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Message chain */}
      {messages.map((msg, i) => (
        <MessageCard key={i} message={msg} index={i} total={messages.length} />
      ))}

      {/* Response blocks */}
      {responseBlocks.length > 0 && (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-200" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-violet-200 bg-violet-50 shadow-sm" />
          <div className="glass-card rounded-xl border border-violet-200 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs text-violet-600 font-bold uppercase tracking-wider">Response</span>
              {request.cacheReadTokens > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 ml-auto">
                  <Database className="w-2.5 h-2.5 text-amber-500" />
                  <span className="text-[9px] text-amber-600 font-mono font-bold">{formatTokens(request.cacheReadTokens)} cached</span>
                </span>
              )}
            </div>
            <div className="p-3 space-y-2">
              {responseBlocks.map((block, i) => (
                <ResponseBlockView key={i} block={block} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
