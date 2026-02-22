# LLM Visuals - Real-Time LLM Traffic Observatory

See exactly what your AI coding agents are sending and receiving. Every token, every hidden system prompt, every tool call - in real time.

## What Is This?

A reverse proxy + dashboard that sits between your LLM clients (Claude Code, GitHub Copilot, Claude Desktop, ChatGPT, etc.) and the LLM APIs. It intercepts all traffic transparently, displays full request/response payloads, and provides real-time metrics.

**Zero code changes. Zero certificates. Just one environment variable per provider.**

```
Your LLM Client                   LLM Visuals Proxy                    LLM API
(VSCode, CLI, Desktop)  ------->  localhost:4000          ---------->  api.anthropic.com
                        <-------  Intercept + Record      <----------  api.openai.com
                                        |                              generativelanguage.googleapis.com
                                        | WebSocket (real-time)
                                        v
                                  Dashboard (localhost:3000)
                                  Full inspection + metrics
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/hoodini/llm-visuals.git
cd llm-visuals
npm install

# Start both proxy and dashboard
npm run dev
```

This starts:
- **Proxy** on `http://localhost:4000` - intercepts LLM traffic
- **Dashboard** on `http://localhost:3000` - shows everything in real time

## Connect Your LLM Tools

### Claude Code (VSCode Extension / CLI)

```bash
# Set the environment variable before launching
export ANTHROPIC_BASE_URL=http://localhost:4000/anthropic

# Now use Claude Code normally - all traffic flows through the proxy
claude "explain this code"
```

Or in your shell profile (`~/.bashrc`, `~/.zshrc`):
```bash
export ANTHROPIC_BASE_URL=http://localhost:4000/anthropic
```

### Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "apiBaseUrl": "http://localhost:4000/anthropic"
}
```

Restart Claude Desktop after editing.

### GitHub Copilot

```bash
# For OpenAI-based Copilot requests
export OPENAI_BASE_URL=http://localhost:4000/openai
```

### OpenAI API (ChatGPT, GPT-4, etc.)

```bash
export OPENAI_BASE_URL=http://localhost:4000/openai
```

Or in your code:
```python
import openai
client = openai.OpenAI(base_url="http://localhost:4000/openai/v1")
```

```typescript
import OpenAI from 'openai';
const client = new OpenAI({ baseURL: 'http://localhost:4000/openai/v1' });
```

### Google Gemini

```bash
export GEMINI_BASE_URL=http://localhost:4000/gemini
```

Or in code:
```python
import google.generativeai as genai
# Set the transport endpoint to the proxy
genai.configure(api_key="your-key", transport="rest", client_options={"api_endpoint": "http://localhost:4000/gemini"})
```

### Any OpenAI-Compatible API

If your tool supports setting a base URL, just point it to:
```
http://localhost:4000/openai
```

## What You Can See

### Full Request Inspector
- **System prompts** - See the hidden instructions your tools send
- **Message chains** - Every message in the conversation, with role labels (system, user, assistant, tool)
- **Thinking blocks** - Extended thinking / chain-of-thought content (Anthropic)
- **Tool definitions** - All tools available to the model, with schemas
- **Tool use & results** - What tools the model called and what came back
- **Images & files** - Media attachments in the context
- **Cache control** - Anthropic prompt caching indicators
- **Headers** - Full request/response headers (API keys auto-redacted)
- **Raw JSON** - Complete request and response bodies, pretty-printed

### Real-Time Metrics
- **Token flow** - Input/output tokens per request with ratio visualization
- **Cost tracking** - Per-request and cumulative cost by provider and model
- **Latency** - Duration, TTFB, tokens/sec with speed gauge
- **Token timeline** - Tokens over time chart
- **Model usage** - Pie chart of which models you're using most
- **Cost by provider** - Bar chart of spending across providers
- **Live streaming** - Watch responses stream in real time with pulsing indicators

### Context Chain Visualization
Click any request and go to the **Context** tab to see the full conversation chain:
- Each message displayed with its role (System, User, Assistant, Tool)
- Token estimates per message so you can see what's eating your context window
- Expandable thinking blocks, tool calls, and tool results
- Cache control badges showing which messages are cached
- Color-coded timeline showing the proportional token usage per role

## Real-World Examples

### "Why is Claude Code using so many tokens?"
1. Start the proxy: `npm run dev`
2. Set `ANTHROPIC_BASE_URL=http://localhost:4000/anthropic`
3. Use Claude Code normally
4. Open `http://localhost:3000` - see every request
5. Click a request -> **Context** tab -> See the full message chain
6. Discover: Claude Code sends your entire file contents, project structure, and previous conversation turns as context

### "What system prompt does Copilot use?"
1. Set `OPENAI_BASE_URL=http://localhost:4000/openai`
2. Use Copilot in VSCode
3. Click any captured request -> **System** tab
4. See the complete system prompt Copilot sends to the model

### "How much am I spending per coding session?"
1. Route all your LLM traffic through the proxy
2. Open the **Metrics** tab in the dashboard
3. See total cost, cost by provider, cost by model - all in real time
4. The dashboard aggregates across all providers simultaneously

### "Is prompt caching actually working?"
1. Make multiple requests through Claude
2. Check the **Overview** tab for cache read/write token counts
3. Check the **Context** tab for cache control badges on messages
4. If `cache_read_input_tokens` > 0, caching is active

## Architecture

```
llm-visuals/
├── packages/
│   ├── shared/          # Types, SSE parsers, cost tables
│   ├── proxy/           # Node.js reverse proxy (port 4000)
│   └── dashboard/       # Next.js 15 dashboard (port 3000)
├── package.json         # npm workspaces root
└── turbo.json           # Turborepo for parallel dev
```

### How It Works
1. Client sends request to `localhost:4000/anthropic/v1/messages`
2. Proxy strips the provider prefix, captures the full request body
3. Parses out system prompt, messages, tools, model from the body
4. Forwards the request unchanged to the real API
5. For streaming responses: pipes through a Transform stream that forwards every byte to the client while simultaneously recording it
6. Broadcasts to the dashboard via WebSocket in real time
7. Dashboard renders the full inspection view

**Zero latency impact** - the proxy forwards bytes as they arrive. Recording happens in parallel.

### Supported Providers
| Provider | Prefix | Upstream |
|----------|--------|----------|
| Anthropic | `/anthropic` | `https://api.anthropic.com` |
| OpenAI | `/openai` | `https://api.openai.com` |
| Google Gemini | `/gemini` | `https://generativelanguage.googleapis.com` |

## Tech Stack
- **Proxy**: Node.js, `http-proxy`, WebSocket
- **Dashboard**: Next.js 15, Tailwind CSS, Zustand, Recharts
- **Shared**: TypeScript types, SSE stream parsers, pricing tables

## Development

```bash
# Install dependencies
npm install

# Start development (proxy + dashboard in parallel)
npm run dev

# Build for production
npm run build

# Start proxy only
npm run dev --workspace=@llm-visuals/proxy

# Start dashboard only
npm run dev --workspace=@llm-visuals/dashboard
```

## Security Notes
- API keys pass through the proxy transparently to the upstream API
- In the dashboard, API keys are **always redacted** as `[REDACTED]`
- The proxy runs locally - your data never leaves your machine
- No telemetry, no external connections from the proxy itself

## License

MIT
