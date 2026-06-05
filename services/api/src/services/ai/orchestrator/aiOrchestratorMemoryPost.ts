import type Anthropic from "@anthropic-ai/sdk";

import { createAnthropicClient } from "../anthropicClient.js";
import {
  AnthropicMemoryWriter,
  type MemoryWriter,
  type MemoryWriterTurn,
} from "../memoryWriter.js";
import type { WorkspaceAiMemoryBlob } from "../promptComposer.js";
import type { WorkspaceAiMemoryService } from "../memoryService.js";

import { hasMeaningfulPatch } from "./aiOrchestratorUtils.js";
import type { AiToolCallRecord } from "@umbraculum/contracts";

export async function runPostTurnMemoryWrite(params: {
  provider: string;
  apiKey: string;
  model: string;
  workspaceId: string;
  workspaceMemory: WorkspaceAiMemoryBlob;
  userMessage: string;
  finalText: string;
  toolCalls: AiToolCallRecord[];
  memory: WorkspaceAiMemoryService;
  createClientOverride?: ((apiKey: string) => Anthropic) | undefined;
  memoryWriterFactory?: ((client: Anthropic) => MemoryWriter) | undefined;
}): Promise<void> {
  const {
    provider,
    apiKey,
    model,
    workspaceId,
    workspaceMemory,
    userMessage,
    finalText,
    toolCalls,
    memory,
    createClientOverride,
    memoryWriterFactory,
  } = params;

  if (provider !== "anthropic") return;

  const anthropicClient = createClientOverride
    ? createClientOverride(apiKey)
    : createAnthropicClient(apiKey).client;
  const writer = memoryWriterFactory
    ? memoryWriterFactory(anthropicClient)
    : new AnthropicMemoryWriter(anthropicClient, model);
  const turn: MemoryWriterTurn = {
    userMessage,
    assistantText: finalText,
    toolNamesUsed: toolCalls.map((c) => c.name),
  };
  const patch = await writer.computePatch(workspaceMemory, turn);
  if (hasMeaningfulPatch(patch)) {
    await memory.applyPatch(workspaceId, patch);
  }
}
