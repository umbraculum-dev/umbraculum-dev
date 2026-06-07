import { z } from "zod";

/**
 * `POST /ai/chat` request body.
 *
 * `routeId` is an optional hint from `@umbraculum/navigation` RouteId strings.
 * Unknown route ids are ignored by the orchestrator (forward compatibility).
 */
export const AiChatRequestBodySchema = z
  .object({
    message: z.string().trim().min(1).max(8000),
    sessionId: z.string().trim().min(1).max(200).optional(),
    routeId: z.string().trim().min(1).max(128).optional(),
  })
  .strict();

export type AiChatRequestBody = z.infer<typeof AiChatRequestBodySchema>;

/** SSE wire events from `services/api/src/services/ai/orchestrator.ts` `AiSseEvent`. */
export const AiSseAssistantChunkEventSchema = z.object({
  type: z.literal("assistant_chunk"),
  text: z.string(),
});

export const AiSseToolCallEventSchema = z.object({
  type: z.literal("tool_call"),
  name: z.string(),
  argsJson: z.string(),
});

export const AiSseToolResultEventSchema = z.object({
  type: z.literal("tool_result"),
  name: z.string(),
  resultJson: z.string(),
  durationMs: z.number(),
  errored: z.boolean(),
});

export const AiSseProposalEventSchema = z.object({
  type: z.literal("proposal"),
  proposalId: z.string(),
  moduleCode: z.string(),
  proposalType: z.string(),
  summary: z.string(),
});

export const AiSseCompleteEventSchema = z.object({
  type: z.literal("complete"),
  usage: z.object({
    tokensIn: z.number(),
    tokensOut: z.number(),
    durationMs: z.number(),
    model: z.string(),
  }),
});

export const AiSseErrorEventSchema = z.object({
  type: z.literal("error"),
  code: z.string(),
  message: z.string(),
});

export const AiSseEventSchema = z.discriminatedUnion("type", [
  AiSseAssistantChunkEventSchema,
  AiSseToolCallEventSchema,
  AiSseToolResultEventSchema,
  AiSseProposalEventSchema,
  AiSseCompleteEventSchema,
  AiSseErrorEventSchema,
]);

export type AiSseEvent = z.infer<typeof AiSseEventSchema>;
