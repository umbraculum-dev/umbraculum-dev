import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AiChatRequestBodySchema } from "@umbraculum/contracts";

import { BadRequestError } from "../../errors.js";
import { requireActiveWorkspace } from "../../plugins/requestContext.js";
import type { AiOrchestrator } from "../../services/ai/orchestrator.js";

export async function handleAiChatStream(
  req: FastifyRequest,
  reply: FastifyReply,
  orchestrator: AiOrchestrator,
  ctx: { userId: string; activeWorkspaceId: string },
) {
  const parsed = AiChatRequestBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new BadRequestError("invalid_body", "Body must match AiChatRequestBody");
  }
  const { message, sessionId: sessionIdRaw, routeId: routeIdRaw } = parsed.data;
  const sessionId = sessionIdRaw ?? null;
  const routeId = routeIdRaw ?? null;

  await orchestrator.preflight({
    workspaceId: ctx.activeWorkspaceId,
    userId: ctx.userId,
    message,
    sessionId,
    routeId,
  });

  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("X-Accel-Buffering", "no");
  reply.raw.flushHeaders();

  try {
    for await (const event of orchestrator.runChatTurn({
      workspaceId: ctx.activeWorkspaceId,
      userId: ctx.userId,
      message,
      sessionId,
      routeId,
    })) {
      if (req.raw.destroyed) break;
      reply.raw.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    }
  } finally {
    try {
      reply.raw.end();
    } catch {
      /* socket already closed */
    }
  }
  return reply;
}

export function registerAiChatRoute(app: FastifyInstance, orchestrator: AiOrchestrator) {
  app.post("/ai/chat", async (req, reply) => {
    const ctx = requireActiveWorkspace(req);
    return handleAiChatStream(req, reply, orchestrator, ctx);
  });
}
