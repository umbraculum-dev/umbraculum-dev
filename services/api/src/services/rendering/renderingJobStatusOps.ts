import type { Prisma, RenderArtifact, RenderJob as PrismaRenderJob } from "@prisma/client";
import type { RenderKind, RenderStatus } from "@umbraculum/module-sdk";
import type { RenderJobStatus } from "@umbraculum/contracts";

import {
  BadRequestError,
  NotFoundError,
  ServiceUnavailableError,
} from "../../errors.js";
import type { RenderingJobServiceDeps } from "./renderingJobService.js";

export function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export async function getJobStatus(
  deps: RenderingJobServiceDeps,
  workspaceId: string,
  jobId: string,
): Promise<RenderJobStatus> {
  const job = await findJobForWorkspace(deps, workspaceId, jobId);
  return toStatus(job);
}

export async function cancelJob(
  deps: RenderingJobServiceDeps,
  workspaceId: string,
  jobId: string,
): Promise<RenderJobStatus> {
  const job = await findJobForWorkspace(deps, workspaceId, jobId);
  if (job.status !== "queued") {
    throw new BadRequestError(
      "render_job_not_cancellable",
      "Only queued rendering jobs can be cancelled",
    );
  }
  const queue = deps.getQueue();
  if (!queue) {
    throw new ServiceUnavailableError(
      "render_queue_unavailable",
      "Rendering queue is unavailable; queued job cannot be removed",
    );
  }
  const removed = await queue.removeWaitingJob(job.id);
  if (!removed) {
    throw new BadRequestError(
      "render_job_not_cancellable",
      "Rendering job is already running or no longer waiting in the queue",
    );
  }

  const updated = await deps.options.prisma.renderJob.update({
    where: { id: job.id },
    data: {
      status: "failed",
      completedAt: deps.now(),
      error: toInputJsonValue({
        code: "render.cancelled",
        message: "Rendering job was cancelled before it started",
      }),
    },
    include: { artifact: true },
  });
  return toStatus(updated);
}

export async function findJobForWorkspace(
  deps: RenderingJobServiceDeps,
  workspaceId: string,
  jobId: string,
): Promise<PrismaRenderJob & { artifact: RenderArtifact | null }> {
  const job = await deps.options.prisma.renderJob.findFirst({
    where: { id: jobId, workspaceId },
    include: { artifact: true },
  });
  if (!job) {
    throw new NotFoundError("render_job_not_found", "Rendering job not found");
  }
  return job;
}

export function toStatus(job: PrismaRenderJob & { artifact: RenderArtifact | null }): RenderJobStatus {
  const error = parseStoredError(job.error);
  return {
    id: job.id,
    templateRef: job.templateRef,
    kind: renderKindFromString(job.kind),
    status: renderStatusFromString(job.status),
    deliveryMode: job.deliveryMode,
    requestedAt: job.requestedAt.toISOString(),
    startedAt: job.startedAt ? job.startedAt.toISOString() : null,
    completedAt: job.completedAt ? job.completedAt.toISOString() : null,
    artifactId: job.artifact?.id ?? null,
    mediaAssetId: job.mediaAssetId ?? null,
    error,
  };
}

function parseStoredError(
  value: Prisma.JsonValue | null,
): { readonly code: string; readonly message: string } | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const code = value["code"];
  const message = value["message"];
  if (typeof code !== "string" || typeof message !== "string") return null;
  return { code, message };
}

function renderStatusFromString(value: string): RenderStatus {
  if (value === "queued" || value === "running" || value === "succeeded" || value === "failed") {
    return value;
  }
  return "failed";
}

function renderKindFromString(value: string): RenderKind {
  if (
    value === "pdf" ||
    value === "xlsx" ||
    value === "csv" ||
    value === "docx" ||
    value === "odt" ||
    value === "html" ||
    value === "json" ||
    value === "xml" ||
    value === "barcode" ||
    value === "qr"
  ) {
    return value;
  }
  return "json";
}
