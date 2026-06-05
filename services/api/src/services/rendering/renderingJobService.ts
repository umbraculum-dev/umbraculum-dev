import type { FastifyBaseLogger } from "fastify";
import type { PrismaClient, RenderArtifact } from "@prisma/client";
import type { RenderRetryPolicy } from "@umbraculum/module-sdk";
import type {
  RenderJobStatus,
  RenderJobSubmitRequest,
} from "@umbraculum/contracts";

import { getArtifactForSignedUrl, getResult } from "./renderingJobArtifactOps.js";
import { processQueuedJob } from "./renderingJobQueueOps.js";
import { cancelJob, getJobStatus } from "./renderingJobStatusOps.js";
import { submitRenderJob } from "./renderingJobSubmitOps.js";
import type { SignedArtifactUrl } from "./signedArtifactUrls.js";

export interface RenderingQueueAdapter {
  enqueue(jobId: string, retryPolicy?: RenderRetryPolicy): Promise<void>;
  removeWaitingJob(jobId: string): Promise<boolean>;
}

export interface RenderingJobServiceOptions {
  readonly prisma: PrismaClient;
  readonly logger: FastifyBaseLogger;
  readonly signingSecret: string;
  readonly now?: () => Date;
  readonly signedUrlTtlMs?: number;
  readonly artifactTtlMs?: number;
}

export interface RenderingJobServiceDeps {
  readonly options: RenderingJobServiceOptions;
  readonly getQueue: () => RenderingQueueAdapter | null;
  readonly now: () => Date;
}

export interface StreamRenderResult {
  readonly kind: "stream";
  readonly contentType: string;
  readonly filename: string;
  readonly body: Uint8Array;
}

export interface AsyncRenderResult {
  readonly kind: "async";
  readonly job: RenderJobStatus;
}

export type SubmitRenderResult = StreamRenderResult | AsyncRenderResult;

export interface ProcessQueuedJobOptions {
  readonly maxAttempts?: number;
}

export class RenderingJobService {
  private queue: RenderingQueueAdapter | null = null;

  constructor(private readonly options: RenderingJobServiceOptions) {}

  setQueue(queue: RenderingQueueAdapter): void {
    this.queue = queue;
  }

  async submit(input: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly request: RenderJobSubmitRequest;
    readonly locale: string;
  }): Promise<SubmitRenderResult> {
    return submitRenderJob(this.deps(), input);
  }

  async processQueuedJob(
    jobId: string,
    options: ProcessQueuedJobOptions = {},
  ): Promise<void> {
    return processQueuedJob(this.deps(), jobId, options);
  }

  async getJobStatus(workspaceId: string, jobId: string): Promise<RenderJobStatus> {
    return getJobStatus(this.deps(), workspaceId, jobId);
  }

  async cancelJob(workspaceId: string, jobId: string): Promise<RenderJobStatus> {
    return cancelJob(this.deps(), workspaceId, jobId);
  }

  async getResult(
    workspaceId: string,
    jobId: string,
    basePath?: string,
  ): Promise<{ readonly job: RenderJobStatus; readonly signed: SignedArtifactUrl }> {
    return getResult(this.deps(), workspaceId, jobId, basePath);
  }

  async getArtifactForSignedUrl(input: {
    readonly artifactId: string;
    readonly expires: unknown;
    readonly signature: unknown;
  }): Promise<RenderArtifact> {
    return getArtifactForSignedUrl(this.deps(), input);
  }

  private deps(): RenderingJobServiceDeps {
    return {
      options: this.options,
      getQueue: () => this.queue,
      now: () => this.options.now?.() ?? new Date(),
    };
  }
}
