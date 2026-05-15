import Anthropic from "@anthropic-ai/sdk";

/**
 * Thin factory around the Anthropic SDK. Centralizes the "construct a
 * client with this BYOK key" call so the orchestrator and any tests stay
 * decoupled from the SDK shape.
 *
 * In Sprint #1 we use a fresh client per chat turn (after decrypting the
 * workspace's key). A connection-pooling optimization can land later when
 * the request volume justifies it.
 */
export interface AnthropicClient {
  client: Anthropic;
}

export function createAnthropicClient(apiKey: string): AnthropicClient {
  if (typeof apiKey !== "string" || apiKey.length === 0) {
    throw new Error("createAnthropicClient: apiKey is required");
  }
  return { client: new Anthropic({ apiKey }) };
}

/** Default model. Override with `ANTHROPIC_MODEL` env var. */
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
