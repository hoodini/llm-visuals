import type { ToolDefinition, ParsedMessage, ContentBlock } from '../types/request.js';
import type { ProviderSlug } from '../types/provider.js';

// Rough token estimate: ~4 chars per token for English text
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function parseContentBlocks(content: any): ContentBlock[] {
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }
  if (!Array.isArray(content)) return [];

  return content.map((block: any): ContentBlock => {
    switch (block.type) {
      case 'text':
        return { type: 'text', text: block.text || '' };
      case 'thinking':
        return { type: 'thinking', thinkingText: block.thinking || block.text || '' };
      case 'tool_use':
        return {
          type: 'tool_use',
          toolName: block.name,
          toolId: block.id,
          toolInput: typeof block.input === 'string' ? block.input : JSON.stringify(block.input, null, 2),
        };
      case 'tool_result':
        return {
          type: 'tool_result',
          toolId: block.tool_use_id,
          text: typeof block.content === 'string'
            ? block.content
            : Array.isArray(block.content)
              ? block.content.map((c: any) => c.text || '').join('')
              : JSON.stringify(block.content),
        };
      case 'image':
      case 'image_url':
        return {
          type: 'image',
          imageSource: block.source?.data ? '[base64]' : block.image_url?.url || block.source?.url || '[image]',
          mediaType: block.source?.media_type || 'image/*',
        };
      default:
        return { type: 'other', text: JSON.stringify(block).slice(0, 500) };
    }
  });
}

export function parseMessagesRich(body: any, provider: ProviderSlug): ParsedMessage[] {
  if (!body) return [];
  const msgs: ParsedMessage[] = [];

  if (provider === 'gemini') {
    const contents = body.contents || [];
    for (const c of contents) {
      const text = (c.parts || []).map((p: any) => p.text || '').join('');
      msgs.push({
        role: c.role || 'user',
        contentBlocks: (c.parts || []).map((p: any): ContentBlock => {
          if (p.functionCall) {
            return { type: 'tool_use', toolName: p.functionCall.name, toolInput: JSON.stringify(p.functionCall.args, null, 2) };
          }
          if (p.functionResponse) {
            return { type: 'tool_result', toolName: p.functionResponse.name, text: JSON.stringify(p.functionResponse.response) };
          }
          if (p.inlineData) {
            return { type: 'image', mediaType: p.inlineData.mimeType, imageSource: '[base64]' };
          }
          return { type: 'text', text: p.text || '' };
        }),
        tokenEstimate: estimateTokens(text),
      });
    }
    return msgs;
  }

  // Anthropic + OpenAI: messages array
  const messages = body.messages || [];
  for (const msg of messages) {
    const blocks = parseContentBlocks(msg.content);
    const textContent = blocks
      .map((b) => b.text || b.thinkingText || b.toolInput || '')
      .join('');

    const parsed: ParsedMessage = {
      role: msg.role || 'unknown',
      contentBlocks: blocks,
      tokenEstimate: estimateTokens(textContent),
      name: msg.name,
    };

    // Anthropic cache control
    if (msg.cache_control) {
      parsed.cacheControl = msg.cache_control.type || 'ephemeral';
    }
    // Check content blocks for cache control too
    if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block.cache_control) {
          parsed.cacheControl = block.cache_control.type || 'ephemeral';
        }
      }
    }

    msgs.push(parsed);
  }

  return msgs;
}

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
  // OpenAI: messages[0].role === 'system' or 'developer'
  if (body.messages?.[0]?.role === 'system' || body.messages?.[0]?.role === 'developer') {
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
