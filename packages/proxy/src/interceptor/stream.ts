import { Transform, type TransformCallback } from 'node:stream';
import {
  SSEParser,
  type SSEEvent,
  type ProviderSlug,
  type ResponseBlock,
  assembleAnthropicResponse,
  assembleOpenAIResponse,
  assembleGeminiResponse,
} from '@llm-visuals/shared';

export interface AssembledStreamResult {
  fullText: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  responseBlocks: ResponseBlock[];
}

export class SSEInterceptTransform extends Transform {
  private parser: SSEParser;
  private events: SSEEvent[] = [];
  private _firstByteTime: number | null = null;

  constructor(
    private requestId: string,
    private providerType: ProviderSlug,
    private onComplete: (result: AssembledStreamResult) => void,
    private onChunk: (data: { requestId: string; text: string; timestamp: number }) => void
  ) {
    super();
    this.parser = new SSEParser({
      onEvent: (event) => {
        this.events.push(event);
        const text = this.extractTextDelta(event);
        if (text) {
          this.onChunk({
            requestId: this.requestId,
            text,
            timestamp: Date.now(),
          });
        }
      },
      onDone: () => {
        this.assembleAndComplete();
      },
    });
  }

  private extractTextDelta(event: SSEEvent): string | null {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      return null;
    }

    switch (this.providerType) {
      case 'anthropic':
        if (data.delta?.type === 'text_delta') return data.delta.text;
        break;
      case 'openai':
        return data.choices?.[0]?.delta?.content || null;
      case 'gemini':
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
    return null;
  }

  private assembleAndComplete() {
    let result: AssembledStreamResult;

    switch (this.providerType) {
      case 'anthropic': {
        const a = assembleAnthropicResponse(this.events);
        result = {
          fullText: a.fullText,
          model: a.model,
          inputTokens: a.inputTokens,
          outputTokens: a.outputTokens,
          cacheReadTokens: a.cacheReadTokens,
          cacheCreationTokens: a.cacheCreationTokens,
          responseBlocks: a.responseBlocks,
        };
        break;
      }
      case 'openai': {
        const o = assembleOpenAIResponse(this.events);
        result = {
          fullText: o.fullText,
          model: o.model,
          inputTokens: o.inputTokens,
          outputTokens: o.outputTokens,
          cacheReadTokens: 0,
          cacheCreationTokens: 0,
          responseBlocks: o.fullText ? [{ type: 'text', text: o.fullText }] : [],
        };
        break;
      }
      case 'gemini': {
        const g = assembleGeminiResponse(this.events);
        result = {
          fullText: g.fullText,
          model: g.model,
          inputTokens: g.inputTokens,
          outputTokens: g.outputTokens,
          cacheReadTokens: 0,
          cacheCreationTokens: 0,
          responseBlocks: g.fullText ? [{ type: 'text', text: g.fullText }] : [],
        };
        break;
      }
    }

    this.onComplete(result);
  }

  _transform(chunk: Buffer, _encoding: string, callback: TransformCallback) {
    if (!this._firstByteTime) {
      this._firstByteTime = Date.now();
    }
    this.push(chunk);
    this.parser.feed(chunk.toString('utf-8'));
    callback();
  }

  _flush(callback: TransformCallback) {
    this.parser.flush();
    callback();
  }

  get firstByteTime() {
    return this._firstByteTime;
  }
}
