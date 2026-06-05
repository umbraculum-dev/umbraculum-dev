import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type Anthropic from "@anthropic-ai/sdk";
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";

import {
  BadRequestError,
  ForbiddenError,
  PaymentRequiredError,
  TooManyRequestsError,
} from "../../../errors.js";
import {
  collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts,
  resolveRoutePromptOverlay,
} from "@umbraculum/module-sdk";

import type { AiSettingsService } from "../aiSettingsService.js";
import type { MemoryWriter } from "../memoryWriter.js";
import type { WorkspaceAiMemoryService } from "../memoryService.js";
import { createChatProviderClient } from "../providers/chatProvider.js";
import { RagSearchService } from "../rag/ragSearchService.js";
import { composeWorkspaceSystemPrompt } from "../promptComposer.js";
import type { WorkspacesService } from "../../workspacesService.js";

import { runPostTurnMemoryWrite } from "./aiOrchestratorMemoryPost.js";
import { runPreflight } from "./aiOrchestratorPreflight.js";
import { runToolLoop } from "./aiOrchestratorToolLoop.js";
import { buildAnthropicTools } from "./aiOrchestratorTypes.js";
import type { AiSseEvent, RunChatTurnInput } from "./aiOrchestratorTypes.js";

export type ChatTurnDeps = {
  prisma: PrismaClient;
  registry: AiToolRegistry;
  workspaces: WorkspacesService;
  settings: AiSettingsService;
  memory: WorkspaceAiMemoryService;
  createClientOverride?: ((apiKey: string) => Anthropic) | undefined;
  memoryWriterFactory?: ((client: Anthropic) => MemoryWriter) | undefined;
};

export async function* runChatTurnStream(
  deps: ChatTurnDeps,
  input: RunChatTurnInput,
): AsyncGenerator<AiSseEvent, void, void> {
  const requestId = randomUUID();
  const start = Date.now();
  try {
    const ctx = await runPreflight(deps.prisma, deps.workspaces, input);
    const settingsRow = await deps.settings.getOrCreate(input.userId, input.workspaceId);
    const apiKey = await deps.settings.getDecryptedKey(input.workspaceId);
    const chatClient = createChatProviderClient(settingsRow.provider, apiKey);
    const model = chatClient.model;
    const toolsForCall =
      settingsRow.provider === "anthropic" ? buildAnthropicTools(deps.registry) : [];
    const workspaceMemory = await deps.memory.read(input.workspaceId);
    const routeOverlay =
      input.routeId && input.routeId.trim().length > 0
        ? resolveRoutePromptOverlay(input.routeId.trim())
        : undefined;
    let systemPrompt = composeWorkspaceSystemPrompt({
      moduleOverlays: collectModulePromptOverlayTexts(),
      knowledgeSnippets: collectModuleKnowledgeSnippets(),
      ...(routeOverlay !== undefined ? { routeOverlay } : {}),
      workspaceMemory,
    });
    if (/[?]|how do|how does|what is/i.test(input.message)) {
      try {
        const rag = new RagSearchService(deps.prisma);
        const hits = await rag.searchProductDocs(input.message.slice(0, 200), 3);
        if (hits.length > 0) {
          const section = hits.map((h) => `- (${h.sourceRef}) ${h.excerpt}`).join("\n");
          systemPrompt = `${systemPrompt}\n\nRetrieved product documentation:\n${section}`;
        }
      } catch {
        /* RAG optional when pgvector not initialized */
      }
    }
    const conversation: Array<{ role: "user" | "assistant"; content: unknown }> = [
      { role: "user", content: input.message },
    ];

    const loopGen = runToolLoop({
      registry: deps.registry,
      ctx,
      requestId,
      conversation,
      chatClient,
      systemPrompt,
      toolsForCall,
    });

    let loopResult = await loopGen.next();
    while (!loopResult.done) {
      yield loopResult.value;
      loopResult = await loopGen.next();
    }

    const { toolCalls, finalText, totalTokensIn, totalTokensOut, providerRequestId } =
      loopResult.value;
    const totalDuration = Date.now() - start;

    await deps.prisma.aiUsageLedger.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        sessionId: input.sessionId ?? null,
        model,
        tokensIn: totalTokensIn,
        tokensOut: totalTokensOut,
        costMicroUsd: 0n,
        durationMs: totalDuration,
        providerRequestId,
        toolCalls: toolCalls as unknown as object,
      },
    });

    yield {
      type: "complete",
      usage: { tokensIn: totalTokensIn, tokensOut: totalTokensOut, durationMs: totalDuration, model },
    };

    try {
      await runPostTurnMemoryWrite({
        provider: settingsRow.provider,
        apiKey,
        model,
        workspaceId: input.workspaceId,
        workspaceMemory,
        userMessage: input.message,
        finalText,
        toolCalls,
        memory: deps.memory,
        createClientOverride: deps.createClientOverride,
        memoryWriterFactory: deps.memoryWriterFactory,
      });
    } catch {
      // Intentionally ignored — post-turn memory is best-effort.
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code =
      err instanceof BadRequestError ||
      err instanceof ForbiddenError ||
      err instanceof PaymentRequiredError ||
      err instanceof TooManyRequestsError
        ? err.code
        : "ai_internal_error";
    yield { type: "error", code, message };
  }
}
