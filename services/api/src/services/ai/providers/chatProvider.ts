import type Anthropic from "@anthropic-ai/sdk";
import type { AiProvider } from "@prisma/client";

import { createAnthropicClient, DEFAULT_MODEL as ANTHROPIC_DEFAULT } from "../anthropicClient.js";
import { createOpenAiClient } from "./openaiClient.js";

export interface ChatMessage {
  role: "user" | "assistant";
  content: unknown;
}

export interface ChatCompletionResult {
  content: unknown[];
  stopReason: string | null;
  usage: { inputTokens: number; outputTokens: number };
  requestId: string | null;
}

export interface ChatProviderClient {
  provider: AiProvider;
  model: string;
  complete(input: {
    system: string;
    tools: unknown[];
    messages: ChatMessage[];
    maxTokens?: number;
  }): Promise<ChatCompletionResult>;
}

export function createChatProviderClient(
  provider: AiProvider,
  apiKey: string,
): ChatProviderClient {
  if (provider === "openai") {
    const client = createOpenAiClient(apiKey);
    return {
      provider,
      model: client.model,
      async complete({ system, messages, maxTokens = 1024 }) {
        const response = await client.createChatCompletion({
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: system },
            ...messages.map((m) => ({
              role: m.role,
              content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
            })),
          ],
        });
        const choice = response.choices[0];
        const text = choice?.message?.content ?? "";
        return {
          content: text ? [{ type: "text", text }] : [],
          stopReason: "end_turn",
          usage: {
            inputTokens: response.usage?.prompt_tokens ?? 0,
            outputTokens: response.usage?.completion_tokens ?? 0,
          },
          requestId: response.id ?? null,
        };
      },
    };
  }

  const { client } = createAnthropicClient(apiKey);
  const model = ANTHROPIC_DEFAULT;
  return {
    provider: "anthropic",
    model,
    async complete({ system, tools, messages, maxTokens = 1024 }) {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        tools: tools as never,
        messages: messages as never,
      });
      return {
        content: Array.isArray(response.content) ? response.content : [],
        stopReason:
          response.stop_reason === "tool_use"
            ? "tool_use"
            : response.stop_reason === "end_turn"
              ? "end_turn"
              : response.stop_reason ?? null,
        usage: {
          inputTokens: response.usage?.input_tokens ?? 0,
          outputTokens: response.usage?.output_tokens ?? 0,
        },
        requestId: (response as { id?: string }).id ?? null,
      };
    },
  };
}

export type { Anthropic };
