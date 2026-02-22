'use client';

import { useState } from 'react';
import { Eye, Terminal, Copy, Check, Monitor, MessageSquare, Code2, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 'claude-code',
    icon: <Terminal className="w-5 h-5" />,
    label: 'Claude Code',
    sublabel: 'VSCode & CLI',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    commands: [
      {
        label: 'Set environment variable before launching:',
        code: 'set ANTHROPIC_BASE_URL=http://localhost:4000/anthropic',
        alt: 'export ANTHROPIC_BASE_URL=http://localhost:4000/anthropic',
        altLabel: 'Mac/Linux:',
        mainLabel: 'Windows:',
      },
    ],
    note: 'Then open VSCode or run claude in your terminal. All requests flow through the proxy.',
  },
  {
    id: 'claude-desktop',
    icon: <Monitor className="w-5 h-5" />,
    label: 'Claude Desktop',
    sublabel: 'Desktop app',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    commands: [
      {
        label: 'Set environment variable before launching:',
        code: 'set ANTHROPIC_BASE_URL=http://localhost:4000/anthropic',
        alt: 'export ANTHROPIC_BASE_URL=http://localhost:4000/anthropic',
        altLabel: 'Mac/Linux:',
        mainLabel: 'Windows:',
      },
    ],
    note: 'Launch Claude Desktop from the same terminal where you set the variable.',
  },
  {
    id: 'openai',
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'OpenAI / GPT',
    sublabel: 'Any OpenAI client',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    commands: [
      {
        label: 'Set environment variable:',
        code: 'set OPENAI_BASE_URL=http://localhost:4000/openai',
        alt: 'export OPENAI_BASE_URL=http://localhost:4000/openai',
        altLabel: 'Mac/Linux:',
        mainLabel: 'Windows:',
      },
    ],
    note: 'Works with any tool that uses the OpenAI SDK and respects this env var.',
  },
  {
    id: 'gemini',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Google Gemini',
    sublabel: 'Gemini API',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    commands: [
      {
        label: 'Set the base URL in your code or environment:',
        code: 'set GEMINI_BASE_URL=http://localhost:4000/gemini',
        alt: 'export GEMINI_BASE_URL=http://localhost:4000/gemini',
        altLabel: 'Mac/Linux:',
        mainLabel: 'Windows:',
      },
    ],
    note: 'Pass ?key=YOUR_API_KEY as usual. The proxy passes it through transparently.',
  },
];

export function SetupGuide() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 animate-float">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400 to-pink-400 opacity-20 blur-xl" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 border border-violet-200/50" />
          <Eye className="w-10 h-10 text-violet-500 relative" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-3 gradient-text">
          Welcome to LLM Visuals
        </h2>
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          See exactly what your AI tools send and receive. Every token, every system prompt, every tool call - in real time.
        </p>
      </div>

      {/* Step 0: Start proxy */}
      <div className="w-full max-w-lg mb-6">
        <div className="glass-card rounded-2xl p-5 glow-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-violet-500/25">
              1
            </div>
            <span className="text-sm font-semibold text-slate-700">Start the proxy server</span>
            <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              required
            </span>
          </div>
          <CodeBlock
            code="cd packages/proxy && npx tsx src/index.ts"
            id="proxy-start"
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-violet-500" />
            Proxy runs on port 4000. Dashboard you're looking at is port 3000.
          </p>
        </div>
      </div>

      {/* Step 1: Configure clients */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25">
            2
          </div>
          <span className="text-sm font-semibold text-slate-700">Point your AI tools to the proxy</span>
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => (
            <details key={step.id} className="group">
              <summary
                className={cn(
                  'glass-card rounded-xl p-4 cursor-pointer list-none flex items-center gap-3 glow-border',
                  'hover:shadow-md transition-all'
                )}
              >
                <div className={cn('p-2.5 rounded-xl', step.bgColor, step.borderColor, 'border shadow-sm')}>
                  <div className={step.color}>{step.icon}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-700">{step.label}</div>
                  <div className="text-[11px] text-slate-400">{step.sublabel}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-2 ml-4 pl-4 border-l-2 border-slate-200 space-y-3 pb-1">
                {step.commands.map((cmd, i) => (
                  <div key={i}>
                    <p className="text-[11px] text-slate-400 mb-2">{cmd.label}</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{cmd.mainLabel}</span>
                        <CodeBlock
                          code={cmd.code}
                          id={`${step.id}-${i}`}
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                      {cmd.alt && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">{cmd.altLabel}</span>
                          <CodeBlock
                            code={cmd.alt}
                            id={`${step.id}-${i}-alt`}
                            copiedId={copiedId}
                            onCopy={copyToClipboard}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <ArrowRight className="w-3 h-3 mt-0.5 text-slate-300 shrink-0" />
                  {step.note}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Step 2: Start chatting */}
      <div className="w-full max-w-lg">
        <div className="glass-card rounded-2xl p-5 glow-border text-center rainbow-border">
          <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25">
              3
            </div>
            <span className="text-sm font-semibold text-slate-700">Start chatting with your AI</span>
          </div>
          <p className="text-[11px] text-slate-400 relative z-10">
            Requests will appear here in real-time as you interact with any configured LLM.
          </p>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  id,
  copiedId,
  onCopy,
}: {
  code: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-3 group/code border border-slate-700/50 shadow-inner">
      <code className="flex-1 text-xs font-mono text-slate-200 select-all">{code}</code>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCopy(code, id);
        }}
        className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
      >
        {copiedId === id ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-slate-500 group-hover/code:text-slate-300" />
        )}
      </button>
    </div>
  );
}
