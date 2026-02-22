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
    color: 'text-orange-400',
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
    color: 'text-orange-400',
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
    color: 'text-emerald-400',
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
    color: 'text-blue-400',
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
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 border border-amber-500/10" />
          <Eye className="w-8 h-8 text-amber-400 relative" />
        </div>
        <h2 className="text-2xl font-display font-bold tracking-tight mb-3 text-foreground">
          Welcome to LLM Visuals
        </h2>
        <p className="text-sm text-[#55555e] max-w-md leading-relaxed">
          See exactly what your AI tools send and receive. Every token, every system prompt, every tool call — in real time.
        </p>
      </div>

      {/* Step 0: Start proxy */}
      <div className="w-full max-w-lg mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/10 text-amber-400 text-xs font-bold font-mono">
              1
            </div>
            <span className="text-sm font-medium text-foreground">Start the proxy server</span>
            <span className="ml-auto text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded font-bold uppercase">
              required
            </span>
          </div>
          <CodeBlock
            code="cd packages/proxy && npx tsx src/index.ts"
            id="proxy-start"
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
          <p className="text-[11px] text-[#3a3a42] mt-3 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            Proxy runs on port 4000. Dashboard you're looking at is port 3000.
          </p>
        </div>
      </div>

      {/* Step 1: Configure clients */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/10 text-pink-400 text-xs font-bold font-mono">
            2
          </div>
          <span className="text-sm font-medium text-foreground">Point your AI tools to the proxy</span>
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => (
            <details key={step.id} className="group">
              <summary
                className={cn(
                  'card p-4 cursor-pointer list-none flex items-center gap-3',
                  'hover:bg-[rgba(255,255,255,0.02)] transition-all'
                )}
              >
                <div className={step.color}>{step.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{step.label}</div>
                  <div className="text-[11px] text-[#3a3a42]">{step.sublabel}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#3a3a42] group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-2 ml-4 pl-4 border-l border-[rgba(255,255,255,0.06)] space-y-3 pb-1">
                {step.commands.map((cmd, i) => (
                  <div key={i}>
                    <p className="text-[11px] text-[#55555e] mb-2">{cmd.label}</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] text-[#3a3a42] font-mono font-medium">{cmd.mainLabel}</span>
                        <CodeBlock
                          code={cmd.code}
                          id={`${step.id}-${i}`}
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                      {cmd.alt && (
                        <div>
                          <span className="text-[10px] text-[#3a3a42] font-mono font-medium">{cmd.altLabel}</span>
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
                <p className="text-[11px] text-[#3a3a42] flex items-start gap-1.5">
                  <ArrowRight className="w-3 h-3 mt-0.5 text-[#3a3a42] shrink-0" />
                  {step.note}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Step 2: Start chatting */}
      <div className="w-full max-w-lg">
        <div className="card p-5 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-xs font-bold font-mono">
              3
            </div>
            <span className="text-sm font-medium text-foreground">Start chatting with your AI</span>
          </div>
          <p className="text-[11px] text-[#3a3a42]">
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
    <div className="flex items-center gap-2 bg-[#0d0d12] rounded-lg p-3 group/code border border-[rgba(255,255,255,0.05)]">
      <code className="flex-1 text-xs font-mono text-[#8b8b96] select-all">{code}</code>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCopy(code, id);
        }}
        className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.04)] transition-colors shrink-0"
      >
        {copiedId === id ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-[#3a3a42] group-hover/code:text-[#55555e]" />
        )}
      </button>
    </div>
  );
}
