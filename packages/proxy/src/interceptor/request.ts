import type { IncomingMessage } from 'node:http';
import {
  extractSystemPrompt,
  extractTools,
  extractModel,
  extractMessages,
  redactHeaders,
} from '@llm-visuals/shared';

export interface CapturedRequest {
  raw: string;
  parsed: any;
  systemPrompt: string | null;
  tools: any[];
  model: string;
  messages: unknown[];
  redactedHeaders: Record<string, string>;
}

export function captureRequestBody(req: IncomingMessage): Promise<CapturedRequest> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Not JSON - forward as-is
      }

      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers[key] = value;
      }

      resolve({
        raw,
        parsed,
        systemPrompt: extractSystemPrompt(parsed),
        tools: extractTools(parsed),
        model: extractModel(parsed),
        messages: extractMessages(parsed),
        redactedHeaders: redactHeaders(headers),
      });
    });
  });
}
