import type { SSEEvent } from './parser.js';

export interface AnthropicAssembled {
  fullText: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string;
}

export function assembleAnthropicResponse(events: SSEEvent[]): AnthropicAssembled {
  let fullText = '';
  let model = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let stopReason = '';

  for (const event of events) {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      continue;
    }

    switch (event.event) {
      case 'message_start':
        model = data.message?.model || '';
        inputTokens = data.message?.usage?.input_tokens || 0;
        break;
      case 'content_block_delta':
        if (data.delta?.type === 'text_delta') {
          fullText += data.delta.text;
        } else if (data.delta?.type === 'input_json_delta') {
          fullText += data.delta.partial_json || '';
        }
        break;
      case 'message_delta':
        outputTokens = data.usage?.output_tokens || 0;
        stopReason = data.delta?.stop_reason || '';
        break;
    }
  }

  return { fullText, model, inputTokens, outputTokens, stopReason };
}
