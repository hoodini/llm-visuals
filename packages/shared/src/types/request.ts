import type { ProviderSlug } from './provider.js';

export interface RequestRecord {
  id: string;
  provider: ProviderSlug;
  method: string;
  path: string;
  url: string;

  // Request
  requestHeaders: Record<string, string>;
  requestBody: string;
  model: string;
  systemPrompt: string | null;
  tools: ToolDefinition[];
  messages: unknown[];
  isStreaming: boolean;

  // Response
  statusCode: number | null;
  responseHeaders: Record<string, string>;
  responseBody: string;
  fullResponseText: string;

  // Timing
  startedAt: number;
  firstByteAt: number | null;
  completedAt: number | null;
  duration: number | null;
  ttfb: number | null;

  // Metrics
  inputTokens: number;
  outputTokens: number;
  tokensPerSecond: number | null;
  estimatedCost: number;

  // Session
  sessionId: string | null;
}

export interface ToolDefinition {
  name: string;
  description?: string;
  input_schema?: unknown;
  parameters?: unknown;
}

export function createEmptyRecord(id: string, provider: ProviderSlug): RequestRecord {
  return {
    id,
    provider,
    method: 'POST',
    path: '',
    url: '',
    requestHeaders: {},
    requestBody: '',
    model: '',
    systemPrompt: null,
    tools: [],
    messages: [],
    isStreaming: false,
    statusCode: null,
    responseHeaders: {},
    responseBody: '',
    fullResponseText: '',
    startedAt: Date.now(),
    firstByteAt: null,
    completedAt: null,
    duration: null,
    ttfb: null,
    inputTokens: 0,
    outputTokens: 0,
    tokensPerSecond: null,
    estimatedCost: 0,
    sessionId: null,
  };
}
