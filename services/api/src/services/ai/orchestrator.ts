import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type Anthropic from "@anthropic-ai/sdk";
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { AiToolCallRecord, AiRoleLimits } from "@umbraculum/contracts";

import {
  BadRequestError,
  ForbiddenError,
  PaymentRequiredError,
  TooManyRequestsError,
} from "../../errors.js";
import { WorkspacesService } from "../workspacesService.js";
import { getTierLimits } from "../tierLimitsService.js";

import { AiSettingsService } from "./aiSettingsService.js";
import { createAnthropicClient, DEFAULT_MODEL } from "./anthropicClient.js";
import { WorkspaceAiMemoryService } from "./memoryService.js";
import {
  AnthropicMemoryWriter,
  type MemoryWriter,
  type MemoryWriterTurn,
} from "./memoryWriter.js";
import {
  collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts,
  resolveRoutePromptOverlay,
} from "@umbraculum/module-sdk";
import { composeWorkspaceSystemPrompt } from "./promptComposer.js";

/**
 * One SSE event emitted by the orchestrator. The route layer wraps these in
 * the `event: <type>\ndata: <json>\n\n` SSE framing.
 */
export type AiSseEvent =
  | { type: "assistant_chunk"; text: string }
  | { type: "tool_call"; name: string; argsJson: string }
  | { type: "tool_result"; name: string; resultJson: string; durationMs: number; errored: boolean }
  | { type: "complete"; usage: { tokensIn: number; tokensOut: number; durationMs: number; model: string } }
  | { type: "error"; code: string; message: string };

export interface RunChatTurnInput {
  workspaceId: string;
  userId: string;
  message: string;
  sessionId?: string | null;
  /** Optional RouteId hint from the client (unknown values are ignored). */
  routeId?: string | null;
}

/**
 * Anthropic-style tool definition shape, narrowed down to the v0 surface.
 * Keeping this as a local type avoids hard-coding the SDK's full union into
 * the orchestrator signature.
 */
interface AnthropicToolDef {
  name: string;
  description: string;
  input_schema: unknown;
}

/**
 * Build a tool registry-derived list of Anthropic tool defs (no handlers).
 */
function buildAnthropicTools(registry: AiToolRegistry): AnthropicToolDef[] {
  return registry.list().map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }));
}

/**
 * Aggregate the workspace's trailing 30-day token usage per role.
 */
async function readRoleUsage(
  prisma: PrismaClient,
  workspaceId: string,
): Promise<Record<string, number>> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await prisma.$queryRawUnsafe<{ role: string; total: bigint }[]>(
    `SELECT wm.role::text AS role, COALESCE(SUM(l.tokens_in + l.tokens_out), 0) AS total
     FROM ai_usage_ledger l
     INNER JOIN workspace_members wm ON wm.workspace_id = l.workspace_id AND wm.user_id = l.user_id
     WHERE l.workspace_id = $1 AND l.created_at >= $2
     GROUP BY wm.role`,
    workspaceId,
    since,
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.role] = Number(r.total ?? 0);
  return out;
}

/**
 * Aggregate today's token usage (UTC) for a single user.
 */
async function readUserDailyUsage(
  prisma: PrismaClient,
  workspaceId: string,
  userId: string,
): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const result = await prisma.aiUsageLedger.aggregate({
    where: { workspaceId, userId, createdAt: { gte: startOfDay } },
    _sum: { tokensIn: true, tokensOut: true },
  });
  const tIn = result._sum.tokensIn ?? 0;
  const tOut = result._sum.tokensOut ?? 0;
  return tIn + tOut;
}

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
    const requestId = randomUUID();
    const start = Date.now();
    try {
      const ctx = await this.preflight(input);
      const tools = buildAnthropicTools(this.registry);
      const apiKey = await this.settings.getDecryptedKey(input.workspaceId);

      const client = this.createClientOverride
        ? this.createClientOverride(apiKey)
        : createAnthropicClient(apiKey).client;

      const model = DEFAULT_MODEL;
      const workspaceMemory = await this.memory.read(input.workspaceId);
      const routeOverlay =
        input.routeId && input.routeId.trim().length > 0
          ? resolveRoutePromptOverlay(input.routeId.trim())
          : undefined;
      const systemPrompt = composeWorkspaceSystemPrompt({
        moduleOverlays: collectModulePromptOverlayTexts(),
        knowledgeSnippets: collectModuleKnowledgeSnippets(),
        routeOverlay,
        workspaceMemory,
      });
      const conversation: Array<{ role: "user" | "assistant"; content: unknown }> = [
        { role: "user", content: input.message },
      ];

      const toolCalls: AiToolCallRecord[] = [];
      let totalTokensIn = 0;
      let totalTokensOut = 0;
      let finalText = "";
      let providerRequestId: string | null = null;
      const MAX_TOOL_LOOPS = 6;

      for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
        const response = await client.messages.create({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          tools: tools as never,
          messages: conversation as never,
        });
        if (response.usage) {
          totalTokensIn += response.usage.input_tokens ?? 0;
          totalTokensOut += response.usage.output_tokens ?? 0;
        }
        providerRequestId = (response as { id?: string }).id ?? providerRequestId;

        const blocks = Array.isArray(response.content) ? response.content : [];
        const text = blocks
          .filter((b) => b.type === "text")
          .map((b) => (b as { text: string }).text)
          .join("");
        if (text.length > 0) {
          finalText += text;
          yield { type: "assistant_chunk", text };
        }

        if (response.stop_reason !== "tool_use") break;

        const toolUseBlocks = blocks.filter((b) => b.type === "tool_use") as Array<{
          id: string;
          name: string;
          input: unknown;
        }>;
        if (toolUseBlocks.length === 0) break;

        conversation.push({ role: "assistant", content: blocks });
        const toolResults: Array<{
          type: "tool_result";
          tool_use_id: string;
          content: string;
          is_error?: boolean;
        }> = [];

        for (const tu of toolUseBlocks) {
          const tool = this.registry.resolve(tu.name);
          const argsJson = truncate(JSON.stringify(tu.input ?? {}), 4096);
          yield { type: "tool_call", name: tu.name, argsJson };
          const toolStart = Date.now();
          let resultJson = "";
          let errored = false;
          try {
            if (!tool) throw new Error(`unknown tool: ${tu.name}`);
            const result = await tool.handler(tu.input, {
              workspaceId: ctx.workspaceId,
              userId: ctx.userId,
              requestId,
            });
            resultJson = truncate(JSON.stringify(result), 8192);
          } catch (err) {
            errored = true;
            resultJson = JSON.stringify({
              error: err instanceof Error ? err.message : String(err),
            });
          }
          const durationMs = Date.now() - toolStart;
          toolCalls.push({ name: tu.name, argsJson, resultJson, durationMs, errored });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: resultJson,
            ...(errored ? { is_error: true } : {}),
          });
          yield { type: "tool_result", name: tu.name, resultJson, durationMs, errored };
        }

        conversation.push({ role: "user", content: toolResults });
      }

      const totalDuration = Date.now() - start;
      await this.prisma.aiUsageLedger.create({
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

      // Best-effort post-session memory write. Failures here MUST NOT
      // surface to the user (the chat turn already completed); they are
      // swallowed and surface in server logs only.
      try {
        const writer = this.memoryWriterFactory
          ? this.memoryWriterFactory(client)
          : new AnthropicMemoryWriter(client, model);
        const turn: MemoryWriterTurn = {
          userMessage: input.message,
          assistantText: finalText,
          toolNamesUsed: toolCalls.map((c) => c.name),
        };
        const patch = await writer.computePatch(workspaceMemory, turn);
        if (hasMeaningfulPatch(patch)) {
          await this.memory.applyPatch(input.workspaceId, patch);
        }
      } catch {
        // Intentionally ignored — see comment above.
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

  /**
   * Preflight gates. Throws structured errors (mapped to SSE `error` events
   * by `runChatTurn`); call sites that prefer hard HTTP errors can invoke
   * this method directly before opening the SSE stream.
   */
  async preflight(input: RunChatTurnInput): Promise<{
    workspaceId: string;
    userId: string;
    role: string;
    perUserDailyCap: number;
    roleLimits: AiRoleLimits;
  }> {
    const role = await this.workspaces.assertMembership(input.userId, input.workspaceId);
    const billing = await this.prisma.workspaceBilling.findUnique({
      where: { workspaceId: input.workspaceId },
    });
    const tier = billing?.tier ?? "free";
    if (!getTierLimits(tier).aiEnabled) {
      throw new PaymentRequiredError(
        "ai_subscription_required",
        "AI consultant is available on paid tiers. Upgrade to unlock.",
        { currentTier: tier },
      );
    }
    const settings = await this.prisma.workspaceAiSettings.findUnique({
      where: { workspaceId: input.workspaceId },
    });
    if (!settings || !settings.enabled) {
      throw new ForbiddenError(
        "ai_not_enabled",
        "AI consultant is not enabled in this workspace. Ask an admin to enable it.",
      );
    }
    if (!settings.dataEgressAccepted) {
      throw new BadRequestError(
        "ai_data_egress_not_accepted",
        "An admin must accept the data-egress notice before AI calls can be made.",
      );
    }
    if (!settings.encryptedKey) {
      throw new BadRequestError(
        "ai_no_key",
        "No provider key configured for this workspace. Ask an admin to set one.",
      );
    }
    const roleLimits = (settings.roleLimits ?? {}) as AiRoleLimits;
    const limitForRole = Number(roleLimits[role] ?? 0);
    if (limitForRole > 0) {
      const usage = await readRoleUsage(this.prisma, input.workspaceId);
      const used = usage[role] ?? 0;
      if (used >= limitForRole) {
        throw new TooManyRequestsError("ai_rate_limit", "Role monthly AI token cap reached.", {
          scope: "role",
          role,
          limit: limitForRole,
          used,
        });
      }
    }
    if (settings.perUserDailyCap > 0) {
      const used = await readUserDailyUsage(this.prisma, input.workspaceId, input.userId);
      if (used >= settings.perUserDailyCap) {
        throw new TooManyRequestsError("ai_rate_limit", "Per-user daily AI token cap reached.", {
          scope: "user_daily",
          limit: settings.perUserDailyCap,
          used,
        });
      }
    }
    return {
      workspaceId: input.workspaceId,
      userId: input.userId,
      role,
      perUserDailyCap: settings.perUserDailyCap,
      roleLimits,
    };
  }
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 16) + "...[truncated]";
}

function hasMeaningfulPatch(patch: {
  addFacts?: string[];
  removeFacts?: string[];
  addRecurringIssues?: string[];
  removeRecurringIssues?: string[];
}): boolean {
  return (
    (patch.addFacts?.length ?? 0) > 0 ||
    (patch.removeFacts?.length ?? 0) > 0 ||
    (patch.addRecurringIssues?.length ?? 0) > 0 ||
    (patch.removeRecurringIssues?.length ?? 0) > 0
  );
}
