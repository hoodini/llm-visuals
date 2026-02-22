export interface MetricsSnapshot {
  totalRequests: number;
  activeStreams: number;

  // Latency (ms)
  avgTTFB: number;
  avgDuration: number;
  p50Duration: number;
  p75Duration: number;
  p90Duration: number;
  p95Duration: number;
  p99Duration: number;
  minDuration: number;
  maxDuration: number;
  durationDistribution: DistributionBucket[];

  // Throughput
  requestsPerMinute: number;
  avgTokensPerSecond: number;

  // Tokens
  totalInputTokens: number;
  totalOutputTokens: number;
  avgInputTokensPerReq: number;
  avgOutputTokensPerReq: number;
  tokenEfficiency: number;

  // Cache
  cacheReadTokens: number;
  cacheCreationTokens: number;
  cacheHitRate: number;
  estimatedCacheSavings: number;

  // Cost
  totalCost: number;
  avgCostPerRequest: number;
  costBurnRate: number;
  tokenBurnRate: number;
  costByProvider: Record<string, number>;
  costByModel: Record<string, number>;
  costPerKTokenByModel: Record<string, number>;

  // Health
  errorRate: number;
  errorsByCode: Record<string, number>;

  // Breakdowns
  modelUsage: Record<string, number>;
  providerUsage: Record<string, number>;
  modelPerformance: ModelPerformanceRow[];

  // Timelines
  tokenTimeline: TimelineBucket[];
  requestTimeline: TimelineBucket[];
  costTimeline: TimelineBucket[];
  latencyTimeline: TimelineBucket[];

  activeSessions: number;
}

export interface TimelineBucket {
  timestamp: number;
  value: number;
}

export interface DistributionBucket {
  bucket: string;
  count: number;
}

export interface ModelPerformanceRow {
  model: string;
  requests: number;
  avgDuration: number;
  avgCost: number;
  avgTokens: number;
  tokensPerSec: number;
}

export function emptyMetrics(): MetricsSnapshot {
  return {
    totalRequests: 0,
    activeStreams: 0,
    avgTTFB: 0,
    avgDuration: 0,
    p50Duration: 0,
    p75Duration: 0,
    p90Duration: 0,
    p95Duration: 0,
    p99Duration: 0,
    minDuration: 0,
    maxDuration: 0,
    durationDistribution: [],
    requestsPerMinute: 0,
    avgTokensPerSecond: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    avgInputTokensPerReq: 0,
    avgOutputTokensPerReq: 0,
    tokenEfficiency: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    cacheHitRate: 0,
    estimatedCacheSavings: 0,
    totalCost: 0,
    avgCostPerRequest: 0,
    costBurnRate: 0,
    tokenBurnRate: 0,
    costByProvider: {},
    costByModel: {},
    costPerKTokenByModel: {},
    errorRate: 0,
    errorsByCode: {},
    modelUsage: {},
    providerUsage: {},
    modelPerformance: [],
    tokenTimeline: [],
    requestTimeline: [],
    costTimeline: [],
    latencyTimeline: [],
    activeSessions: 0,
  };
}
