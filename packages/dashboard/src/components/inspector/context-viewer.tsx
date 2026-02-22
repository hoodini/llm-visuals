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
  system: { icon: <Shield className="w-3.5 h-3.5" />, label: 'System', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  developer: { icon: <Shield className="w-3.5 h-3.5" />, label: 'Developer', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  user: { icon: <User className="w-3.5 h-3.5" />, label: 'User', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  assistant: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Assistant', color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  tool: { icon: <Wrench className="w-3.5 h-3.5" />, label: 'Tool', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  model: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Model', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
};

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] || { icon: <MessageSquare className="w-3.5 h-3.5" />, label: role, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20' };
}

function ContentBlockView({ block, index }: { block: ContentBlock; index: number }) {
  const [expanded, setExpanded] = useState(false);

  switch (block.type) {
    case 'text': {
      const text = block.text || '';
      const isLong = text.length > 300;
      return (
        <div className="text-sm text-zinc-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
          {isLong && !expanded ? text.slice(0, 300) + '...' : text}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {expanded ? 'Show less' : `Show all (${text.length.toLocaleString()} chars)`}
            </button>
          )}
        </div>
      );
    }
    case 'thinking':
      return (
        <div className="rounded-lg border border-pink-500/20 bg-pink-500/[0.03]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Brain className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs text-pink-400 font-medium">Thinking Block</span>
            <span className="text-[10px] text-zinc-600 ml-auto">
              {(block.thinkingText || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronRight className="w-3 h-3 text-zinc-600" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-zinc-400 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
              {block.thinkingText}
            </pre>
          )}
        </div>
      );
    case 'tool_use':
      return (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-mono font-medium">{block.toolName}</span>
            {block.toolId && <span className="text-[10px] text-zinc-600 font-mono">#{block.toolId.slice(-6)}</span>}
            {expanded ? <ChevronDown className="w-3 h-3 text-zinc-600 ml-auto" /> : <ChevronRight className="w-3 h-3 text-zinc-600 ml-auto" />}
          </button>
          {expanded && block.toolInput && (
            <pre className="px-3 pb-3 text-xs text-zinc-400 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.toolInput}
            </pre>
          )}
        </div>
      );
    case 'tool_result':
      return (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/[0.03]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium">Tool Result</span>
            {block.toolId && <span className="text-[10px] text-zinc-600 font-mono">#{block.toolId.slice(-6)}</span>}
            <span className="text-[10px] text-zinc-600 ml-auto">
              {(block.text || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronRight className="w-3 h-3 text-zinc-600" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-zinc-400 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.text}
            </pre>
          )}
        </div>
      );
    case 'image':
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-500/20 bg-orange-500/[0.03]">
          <Image className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-orange-400 font-medium">Image</span>
          <span className="text-[10px] text-zinc-600">{block.mediaType || 'image/*'}</span>
          {block.imageSource && block.imageSource !== '[base64]' && (
            <span className="text-[10px] text-zinc-600 font-mono truncate max-w-[200px]">{block.imageSource}</span>
          )}
          {block.imageSource === '[base64]' && <span className="text-[10px] text-zinc-600">base64 encoded</span>}
        </div>
      );
    default:
      return (
        <div className="text-xs text-zinc-500 font-mono">
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
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-zinc-800" />
      <div className={cn('absolute left-[6px] top-3 w-3 h-3 rounded-full border-2', config.borderColor, config.bgColor)} />

      <div className={cn('glass-card rounded-xl border', config.borderColor, 'mb-3')}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/50">
          <div className={cn('flex items-center gap-1.5', config.color)}>
            {config.icon}
            <span className="text-xs font-semibold uppercase tracking-wider">{config.label}</span>
          </div>
          {message.name && (
            <span className="text-[10px] text-zinc-600 font-mono">({message.name})</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {message.cacheControl && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                <Database className="w-2.5 h-2.5 text-yellow-400" />
                <span className="text-[9px] text-yellow-400 font-medium uppercase">{message.cacheControl}</span>
              </span>
            )}
            <span className="text-[10px] text-zinc-600 font-mono">~{formatTokens(message.tokenEstimate)} tok</span>
            <span className="text-[10px] text-zinc-700">#{index + 1}/{total}</span>
          </div>
        </div>

        {/* Content blocks */}
        <div className="p-3 space-y-2">
          {message.contentBlocks.map((block, bi) => (
            <ContentBlockView key={bi} block={block} index={bi} />
          ))}
          {message.contentBlocks.length === 0 && (
            <span className="text-xs text-zinc-700 italic">Empty message</span>
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
      <div className="rounded-lg border border-pink-500/20 bg-pink-500/[0.03]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Brain className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs text-pink-400 font-medium">Thinking</span>
          <span className="text-[10px] text-zinc-600 ml-auto">
            {(block.thinkingText || '').length.toLocaleString()} chars
          </span>
          {expanded ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronRight className="w-3 h-3 text-zinc-600" />}
        </button>
        {expanded && (
          <pre className="px-3 pb-3 text-xs text-zinc-400 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
            {block.thinkingText}
          </pre>
        )}
      </div>
    );
  }

  if (block.type === 'tool_use') {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-300 font-mono font-medium">{block.toolName}</span>
          {expanded ? <ChevronDown className="w-3 h-3 text-zinc-600 ml-auto" /> : <ChevronRight className="w-3 h-3 text-zinc-600 ml-auto" />}
        </button>
        {expanded && block.toolInput && (
          <pre className="px-3 pb-3 text-xs text-zinc-400 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
            {block.toolInput}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm text-zinc-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
      {block.text}
    </div>
  );
}

export function ContextViewer({ request }: { request: RequestRecord }) {
  const messages = request.parsedMessages || [];
  const responseBlocks = request.responseBlocks || [];

  if (messages.length === 0 && !request.systemPrompt) {
    return (
      <div className="text-sm text-zinc-600 text-center py-8">
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
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Context Chain</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
              {messages.length} messages
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
              ~{formatTokens(totalEstTokens)} input tok
            </span>
            {request.hasCacheControl && (
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-400 font-mono">
                Cache Control
              </span>
            )}
            {request.hasThinkingBlocks && (
              <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-[10px] text-pink-400 font-mono">
                Thinking
              </span>
            )}
            {request.hasToolUse && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
                Tool Use
              </span>
            )}
            {request.hasImages && (
              <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-400 font-mono">
                Images
              </span>
            )}
          </div>
        </div>
        {/* Token breakdown bar */}
        {messages.length > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden flex">
              {messages.map((m, i) => {
                const config = getRoleConfig(m.role);
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
                      opacity: 0.7,
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
                  <span key={role} className="flex items-center gap-1 text-[10px] text-zinc-600">
                    <span
                      className="w-2 h-2 rounded-full"
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

      {/* System prompt (if separate from messages) */}
      {request.systemPrompt && messages.every((m) => m.role !== 'system' && m.role !== 'developer') && (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-zinc-800" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-amber-500/20 bg-amber-500/10" />
          <div className="glass-card rounded-xl border border-amber-500/20 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/50">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">System Prompt</span>
            </div>
            <pre className="p-3 text-sm text-zinc-300 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
              {request.systemPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Message chain */}
      {messages.map((msg, i) => (
        <MessageCard key={i} message={msg} index={i} total={messages.length} />
      ))}

      {/* Response blocks (from the LLM response) */}
      {responseBlocks.length > 0 && (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-zinc-800" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-violet-500/30 bg-violet-500/10" />
          <div className="glass-card rounded-xl border border-violet-500/20 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/50">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Response</span>
              {request.cacheReadTokens > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 ml-auto">
                  <Database className="w-2.5 h-2.5 text-yellow-400" />
                  <span className="text-[9px] text-yellow-400 font-mono">{formatTokens(request.cacheReadTokens)} cached</span>
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
