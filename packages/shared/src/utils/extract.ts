import type { ToolDefinition } from '../types/request.js';
import type { ProviderSlug } from '../types/provider.js';

export function extractSystemPrompt(body: any): string | null {
  if (!body) return null;
  // Anthropic: top-level "system" field
  if (body.system) {
    return typeof body.system === 'string'
      ? body.system
      : Array.isArray(body.system)
        ? body.system.map((b: any) => b.text || '').join('\n')
        : null;
  }
  // OpenAI: messages[0].role === 'system'
  if (body.messages?.[0]?.role === 'system') {
    const content = body.messages[0].content;
    return typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((c: any) => c.text || '').join('\n')
        : null;
  }
  // Gemini: systemInstruction
  if (body.systemInstruction) {
    return body.systemInstruction.parts?.map((p: any) => p.text || '').join('\n') || null;
  }
  return null;
}

export function extractTools(body: any): ToolDefinition[] {
  if (!body) return [];
  // Anthropic + OpenAI: top-level "tools" array
  if (Array.isArray(body.tools)) {
    return body.tools.map((t: any) => ({
      name: t.name || t.function?.name || 'unknown',
      description: t.description || t.function?.description,
      input_schema: t.input_schema || t.function?.parameters,
    }));
  }
  // Gemini: tools[].functionDeclarations
  if (body.tools?.[0]?.functionDeclarations) {
    return body.tools[0].functionDeclarations.map((f: any) => ({
      name: f.name,
      description: f.description,
      input_schema: f.parameters,
    }));
  }
  return [];
}

export function extractModel(body: any): string {
  return body?.model || '';
}

export function extractMessages(body: any): unknown[] {
  // Anthropic + OpenAI
  if (Array.isArray(body?.messages)) return body.messages;
  // Gemini
  if (Array.isArray(body?.contents)) return body.contents;
  return [];
}

export function isStreamingRequest(provider: ProviderSlug, body: any, url: string): boolean {
  if (provider === 'gemini') {
    return url.includes(':streamGenerateContent');
  }
  return body?.stream === true;
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted = { ...headers };
  const sensitiveKeys = ['x-api-key', 'authorization', 'api-key'];
  for (const key of sensitiveKeys) {
    if (redacted[key]) {
      redacted[key] = '[REDACTED]';
    }
  }
  return redacted;
}
