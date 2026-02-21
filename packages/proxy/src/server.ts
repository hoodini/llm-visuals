import http from 'node:http';
import { Readable } from 'node:stream';
import httpProxy from 'http-proxy';
import { nanoid } from 'nanoid';
import {
  createEmptyRecord,
  calculateCost,
  redactHeaders,
  type ProviderSlug,
  type RequestRecord,
} from '@llm-visuals/shared';
import { providerRegistry } from './providers/registry.js';
import { captureRequestBody } from './interceptor/request.js';
import { SSEInterceptTransform } from './interceptor/stream.js';
import { MemoryStorage } from './storage/memory.js';
import { Broadcaster } from './ws/broadcaster.js';
import { computeMetrics } from './metrics/collector.js';

const PROXY_PORT = parseInt(process.env.PROXY_PORT || '4000', 10);

const storage = new MemoryStorage();

const proxy = httpProxy.createProxyServer({
  selfHandleResponse: true,
  changeOrigin: true,
  secure: true,
});

const server = http.createServer(async (req, res) => {
  // CORS headers for dashboard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Dashboard API: GET /api/requests
  if (req.url === '/api/requests') {
    const records = storage.getAll(200);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(records));
    return;
  }

  // Dashboard API: GET /api/metrics
  if (req.url === '/api/metrics') {
    const metrics = computeMetrics(storage.getAllRecords());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics));
    return;
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', connections: broadcaster.connectionCount }));
    return;
  }

  // Route to provider
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const segments = url.pathname.split('/').filter(Boolean);
  const providerSlug = segments[0];

  const provider = providerRegistry.get(providerSlug);
  if (!provider) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: `Unknown provider: "${providerSlug}". Available: ${[...providerRegistry.keys()].join(', ')}`,
    }));
    return;
  }

  // Capture request body
  const captured = await captureRequestBody(req);
  const requestId = nanoid(12);

  // Strip provider prefix from path
  const upstreamPath = '/' + segments.slice(1).join('/') + url.search;

  // Create record
  const record = createEmptyRecord(requestId, provider.slug);
  record.path = upstreamPath;
  record.url = provider.upstream + upstreamPath;
  record.method = req.method || 'POST';
  record.requestHeaders = captured.redactedHeaders;
  record.requestBody = captured.raw;
  record.model = captured.model;
  record.systemPrompt = captured.systemPrompt;
  record.tools = captured.tools;
  record.messages = captured.messages;
  record.isStreaming = provider.isStreaming(captured.parsed, upstreamPath);

  storage.save(record);
  broadcaster.send({ type: 'request:start', data: record });

  // Transform headers for upstream
  provider.transformRequest(req);
  req.url = upstreamPath;

  // Forward with buffered body
  const bodyBuffer = Buffer.from(captured.raw, 'utf-8');
  req.headers['content-length'] = String(bodyBuffer.length);

  // Attach requestId for proxyRes handler
  (req as any).__requestId = requestId;
  (req as any).__record = record;

  proxy.web(req, res, {
    target: provider.upstream,
    buffer: Readable.from(bodyBuffer),
  });
});

// Handle proxy responses
proxy.on('proxyRes', (proxyRes, req, res) => {
  const record: RequestRecord = (req as any).__record;

  record.statusCode = proxyRes.statusCode || 0;
  const resHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(proxyRes.headers)) {
    if (typeof value === 'string') resHeaders[key] = value;
  }
  record.responseHeaders = resHeaders;

  const contentType = proxyRes.headers['content-type'] || '';
  const isSSE = contentType.includes('text/event-stream');

  if (isSSE && record.isStreaming) {
    // Streaming response - use Transform stream
    res.writeHead(proxyRes.statusCode!, {
      ...proxyRes.headers,
      'x-accel-buffering': 'no',
      'cache-control': 'no-cache, no-transform',
    });

    const transform = new SSEInterceptTransform(
      record.id,
      record.provider,
      (result) => {
        record.fullResponseText = result.fullText;
        record.inputTokens = result.inputTokens || record.inputTokens;
        record.outputTokens = result.outputTokens;
        if (result.model) record.model = result.model;
        record.completedAt = Date.now();
        record.duration = record.completedAt - record.startedAt;
        record.firstByteAt = transform.firstByteTime;
        record.ttfb = record.firstByteAt ? record.firstByteAt - record.startedAt : null;

        // tokens/sec for streaming
        const streamDuration = record.duration / 1000;
        if (streamDuration > 0 && record.outputTokens > 0) {
          record.tokensPerSecond = Math.round(record.outputTokens / streamDuration);
        }

        record.estimatedCost = calculateCost(
          record.provider,
          record.model,
          record.inputTokens,
          record.outputTokens
        );

        storage.save(record);
        broadcaster.send({ type: 'request:complete', data: record });

        // Push updated metrics
        const metrics = computeMetrics(storage.getAllRecords());
        broadcaster.send({ type: 'metrics:update', data: metrics });
      },
      (chunk) => {
        broadcaster.send({ type: 'request:stream-chunk', data: chunk });
      }
    );

    proxyRes.pipe(transform).pipe(res as any);
  } else {
    // Non-streaming response - buffer entirely
    const bodyChunks: Buffer[] = [];
    proxyRes.on('data', (chunk: Buffer) => bodyChunks.push(chunk));
    proxyRes.on('end', () => {
      const body = Buffer.concat(bodyChunks).toString('utf-8');
      record.responseBody = body;
      record.completedAt = Date.now();
      record.duration = record.completedAt - record.startedAt;
      record.ttfb = record.duration; // Non-streaming: TTFB ≈ total

      // Try extracting token usage from non-streaming response
      try {
        const parsed = JSON.parse(body);
        // Anthropic non-streaming
        if (parsed.usage) {
          record.inputTokens = parsed.usage.input_tokens || parsed.usage.prompt_tokens || 0;
          record.outputTokens = parsed.usage.output_tokens || parsed.usage.completion_tokens || 0;
        }
        if (parsed.model) record.model = parsed.model;
        // Extract response text
        if (parsed.content) {
          record.fullResponseText = parsed.content
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text)
            .join('');
        } else if (parsed.choices?.[0]?.message?.content) {
          record.fullResponseText = parsed.choices[0].message.content;
        }
      } catch {
        record.fullResponseText = body;
      }

      record.estimatedCost = calculateCost(
        record.provider,
        record.model,
        record.inputTokens,
        record.outputTokens
      );

      storage.save(record);
      broadcaster.send({ type: 'request:complete', data: record });

      const metrics = computeMetrics(storage.getAllRecords());
      broadcaster.send({ type: 'metrics:update', data: metrics });

      res.writeHead(proxyRes.statusCode!, proxyRes.headers);
      res.end(body);
    });
  }
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  const record: RequestRecord | undefined = (req as any)?.__record;
  if (record) {
    record.statusCode = 502;
    record.completedAt = Date.now();
    record.duration = record.completedAt - record.startedAt;
    record.fullResponseText = `Proxy error: ${err.message}`;
    storage.save(record);
    broadcaster.send({ type: 'request:complete', data: record });
  }
  if (res && 'writeHead' in res) {
    (res as http.ServerResponse).writeHead(502, { 'Content-Type': 'application/json' });
    (res as http.ServerResponse).end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  }
});

const broadcaster = new Broadcaster(server, () => storage.getAll(100));

export { server, PROXY_PORT };
