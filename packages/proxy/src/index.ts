import { server, PROXY_PORT } from './server.js';

server.listen(PROXY_PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║           LLM Visuals Proxy Server                  ║');
  console.log('  ╠══════════════════════════════════════════════════════╣');
  console.log(`  ║  Proxy:     http://localhost:${PROXY_PORT}                   ║`);
  console.log(`  ║  WebSocket: ws://localhost:${PROXY_PORT}/ws                  ║`);
  console.log('  ║                                                      ║');
  console.log('  ║  Configure your clients:                             ║');
  console.log(`  ║  ANTHROPIC_BASE_URL=http://localhost:${PROXY_PORT}/anthropic  ║`);
  console.log(`  ║  OPENAI_BASE_URL=http://localhost:${PROXY_PORT}/openai       ║`);
  console.log(`  ║  GEMINI_BASE_URL=http://localhost:${PROXY_PORT}/gemini       ║`);
  console.log('  ╚══════════════════════════════════════════════════════╝');
  console.log('');
});
