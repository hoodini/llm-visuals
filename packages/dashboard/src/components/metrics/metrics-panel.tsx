'use client';

import { useRequestStore } from '@/hooks/use-request-store';
import { formatDuration, formatTokens, formatCost, PROVIDER_COLORS, PROVIDER_LABELS } from '@/lib/utils';
import {
  Zap,
  Clock,
  Coins,
  Activity,
  TrendingUp,
  Users,
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
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 flex items-center justify-center border border-violet-500/10">
            <Activity className="w-7 h-7 text-violet-500/40" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-zinc-500 font-medium">Waiting for data...</p>
          <p className="text-xs text-zinc-700 mt-1">Metrics appear once requests flow through the proxy</p>
        </div>
      </div>
    );
  }

  const modelData = Object.entries(metrics.modelUsage)
    .map(([name, value]) => ({ name: name || 'unknown', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const MODEL_COLORS = ['#8b5cf6', '#f97316', '#22c55e', '#3b82f6', '#ef4444', '#eab308', '#ec4899', '#06b6d4'];

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
      {/* Hero stats - big numbers */}
      <div className="glass-card rounded-xl p-5 glow-border">
        <div className="grid grid-cols-3 gap-6">
          <HeroStat
            value={String(metrics.totalRequests)}
            label="Requests"
            icon={<Zap className="w-4 h-4" />}
            color="text-violet-400"
            bgColor="bg-violet-500/10"
          />
          <HeroStat
            value={formatTokens(totalTokens)}
            label="Total Tokens"
            icon={<Flame className="w-4 h-4" />}
            color="text-cyan-400"
            bgColor="bg-cyan-500/10"
          />
          <HeroStat
            value={formatCost(metrics.totalCost)}
            label="Total Cost"
            icon={<Coins className="w-4 h-4" />}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
          />
        </div>
      </div>

      {/* Speed + Latency cards */}
      <div className="grid grid-cols-2 gap-3">
        <SpeedCard
          label="Tokens/sec"
          value={metrics.avgTokensPerSecond ? Math.round(metrics.avgTokensPerSecond) : 0}
          max={200}
          color="#8b5cf6"
        />
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Latency</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-zinc-500">TTFB</span>
              <span className="font-mono text-sm font-bold text-blue-300">{formatDuration(metrics.avgTTFB)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-zinc-500">Avg</span>
              <span className="font-mono text-sm font-bold text-zinc-200">{formatDuration(metrics.avgDuration)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-zinc-500">P95</span>
              <span className="font-mono text-sm font-bold text-amber-400">{formatDuration(metrics.p95Duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token I/O breakdown */}
      <div className="glass-card rounded-xl p-4 glow-border">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Token Flow</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <ArrowUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-zinc-100 animate-count-up">
                {formatTokens(metrics.totalInputTokens)}
              </div>
              <div className="text-[10px] text-zinc-600">Input tokens sent</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <ArrowDown className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-zinc-100 animate-count-up">
                {formatTokens(metrics.totalOutputTokens)}
              </div>
              <div className="text-[10px] text-zinc-600">Output tokens received</div>
            </div>
          </div>
        </div>
        {/* Ratio bar */}
        {totalTokens > 0 && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-l-full transition-all duration-700"
                style={{ width: `${(metrics.totalInputTokens / totalTokens) * 100}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-r-full transition-all duration-700"
                style={{ width: `${(metrics.totalOutputTokens / totalTokens) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-blue-500">
                {Math.round((metrics.totalInputTokens / totalTokens) * 100)}% in
              </span>
              <span className="text-[10px] text-violet-500">
                {Math.round((metrics.totalOutputTokens / totalTokens) * 100)}% out
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Token timeline chart */}
      {tokenTimelineData.length > 1 && (
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Tokens Over Time</div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenTimelineData}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: '#52525b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#52525b' }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f0f14',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#8b5cf6"
                  fill="url(#tokenGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Model usage pie */}
      {modelData.length > 0 && (
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Model Usage</div>
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
                    className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }}
                  />
                  <span className="text-zinc-400 truncate font-mono text-[11px]">{m.name}</span>
                  <span className="text-zinc-600 ml-auto font-mono text-[11px]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost by provider */}
      {providerCostData.length > 0 && (
        <div className="glass-card rounded-xl p-4 glow-border">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Cost by Provider</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerCostData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: '#52525b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f0f14',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  }}
                  formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']}
                />
                <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={14}>
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
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="text-center">
      <div className={cn('inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2', bgColor)}>
        <div className={color}>{icon}</div>
      </div>
      <div className="text-2xl font-mono font-bold text-zinc-100 animate-count-up">{value}</div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{label}</div>
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
  const angle = (percentage / 100) * 180;

  return (
    <div className="glass-card rounded-xl p-4 glow-border">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>

      {/* Mini gauge */}
      <div className="flex items-center justify-center mb-2">
        <div className="relative w-24 h-14 overflow-hidden">
          {/* Background arc */}
          <svg viewBox="0 0 120 70" className="w-full h-full">
            <path
              d="M 10 65 A 50 50 0 0 1 110 65"
              fill="none"
              stroke="#1e1e24"
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
                filter: `drop-shadow(0 0 6px ${color}40)`,
              }}
            />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <span className="text-xl font-mono font-bold text-zinc-100">{value}</span>
        <span className="text-xs text-zinc-600 ml-1">tok/s</span>
      </div>
    </div>
  );
}
