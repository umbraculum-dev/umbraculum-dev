import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { AiToolCallRecord } from "@umbraculum/contracts";

import type { ChatProviderClient } from "../providers/chatProvider.js";
import { truncate } from "./aiOrchestratorUtils.js";
import type { AiSseEvent, PreflightResult } from "./aiOrchestratorTypes.js";

type ContentBlock = {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: unknown;
};

export type ToolLoopResult = {
  toolCalls: AiToolCallRecord[];
  finalText: string;
  totalTokensIn: number;
  totalTokensOut: number;
  providerRequestId: string | null;
};

export async function* runToolLoop(params: {
  registry: AiToolRegistry;
  ctx: PreflightResult;
  requestId: string;
  conversation: Array<{ role: "user" | "assistant"; content: unknown }>;
  chatClient: ChatProviderClient;
  systemPrompt: string;
  toolsForCall: unknown[];
  maxLoops?: number;
}): AsyncGenerator<AiSseEvent, ToolLoopResult, void> {
  const { registry, ctx, requestId, chatClient, systemPrompt, toolsForCall } = params;
  const conversation = params.conversation;
  const MAX_TOOL_LOOPS = params.maxLoops ?? 6;

  const toolCalls: AiToolCallRecord[] = [];
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let finalText = "";
  let providerRequestId: string | null = null;

  for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
    const response = await chatClient.complete({
      system: systemPrompt,
      tools: toolsForCall,
      messages: conversation,
      maxTokens: 1024,
    });
    totalTokensIn += response.usage.inputTokens;
    totalTokensOut += response.usage.outputTokens;
    providerRequestId = response.requestId ?? providerRequestId;

    const blocks = (Array.isArray(response.content) ? response.content : []) as ContentBlock[];
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");
    if (text.length > 0) {
      finalText += text;
      yield { type: "assistant_chunk", text };
    }

    if (response.stopReason !== "tool_use") break;

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
      const tool = registry.resolve(tu.name);
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
      if (!errored) {
        try {
          const parsed = JSON.parse(resultJson) as {
            proposalId?: string;
            summary?: string;
          };
          if (typeof parsed.proposalId === "string" && typeof parsed.summary === "string") {
            const moduleCode = tu.name.split(".")[0] ?? "unknown";
            const proposalType =
              tu.name === "mrp.proposeOrderAdjustment"
                ? "orderAdjustment"
                : tu.name === "crp.proposeScheduleAdjustment"
                  ? "scheduleAdjustment"
                  : "proposal";
            yield {
              type: "proposal",
              proposalId: parsed.proposalId,
              moduleCode,
              proposalType,
              summary: parsed.summary,
            };
          }
        } catch {
          /* not a proposal payload */
        }
      }
    }

    conversation.push({ role: "user", content: toolResults });
  }

  return { toolCalls, finalText, totalTokensIn, totalTokensOut, providerRequestId };
}
