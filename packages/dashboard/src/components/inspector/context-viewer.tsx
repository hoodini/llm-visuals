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

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; borderColor: string }> = {
  system: { icon: <Shield className="w-3.5 h-3.5" />, label: 'System', color: 'text-amber-400', borderColor: 'border-amber-500/20' },
  developer: { icon: <Shield className="w-3.5 h-3.5" />, label: 'Developer', color: 'text-amber-400', borderColor: 'border-amber-500/20' },
  user: { icon: <User className="w-3.5 h-3.5" />, label: 'User', color: 'text-blue-400', borderColor: 'border-blue-500/20' },
  assistant: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Assistant', color: 'text-violet-400', borderColor: 'border-violet-500/20' },
  tool: { icon: <Wrench className="w-3.5 h-3.5" />, label: 'Tool', color: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
  model: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Model', color: 'text-cyan-400', borderColor: 'border-cyan-500/20' },
};

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] || { icon: <MessageSquare className="w-3.5 h-3.5" />, label: role, color: 'text-[#55555e]', borderColor: 'border-[rgba(255,255,255,0.05)]' };
}

function ContentBlockView({ block, index }: { block: ContentBlock; index: number }) {
  const [expanded, setExpanded] = useState(false);

  switch (block.type) {
    case 'text': {
      const text = block.text || '';
      const isLong = text.length > 300;
      return (
        <div className="text-sm text-[#8b8b96] whitespace-pre-wrap break-words font-mono leading-relaxed">
          {isLong && !expanded ? text.slice(0, 300) + '...' : text}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              {expanded ? 'Show less' : `Show all (${text.length.toLocaleString()} chars)`}
            </button>
          )}
        </div>
      );
    }
    case 'thinking':
      return (
        <div className="rounded-lg border border-pink-500/15 bg-pink-500/[0.04]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Brain className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs text-pink-400 font-medium">Thinking Block</span>
            <span className="text-[10px] text-[#3a3a42] ml-auto">
              {(block.thinkingText || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-[#3a3a42]" /> : <ChevronRight className="w-3 h-3 text-[#3a3a42]" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-[#55555e] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
              {block.thinkingText}
            </pre>
          )}
        </div>
      );
    case 'tool_use':
      return (
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-mono font-bold">{block.toolName}</span>
            {block.toolId && <span className="text-[10px] text-[#3a3a42] font-mono">#{block.toolId.slice(-6)}</span>}
            {expanded ? <ChevronDown className="w-3 h-3 text-[#3a3a42] ml-auto" /> : <ChevronRight className="w-3 h-3 text-[#3a3a42] ml-auto" />}
          </button>
          {expanded && block.toolInput && (
            <pre className="px-3 pb-3 text-xs text-[#55555e] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.toolInput}
            </pre>
          )}
        </div>
      );
    case 'tool_result':
      return (
        <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/[0.04]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium">Tool Result</span>
            {block.toolId && <span className="text-[10px] text-[#3a3a42] font-mono">#{block.toolId.slice(-6)}</span>}
            <span className="text-[10px] text-[#3a3a42] ml-auto">
              {(block.text || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-[#3a3a42]" /> : <ChevronRight className="w-3 h-3 text-[#3a3a42]" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-[#55555e] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.text}
            </pre>
          )}
        </div>
      );
    case 'image':
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-500/15 bg-orange-500/[0.04]">
          <Image className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-orange-400 font-medium">Image</span>
          <span className="text-[10px] text-[#3a3a42]">{block.mediaType || 'image/*'}</span>
          {block.imageSource && block.imageSource !== '[base64]' && (
            <span className="text-[10px] text-[#3a3a42] font-mono truncate max-w-[200px]">{block.imageSource}</span>
          )}
          {block.imageSource === '[base64]' && <span className="text-[10px] text-[#3a3a42]">base64 encoded</span>}
        </div>
      );
    default:
      return (
        <div className="text-xs text-[#3a3a42] font-mono">
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
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[rgba(255,255,255,0.05)]" />
      <div className={cn('absolute left-[6px] top-3 w-3 h-3 rounded-full border-2', config.borderColor, 'bg-[#0d0d12]')} />

      <div className={cn('card border-l-2 mb-3', config.borderColor)}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(255,255,255,0.04)]">
          <div className={cn('flex items-center gap-1.5', config.color)}>
            {config.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
          </div>
          {message.name && (
            <span className="text-[10px] text-[#3a3a42] font-mono">({message.name})</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {message.cacheControl && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/15">
                <Database className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[9px] text-amber-400 font-bold uppercase">{message.cacheControl}</span>
              </span>
            )}
            <span className="text-[10px] text-[#3a3a42] font-mono">~{formatTokens(message.tokenEstimate)} tok</span>
            <span className="text-[10px] text-[#2a2a32]">#{index + 1}/{total}</span>
          </div>
        </div>

        {/* Content blocks */}
        <div className="p-3 space-y-2">
          {message.contentBlocks.map((block, bi) => (
            <ContentBlockView key={bi} block={block} index={bi} />
          ))}
          {message.contentBlocks.length === 0 && (
            <span className="text-xs text-[#3a3a42] italic">Empty message</span>
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
      <div className="rounded-lg border border-pink-500/15 bg-pink-500/[0.04]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Brain className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs text-pink-400 font-medium">Thinking</span>
          <span className="text-[10px] text-[#3a3a42] ml-auto">
            {(block.thinkingText || '').length.toLocaleString()} chars
          </span>
          {expanded ? <ChevronDown className="w-3 h-3 text-[#3a3a42]" /> : <ChevronRight className="w-3 h-3 text-[#3a3a42]" />}
        </button>
        {expanded && (
          <pre className="px-3 pb-3 text-xs text-[#55555e] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
            {block.thinkingText}
          </pre>
        )}
      </div>
    );
  }

  if (block.type === 'tool_use') {
    return (
      <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-mono font-bold">{block.toolName}</span>
          {expanded ? <ChevronDown className="w-3 h-3 text-[#3a3a42] ml-auto" /> : <ChevronRight className="w-3 h-3 text-[#3a3a42] ml-auto" />}
        </button>
        {expanded && block.toolInput && (
          <pre className="px-3 pb-3 text-xs text-[#55555e] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
            {block.toolInput}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm text-[#8b8b96] whitespace-pre-wrap break-words font-mono leading-relaxed">
      {block.text}
    </div>
  );
}

export function ContextViewer({ request }: { request: RequestRecord }) {
  const messages = request.parsedMessages || [];
  const responseBlocks = request.responseBlocks || [];

  if (messages.length === 0 && !request.systemPrompt) {
    return (
      <div className="text-sm text-[#3a3a42] text-center py-8">
        No context data available
      </div>
    );
  }

  const totalEstTokens = messages.reduce((sum, m) => sum + m.tokenEstimate, 0);

  return (
    <div className="space-y-4">
      {/* Context summary bar */}
      <div className="card p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold">Context Chain</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <span className="px-2 py-0.5 rounded bg-[#0d0d12] border border-[rgba(255,255,255,0.04)] text-[10px] text-[#55555e] font-mono font-medium">
              {messages.length} messages
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0d0d12] border border-[rgba(255,255,255,0.04)] text-[10px] text-[#55555e] font-mono font-medium">
              ~{formatTokens(totalEstTokens)} input tok
            </span>
            {request.hasCacheControl && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/15 text-[10px] text-amber-400 font-mono font-bold">
                Cache Control
              </span>
            )}
            {request.hasThinkingBlocks && (
              <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/15 text-[10px] text-pink-400 font-mono font-bold">
                Thinking
              </span>
            )}
            {request.hasToolUse && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-[10px] text-emerald-400 font-mono font-bold">
                Tool Use
              </span>
            )}
            {request.hasImages && (
              <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/15 text-[10px] text-orange-400 font-mono font-bold">
                Images
              </span>
            )}
          </div>
        </div>
        {/* Token breakdown bar */}
        {messages.length > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-[#0d0d12] overflow-hidden flex">
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
                  <span key={role} className="flex items-center gap-1 text-[10px] text-[#55555e] font-medium">
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

      {/* System prompt */}
      {request.systemPrompt && messages.every((m) => m.role !== 'system' && m.role !== 'developer') && (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[rgba(255,255,255,0.05)]" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-amber-500/20 bg-[#0d0d12]" />
          <div className="card border-l-2 border-l-amber-500/30 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(255,255,255,0.04)]">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">System Prompt</span>
            </div>
            <pre className="p-3 text-sm text-[#8b8b96] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
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
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[rgba(255,255,255,0.05)]" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-violet-500/20 bg-[#0d0d12]" />
          <div className="card border-l-2 border-l-violet-500/30 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(255,255,255,0.04)]">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-violet-400 font-bold uppercase tracking-wider">Response</span>
              {request.cacheReadTokens > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/15 ml-auto">
                  <Database className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-[9px] text-amber-400 font-mono font-bold">{formatTokens(request.cacheReadTokens)} cached</span>
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
