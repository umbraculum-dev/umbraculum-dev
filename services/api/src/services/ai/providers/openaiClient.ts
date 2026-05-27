export const DEFAULT_OPENAI_MODEL = process.env["OPENAI_MODEL"] ?? "gpt-4o-mini";

export interface OpenAiChatClient {
  model: string;
  createChatCompletion(body: {
    messages: Array<{ role: string; content: string }>;
    max_tokens: number;
  }): Promise<{
    id?: string;
    choices: Array<{
      message?: { content?: string | null };
      finish_reason?: string | null;
    }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }>;
}

/** Minimal OpenAI REST client (no npm openai package — workspace peer-deps). */
export function createOpenAiClient(apiKey: string): OpenAiChatClient {
  if (!apiKey.trim()) {
    throw new Error("createOpenAiClient: apiKey is required");
  }
  const model = DEFAULT_OPENAI_MODEL;
  return {
    model,
    async createChatCompletion(body) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, ...body }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`openai_http_${res.status}: ${text.slice(0, 200)}`);
      }
      return (await res.json()) as Awaited<ReturnType<OpenAiChatClient["createChatCompletion"]>>;
    },
  };
}
