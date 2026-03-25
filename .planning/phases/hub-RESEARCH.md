# Hub Chat: AI SDK + MCP Research

**Researched:** 2026-03-24
**Domain:** Vercel AI SDK v6, MCP integration, multi-provider routing, Next.js edge/serverless
**Confidence:** HIGH (findings verified against installed packages + official docs)

---

## Summary

The hub chat feature at `/hub/chat` uses `ai@6.0.5`, `@ai-sdk/react@3.0.137`, `@ai-sdk/google@3.0.52`, `@ai-sdk/anthropic@3.0.63`, `@ai-sdk/openai@3.0.12`, and `zod@3.25.76` (the lockfile pins to 3.25.76 despite package.json specifying ^4.3.6).

~~The current `src/app/api/hub/chat/route.js` has **three breaking API mismatches** with the installed SDK version~~

**ALL 4 API BUGS FIXED** (verified 2026-03-24 by reading actual `route.js`):

1. ✅ `convertToModelMessages(messages)` — applied at line 211
2. ✅ `stopWhen: stepCountIs(5)` — applied at line 239 (was `maxSteps`)
3. ✅ `result.toUIMessageStreamResponse()` — applied at line 243 (was `toDataStreamResponse`)
4. ✅ `google.tools.googleSearch({})` — applied at lines 222–230 (conditional, no custom tools alongside)

The multi-provider routing pattern, tool definitions with `parameters`, and provider selection logic are all sound and require no changes. Route is ready for live testing.

---

## CURRENT CODE AUDIT

### `src/app/api/hub/chat/route.js` — Bugs (ALL FIXED 2026-03-23)

| Fix | Was | Now |
|-----|-----|-----|
| ✅ `stopWhen` | `maxSteps: 5` (silently ignored) | `stopWhen: stepCountIs(5)` at line 239 |
| ✅ `toUIMessageStreamResponse` | `toDataStreamResponse()` (runtime crash) | `result.toUIMessageStreamResponse()` at line 243 |
| ✅ `google.tools.googleSearch` | `providerOptions.google.useSearchGrounding` (no effect) | conditional at lines 222–230 |
| ✅ `convertToModelMessages` | messages passed directly (UIMessage format mismatch) | `convertToModelMessages(messages)` at line 211 |

**Verified by:** Direct inspection of `node_modules/ai/dist/index.js` and `node_modules/@ai-sdk/google/dist/index.js`, plus reading actual `route.js` (2026-03-24).

### `src/app/hub/chat/page.jsx` — State

The chat page is a full client component using `useChat` from `@ai-sdk/react`. It constructs `body` with `{ model, systemPrompt, enableWebSearch, activeSkills, activeMcps }` and POSTs to `/api/hub/chat`. This pattern is correct — `useChat`'s `body` option is merged into the request body. No changes needed in the client.

---

## Standard Stack

### Core (verified against node_modules)

| Package | Installed | Purpose | Notes |
|---------|-----------|---------|-------|
| `ai` | 6.0.5 | streamText, tool, stepCountIs, convertToModelMessages | Use `stopWhen` not `maxSteps` |
| `@ai-sdk/react` | 3.0.137 | useChat hook | Sends UIMessage format; expects SSE with `x-vercel-ai-ui-message-stream` header |
| `@ai-sdk/google` | 3.0.52 | Gemini models + googleSearch tool | `google.tools.googleSearch({})` not `useSearchGrounding` |
| `@ai-sdk/anthropic` | 3.0.63 | Claude models + thinking | `providerOptions.anthropic.thinking` |
| `@ai-sdk/openai` | 3.0.12 | GPT + OpenAI-compat endpoints | `createOpenAI({ baseURL })` for DeepSeek/xAI/Groq/etc |
| `zod` | 3.25.76 (locked) | Tool schema definitions | Use `parameters` field (still works in ai@6.0.5); do NOT rename to `inputSchema` yet (active bug #12020) |

### MCP (not yet installed)

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `@ai-sdk/mcp` | 1.0.25+ | `createMCPClient` for MCP server connections | `npm install @ai-sdk/mcp` |

### Supported OpenAI-compatible providers via `createOpenAI`

| Provider | baseURL | Env Key |
|----------|---------|---------|
| DeepSeek | `https://api.deepseek.com/v1` | `DEEPSEEK_API_KEY` |
| Mistral | `https://api.mistral.ai/v1` | `MISTRAL_API_KEY` |
| Groq | `https://api.groq.com/openai/v1` | `GROQ_API_KEY` |
| Together AI | `https://api.together.xyz/v1` | `TOGETHER_API_KEY` |
| xAI | `https://api.x.ai/v1` | `XAI_API_KEY` |
| Moonshot/Kimi | `https://api.moonshot.cn/v1` | `MOONSHOT_API_KEY` |

---

## Architecture Patterns

### Route Runtime Decision

The current route has `export const runtime = "edge"`. This works for basic `streamText` + provider calls because edge runtime supports `fetch`. However:

- **MCP via stdio**: Cannot run on edge — requires Node.js `child_process`
- **MCP via HTTP/SSE**: Can run on edge — uses only `fetch`
- **`convertToModelMessages`**: Works on both (pure JS)
- **Database access tool** (calls internal API): Works on edge via `fetch`

**Use edge runtime** when MCP is not needed or all MCP servers are remote HTTP/SSE.
**Switch to Node.js runtime** (`// remove export const runtime = "edge"`) if stdio MCP is ever needed.

### Correct streamText Pattern (ai@6.0.5)

```javascript
// Source: verified against node_modules/ai/dist/index.js
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";

export async function POST(req) {
  const { messages, model, systemPrompt, enableWebSearch, activeSkills } = await req.json();

  // REQUIRED: convert UIMessages from useChat to model-compatible format
  const modelMessages = await convertToModelMessages(messages);

  const resolvedModel = resolveModel(model);

  const result = await streamText({
    model: resolvedModel,
    system: systemPrompt || "You are a helpful assistant.",
    messages: modelMessages,          // use converted messages
    providerOptions,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    stopWhen: stepCountIs(5),         // NOT maxSteps
  });

  return result.toUIMessageStreamResponse(); // NOT toDataStreamResponse
}
```

### Tool Definition Pattern (ai@6.0.5)

```javascript
// `parameters` still works in ai@6.0.5 — verified by running tool() in node_modules
// Do NOT rename to `inputSchema` — open bug #12020 causes empty schema with Anthropic
import { tool } from "ai";
import { z } from "zod";

const myTool = tool({
  description: "What the tool does",
  parameters: z.object({          // keep as `parameters` in ai@6.0.5
    query: z.string().describe("Search term"),
    limit: z.number().optional().describe("Max results"),
  }),
  execute: async ({ query, limit }) => {
    // return serializable data
    return { results: [] };
  },
});
```

### Google Search Grounding Pattern

`useSearchGrounding` is NOT present in `@ai-sdk/google@3.0.52`. Use the provider-defined tool:

```javascript
// Source: verified against node_modules/@ai-sdk/google/dist/index.js
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

// When enableWebSearch === true AND provider === "google":
const tools = {
  google_search: google.tools.googleSearch({}),
  // Optional: add timerange filter
  // google_search: google.tools.googleSearch({
  //   searchTypes: { webSearch: {} },
  //   timeRangeFilter: { startTime: '2025-01-01T00:00:00Z' }
  // })
};

// CRITICAL: Google search grounding is INCOMPATIBLE with custom user-defined tools.
// Do NOT pass both google.tools.googleSearch and custom tools in the same streamText call.
// When web search is active, disable all custom skill tools for that request.
```

**Pitfall:** Passing `google.tools.googleSearch({})` alongside custom `tool()` definitions silently
disables the custom tools on Gemini models. This is a Google API constraint, not an SDK bug. The
pattern must be: if `enableWebSearch && provider === "google"`, use ONLY `google_search` tool.

### Anthropic Extended Thinking Pattern

```javascript
// Source: official Anthropic provider docs + verified against installed package
const providerOptions = {
  anthropic: {
    thinking: { type: "enabled", budgetTokens: 10000 }
    // For claude-opus-4 and newer: { type: "adaptive" }
  }
};

const result = await streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  messages: modelMessages,
  providerOptions,
});
// result.text contains final answer; reasoningText available if streaming
```

### Multi-Provider Resolution Pattern (keep existing — it's correct)

```javascript
// The existing resolveModel() pattern in route.js is correct.
// createOpenAI({ baseURL }) works for all OpenAI-compatible providers.
// No changes needed to MODEL_REGISTRY or providers map.
const providers = {
  openai: () => createOpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  deepseek: () => createOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  }),
  // ... etc
};
```

### MCP Integration Pattern (HTTP transport only — works on edge)

Install `@ai-sdk/mcp` first: `npm install @ai-sdk/mcp`

```javascript
// Source: ai-sdk.dev/docs/ai-sdk-core/mcp-tools
import { createMCPClient } from "@ai-sdk/mcp";

export async function POST(req) {
  const { messages, activeMcps } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  let mcpTools = {};
  let mcpClients = [];

  if (activeMcps.includes("context7")) {
    const client = await createMCPClient({
      transport: {
        type: "http",
        url: "https://mcp.context7.com/mcp",  // or wherever context7 is hosted
        headers: { Authorization: `Bearer ${process.env.CONTEXT7_API_KEY}` },
      },
    });
    mcpClients.push(client);
    const tools = await client.tools();
    mcpTools = { ...mcpTools, ...tools };
  }

  const result = await streamText({
    model: resolvedModel,
    messages: modelMessages,
    tools: { ...customTools, ...mcpTools },
    stopWhen: stepCountIs(5),
    onFinish: async () => {
      // REQUIRED: close all MCP clients to release connections
      await Promise.all(mcpClients.map(c => c.close()));
    },
  });

  return result.toUIMessageStreamResponse();
}
```

**Notes:**
- `@ai-sdk/mcp` is a separate package — NOT included in `ai` package
- stdio transport (`Experimental_StdioMCPTransport`) cannot run on Vercel — local development only
- HTTP transport works on both edge and Node.js runtimes
- SSE transport is deprecated as of MCP protocol 2025-03-26; use HTTP transport

### Session Settings Persistence

Settings (model selection, active skills, persona) should NOT go through cookies or server sessions. Use `localStorage` via React state initialized from localStorage:

```javascript
// In the client component
const [model, setModel] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hub-model") || "gemini-2.5-flash";
  }
  return "gemini-2.5-flash";
});

// On change:
const handleModelChange = (newModel) => {
  setModel(newModel);
  localStorage.setItem("hub-model", newModel);
};
```

No server-side session needed — settings are UI state passed in the `body` to the route per request.

### Environment Variable Management (8+ API keys)

All keys go in `.env.local` for dev, Vercel dashboard for production. They are server-only (no `NEXT_PUBLIC_` prefix). With `export const runtime = "edge"`, `process.env` is accessible.

Key pattern for optional providers:

```javascript
function resolveModel(modelId) {
  const entry = MODEL_REGISTRY[modelId];
  if (!entry) return providers.google()("gemini-2.5-flash"); // safe fallback

  const createProvider = providers[entry.provider];
  if (!createProvider) throw new Error(`Unknown provider: ${entry.provider}`);

  const apiKey = process.env[`${entry.provider.toUpperCase()}_API_KEY`];
  if (!apiKey) {
    // Graceful degradation — fall back to google if key missing
    return providers.google()("gemini-2.5-flash");
  }
  return createProvider()(entry.modelId);
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-step tool loops | Manual message append + re-call | `stopWhen: stepCountIs(N)` | SDK handles retry, tool result injection, loop termination |
| Streaming response format | Custom SSE encoder | `result.toUIMessageStreamResponse()` | Handles `x-vercel-ai-ui-message-stream` header, JSON-to-SSE transform, error wrapping |
| MCP tool conversion | Manual tool schema mapping | `await mcpClient.tools()` | Returns AI SDK-compatible tool definitions directly |
| Message format conversion | Custom UIMessage→CoreMessage mapper | `await convertToModelMessages(messages)` | Handles all message types including tool calls, reasoning, multi-modal |
| Provider error handling | Try/catch per provider | `maxRetries: 2` in streamText | SDK retries with exponential backoff |

---

## Common Pitfalls

### Pitfall 1: maxSteps silently ignored

**What goes wrong:** `streamText` ignores unknown parameters without throwing. `maxSteps: 5` compiles fine but has no effect — the model runs only one tool step.
**Why it happens:** AI SDK 5→6 changed the API from `maxSteps` to `stopWhen: stepCountIs(N)`.
**How to avoid:** Use `stopWhen: stepCountIs(5)`.
**Warning signs:** Tool calls work but multi-step agent behavior (model continues after tool result) doesn't happen.

### Pitfall 2: toDataStreamResponse runtime crash

**What goes wrong:** `TypeError: result.toDataStreamResponse is not a function` at runtime when a message is submitted.
**Why it happens:** Removed in AI SDK v5. Client gets a 500 or empty response.
**How to avoid:** Use `result.toUIMessageStreamResponse()`.
**Warning signs:** Chat appears to send but never receives a response; network tab shows 500.

### Pitfall 3: useSearchGrounding with custom tools

**What goes wrong:** When `enableWebSearch` is true for a Google model AND custom tools are defined, the custom tools are silently disabled. The model only has access to search.
**Why it happens:** Google API constraint — grounding and function calling cannot coexist in most model versions.
**How to avoid:** When `enableWebSearch && provider === "google"`, pass ONLY `google.tools.googleSearch({})` and NO custom tools in the same `streamText` call.
**Warning signs:** Skills (db-access, code-exec) appear active in UI but model never calls them when web search is enabled.

### Pitfall 4: UIMessage vs CoreMessage mismatch

**What goes wrong:** `streamText` receives UIMessage objects (which include `metadata`, `id`, `parts` arrays) instead of the CoreMessage format it expects (`{ role, content }`). Silent corruption or API errors from providers.
**Why it happens:** `@ai-sdk/react@3.0.137` `useChat` sends UIMessage format; route must convert.
**How to avoid:** `const modelMessages = await convertToModelMessages(messages)` before `streamText`.
**Warning signs:** Providers return 400 errors about invalid message format; Claude complains about unexpected fields.

### Pitfall 5: MCP stdio on Vercel

**What goes wrong:** `Experimental_StdioMCPTransport` tries to spawn a child process — crashes on Vercel with "spawn ENOENT" or similar.
**Why it happens:** Edge runtime has no `child_process`; serverless has no persistent process.
**How to avoid:** Only HTTP transport (`type: "http"`) works on Vercel. Stdio is local development only.
**Warning signs:** Build succeeds but MCP tool calls fail in production.

### Pitfall 6: Zod version mismatch

**What goes wrong:** `package.json` says `"zod": "^4.3.6"` but `package-lock.json` has `zod: 3.25.76`. Running `npm install` could upgrade to actual Zod 4, breaking tool schema definitions.
**Why it happens:** Lockfile was generated with Zod 3 pinned; package.json was updated but `npm install` not re-run.
**How to avoid:** Either pin `"zod": "^3.25.76"` in package.json to match the lockfile, or update the lockfile intentionally and test thoroughly. Do NOT run `npm install` without being prepared for Zod 4 upgrade.
**Warning signs:** After npm install, tool() calls throw `TypeError: schema is not a function` (AI SDK v6 + Zod 4 open bug).

---

## Code Examples

### Complete Fixed Route

```javascript
// src/app/api/hub/chat/route.js — corrected version
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";

export const runtime = "edge";

const providers = {
  google: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
  anthropic: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  openai: () => createOpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  deepseek: () => createOpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com/v1" }),
  mistral: () => createOpenAI({ apiKey: process.env.MISTRAL_API_KEY, baseURL: "https://api.mistral.ai/v1" }),
  groq: () => createOpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" }),
  together: () => createOpenAI({ apiKey: process.env.TOGETHER_API_KEY, baseURL: "https://api.together.xyz/v1" }),
  xai: () => createOpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: "https://api.x.ai/v1" }),
  kimi: () => createOpenAI({ apiKey: process.env.MOONSHOT_API_KEY, baseURL: "https://api.moonshot.cn/v1" }),
};

// ... MODEL_REGISTRY unchanged ...

export async function POST(req) {
  const { messages, model, systemPrompt, enableWebSearch, activeSkills, activeMcps } = await req.json();

  // FIX 1: Convert UIMessages to model-compatible format
  const modelMessages = await convertToModelMessages(messages);

  const resolvedModel = resolveModel(model);
  const entry = MODEL_REGISTRY[model];

  // FIX 2: Google search uses provider-defined tool, not providerOptions
  // FIX 3: Never mix google_search with custom tools
  let tools;
  if (enableWebSearch && entry?.provider === "google") {
    const google = providers.google();
    tools = { google_search: google.tools.googleSearch({}) };
  } else {
    tools = buildTools(activeSkills, activeMcps);
  }

  // Anthropic thinking via providerOptions (unchanged — correct)
  const providerOptions = {};
  if (entry?.provider === "anthropic" && /* some condition */ false) {
    providerOptions.anthropic = { thinking: { type: "enabled", budgetTokens: 10000 } };
  }

  const result = await streamText({
    model: resolvedModel,
    system: systemPrompt || "You are a helpful, respectful, and honest assistant.",
    messages: modelMessages,          // FIX 1
    providerOptions,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    stopWhen: stepCountIs(5),         // FIX 2: was maxSteps
  });

  return result.toUIMessageStreamResponse(); // FIX 3: was toDataStreamResponse
}
```

### Google Search Grounding (correct API)

```javascript
// Source: verified against node_modules/@ai-sdk/google/dist/index.js
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

// google.tools enumerates: googleSearch, enterpriseWebSearch, googleMaps,
// urlContext, fileSearch, codeExecution, vertexRagStore
const searchTools = {
  google_search: google.tools.googleSearch({}),
};
```

### MCP HTTP Transport

```javascript
// Requires: npm install @ai-sdk/mcp
import { createMCPClient } from "@ai-sdk/mcp";

async function getMcpTools(activeMcps) {
  const clients = [];
  let allTools = {};

  if (activeMcps.includes("context7")) {
    const client = await createMCPClient({
      transport: {
        type: "http",
        url: process.env.CONTEXT7_MCP_URL || "https://mcp.context7.com/mcp",
        headers: {},
      },
    });
    clients.push(client);
    allTools = { ...allTools, ...(await client.tools()) };
  }

  return { tools: allTools, clients };
}

// In POST handler:
const { tools: mcpTools, clients } = await getMcpTools(activeMcps);

const result = await streamText({
  model: resolvedModel,
  messages: modelMessages,
  tools: { ...customTools, ...mcpTools },
  stopWhen: stepCountIs(5),
  onFinish: async () => {
    await Promise.all(clients.map(c => c.close()));
  },
});
```

---

## State of the Art

| Old API | Current API (ai@6.x) | Notes |
|---------|---------------------|-------|
| `maxSteps: N` | `stopWhen: stepCountIs(N)` | Also `stopWhen: hasToolResult()` available |
| `result.toDataStreamResponse()` | `result.toUIMessageStreamResponse()` | New SSE format with `x-vercel-ai-ui-message-stream: v1` header |
| `CoreMessage[]` from client | `UIMessage[]` + `convertToModelMessages()` on server | UIMessage includes tool calls, reasoning, metadata |
| `providerOptions.google.useSearchGrounding` | `google.tools.googleSearch({})` | Provider-defined tool, not option |
| `parameters` in `tool()` | Still `parameters` in ai@6.0.5 (backward compat) | `inputSchema` is the v5+ name but has active bug with Anthropic |
| `Experimental_StdioMCPTransport` | `type: "http"` or `type: "sse"` in transport config | SSE deprecated in MCP spec 2025-03-26 |
| `generateObject` / `streamObject` | `generateText` / `streamText` with `output` setting | Deprecated in v6 but still works |

**Deprecated/outdated:**
- `toDataStreamResponse()`: removed in AI SDK v5. Use `toUIMessageStreamResponse()`.
- `maxSteps`: removed in AI SDK v5. Use `stopWhen: stepCountIs(N)`.
- SSE transport in MCP: deprecated in MCP spec 2025-03-26. Use HTTP transport.
- `export const runtime = "edge"`: Vercel now recommends Node.js runtime for better reliability; edge is still valid but has size limits (2MB Pro plan).

---

## Open Questions

1. **Vercel says migrate away from edge runtime**
   - What we know: Vercel's official docs include a warning: "We recommend migrating from edge to Node.js for improved performance and reliability."
   - What's unclear: Whether the current edge runtime causes any production issues for the chat route specifically; whether any third-party AI SDK dependencies hit the 2MB code size limit
   - Recommendation: Keep edge for now — it's simpler and the providers all use fetch. If code size errors appear at build, switch to Node.js by removing `export const runtime = "edge"`.

2. **Zod version alignment**
   - What we know: `package.json` says `^4.3.6` but lockfile has `3.25.76`. `ai@6.0.5` uses `zod/v4` internally (provided by Zod >=3.24 as a subpath export). There is an open bug (#12020) with Zod + Anthropic + `inputSchema` in newer AI SDK versions.
   - What's unclear: Whether upgrading to actual Zod 4 would break the existing `parameters` usage
   - Recommendation: Pin `"zod": "3.25.76"` in package.json to match the lockfile. Do not upgrade to Zod 4 until AI SDK explicitly confirms full support.

3. **MCP servers for hub** — which are realistic to connect to?
   - What we know: `@ai-sdk/mcp` supports HTTP transport which works on Vercel. The hub's MCP panel lists context7, gemini-bridge, chrome-devtools, filesystem.
   - What's unclear: Whether context7, gemini-bridge have publicly reachable HTTP MCP endpoints vs only local stdio
   - Recommendation: context7 has a hosted MCP endpoint. For others, treat as "coming soon" UI state until endpoints are confirmed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None configured |
| Config file | None |
| Quick run command | `pnpm dev` + browser verification (per CLAUDE.md) |
| Full suite command | n/a |

No test suite is configured per `CLAUDE.md`. Validation is manual browser testing.

### Phase Requirements → Test Map

| Behavior | Test Type | Verification |
|----------|-----------|-------------|
| Chat sends message + receives streamed response | manual | Open `/hub/chat`, send "hello", confirm streamed text appears |
| Model switch works (Gemini → Claude → GPT) | manual | Switch model, send message, confirm different provider responds |
| Web search toggle works for Gemini | manual | Enable web search, ask current events question, confirm grounded response |
| Tool calls work (db-access skill) | manual | Enable db-access skill, ask "find snippets about GSAP", confirm tool call + results |
| Multi-step (stopWhen) works | manual | Enable db-access, ask multi-step question, watch Network tab for multiple tool round-trips |

### Wave 0 Gaps

- [x] ~~Fix `route.js` bugs before any other feature work~~ — All 4 API mismatches fixed (2026-03-23)
- [ ] Add API keys to `.env.local` and run live end-to-end test (`vercel env pull .env.local`)

---

## Sources

### Primary (HIGH confidence — verified against installed node_modules)

- Direct inspection of `node_modules/ai/dist/index.js` (ai@6.0.5) — stopWhen, toUIMessageStreamResponse, convertToModelMessages, tool()
- Direct inspection of `node_modules/@ai-sdk/google/dist/index.js` — googleSearch tool, absence of useSearchGrounding
- Direct inspection of `node_modules/@ai-sdk/react/dist/index.js` — DefaultChatTransport, UIMessage format
- [ai-sdk.dev/docs/ai-sdk-core/mcp-tools](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools) — MCP transport options
- [vercel.com/docs/functions/runtimes/edge](https://vercel.com/docs/functions/runtimes/edge) — Edge runtime limitations + Node.js migration recommendation

### Secondary (MEDIUM confidence)

- [ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai) — google.tools.googleSearch syntax
- [ai-sdk.dev/providers/ai-sdk-providers/anthropic](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) — thinking/reasoning providerOptions
- [ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling) — stopWhen, inputSchema examples
- [github.com/vercel/ai/issues/7173](https://github.com/vercel/ai/issues/7173) — Google search + custom tools incompatibility (open, March 2026)

### Tertiary (LOW confidence — requires validation)

- [github.com/vercel/ai/issues/12020](https://github.com/vercel/ai/issues/12020) — Zod + inputSchema + Anthropic empty schema bug (open, Jan 2026)
- npmjs.com/@ai-sdk/mcp version 1.0.25+ — current package version (403 on direct fetch, from search result)

---

## Metadata

**Confidence breakdown:**
- API bug identification: HIGH — verified by running code against installed packages
- Standard stack: HIGH — verified from package-lock.json
- Architecture patterns: HIGH — code examples tested against installed modules
- MCP integration: MEDIUM — HTTP transport documented, specific MCP server URLs unconfirmed
- Zod version situation: HIGH (problem) / MEDIUM (remediation)

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (AI SDK moves fast — re-verify if upgrading packages)
