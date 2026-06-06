import type { FastifyInstance } from "fastify";

import { BadRequestError } from "../../../errors.js";

export async function submitAsyncRenderJob(
  app: FastifyInstance,
  input: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly templateRef: string;
    readonly kind: "pdf" | "xlsx" | "csv";
    readonly data: unknown;
    readonly visibility?: "workspace" | "public";
  },
) {
  const result = await app.renderingJobs.submit({
    userId: input.userId,
    workspaceId: input.workspaceId,
    locale: "en",
    request: {
      templateRef: input.templateRef,
      kind: input.kind,
      data: input.data,
      delivery: {
        mode: "persist-to-media",
        visibility: input.visibility ?? "workspace",
      },
    },
  });
  if (result.kind !== "async") {
    throw new BadRequestError(
      "render_unexpected_stream_result",
      "MRP render jobs must render asynchronously",
    );
  }
  return result;
}
