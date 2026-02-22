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
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Database,
  Timer,
  BarChart3,
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

const TOOLTIP_STYLE = {
  backgroundColor: '#131317',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  fontSize: '11px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
  color: '#8b8b96',
};

const AXIS_TICK = { fontSize: 9, fill: '#3a3a42' };

const MODEL_COLORS = ['#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#22c55e', '#06b6d4', '#f97316'];

export function MetricsPanel() {
  const metrics = useRequestStore((s) => s.metrics);

  if (!metrics || metrics.totalRequests === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-xl bg-[#131317] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
          <Activity className="w-6 h-6 text-[#3a3a42]" />
        </div>
        <div className="text-center">
          <p className="text-sm text-[#55555e]">Waiting for data...</p>
          <p className="text-xs text-[#3a3a42] mt-1">Metrics appear once requests flow through the proxy</p>
        </div>
      </div>
    );
  }

  const totalTokens = metrics.totalInputTokens + metrics.totalOutputTokens;

  const modelData = Object.entries(metrics.modelUsage)
    .map(([name, value]) => ({ name: name || 'unknown', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const providerCostData = Object.entries(metrics.costByProvider).map(([name, value]) => ({
    name: PROVIDER_LABELS[name] || name,
    cost: value,
    fill: PROVIDER_COLORS[name] || '#71717a',
  }));

  const tokenTimelineData = metrics.tokenTimeline.map((b) => ({
    time: new Date(b.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    tokens: b.value,
  }));

  const costTimelineData = metrics.costTimeline.map((b) => ({
    time: new Date(b.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    cost: b.value,
  }));

  const requestTimelineData = metrics.requestTimeline.map((b) => ({
    time: new Date(b.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    requests: b.value,
  }));

  const latencyTimelineData = (metrics.latencyTimeline || []).map((b) => ({
    time: new Date(b.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    latency: Math.round(b.value),
  }));

  const distData = (metrics.durationDistribution || []).filter((d) => d.count > 0);

  const successRate = 100 - (metrics.errorRate || 0);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* ═══ HERO STATS ═══ */}
      <div className="card p-5">
        <div className="grid grid-cols-4 gap-4">
          <HeroStat
            value={String(metrics.totalRequests)}
            label="Requests"
            icon={<Zap className="w-4 h-4" />}
            color="text-amber-400"
          />
          <HeroStat
            value={formatTokens(totalTokens)}
            label="Total Tokens"
            icon={<Flame className="w-4 h-4" />}
            color="text-pink-400"
          />
          <HeroStat
            value={formatCost(metrics.totalCost)}
            label="Total Cost"
            icon={<Coins className="w-4 h-4" />}
            color="text-emerald-400"
          />
          <HeroStat
            value={`${formatCost(metrics.costBurnRate)}/h`}
            label="Burn Rate"
            icon={<TrendingUp className="w-4 h-4" />}
            color="text-orange-400"
          />
        </div>
      </div>

      {/* ═══ THROUGHPUT + LATENCY ═══ */}
      <div className="grid grid-cols-2 gap-3">
        <SpeedCard
          label="Tokens/sec"
          value={metrics.avgTokensPerSecond ? Math.round(metrics.avgTokensPerSecond) : 0}
          max={200}
          color="#f59e0b"
        />
        <SpeedCard
          label="Req/min"
          value={Math.round(metrics.requestsPerMinute * 10) / 10}
          max={20}
          color="#ec4899"
        />
      </div>

      {/* ═══ LATENCY PERCENTILES ═══ */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold">Latency Percentiles</span>
          <span className="ml-auto text-[9px] text-[#3a3a42] font-mono">last 5 min</span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'TTFB', value: metrics.avgTTFB, color: 'text-sky-400' },
            { label: 'P50', value: metrics.p50Duration, color: 'text-emerald-400' },
            { label: 'P90', value: metrics.p90Duration, color: 'text-amber-400' },
            { label: 'P99', value: metrics.p99Duration, color: 'text-red-400' },
          ].map((p) => (
            <div key={p.label} className="text-center p-2 rounded-lg bg-[#0d0d12] border border-[rgba(255,255,255,0.04)]">
              <div className={cn('font-mono text-sm font-bold', p.color)}>{formatDuration(p.value)}</div>
              <div className="text-[9px] text-[#3a3a42] font-bold mt-0.5">{p.label}</div>
            </div>
          ))}
        </div>
        {/* Full percentile bar */}
        <div className="space-y-1">
          {[
            { label: 'P50', value: metrics.p50Duration, pct: 50 },
            { label: 'P75', value: metrics.p75Duration, pct: 75 },
            { label: 'P90', value: metrics.p90Duration, pct: 90 },
            { label: 'P95', value: metrics.p95Duration, pct: 95 },
            { label: 'P99', value: metrics.p99Duration, pct: 99 },
          ].map((p) => {
            const maxD = metrics.maxDuration || 1;
            const width = Math.min((p.value / maxD) * 100, 100);
            return (
              <div key={p.label} className="flex items-center gap-2">
                <span className="text-[9px] text-[#3a3a42] w-6 font-mono font-bold">{p.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[#0d0d12] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="text-[9px] text-[#55555e] w-12 text-right font-mono">{formatDuration(p.value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ DURATION HISTOGRAM ═══ */}
      {distData.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold">Duration Distribution</span>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData}>
                <XAxis dataKey="bucket" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                  {distData.map((_, i) => (
                    <Cell key={i} fill={i < 2 ? '#22c55e' : i < 4 ? '#eab308' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ TOKEN FLOW ═══ */}
      <div className="card p-4">
        <div className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold mb-3">Token Flow</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/15">
              <ArrowUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-foreground">{formatTokens(metrics.totalInputTokens)}</div>
              <div className="text-[10px] text-[#55555e]">
                Input <span className="text-[#3a3a42]">({formatTokens(metrics.avgInputTokensPerReq)}/req)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/15">
              <ArrowDown className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-foreground">{formatTokens(metrics.totalOutputTokens)}</div>
              <div className="text-[10px] text-[#55555e]">
                Output <span className="text-[#3a3a42]">({formatTokens(metrics.avgOutputTokensPerReq)}/req)</span>
              </div>
            </div>
          </div>
        </div>
        {/* Ratio bar */}
        {totalTokens > 0 && (
          <div className="mt-3">
            <div className="h-2 rounded-full bg-[#0d0d12] overflow-hidden flex">
              <div
                className="h-full bg-blue-500/70 rounded-l-full transition-all duration-700"
                style={{ width: `${(metrics.totalInputTokens / totalTokens) * 100}%` }}
              />
              <div
                className="h-full bg-violet-500/70 rounded-r-full transition-all duration-700"
                style={{ width: `${(metrics.totalOutputTokens / totalTokens) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-blue-400 font-bold">
                {Math.round((metrics.totalInputTokens / totalTokens) * 100)}% in
              </span>
              <span className="text-[10px] text-[#3a3a42] font-mono">
                efficiency: {metrics.tokenEfficiency.toFixed(2)}x
              </span>
              <span className="text-[10px] text-violet-400 font-bold">
                {Math.round((metrics.totalOutputTokens / totalTokens) * 100)}% out
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ CACHE ECONOMICS ═══ */}
      {(metrics.cacheReadTokens > 0 || metrics.cacheCreationTokens > 0) && (
        <div className="card p-4 border-l-2 border-l-amber-500/40">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">Cache Economics</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-[#0d0d12] border border-[rgba(255,255,255,0.04)]">
              <div className="font-mono text-sm font-bold text-emerald-400">{metrics.cacheHitRate.toFixed(0)}%</div>
              <div className="text-[9px] text-[#3a3a42] font-bold mt-0.5">Hit Rate</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[#0d0d12] border border-[rgba(255,255,255,0.04)]">
              <div className="font-mono text-sm font-bold text-blue-400">{formatTokens(metrics.cacheReadTokens)}</div>
              <div className="text-[9px] text-[#3a3a42] font-bold mt-0.5">Cache Read</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[#0d0d12] border border-[rgba(255,255,255,0.04)]">
              <div className="font-mono text-sm font-bold text-amber-400">{formatCost(metrics.estimatedCacheSavings)}</div>
              <div className="text-[9px] text-[#3a3a42] font-bold mt-0.5">Est. Saved</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TIMELINES ═══ */}
      {tokenTimelineData.length > 1 && (
        <div className="card p-4 space-y-4">
          <div className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold">Timelines</div>

          {/* Token timeline */}
          <div>
            <div className="text-[9px] text-[#3a3a42] font-bold mb-1">TOKENS OVER TIME</div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tokenTimelineData}>
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="tokens" stroke="#f59e0b" fill="url(#tokenGrad)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost timeline */}
          {costTimelineData.length > 1 && (
            <div>
              <div className="text-[9px] text-[#3a3a42] font-bold mb-1">COST OVER TIME</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTimelineData}>
                    <defs>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} tickFormatter={(v: number) => `$${v.toFixed(2)}`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']} />
                    <Area type="monotone" dataKey="cost" stroke="#22c55e" fill="url(#costGrad)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Request rate timeline */}
          {requestTimelineData.length > 1 && (
            <div>
              <div className="text-[9px] text-[#3a3a42] font-bold mb-1">REQUESTS OVER TIME</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={requestTimelineData}>
                    <defs>
                      <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#reqGrad)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Latency timeline */}
          {latencyTimelineData.length > 1 && (
            <div>
              <div className="text-[9px] text-[#3a3a42] font-bold mb-1">AVG LATENCY OVER TIME</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyTimelineData}>
                    <defs>
                      <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [formatDuration(v), 'Latency']} />
                    <Area type="monotone" dataKey="latency" stroke="#f97316" fill="url(#latGrad)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ MODEL PERFORMANCE TABLE ═══ */}
      {(metrics.modelPerformance || []).length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold">Model Performance</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-[#3a3a42] font-bold uppercase tracking-wider border-b border-[rgba(255,255,255,0.05)]">
                  <th className="text-left py-1.5 pr-2">Model</th>
                  <th className="text-right py-1.5 px-2">Reqs</th>
                  <th className="text-right py-1.5 px-2">Avg Latency</th>
                  <th className="text-right py-1.5 px-2">Avg Cost</th>
                  <th className="text-right py-1.5 px-2">Tok/s</th>
                </tr>
              </thead>
              <tbody>
                {metrics.modelPerformance.slice(0, 6).map((m) => (
                  <tr key={m.model} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="py-1.5 pr-2 font-mono text-[#8b8b96] font-medium truncate max-w-[120px]">{m.model}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-[#55555e]">{m.requests}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-blue-400">{formatDuration(m.avgDuration)}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-emerald-400">{formatCost(m.avgCost)}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-violet-400">{Math.round(m.tokensPerSec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ OPERATIONAL HEALTH ═══ */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold">Health</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Success rate ring */}
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#131317" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={successRate >= 95 ? '#22c55e' : successRate >= 80 ? '#eab308' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${successRate * 2.51} 251`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-mono font-bold text-foreground">{successRate.toFixed(0)}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#55555e]">Active Streams</span>
              <span className="text-xs font-mono font-bold text-[#8b8b96]">{metrics.activeStreams}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#55555e]">Sessions (5m)</span>
              <span className="text-xs font-mono font-bold text-[#8b8b96]">{metrics.activeSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#55555e]">Avg Cost/Req</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{formatCost(metrics.avgCostPerRequest)}</span>
            </div>
            {Object.keys(metrics.errorsByCode || {}).length > 0 && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {Object.entries(metrics.errorsByCode).map(([code, count]) => (
                  <span key={code} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/15">
                    {code}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MODEL USAGE PIE ═══ */}
      {modelData.length > 0 && (
        <div className="card p-4">
          <div className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold mb-3">Model Usage</div>
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
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }}
                  />
                  <span className="text-[#8b8b96] truncate font-mono text-[11px] font-medium">{m.name}</span>
                  <span className="text-[#55555e] ml-auto font-mono text-[11px] font-bold">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ COST BY PROVIDER ═══ */}
      {providerCostData.length > 0 && (
        <div className="card p-4">
          <div className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold mb-3">Cost by Provider</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerCostData} layout="vertical">
                <XAxis
                  type="number"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#55555e' }}
                  axisLine={false}
                  tickLine={false}
                  width={75}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']} />
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
    </div>
  );
}

function HeroStat({
  value,
  label,
  icon,
  color,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={cn('inline-flex items-center justify-center w-8 h-8 rounded-lg mb-1.5', color)}>
        {icon}
      </div>
      <div className="text-lg font-mono font-bold text-foreground leading-tight text-tabular">{value}</div>
      <div className="text-[9px] text-[#3a3a42] uppercase tracking-wider font-bold mt-0.5">{label}</div>
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
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] text-[#55555e] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <div className="flex items-center justify-center mb-2">
        <div className="relative w-24 h-14 overflow-hidden">
          <svg viewBox="0 0 120 70" className="w-full h-full">
            <path
              d="M 10 65 A 50 50 0 0 1 110 65"
              fill="none"
              stroke="#131317"
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
              style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
            />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <span className="text-xl font-mono font-bold text-foreground text-tabular">{value}</span>
      </div>
    </div>
  );
}
