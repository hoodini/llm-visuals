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
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { useCopyToClipboard } from '@/hooks/use-copy';

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; borderColor: string; bgColor: string }> = {
  system: { icon: <Shield className="w-3.5 h-3.5" />, label: 'System', color: 'text-amber-600', borderColor: 'border-amber-300/40', bgColor: 'bg-amber-50' },
  developer: { icon: <Shield className="w-3.5 h-3.5" />, label: 'Developer', color: 'text-amber-600', borderColor: 'border-amber-300/40', bgColor: 'bg-amber-50' },
  user: { icon: <User className="w-3.5 h-3.5" />, label: 'User', color: 'text-blue-600', borderColor: 'border-blue-300/40', bgColor: 'bg-blue-50' },
  assistant: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Assistant', color: 'text-violet-600', borderColor: 'border-violet-300/40', bgColor: 'bg-violet-50' },
  tool: { icon: <Wrench className="w-3.5 h-3.5" />, label: 'Tool', color: 'text-emerald-600', borderColor: 'border-emerald-300/40', bgColor: 'bg-emerald-50' },
  model: { icon: <Bot className="w-3.5 h-3.5" />, label: 'Model', color: 'text-cyan-600', borderColor: 'border-cyan-300/40', bgColor: 'bg-cyan-50' },
};

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] || { icon: <MessageSquare className="w-3.5 h-3.5" />, label: role, color: 'text-[#9f95b8]', borderColor: 'border-[rgba(124,58,237,0.08)]', bgColor: 'bg-violet-50' };
}

function ContentBlockView({ block, index, copiedId, onCopy }: { block: ContentBlock; index: number; copiedId: string | null; onCopy: (text: string, id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  switch (block.type) {
    case 'text': {
      const text = block.text || '';
      const isLong = text.length > 300;
      const blockCopyId = `text-${index}`;
      return (
        <div className="relative group/text">
          <div className="text-sm text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed">
            {isLong && !expanded ? text.slice(0, 300) + '...' : text}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-xs text-violet-500 hover:text-violet-400 transition-colors font-semibold"
              >
                {expanded ? 'Show less' : `Show all (${text.length.toLocaleString()} chars)`}
              </button>
            )}
          </div>
          {text.length > 0 && (
            <button
              onClick={() => onCopy(text, blockCopyId)}
              className="absolute top-0 right-0 p-1 rounded-md opacity-0 group-hover/text:opacity-100 hover:bg-violet-50 transition-all"
              title="Copy text"
            >
              {copiedId === blockCopyId ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3 text-[#c4b5d9]" />
              )}
            </button>
          )}
        </div>
      );
    }
    case 'thinking':
      return (
        <div className="rounded-xl border border-pink-200/60 bg-pink-50/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Brain className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs text-pink-600 font-semibold">Thinking Block</span>
            <span className="text-[10px] text-[#9f95b8] ml-auto">
              {(block.thinkingText || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-[#9f95b8]" /> : <ChevronRight className="w-3 h-3 text-[#9f95b8]" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
              {block.thinkingText}
            </pre>
          )}
        </div>
      );
    case 'tool_use':
      return (
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-700 font-mono font-bold">{block.toolName}</span>
            {block.toolId && <span className="text-[10px] text-[#9f95b8] font-mono">#{block.toolId.slice(-6)}</span>}
            {expanded ? <ChevronDown className="w-3 h-3 text-[#9f95b8] ml-auto" /> : <ChevronRight className="w-3 h-3 text-[#9f95b8] ml-auto" />}
          </button>
          {expanded && block.toolInput && (
            <pre className="px-3 pb-3 text-xs text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.toolInput}
            </pre>
          )}
        </div>
      );
    case 'tool_result':
      return (
        <div className="rounded-xl border border-cyan-200/60 bg-cyan-50/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left"
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-xs text-cyan-600 font-semibold">Tool Result</span>
            {block.toolId && <span className="text-[10px] text-[#9f95b8] font-mono">#{block.toolId.slice(-6)}</span>}
            <span className="text-[10px] text-[#9f95b8] ml-auto">
              {(block.text || '').length.toLocaleString()} chars
            </span>
            {expanded ? <ChevronDown className="w-3 h-3 text-[#9f95b8]" /> : <ChevronRight className="w-3 h-3 text-[#9f95b8]" />}
          </button>
          {expanded && (
            <pre className="px-3 pb-3 text-xs text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
              {block.text}
            </pre>
          )}
        </div>
      );
    case 'image':
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-200/60 bg-orange-50/50">
          <Image className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs text-orange-600 font-semibold">Image</span>
          <span className="text-[10px] text-[#9f95b8]">{block.mediaType || 'image/*'}</span>
          {block.imageSource && block.imageSource !== '[base64]' && (
            <span className="text-[10px] text-[#9f95b8] font-mono truncate max-w-[200px]">{block.imageSource}</span>
          )}
          {block.imageSource === '[base64]' && <span className="text-[10px] text-[#9f95b8]">base64 encoded</span>}
        </div>
      );
    default:
      return (
        <div className="text-xs text-[#9f95b8] font-mono">
          {block.text?.slice(0, 200) || `[${block.type}]`}
        </div>
      );
  }
}

function MessageCard({ message, index, total, copiedId, onCopy }: { message: ParsedMessage; index: number; total: number; copiedId: string | null; onCopy: (text: string, id: string) => void }) {
  const config = getRoleConfig(message.role);

  return (
    <div className={cn('relative pl-6')}>
      {/* Timeline connector */}
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[rgba(124,58,237,0.1)]" />
      <div className={cn('absolute left-[6px] top-3 w-3 h-3 rounded-full border-2', config.borderColor, config.bgColor)} />

      <div className={cn('card border-l-2 mb-3', config.borderColor)}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(124,58,237,0.05)]">
          <div className={cn('flex items-center gap-1.5', config.color)}>
            {config.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
          </div>
          {message.name && (
            <span className="text-[10px] text-[#9f95b8] font-mono">({message.name})</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {message.cacheControl && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200/50">
                <Database className="w-2.5 h-2.5 text-violet-500" />
                <span className="text-[9px] text-violet-600 font-bold uppercase">{message.cacheControl}</span>
              </span>
            )}
            <span className="text-[10px] text-[#c4b5d9] font-mono">~{formatTokens(message.tokenEstimate)} tok</span>
            <span className="text-[10px] text-[#d4c9e8]">#{index + 1}/{total}</span>
          </div>
        </div>

        {/* Content blocks */}
        <div className="p-3 space-y-2">
          {message.contentBlocks.map((block, bi) => (
            <ContentBlockView key={bi} block={block} index={bi} copiedId={copiedId} onCopy={onCopy} />
          ))}
          {message.contentBlocks.length === 0 && (
            <span className="text-xs text-[#c4b5d9] italic">Empty message</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseBlockView({ block, copiedId, onCopy, index }: { block: ResponseBlock; copiedId: string | null; onCopy: (text: string, id: string) => void; index: number }) {
  const [expanded, setExpanded] = useState(block.type === 'text');

  if (block.type === 'thinking') {
    return (
      <div className="rounded-xl border border-pink-200/60 bg-pink-50/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Brain className="w-3.5 h-3.5 text-pink-500" />
          <span className="text-xs text-pink-600 font-semibold">Thinking</span>
          <span className="text-[10px] text-[#9f95b8] ml-auto">
            {(block.thinkingText || '').length.toLocaleString()} chars
          </span>
          {expanded ? <ChevronDown className="w-3 h-3 text-[#9f95b8]" /> : <ChevronRight className="w-3 h-3 text-[#9f95b8]" />}
        </button>
        {expanded && (
          <pre className="px-3 pb-3 text-xs text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
            {block.thinkingText}
          </pre>
        )}
      </div>
    );
  }

  if (block.type === 'tool_use') {
    return (
      <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left"
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-700 font-mono font-bold">{block.toolName}</span>
          {expanded ? <ChevronDown className="w-3 h-3 text-[#9f95b8] ml-auto" /> : <ChevronRight className="w-3 h-3 text-[#9f95b8] ml-auto" />}
        </button>
        {expanded && block.toolInput && (
          <pre className="px-3 pb-3 text-xs text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-64 overflow-y-auto">
            {block.toolInput}
          </pre>
        )}
      </div>
    );
  }

  const responseCopyId = `resp-text-${index}`;
  return (
    <div className="relative group/resp">
      <div className="text-sm text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed">
        {block.text}
      </div>
      {block.text && block.text.length > 0 && (
        <button
          onClick={() => onCopy(block.text!, responseCopyId)}
          className="absolute top-0 right-0 p-1 rounded-md opacity-0 group-hover/resp:opacity-100 hover:bg-violet-50 transition-all"
          title="Copy text"
        >
          {copiedId === responseCopyId ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-[#c4b5d9]" />
          )}
        </button>
      )}
    </div>
  );
}

export function ContextViewer({ request }: { request: RequestRecord }) {
  const messages = request.parsedMessages || [];
  const responseBlocks = request.responseBlocks || [];
  const { copiedId, copy } = useCopyToClipboard();

  if (messages.length === 0 && !request.systemPrompt) {
    return (
      <div className="text-sm text-[#9f95b8] text-center py-8">
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
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[10px] text-[#9f95b8] uppercase tracking-wider font-bold">Context Chain</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <span className="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200/40 text-[10px] text-[#4c4460] font-mono font-medium">
              {messages.length} messages
            </span>
            <span className="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200/40 text-[10px] text-[#4c4460] font-mono font-medium">
              ~{formatTokens(totalEstTokens)} input tok
            </span>
            {request.hasCacheControl && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/50 text-[10px] text-amber-600 font-mono font-bold">
                Cache Control
              </span>
            )}
            {request.hasThinkingBlocks && (
              <span className="px-2 py-0.5 rounded-md bg-pink-50 border border-pink-200/50 text-[10px] text-pink-600 font-mono font-bold">
                Thinking
              </span>
            )}
            {request.hasToolUse && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/50 text-[10px] text-emerald-600 font-mono font-bold">
                Tool Use
              </span>
            )}
            {request.hasImages && (
              <span className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200/50 text-[10px] text-orange-600 font-mono font-bold">
                Images
              </span>
            )}
          </div>
        </div>
        {/* Token breakdown bar */}
        {messages.length > 0 && (
          <div className="mt-3">
            <div className="h-2 rounded-full bg-violet-50 overflow-hidden flex">
              {messages.map((m, i) => {
                const width = totalEstTokens > 0 ? (m.tokenEstimate / totalEstTokens) * 100 : 0;
                return width > 0.5 ? (
                  <div
                    key={i}
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: m.role === 'system' || m.role === 'developer' ? '#d97706'
                        : m.role === 'user' ? '#2563eb'
                        : m.role === 'assistant' ? '#7c3aed'
                        : m.role === 'tool' ? '#059669'
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
                  <span key={role} className="flex items-center gap-1 text-[10px] text-[#4c4460] font-medium">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: role === 'system' ? '#d97706'
                          : role === 'user' ? '#2563eb'
                          : role === 'assistant' ? '#7c3aed'
                          : '#059669',
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
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[rgba(124,58,237,0.1)]" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-amber-300/50 bg-amber-50" />
          <div className="card border-l-2 border-l-amber-300/40 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(124,58,237,0.05)]">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">System Prompt</span>
              <button
                onClick={() => copy(request.systemPrompt!, 'ctx-system-prompt')}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-violet-50 transition-colors"
                title="Copy system prompt"
              >
                {copiedId === 'ctx-system-prompt' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] text-emerald-500 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#c4b5d9]" />
                    <span className="text-[9px] text-[#c4b5d9] font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-sm text-[#4c4460] whitespace-pre-wrap break-words font-mono leading-relaxed max-h-96 overflow-y-auto">
              {request.systemPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Message chain */}
      {messages.map((msg, i) => (
        <MessageCard key={i} message={msg} index={i} total={messages.length} copiedId={copiedId} onCopy={copy} />
      ))}

      {/* Response blocks */}
      {responseBlocks.length > 0 && (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[rgba(124,58,237,0.1)]" />
          <div className="absolute left-[6px] top-3 w-3 h-3 rounded-full border-2 border-violet-300/50 bg-violet-50" />
          <div className="card border-l-2 border-l-violet-300/40 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(124,58,237,0.05)]">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs text-violet-600 font-bold uppercase tracking-wider">Response</span>
              {request.cacheReadTokens > 0 && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200/40 ml-auto">
                  <Database className="w-2.5 h-2.5 text-violet-500" />
                  <span className="text-[9px] text-violet-600 font-mono font-bold">{formatTokens(request.cacheReadTokens)} cached</span>
                </span>
              )}
            </div>
            <div className="p-3 space-y-2">
              {responseBlocks.map((block, i) => (
                <ResponseBlockView key={i} block={block} copiedId={copiedId} onCopy={copy} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
