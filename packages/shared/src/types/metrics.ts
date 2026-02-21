export interface MetricsSnapshot {
  totalRequests: number;
  activeStreams: number;

  avgTTFB: number;
  avgDuration: number;
  p95Duration: number;

  totalInputTokens: number;
  totalOutputTokens: number;
  avgTokensPerSecond: number;

  totalCost: number;
  costByProvider: Record<string, number>;
  costByModel: Record<string, number>;

  modelUsage: Record<string, number>;
  providerUsage: Record<string, number>;

  tokenTimeline: TimelineBucket[];
  requestTimeline: TimelineBucket[];
  costTimeline: TimelineBucket[];

  activeSessions: number;
}

export interface TimelineBucket {
  timestamp: number;
  value: number;
}

export function emptyMetrics(): MetricsSnapshot {
  return {
    totalRequests: 0,
    activeStreams: 0,
    avgTTFB: 0,
    avgDuration: 0,
    p95Duration: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    avgTokensPerSecond: 0,
    totalCost: 0,
    costByProvider: {},
    costByModel: {},
    modelUsage: {},
    providerUsage: {},
    tokenTimeline: [],
    requestTimeline: [],
    costTimeline: [],
    activeSessions: 0,
  };
}
