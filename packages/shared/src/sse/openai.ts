import type { SSEEvent } from './parser.js';

export interface OpenAIAssembled {
  fullText: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
}

export function assembleOpenAIResponse(events: SSEEvent[]): OpenAIAssembled {
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

    if (data.model) model = data.model;

    const choice = data.choices?.[0];
    if (choice?.delta?.content) {
      fullText += choice.delta.content;
    }
    if (choice?.finish_reason) {
      finishReason = choice.finish_reason;
    }

    // Token usage (sent in final chunk if stream_options.include_usage is set)
    if (data.usage) {
      inputTokens = data.usage.prompt_tokens || 0;
      outputTokens = data.usage.completion_tokens || 0;
    }
  }

  return { fullText, model, inputTokens, outputTokens, finishReason };
}
