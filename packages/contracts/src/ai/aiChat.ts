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
