import type { FastifyBaseLogger } from "fastify";
import { Queue, Worker, type JobsOptions } from "bullmq";
import type { RenderRetryPolicy } from "@umbraculum/module-sdk";

import type {
  RenderingJobService,
  RenderingQueueAdapter,
} from "./renderingJobService.js";

interface RenderingQueueData {
  readonly jobId: string;
}

export interface RenderingQueueRuntime extends RenderingQueueAdapter {
  close(): Promise<void>;
}

interface RedisConnectionOptions {
  readonly host: string;
  readonly port: number;
  readonly username?: string;
  readonly password?: string;
  readonly db?: number;
}

const QUEUE_NAME = "rendering.jobs";

export function createRenderingQueueRuntime(options: {
  readonly redisUrl: string;
  readonly service: RenderingJobService;
  readonly logger: FastifyBaseLogger;
  readonly workerEnabled?: boolean;
  readonly queueName?: string;
}): RenderingQueueRuntime {
  const connection = parseRedisConnection(options.redisUrl);
  const queueName = options.queueName ?? QUEUE_NAME;
  const queue = new Queue<RenderingQueueData>(queueName, { connection });
  const worker = options.workerEnabled === false
    ? null
    : new Worker<RenderingQueueData>(
      queueName,
      async (job) => {
        const processOptions = job.opts.attempts !== undefined
          ? { maxAttempts: job.opts.attempts }
          : undefined;
        await options.service.processQueuedJob(job.data.jobId, processOptions);
      },
      { connection },
    );

  worker?.on("failed", (job, err) => {
    options.logger.error(
      { err, bullJobId: job?.id, renderJobId: job?.data.jobId },
      "render.queue.job_failed",
    );
  });

  worker?.on("error", (err) => {
    options.logger.error({ err }, "render.queue.worker_error");
  });

  return {
    async enqueue(jobId, retryPolicy) {
      const jobOptions: JobsOptions = {
        jobId,
        attempts: retryPolicy?.maxAttempts ?? 3,
        removeOnComplete: true,
        removeOnFail: false,
      };
      const backoff = backoffForPolicy(retryPolicy);
      if (backoff !== undefined) {
        jobOptions.backoff = backoff;
      }
      await queue.add(
        "render",
        { jobId },
        jobOptions,
      );
    },
    async removeWaitingJob(jobId) {
      const job = await queue.getJob(jobId);
      if (!job) return false;
      const state = await job.getState();
      if (state !== "waiting" && state !== "delayed") return false;
      await job.remove();
      return true;
    },
    async close() {
      await worker?.close();
      await queue.close();
    },
  };
}

function parseRedisConnection(redisUrl: string): RedisConnectionOptions {
  const url = new URL(redisUrl);
  const port = url.port ? Number(url.port) : 6379;
  const dbText = url.pathname.replace(/^\//, "");
  const db = dbText ? Number(dbText) : undefined;
  const username = url.username ? decodeURIComponent(url.username) : undefined;
  const password = url.password ? decodeURIComponent(url.password) : undefined;

  return {
    host: url.hostname,
    port,
    ...(username !== undefined ? { username } : {}),
    ...(password !== undefined ? { password } : {}),
    ...(db !== undefined && Number.isInteger(db) ? { db } : {}),
  };
}

function backoffForPolicy(
  retryPolicy: RenderRetryPolicy | undefined,
): JobsOptions["backoff"] {
  return {
    type: "exponential",
    delay: retryPolicy?.backoffMs ?? 1_000,
  };
}
