import { createHash } from "node:crypto";
import type { RenderJob as PrismaRenderJob } from "@prisma/client";
import type { DocumentTemplate } from "@umbraculum/module-sdk";

import type {
  ProcessQueuedJobOptions,
  RenderingJobServiceDeps,
} from "./renderingJobService.js";
import { toInputJsonValue } from "./renderingJobStatusOps.js";
import {
  filenameForTemplate,
  renderTemplate,
  resolveTemplate,
  type RenderArtifactBytes,
} from "./renderingJobSubmitOps.js";

const DEFAULT_ARTIFACT_TTL_MS = 24 * 60 * 60 * 1000;

export async function processQueuedJob(
  deps: RenderingJobServiceDeps,
  jobId: string,
  options: ProcessQueuedJobOptions = {},
): Promise<void> {
  const job = await deps.options.prisma.renderJob.findUnique({
    where: { id: jobId },
    include: { artifact: true },
  });
  if (!job) return;
  if (job.status !== "queued") return;

  const template = resolveTemplate(job.templateRef);
  const attemptNumber = await nextAttemptNumber(deps, job.id);
  const attempt = await deps.options.prisma.renderJobAttempt.create({
    data: { jobId: job.id, attemptNumber },
  });

  await deps.options.prisma.renderJob.update({
    where: { id: job.id },
    data: { status: "running", startedAt: deps.now() },
  });
  deps.options.logger.info(
    { jobId: job.id, workspaceId: job.workspaceId, attemptNumber },
    "render.job.started",
  );

  try {
    const parsedData = template.schema.parse(job.inputJson);
    const artifact = await renderTemplate(deps, template, parsedData, {
      userId: job.requestedById,
      workspaceId: job.workspaceId,
      locale: "en",
    });
    await storeArtifact(deps, job, template, artifact);
    const completedAt = deps.now();
    await deps.options.prisma.renderJobAttempt.update({
      where: { id: attempt.id },
      data: { completedAt },
    });
    await deps.options.prisma.renderJob.update({
      where: { id: job.id },
      data: { status: "succeeded", completedAt },
    });
    deps.options.logger.info(
      { jobId: job.id, workspaceId: job.workspaceId },
      "render.job.succeeded",
    );
  } catch (error) {
    const renderError = toRenderError(error);
    const completedAt = deps.now();
    await deps.options.prisma.renderJobAttempt.update({
      where: { id: attempt.id },
      data: {
        completedAt,
        error: toInputJsonValue(renderError),
      },
    });
    const hasRemainingAttempts = attemptNumber < (options.maxAttempts ?? 1);
    if (hasRemainingAttempts) {
      await deps.options.prisma.renderJob.update({
        where: { id: job.id },
        data: {
          status: "queued",
          startedAt: null,
          completedAt: null,
          error: toInputJsonValue(renderError),
        },
      });
      deps.options.logger.warn(
        {
          err: error,
          jobId: job.id,
          workspaceId: job.workspaceId,
          attemptNumber,
          maxAttempts: options.maxAttempts,
        },
        "render.job.retry_scheduled",
      );
    } else {
      await deps.options.prisma.renderJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          completedAt,
          error: toInputJsonValue(renderError),
        },
      });
      deps.options.logger.error(
        { err: error, jobId: job.id, workspaceId: job.workspaceId },
        "render.job.failed",
      );
    }
    throw error;
  }
}

async function storeArtifact(
  deps: RenderingJobServiceDeps,
  job: PrismaRenderJob,
  template: DocumentTemplate<unknown>,
  artifact: RenderArtifactBytes,
): Promise<void> {
  const sha256 = createHash("sha256").update(artifact.body).digest("hex");
  const expiresAt = new Date(deps.now().getTime() + (deps.options.artifactTtlMs ?? DEFAULT_ARTIFACT_TTL_MS));
  const body = toPrismaBytes(artifact.body);
  await deps.options.prisma.renderArtifact.upsert({
    where: { jobId: job.id },
    create: {
      jobId: job.id,
      workspaceId: job.workspaceId,
      contentType: artifact.contentType,
      filename: filenameForTemplate(template, artifact.filenameExtension),
      filenameExtension: artifact.filenameExtension,
      sha256,
      bytes: artifact.body.byteLength,
      body,
      expiresAt,
    },
    update: {
      contentType: artifact.contentType,
      filename: filenameForTemplate(template, artifact.filenameExtension),
      filenameExtension: artifact.filenameExtension,
      sha256,
      bytes: artifact.body.byteLength,
      body,
      expiresAt,
    },
  });
}

async function nextAttemptNumber(deps: RenderingJobServiceDeps, jobId: string): Promise<number> {
  const attempts = await deps.options.prisma.renderJobAttempt.count({
    where: { jobId },
  });
  return attempts + 1;
}

function toPrismaBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copied = new Uint8Array(bytes.byteLength);
  copied.set(bytes);
  return copied;
}

function toRenderError(error: unknown): { readonly code: string; readonly message: string } {
  if (error instanceof Error && "code" in error && typeof error.code === "string") {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: "render.failed", message: error.message };
  }
  return { code: "render.failed", message: "Rendering job failed" };
}
