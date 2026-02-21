import type { IncomingMessage } from 'node:http';
import { PROVIDERS, type ProviderSlug } from '@llm-visuals/shared';

export interface Provider {
  slug: ProviderSlug;
  displayName: string;
  upstream: string;
  transformRequest(req: IncomingMessage): void;
  isStreaming(body: any, url: string): boolean;
}

class AnthropicProvider implements Provider {
  slug = 'anthropic' as const;
  displayName = 'Anthropic';
  upstream = PROVIDERS.anthropic.upstream;

  transformRequest(req: IncomingMessage) {
    // x-api-key passes through as-is, just fix the host header
    req.headers.host = 'api.anthropic.com';
  }

  isStreaming(body: any) {
    return body?.stream === true;
  }
}

class OpenAIProvider implements Provider {
  slug = 'openai' as const;
  displayName = 'OpenAI';
  upstream = PROVIDERS.openai.upstream;

  transformRequest(req: IncomingMessage) {
    req.headers.host = 'api.openai.com';
  }

  isStreaming(body: any) {
    return body?.stream === true;
  }
}

class GeminiProvider implements Provider {
  slug = 'gemini' as const;
  displayName = 'Google Gemini';
  upstream = PROVIDERS.gemini.upstream;

  transformRequest(req: IncomingMessage) {
    req.headers.host = 'generativelanguage.googleapis.com';
  }

  isStreaming(_body: any, url: string) {
    return url.includes(':streamGenerateContent');
  }
}

export const providerRegistry = new Map<string, Provider>();
providerRegistry.set('anthropic', new AnthropicProvider());
providerRegistry.set('openai', new OpenAIProvider());
providerRegistry.set('gemini', new GeminiProvider());
