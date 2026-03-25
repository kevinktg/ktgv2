import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
import { z } from "zod";

export const runtime = "edge";

// --- AI Gateway: 8+ model families ---
// Each provider reads its own env var. Only configure the ones you have keys for.
const providers = {
  google: () =>
    createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    }),
  anthropic: () =>
    createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    }),
  openai: () =>
    createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  deepseek: () =>
    createOpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    }),
  mistral: () =>
    createOpenAI({
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: "https://api.mistral.ai/v1",
    }),
  groq: () =>
    createOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    }),
  together: () =>
    createOpenAI({
      apiKey: process.env.TOGETHER_API_KEY,
      baseURL: "https://api.together.xyz/v1",
    }),
  xai: () =>
    createOpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    }),
  kimi: () =>
    createOpenAI({
      apiKey: process.env.MOONSHOT_API_KEY,
      baseURL: "https://api.moonshot.cn/v1",
    }),
};

// Model ID → { provider, modelId }
const MODEL_REGISTRY = {
  // Google Gemini
  "gemini-2.5-flash": { provider: "google", modelId: "gemini-2.5-flash" },
  "gemini-2.5-pro": { provider: "google", modelId: "gemini-2.5-pro" },
  "gemini-2.0-flash": { provider: "google", modelId: "gemini-2.0-flash" },
  // Anthropic Claude
  "claude-sonnet-4": { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
  "claude-haiku-3.5": { provider: "anthropic", modelId: "claude-3-5-haiku-20241022" },
  "claude-opus-4": { provider: "anthropic", modelId: "claude-opus-4-20250514" },
  // OpenAI
  "gpt-4.1": { provider: "openai", modelId: "gpt-4.1" },
  "gpt-4.1-mini": { provider: "openai", modelId: "gpt-4.1-mini" },
  "o3-mini": { provider: "openai", modelId: "o3-mini" },
  // DeepSeek
  "deepseek-chat": { provider: "deepseek", modelId: "deepseek-chat" },
  "deepseek-reasoner": { provider: "deepseek", modelId: "deepseek-reasoner" },
  // Mistral
  "mistral-large": { provider: "mistral", modelId: "mistral-large-latest" },
  "codestral": { provider: "mistral", modelId: "codestral-latest" },
  // Meta Llama (via Groq)
  "llama-4-scout": { provider: "groq", modelId: "meta-llama/llama-4-scout-17b-16e-instruct" },
  "llama-3.3-70b": { provider: "groq", modelId: "llama-3.3-70b-versatile" },
  // Qwen (via Together)
  "qwen-2.5-72b": { provider: "together", modelId: "Qwen/Qwen2.5-72B-Instruct-Turbo" },
  "qwen-coder-32b": { provider: "together", modelId: "Qwen/Qwen2.5-Coder-32B-Instruct" },
  // xAI Grok
  "grok-3": { provider: "xai", modelId: "grok-3" },
  "grok-3-mini": { provider: "xai", modelId: "grok-3-mini" },
  // Kimi (Moonshot)
  "kimi-k2": { provider: "kimi", modelId: "kimi-k2" },
  "moonshot-v1-8k": { provider: "kimi", modelId: "moonshot-v1-8k" },
};

function resolveModel(modelId) {
  const entry = MODEL_REGISTRY[modelId];
  if (!entry) {
    // Default fallback
    const google = providers.google();
    return google("gemini-2.5-flash");
  }
  const createProvider = providers[entry.provider];
  if (!createProvider) throw new Error(`Unknown provider: ${entry.provider}`);
  const provider = createProvider();
  return provider(entry.modelId);
}

// Skill definitions — real implementations
function buildTools(activeSkills = [], activeMcps = []) {
  const tools = {};

  // Code Execution skill — uses Gemini's native code execution
  // AI SDK doesn't expose { codeExecution: {} } directly,
  // so we provide a tool that describes code execution intent.
  // The model will write code in its response when this is active.
  if (activeSkills.includes("code-exec")) {
    tools.runCode = tool({
      description:
        "Execute Python code to solve computational problems, analyze data, or perform calculations. Write and run Python code, then return the result.",
      parameters: z.object({
        code: z.string().describe("Python code to execute"),
        description: z.string().describe("What this code does"),
      }),
      execute: async ({ code, description }) => {
        // For now, return the code for display — real execution
        // would use Gemini's codeExecution tool via @google/genai
        return {
          status: "displayed",
          description,
          code,
          note: "Code execution is rendered in the chat. Server-side execution coming soon.",
        };
      },
    });
  }

  // Database Access skill — query the snippets table
  if (activeSkills.includes("db-access")) {
    tools.queryDatabase = tool({
      description:
        "Query the KTG snippets database. Returns snippet titles, descriptions, tags, and types. Use this to search for code snippets, techniques, or framework documentation.",
      parameters: z.object({
        query: z
          .string()
          .describe("Search term to find relevant snippets"),
        type: z
          .string()
          .optional()
          .describe("Filter by snippet type: gate, technique, pattern, tool"),
      }),
      execute: async ({ query, type }) => {
        // Call our own snippets API
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (type) params.set("type", type);

        try {
          const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000";
          const res = await fetch(
            `${baseUrl}/api/hub/snippets?${params.toString()}`
          );
          if (!res.ok) throw new Error("Snippets API error");
          const snippets = await res.json();
          return {
            count: snippets.length,
            results: snippets.slice(0, 10).map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              tags: s.tags,
              type: s.snippet_type,
            })),
          };
        } catch (error) {
          return { error: "Could not query snippets database", detail: error.message };
        }
      },
    });
  }

  // MCP-sourced tools — each active MCP server can inject capabilities
  if (activeMcps.includes("filesystem")) {
    tools.listFiles = tool({
      description: "List files in the project directory structure",
      parameters: z.object({
        path: z.string().describe("Directory path to list"),
      }),
      execute: async ({ path }) => {
        return {
          note: "Filesystem access is restricted in production. Available in development only.",
          requestedPath: path,
        };
      },
    });
  }

  return tools;
}

export async function POST(req) {
  const {
    messages,
    model,
    systemPrompt,
    enableWebSearch,
    activeSkills,
    activeMcps,
  } = await req.json();

  const resolvedModel = resolveModel(model);
  const entry = MODEL_REGISTRY[model];

  // FIX 1: Convert UIMessage[] from useChat to model-compatible format
  const modelMessages = await convertToModelMessages(messages);

  // Build active tools from skills + MCPs
  const tools = buildTools(activeSkills, activeMcps);

  // FIX 2: Google search grounding uses google.tools.googleSearch, not providerOptions
  // Also: Google API doesn't allow custom tools + search together
  const isGoogle = entry?.provider === "google";
  const wantsSearch = enableWebSearch && isGoogle;
  const hasCustomTools = Object.keys(tools).length > 0;

  let finalTools;
  if (wantsSearch && !hasCustomTools) {
    // Search grounding only (no custom tools allowed alongside)
    const google = providers.google();
    finalTools = { google_search: google.tools.googleSearch({}) };
  } else if (hasCustomTools) {
    finalTools = tools;
  } else {
    finalTools = undefined;
  }

  const result = await streamText({
    model: resolvedModel,
    system: systemPrompt || "You are a helpful, respectful, and honest assistant.",
    messages: modelMessages,
    tools: finalTools,
    // FIX 3: maxSteps removed in ai@6, use stopWhen
    stopWhen: stepCountIs(5),
  });

  // FIX 4: toDataStreamResponse removed, use toUIMessageStreamResponse
  return result.toUIMessageStreamResponse();
}
