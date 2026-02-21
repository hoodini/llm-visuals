import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';
import type { WSMessage, RequestRecord } from '@llm-visuals/shared';

export class Broadcaster {
  private wss: WebSocketServer;
  private clients = new Set<WebSocket>();

  constructor(
    httpServer: Server,
    private getHistory: () => RequestRecord[]
  ) {
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      // Send recent history on connect
      const history = this.getHistory();
      ws.send(JSON.stringify({ type: 'history:sync', data: history } satisfies WSMessage));

      ws.on('close', () => this.clients.delete(ws));
      ws.on('error', () => this.clients.delete(ws));
    });
  }

  send(message: WSMessage) {
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  get connectionCount() {
    return this.clients.size;
  }
}
