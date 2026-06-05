import type { PrismaClient } from "@prisma/client";
import type Anthropic from "@anthropic-ai/sdk";
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";

import { WorkspacesService } from "../workspacesService.js";

import { AiSettingsService } from "./aiSettingsService.js";
import type { MemoryWriter } from "./memoryWriter.js";
import { WorkspaceAiMemoryService } from "./memoryService.js";
import { runChatTurnStream } from "./orchestrator/aiOrchestratorChatTurn.js";
import { runPreflight } from "./orchestrator/aiOrchestratorPreflight.js";
import type { AiSseEvent, RunChatTurnInput } from "./orchestrator/aiOrchestratorTypes.js";

export type { AiSseEvent, RunChatTurnInput } from "./orchestrator/aiOrchestratorTypes.js";

/**
 * The runtime orchestrator implementing docs/PLATFORM-ARCHITECTURE.md §6.4.
 * One instance is created per request by the route handler; tools and
 * settings services are injected so this class stays unit-testable.
 */
export class AiOrchestrator {
  private readonly workspaces: WorkspacesService;
  private readonly settings: AiSettingsService;
  private readonly memory: WorkspaceAiMemoryService;
  private readonly memoryWriterFactory?: ((client: Anthropic) => MemoryWriter) | undefined;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly registry: AiToolRegistry,
    options?: {
      settings?: AiSettingsService;
      memory?: WorkspaceAiMemoryService;
      createClient?: (apiKey: string) => Anthropic;
      createMemoryWriter?: (client: Anthropic) => MemoryWriter;
    },
  ) {
    this.workspaces = new WorkspacesService(prisma);
    this.settings = options?.settings ?? new AiSettingsService(prisma);
    this.memory = options?.memory ?? new WorkspaceAiMemoryService(prisma);
    this.memoryWriterFactory = options?.createMemoryWriter;
    if (options?.createClient) this.createClientOverride = options.createClient;
  }

  private readonly createClientOverride?: ((apiKey: string) => Anthropic) | undefined;

  /**
   * Stream a single chat turn end-to-end. The route layer iterates the
   * async generator and forwards each event to the wire as an SSE message.
   * Yields exactly one `complete` (success) OR exactly one `error` (failure)
   * as its final event.
   */
  async *runChatTurn(input: RunChatTurnInput): AsyncGenerator<AiSseEvent, void, void> {
    yield* runChatTurnStream(
      {
        prisma: this.prisma,
        registry: this.registry,
        workspaces: this.workspaces,
        settings: this.settings,
        memory: this.memory,
        createClientOverride: this.createClientOverride,
        memoryWriterFactory: this.memoryWriterFactory,
      },
      input,
    );
  }

  /**
   * Preflight gates. Throws structured errors (mapped to SSE `error` events
   * by `runChatTurn`); call sites that prefer hard HTTP errors can invoke
   * this method directly before opening the SSE stream.
   */
  async preflight(input: RunChatTurnInput) {
    return runPreflight(this.prisma, this.workspaces, input);
  }
}
