// Re-export shared types for dashboard use
// Using inline types to avoid workspace resolution issues with Next.js

export type ProviderSlug = 'anthropic' | 'openai' | 'gemini';

export interface ContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result' | 'thinking' | 'file' | 'other';
  text?: string;
  toolName?: string;
  toolInput?: string;
  toolId?: string;
  imageSource?: string;
  mediaType?: string;
  thinkingText?: string;
}

export interface ParsedMessage {
  role: string;
  contentBlocks: ContentBlock[];
  tokenEstimate: number;
  cacheControl?: string;
  name?: string;
}

export interface ResponseBlock {
  type: 'text' | 'tool_use' | 'thinking' | 'other';
  text?: string;
  toolName?: string;
  toolInput?: string;
  toolId?: string;
  thinkingText?: string;
}

export interface RequestRecord {
  id: string;
  provider: ProviderSlug;
  method: string;
  path: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  model: string;
  systemPrompt: string | null;
  tools: ToolDefinition[];
  messages: unknown[];
  isStreaming: boolean;

  // Rich context
  parsedMessages: ParsedMessage[];
  responseBlocks: ResponseBlock[];
  totalMessageCount: number;
  hasCacheControl: boolean;
  hasThinkingBlocks: boolean;
  hasToolUse: boolean;
  hasImages: boolean;

  statusCode: number | null;
  responseHeaders: Record<string, string>;
  responseBody: string;
  fullResponseText: string;
  startedAt: number;
  firstByteAt: number | null;
  completedAt: number | null;
  duration: number | null;
  ttfb: number | null;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  tokensPerSecond: number | null;
  estimatedCost: number;
  sessionId: string | null;
}

export interface ToolDefinition {
  name: string;
  description?: string;
  input_schema?: unknown;
  parameters?: unknown;
}

export interface MetricsSnapshot {
  totalRequests: number;
  activeStreams: number;

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

  requestsPerMinute: number;
  avgTokensPerSecond: number;

  totalInputTokens: number;
  totalOutputTokens: number;
  avgInputTokensPerReq: number;
  avgOutputTokensPerReq: number;
  tokenEfficiency: number;

  cacheReadTokens: number;
  cacheCreationTokens: number;
  cacheHitRate: number;
  estimatedCacheSavings: number;

  totalCost: number;
  avgCostPerRequest: number;
  costBurnRate: number;
  tokenBurnRate: number;
  costByProvider: Record<string, number>;
  costByModel: Record<string, number>;
  costPerKTokenByModel: Record<string, number>;

  errorRate: number;
  errorsByCode: Record<string, number>;

  modelUsage: Record<string, number>;
  providerUsage: Record<string, number>;
  modelPerformance: ModelPerformanceRow[];

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

export type WSMessage =
  | { type: 'request:start'; data: Partial<RequestRecord> }
  | { type: 'request:stream-chunk'; data: { requestId: string; text: string; timestamp: number } }
  | { type: 'request:complete'; data: RequestRecord }
  | { type: 'metrics:update'; data: MetricsSnapshot }
  | { type: 'history:sync'; data: RequestRecord[] };
