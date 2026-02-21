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

export function MetricsPanel() {
  const metrics = useRequestStore((s) => s.metrics);

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
        <Activity className="w-10 h-10 text-zinc-800" />
        <p className="text-sm">Waiting for data...</p>
      </div>
    );
  }

  // Prepare model usage data for pie chart
  const modelData = Object.entries(metrics.modelUsage)
    .map(([name, value]) => ({ name: name || 'unknown', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const MODEL_COLORS = ['#8b5cf6', '#f97316', '#22c55e', '#3b82f6', '#ef4444', '#eab308', '#ec4899', '#06b6d4'];

  // Prepare provider cost data
  const providerCostData = Object.entries(metrics.costByProvider).map(([name, value]) => ({
    name: PROVIDER_LABELS[name] || name,
    cost: value,
    fill: PROVIDER_COLORS[name] || '#71717a',
  }));

  // Timeline data
  const tokenTimelineData = metrics.tokenTimeline.map((b) => ({
    time: new Date(b.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    tokens: b.value,
  }));

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          label="Total Requests"
          value={String(metrics.totalRequests)}
          icon={<Zap className="w-4 h-4 text-violet-400" />}
        />
        <KPICard
          label="Avg Latency"
          value={formatDuration(metrics.avgDuration)}
          icon={<Clock className="w-4 h-4 text-blue-400" />}
        />
        <KPICard
          label="Total Cost"
          value={formatCost(metrics.totalCost)}
          icon={<Coins className="w-4 h-4 text-amber-400" />}
        />
        <KPICard
          label="Avg TTFB"
          value={formatDuration(metrics.avgTTFB)}
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
        />
        <KPICard
          label="Avg Tok/s"
          value={metrics.avgTokensPerSecond ? `${Math.round(metrics.avgTokensPerSecond)}` : '-'}
          icon={<Activity className="w-4 h-4 text-pink-400" />}
        />
        <KPICard
          label="Sessions"
          value={String(metrics.activeSessions)}
          icon={<Users className="w-4 h-4 text-cyan-400" />}
        />
      </div>

      {/* Token totals */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Token Usage</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-mono font-bold text-zinc-200">
              {formatTokens(metrics.totalInputTokens)}
            </div>
            <div className="text-xs text-zinc-500">Input tokens</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-zinc-200">
              {formatTokens(metrics.totalOutputTokens)}
            </div>
            <div className="text-xs text-zinc-500">Output tokens</div>
          </div>
        </div>
      </div>

      {/* Token timeline chart */}
      {tokenTimelineData.length > 1 && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Tokens Over Time</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenTimelineData}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={{ stroke: '#27272a' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#8b5cf6"
                  fill="url(#tokenGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Model usage pie */}
      {modelData.length > 0 && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Model Usage</div>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
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
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }}
                  />
                  <span className="text-zinc-400 truncate font-mono">{m.name}</span>
                  <span className="text-zinc-600 ml-auto font-mono">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost by provider */}
      {providerCostData.length > 0 && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Cost by Provider</div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerCostData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']}
                />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={16}>
                  {providerCostData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* P95 latency */}
      {metrics.p95Duration > 0 && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Latency Distribution</div>
          <div className="flex items-baseline gap-4">
            <div>
              <span className="text-lg font-mono font-bold text-zinc-200">
                {formatDuration(metrics.avgDuration)}
              </span>
              <span className="text-xs text-zinc-500 ml-1">avg</span>
            </div>
            <div>
              <span className="text-lg font-mono font-bold text-amber-400">
                {formatDuration(metrics.p95Duration)}
              </span>
              <span className="text-xs text-zinc-500 ml-1">p95</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-mono font-bold text-zinc-200">{value}</div>
    </div>
  );
}
