import type { RequestRecord, MetricsSnapshot, TimelineBucket, DistributionBucket, ModelPerformanceRow } from '@llm-visuals/shared';
import { emptyMetrics } from '@llm-visuals/shared';

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

function percentile(nums: number[], p: number): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * s.length) - 1;
  return s[Math.max(0, idx)];
}

function groupAndSum(records: RequestRecord[], key: 'provider' | 'model', valueKey: 'estimatedCost'): Record<string, number> {
  const groups: Record<string, number> = {};
  for (const r of records) {
    const k = r[key] || 'unknown';
    groups[k] = (groups[k] || 0) + r[valueKey];
  }
  return groups;
}

function countBy(records: RequestRecord[], key: 'provider' | 'model'): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of records) {
    const k = r[key] || 'unknown';
    counts[k] = (counts[k] || 0) + 1;
  }
  return counts;
}

function bucketByMinute(records: RequestRecord[], valueFn: (r: RequestRecord) => number): TimelineBucket[] {
  const buckets = new Map<number, number>();
  for (const r of records) {
    const minute = Math.floor(r.startedAt / 60000) * 60000;
    buckets.set(minute, (buckets.get(minute) || 0) + valueFn(r));
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([timestamp, value]) => ({ timestamp, value }));
}

function bucketByMinuteAvg(records: RequestRecord[], valueFn: (r: RequestRecord) => number | null): TimelineBucket[] {
  const buckets = new Map<number, { sum: number; count: number }>();
  for (const r of records) {
    const val = valueFn(r);
    if (val === null) continue;
    const minute = Math.floor(r.startedAt / 60000) * 60000;
    const existing = buckets.get(minute) || { sum: 0, count: 0 };
    existing.sum += val;
    existing.count += 1;
    buckets.set(minute, existing);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([timestamp, { sum, count }]) => ({ timestamp, value: count > 0 ? sum / count : 0 }));
}

const DURATION_BUCKETS = [
  { label: '0-500ms', max: 500 },
  { label: '0.5-1s', max: 1000 },
  { label: '1-2s', max: 2000 },
  { label: '2-5s', max: 5000 },
  { label: '5-10s', max: 10000 },
  { label: '10-30s', max: 30000 },
  { label: '30s+', max: Infinity },
];

function computeDurationDistribution(durations: number[]): DistributionBucket[] {
  const counts = DURATION_BUCKETS.map((b) => ({ bucket: b.label, count: 0 }));
  for (const d of durations) {
    for (let i = 0; i < DURATION_BUCKETS.length; i++) {
      if (d < DURATION_BUCKETS[i].max || i === DURATION_BUCKETS.length - 1) {
        counts[i].count++;
        break;
      }
    }
  }
  return counts;
}

function computeModelPerformance(records: RequestRecord[]): ModelPerformanceRow[] {
  const byModel = new Map<string, RequestRecord[]>();
  for (const r of records) {
    const model = r.model || 'unknown';
    const list = byModel.get(model) || [];
    list.push(r);
    byModel.set(model, list);
  }

  return Array.from(byModel.entries())
    .map(([model, recs]) => {
      const durations = recs.map((r) => r.duration).filter((d): d is number => d !== null);
      const tps = recs.map((r) => r.tokensPerSecond).filter((t): t is number => t !== null);
      return {
        model,
        requests: recs.length,
        avgDuration: avg(durations),
        avgCost: avg(recs.map((r) => r.estimatedCost)),
        avgTokens: avg(recs.map((r) => r.inputTokens + r.outputTokens)),
        tokensPerSec: avg(tps),
      };
    })
    .sort((a, b) => b.requests - a.requests);
}

function computeCostPerKToken(records: RequestRecord[]): Record<string, number> {
  const byModel = new Map<string, { cost: number; tokens: number }>();
  for (const r of records) {
    const model = r.model || 'unknown';
    const existing = byModel.get(model) || { cost: 0, tokens: 0 };
    existing.cost += r.estimatedCost;
    existing.tokens += r.inputTokens + r.outputTokens;
    byModel.set(model, existing);
  }
  const result: Record<string, number> = {};
  for (const [model, { cost, tokens }] of byModel) {
    result[model] = tokens > 0 ? (cost / tokens) * 1000 : 0;
  }
  return result;
}

export function computeMetrics(records: RequestRecord[]): MetricsSnapshot {
  if (records.length === 0) return emptyMetrics();

  const now = Date.now();
  const last5min = records.filter((r) => now - r.startedAt < 5 * 60 * 1000);
  const last1hr = records.filter((r) => now - r.startedAt < 60 * 60 * 1000);

  const durations = last5min.map((r) => r.duration).filter((d): d is number => d !== null);
  const allDurations = records.map((r) => r.duration).filter((d): d is number => d !== null);
  const ttfbs = last5min.map((r) => r.ttfb).filter((t): t is number => t !== null);
  const tps = last5min.map((r) => r.tokensPerSecond).filter((t): t is number => t !== null);

  const totalInputTokens = sum(records.map((r) => r.inputTokens));
  const totalOutputTokens = sum(records.map((r) => r.outputTokens));
  const totalTokens = totalInputTokens + totalOutputTokens;

  const totalCost = sum(records.map((r) => r.estimatedCost));

  // Cache stats
  const cacheReadTokens = sum(records.map((r) => r.cacheReadTokens || 0));
  const cacheCreationTokens = sum(records.map((r) => r.cacheCreationTokens || 0));
  const requestsWithCache = records.filter((r) => (r.cacheReadTokens || 0) > 0).length;
  const cacheHitRate = records.length > 0 ? (requestsWithCache / records.length) * 100 : 0;
  // Rough estimate: cached tokens saved re-processing cost (~$3/MTok input avg)
  const estimatedCacheSavings = (cacheReadTokens / 1_000_000) * 3.0;

  // Error stats
  const completedRequests = records.filter((r) => r.statusCode !== null);
  const errorRequests = completedRequests.filter((r) => r.statusCode! >= 400);
  const errorRate = completedRequests.length > 0 ? (errorRequests.length / completedRequests.length) * 100 : 0;
  const errorsByCode: Record<string, number> = {};
  for (const r of errorRequests) {
    const code = String(r.statusCode);
    errorsByCode[code] = (errorsByCode[code] || 0) + 1;
  }

  // Burn rates (extrapolated from last 5 min to per-hour)
  const last5minCost = sum(last5min.map((r) => r.estimatedCost));
  const last5minTokens = sum(last5min.map((r) => r.inputTokens + r.outputTokens));
  const costBurnRate = last5min.length > 0 ? (last5minCost / 5) * 60 : 0;
  const tokenBurnRate = last5min.length > 0 ? (last5minTokens / 5) * 60 : 0;

  // Requests per minute (last 5 min)
  const requestsPerMinute = last5min.length > 0 ? last5min.length / 5 : 0;

  return {
    totalRequests: records.length,
    activeStreams: records.filter((r) => !r.completedAt).length,

    avgTTFB: avg(ttfbs),
    avgDuration: avg(durations),
    p50Duration: percentile(durations, 50),
    p75Duration: percentile(durations, 75),
    p90Duration: percentile(durations, 90),
    p95Duration: percentile(durations, 95),
    p99Duration: percentile(durations, 99),
    minDuration: durations.length > 0 ? Math.min(...durations) : 0,
    maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
    durationDistribution: computeDurationDistribution(allDurations),

    requestsPerMinute,
    avgTokensPerSecond: avg(tps),

    totalInputTokens,
    totalOutputTokens,
    avgInputTokensPerReq: records.length > 0 ? totalInputTokens / records.length : 0,
    avgOutputTokensPerReq: records.length > 0 ? totalOutputTokens / records.length : 0,
    tokenEfficiency: totalInputTokens > 0 ? totalOutputTokens / totalInputTokens : 0,

    cacheReadTokens,
    cacheCreationTokens,
    cacheHitRate,
    estimatedCacheSavings,

    totalCost,
    avgCostPerRequest: records.length > 0 ? totalCost / records.length : 0,
    costBurnRate,
    tokenBurnRate,
    costByProvider: groupAndSum(records, 'provider', 'estimatedCost'),
    costByModel: groupAndSum(records, 'model', 'estimatedCost'),
    costPerKTokenByModel: computeCostPerKToken(records),

    errorRate,
    errorsByCode,

    modelUsage: countBy(records, 'model'),
    providerUsage: countBy(records, 'provider'),
    modelPerformance: computeModelPerformance(records),

    tokenTimeline: bucketByMinute(last1hr, (r) => r.inputTokens + r.outputTokens),
    requestTimeline: bucketByMinute(last1hr, () => 1),
    costTimeline: bucketByMinute(last1hr, (r) => r.estimatedCost),
    latencyTimeline: bucketByMinuteAvg(last1hr, (r) => r.duration),

    activeSessions: new Set(last5min.map((r) => r.sessionId).filter(Boolean)).size,
  };
}
