export interface SSEEvent {
  event?: string;
  data: string;
  id?: string;
}

export interface SSEParserHandlers {
  onEvent: (event: SSEEvent) => void;
  onDone: () => void;
}

export class SSEParser {
  private buffer = '';
  private currentEvent: Partial<SSEEvent> = {};
  private done = false;

  constructor(private handlers: SSEParserHandlers) {}

  feed(text: string) {
    if (this.done) return;

    this.buffer += text;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line === '' || line === '\r') {
        // Empty line = end of event
        if (this.currentEvent.data !== undefined) {
          if (this.currentEvent.data === '[DONE]') {
            this.done = true;
            this.handlers.onDone();
            return;
          }
          this.handlers.onEvent(this.currentEvent as SSEEvent);
        }
        this.currentEvent = {};
      } else if (line.startsWith('event:')) {
        this.currentEvent.event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const val = line.slice(5).trimStart();
        this.currentEvent.data =
          this.currentEvent.data !== undefined
            ? this.currentEvent.data + '\n' + val
            : val;
      } else if (line.startsWith('id:')) {
        this.currentEvent.id = line.slice(3).trim();
      }
      // Lines starting with ':' are comments, ignore
    }
  }

  flush() {
    if (!this.done) {
      if (this.buffer.length > 0) {
        this.feed('\n\n');
      }
      this.handlers.onDone();
      this.done = true;
    }
  }
}
