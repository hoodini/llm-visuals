'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { formatDuration, formatTokens, formatCost, PROVIDER_COLORS, PROVIDER_LABELS } from '@/lib/utils';
import {
  Zap,
  Clock,
  Coins,
  Activity,
  Gauge,
  ArrowUp,
  ArrowDown,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';

export function MetricsPanel() {
  const metrics = useRequestStore((s) => s.metrics);

  if (!metrics || metrics.totalRequests === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center border border-violet-200/50 shadow-xl shadow-violet-500/10 animate-float">
            <Activity className="w-8 h-8 text-violet-500" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500 font-semibold">Waiting for data...</p>
          <p className="text-xs text-slate-300 mt-1">Metrics appear once requests flow through the proxy</p>
        </div>
      </div>
    );
  }

  const modelData = Object.entries(metrics.modelUsage)
    .map(([name, value]) => ({ name: name || 'unknown', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const MODEL_COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#ef4444', '#eab308', '#06b6d4', '#22c55e'];

  const providerCostData = Object.entries(metrics.costByProvider).map(([name, value]) => ({
    name: PROVIDER_LABELS[name] || name,
    cost: value,
    fill: PROVIDER_COLORS[name] || '#71717a',
  }));

  const tokenTimelineData = metrics.tokenTimeline.map((b) => ({
    time: new Date(b.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    tokens: b.value,
  }));

  const totalTokens = metrics.totalInputTokens + metrics.totalOutputTokens;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Hero stats */}
      <div className="glass-card rounded-2xl p-5 glow-border rainbow-border">
        <div className="grid grid-cols-3 gap-6 relative z-10">
          <HeroStat
            value={String(metrics.totalRequests)}
            label="Requests"
            icon={<Zap className="w-4 h-4" />}
            color="text-violet-500"
            bgColor="bg-violet-100"
            glowColor="shadow-violet-500/20"
          />
          <HeroStat
            value={formatTokens(totalTokens)}
            label="Total Tokens"
            icon={<Flame className="w-4 h-4" />}
            color="text-pink-500"
            bgColor="bg-pink-100"
            glowColor="shadow-pink-500/20"
          />
          <HeroStat
            value={formatCost(metrics.totalCost)}
            label="Total Cost"
            icon={<Coins className="w-4 h-4" />}
            color="text-emerald-500"
            bgColor="bg-emerald-100"
            glowColor="shadow-emerald-500/20"
          />
        </div>
      </div>

      {/* Speed + Latency */}
      <div className="grid grid-cols-2 gap-3">
        <SpeedCard
          label="Tokens/sec"
          value={metrics.avgTokensPerSecond ? Math.round(metrics.avgTokensPerSecond) : 0}
          max={200}
          color="#8b5cf6"
        />
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Latency</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">TTFB</span>
              <span className="font-mono text-sm font-bold text-blue-600">{formatDuration(metrics.avgTTFB)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">Avg</span>
              <span className="font-mono text-sm font-bold text-slate-700">{formatDuration(metrics.avgDuration)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">P95</span>
              <span className="font-mono text-sm font-bold text-amber-600">{formatDuration(metrics.p95Duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token I/O */}
      <div className="glass-card rounded-xl p-4 glow-border">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3">Token Flow</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/20">
              <ArrowUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-slate-800 animate-count-up">
                {formatTokens(metrics.totalInputTokens)}
              </div>
              <div className="text-[10px] text-slate-400">Input tokens sent</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-500/20">
              <ArrowDown className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-slate-800 animate-count-up">
                {formatTokens(metrics.totalOutputTokens)}
              </div>
              <div className="text-[10px] text-slate-400">Output tokens received</div>
            </div>
          </div>
        </div>
        {/* Ratio bar */}
        {totalTokens > 0 && (
          <div className="mt-4">
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-l-full transition-all duration-700"
                style={{ width: `${(metrics.totalInputTokens / totalTokens) * 100}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-r-full transition-all duration-700"
                style={{ width: `${(metrics.totalOutputTokens / totalTokens) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-blue-500 font-bold">
                {Math.round((metrics.totalInputTokens / totalTokens) * 100)}% in
              </span>
              <span className="text-[10px] text-violet-500 font-bold">
                {Math.round((metrics.totalOutputTokens / totalTokens) * 100)}% out
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Token timeline */}
      {tokenTimelineData.length > 1 && (
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3">Tokens Over Time</div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenTimelineData}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#8b5cf6"
                  fill="url(#tokenGrad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Model usage pie */}
      {modelData.length > 0 && (
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3">Model Usage</div>
          <div className="flex items-center gap-4">
            <div className="h-28 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {modelData.map((_, i) => (
                      <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {modelData.map((m, i) => (
                <div key={m.name} className="flex items-center gap-2 text-xs group">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125 shadow-sm"
                    style={{ backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate font-mono text-[11px] font-medium">{m.name}</span>
                  <span className="text-slate-400 ml-auto font-mono text-[11px] font-bold">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost by provider */}
      {providerCostData.length > 0 && (
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3">Cost by Provider</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerCostData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  }}
                  formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']}
                />
                <Bar dataKey="cost" radius={[0, 8, 8, 0]} barSize={16}>
                  {providerCostData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function HeroStat({
  value,
  label,
  icon,
  color,
  bgColor,
  glowColor,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  glowColor: string;
}) {
  return (
    <div className="text-center">
      <div className={cn('inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2 shadow-lg', bgColor, glowColor)}>
        <div className={color}>{icon}</div>
      </div>
      <div className="text-2xl font-mono font-bold text-slate-800 animate-count-up">{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">{label}</div>
    </div>
  );
}

function SpeedCard({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="glass-card rounded-xl p-4 glow-border">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-violet-50">
          <Gauge className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
      </div>

      {/* Mini gauge */}
      <div className="flex items-center justify-center mb-2">
        <div className="relative w-24 h-14 overflow-hidden">
          <svg viewBox="0 0 120 70" className="w-full h-full">
            <path
              d="M 10 65 A 50 50 0 0 1 110 65"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 10 65 A 50 50 0 0 1 110 65"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 1.57} 157`}
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${color}50)`,
              }}
            />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <span className="text-xl font-mono font-bold text-slate-800">{value}</span>
        <span className="text-xs text-slate-400 ml-1 font-medium">tok/s</span>
      </div>
    </div>
  );
}
