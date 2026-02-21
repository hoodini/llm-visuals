'use client';

import { useEffect, useRef } from 'react';
import { useRequestStore } from './use-request-store';
import type { WSMessage } from '@/lib/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setHistory = useRequestStore((s) => s.setHistory);
  const addRequest = useRequestStore((s) => s.addRequest);
  const updateRequest = useRequestStore((s) => s.updateRequest);
  const addStreamChunk = useRequestStore((s) => s.addStreamChunk);
  const setMetrics = useRequestStore((s) => s.setMetrics);
  const setWsStatus = useRequestStore((s) => s.setWsStatus);

  useEffect(() => {
    function connect() {
      setWsStatus('connecting');

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        console.log('[LLM Visuals] Connected to proxy');
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        wsRef.current = null;
        reconnectTimerRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          switch (msg.type) {
            case 'history:sync':
              setHistory(msg.data);
              break;
            case 'request:start':
              addRequest(msg.data);
              break;
            case 'request:stream-chunk':
              addStreamChunk(msg.data.requestId, msg.data.text);
              break;
            case 'request:complete':
              updateRequest(msg.data);
              break;
            case 'metrics:update':
              setMetrics(msg.data);
              break;
          }
        } catch (e) {
          console.error('[LLM Visuals] Failed to parse WS message:', e);
        }
      };
    }

    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [setHistory, addRequest, updateRequest, addStreamChunk, setMetrics, setWsStatus]);
}
