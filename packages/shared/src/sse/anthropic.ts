import type { SSEEvent } from './parser.js';
import type { ResponseBlock } from '../types/request.js';

export interface AnthropicAssembled {
  fullText: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  stopReason: string;
  responseBlocks: ResponseBlock[];
}

export function assembleAnthropicResponse(events: SSEEvent[]): AnthropicAssembled {
  let fullText = '';
  let model = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;
  let cacheCreationTokens = 0;
  let stopReason = '';
  const responseBlocks: ResponseBlock[] = [];

  let currentBlockType: string | null = null;
  let currentBlockText = '';
  let currentToolName = '';
  let currentToolId = '';
  let currentToolInput = '';

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
        cacheReadTokens = data.message?.usage?.cache_read_input_tokens || 0;
        cacheCreationTokens = data.message?.usage?.cache_creation_input_tokens || 0;
        break;

      case 'content_block_start':
        currentBlockType = data.content_block?.type || null;
        currentBlockText = '';
        currentToolName = data.content_block?.name || '';
        currentToolId = data.content_block?.id || '';
        currentToolInput = '';
        break;

      case 'content_block_delta':
        if (data.delta?.type === 'text_delta') {
          fullText += data.delta.text;
          currentBlockText += data.delta.text;
        } else if (data.delta?.type === 'input_json_delta') {
          currentToolInput += data.delta.partial_json || '';
        } else if (data.delta?.type === 'thinking_delta') {
          currentBlockText += data.delta.thinking || '';
        }
        break;

      case 'content_block_stop':
        if (currentBlockType === 'text') {
          responseBlocks.push({ type: 'text', text: currentBlockText });
        } else if (currentBlockType === 'thinking') {
          responseBlocks.push({ type: 'thinking', thinkingText: currentBlockText });
        } else if (currentBlockType === 'tool_use') {
          responseBlocks.push({
            type: 'tool_use',
            toolName: currentToolName,
            toolId: currentToolId,
            toolInput: currentToolInput,
          });
        }
        currentBlockType = null;
        break;

      case 'message_delta':
        outputTokens = data.usage?.output_tokens || 0;
        stopReason = data.delta?.stop_reason || '';
        break;
    }
  }

  return { fullText, model, inputTokens, outputTokens, cacheReadTokens, cacheCreationTokens, stopReason, responseBlocks };
}
