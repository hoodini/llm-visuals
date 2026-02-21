// Re-export shared types for dashboard use
// Using inline types to avoid workspace resolution issues with Next.js

export type ProviderSlug = 'anthropic' | 'openai' | 'gemini';

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

export type WSMessage =
  | { type: 'request:start'; data: Partial<RequestRecord> }
  | { type: 'request:stream-chunk'; data: { requestId: string; text: string; timestamp: number } }
  | { type: 'request:complete'; data: RequestRecord }
  | { type: 'metrics:update'; data: MetricsSnapshot }
  | { type: 'history:sync'; data: RequestRecord[] };
