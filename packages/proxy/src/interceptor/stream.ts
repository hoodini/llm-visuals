import { Transform, type TransformCallback } from 'node:stream';
import {
  SSEParser,
  type SSEEvent,
  type ProviderSlug,
  assembleAnthropicResponse,
  assembleOpenAIResponse,
  assembleGeminiResponse,
} from '@llm-visuals/shared';

export interface AssembledStreamResult {
  fullText: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
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
        // Extract text delta for live streaming to dashboard
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
        result = { fullText: a.fullText, model: a.model, inputTokens: a.inputTokens, outputTokens: a.outputTokens };
        break;
      }
      case 'openai': {
        const o = assembleOpenAIResponse(this.events);
        result = { fullText: o.fullText, model: o.model, inputTokens: o.inputTokens, outputTokens: o.outputTokens };
        break;
      }
      case 'gemini': {
        const g = assembleGeminiResponse(this.events);
        result = { fullText: g.fullText, model: g.model, inputTokens: g.inputTokens, outputTokens: g.outputTokens };
        break;
      }
    }

    this.onComplete(result);
  }

  _transform(chunk: Buffer, _encoding: string, callback: TransformCallback) {
    if (!this._firstByteTime) {
      this._firstByteTime = Date.now();
    }
    // Forward unchanged to client
    this.push(chunk);
    // Feed to parser for recording
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
