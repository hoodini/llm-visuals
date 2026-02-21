import type { RequestRecord } from './request.js';
import type { MetricsSnapshot } from './metrics.js';

export type WSMessage =
  | { type: 'request:start'; data: Partial<RequestRecord> }
  | { type: 'request:stream-chunk'; data: { requestId: string; text: string; timestamp: number } }
  | { type: 'request:complete'; data: RequestRecord }
  | { type: 'metrics:update'; data: MetricsSnapshot }
  | { type: 'history:sync'; data: RequestRecord[] };
