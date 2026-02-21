import type { SSEEvent } from './parser.js';

export interface GeminiAssembled {
  fullText: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
}

export function assembleGeminiResponse(events: SSEEvent[]): GeminiAssembled {
  let fullText = '';
  let model = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let finishReason = '';

  for (const event of events) {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      continue;
    }

    if (data.modelVersion) model = data.modelVersion;

    const candidate = data.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) fullText += part.text;
      }
    }
    if (candidate?.finishReason) {
      finishReason = candidate.finishReason;
    }

    if (data.usageMetadata) {
      inputTokens = data.usageMetadata.promptTokenCount || 0;
      outputTokens = data.usageMetadata.candidatesTokenCount || 0;
    }
  }

  return { fullText, model, inputTokens, outputTokens, finishReason };
}
