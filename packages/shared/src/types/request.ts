import type { ProviderSlug } from './provider.js';

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

  // Request
  requestHeaders: Record<string, string>;
  requestBody: string;
  model: string;
  systemPrompt: string | null;
  tools: ToolDefinition[];
  messages: unknown[];
  isStreaming: boolean;

  // Parsed context (rich message chain)
  parsedMessages: ParsedMessage[];
  responseBlocks: ResponseBlock[];
  totalMessageCount: number;
  hasCacheControl: boolean;
  hasThinkingBlocks: boolean;
  hasToolUse: boolean;
  hasImages: boolean;

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
  cacheReadTokens: number;
  cacheCreationTokens: number;
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
    parsedMessages: [],
    responseBlocks: [],
    totalMessageCount: 0,
    hasCacheControl: false,
    hasThinkingBlocks: false,
    hasToolUse: false,
    hasImages: false,
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
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    tokensPerSecond: null,
    estimatedCost: 0,
    sessionId: null,
  };
}
