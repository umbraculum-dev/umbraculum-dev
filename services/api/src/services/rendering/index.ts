import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { RenderingJobService } from "./renderingJobService.js";
import {
  createRenderingQueueRuntime,
  type RenderingQueueRuntime,
} from "./renderingQueue.js";

declare module "fastify" {
  interface FastifyInstance {
    renderingJobs: RenderingJobService;
  }
}

export const renderingRuntimePlugin = fp((app: FastifyInstance) => {
  const signingSecret =
    process.env['RENDERING_SIGNING_SECRET']?.trim() || "dev-only-rendering-signing-secret";
  const service = new RenderingJobService({
    prisma: app.prisma,
    logger: app.log,
    signingSecret,
  });

  let queueRuntime: RenderingQueueRuntime | null = null;
  const redisUrl = process.env['REDIS_URL']?.trim();
  if (redisUrl) {
    const queueOptions: Parameters<typeof createRenderingQueueRuntime>[0] = {
      redisUrl,
      service,
      logger: app.log,
      workerEnabled: process.env['RENDERING_WORKER_DISABLED'] !== "1",
      ...(process.env['NODE_ENV'] === "test" ? { queueName: "rendering.jobs.test" } : {}),
    };
    queueRuntime = createRenderingQueueRuntime(queueOptions);
    service.setQueue(queueRuntime);
  } else {
    app.log.warn("rendering queue disabled; REDIS_URL is not configured");
  }

  app.decorate("renderingJobs", service);

  app.addHook("onClose", async () => {
    await queueRuntime?.close();
  });
});

export { RenderingJobService };
export type { RenderingQueueAdapter } from "./renderingJobService.js";
