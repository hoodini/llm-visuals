import type { RequestRecord, MetricsSnapshot, TimelineBucket } from '@llm-visuals/shared';
import { emptyMetrics } from '@llm-visuals/shared';

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const s = [...sorted].sort((a, b) => a - b);
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

export function computeMetrics(records: RequestRecord[]): MetricsSnapshot {
  if (records.length === 0) return emptyMetrics();

  const now = Date.now();
  const last5min = records.filter((r) => now - r.startedAt < 5 * 60 * 1000);
  const last1hr = records.filter((r) => now - r.startedAt < 60 * 60 * 1000);

  const durations = last5min.map((r) => r.duration).filter((d): d is number => d !== null);
  const ttfbs = last5min.map((r) => r.ttfb).filter((t): t is number => t !== null);
  const tps = last5min.map((r) => r.tokensPerSecond).filter((t): t is number => t !== null);

  return {
    totalRequests: records.length,
    activeStreams: records.filter((r) => !r.completedAt).length,

    avgTTFB: avg(ttfbs),
    avgDuration: avg(durations),
    p95Duration: percentile(durations, 95),

    totalInputTokens: sum(records.map((r) => r.inputTokens)),
    totalOutputTokens: sum(records.map((r) => r.outputTokens)),
    avgTokensPerSecond: avg(tps),

    totalCost: sum(records.map((r) => r.estimatedCost)),
    costByProvider: groupAndSum(records, 'provider', 'estimatedCost'),
    costByModel: groupAndSum(records, 'model', 'estimatedCost'),

    modelUsage: countBy(records, 'model'),
    providerUsage: countBy(records, 'provider'),

    tokenTimeline: bucketByMinute(last1hr, (r) => r.inputTokens + r.outputTokens),
    requestTimeline: bucketByMinute(last1hr, () => 1),
    costTimeline: bucketByMinute(last1hr, (r) => r.estimatedCost),

    activeSessions: new Set(last5min.map((r) => r.sessionId).filter(Boolean)).size,
  };
}
