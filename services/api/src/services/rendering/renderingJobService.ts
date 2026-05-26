import { createHash } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import type {
  Prisma,
  PrismaClient,
  RenderArtifact,
  RenderJob as PrismaRenderJob,
} from "@prisma/client";
import {
  getRegisteredDocumentTemplate,
  type DocumentTemplate,
  type RenderDelivery,
  type RenderKind,
  type RenderLogger,
  type RenderOutput,
  type RenderRetryPolicy,
  type RenderStatus,
} from "@umbraculum/module-sdk";
import type {
  RenderJobStatus,
  RenderJobSubmitRequest,
} from "@umbraculum/contracts";

import {
  BadRequestError,
  NotFoundError,
  ServiceUnavailableError,
} from "../../errors.js";
import {
  createSignedArtifactUrl,
  type SignedArtifactUrl,
  verifySignedArtifactUrl,
} from "./signedArtifactUrls.js";

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

interface RenderArtifactBytes {
  readonly kind: RenderKind;
  readonly contentType: string;
  readonly filenameExtension: string;
  readonly body: Uint8Array<ArrayBuffer>;
}

const DEFAULT_DELIVERY: RenderDelivery = {
  mode: "persist-to-media",
  visibility: "workspace",
};

const DEFAULT_MAX_SYNC_BYTES = 256 * 1024;
const HARD_MAX_SYNC_BYTES = 2 * 1024 * 1024;
const DEFAULT_ARTIFACT_TTL_MS = 24 * 60 * 60 * 1000;

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
    const template = this.resolveTemplate(input.request.templateRef);
    if (input.request.kind !== undefined && input.request.kind !== template.kind) {
      throw new BadRequestError(
        "render_kind_mismatch",
        "Body.kind must match the registered document template kind",
      );
    }

    const delivery = input.request.delivery ?? DEFAULT_DELIVERY;
    const parsedData = template.schema.parse(input.request.data);

    if (delivery.mode === "email") {
      throw new BadRequestError(
        "unsupported_delivery_mode",
        "Email delivery is not implemented by the rendering pipeline yet",
      );
    }

    if (delivery.mode === "stream-response") {
      const artifact = await this.renderTemplate(template, parsedData, {
        userId: input.userId,
        workspaceId: input.workspaceId,
        locale: input.locale,
      });
      const maxSyncBytes = Math.min(template.maxSyncBytes ?? DEFAULT_MAX_SYNC_BYTES, HARD_MAX_SYNC_BYTES);
      if (artifact.body.byteLength > maxSyncBytes) {
        throw new BadRequestError(
          "render_sync_too_large",
          "Rendered artifact exceeds the template's synchronous size limit",
        );
      }
      return {
        kind: "stream",
        contentType: artifact.contentType,
        filename: this.filenameForTemplate(template, artifact.filenameExtension),
        body: artifact.body,
      };
    }

    if (!this.queue) {
      throw new ServiceUnavailableError(
        "render_queue_unavailable",
        "Rendering queue is unavailable; Redis is required for async rendering",
      );
    }

    const job = await this.options.prisma.renderJob.create({
      data: {
        workspaceId: input.workspaceId,
        requestedById: input.userId,
        templateRef: template.ref,
        kind: template.kind,
        status: "queued",
        deliveryMode: delivery.mode,
        deliveryJson: toInputJsonValue(delivery),
        inputJson: toInputJsonValue(input.request.data),
      },
      include: { artifact: true },
    });

    await this.queue.enqueue(job.id, template.retryPolicy);
    this.options.logger.info(
      {
        jobId: job.id,
        workspaceId: job.workspaceId,
        templateRef: job.templateRef,
      },
      "render.job.queued",
    );

    return {
      kind: "async",
      job: this.toStatus(job),
    };
  }

  async processQueuedJob(
    jobId: string,
    options: ProcessQueuedJobOptions = {},
  ): Promise<void> {
    const job = await this.options.prisma.renderJob.findUnique({
      where: { id: jobId },
      include: { artifact: true },
    });
    if (!job) return;
    if (job.status !== "queued") return;

    const template = this.resolveTemplate(job.templateRef);
    const attemptNumber = await this.nextAttemptNumber(job.id);
    const attempt = await this.options.prisma.renderJobAttempt.create({
      data: { jobId: job.id, attemptNumber },
    });

    await this.options.prisma.renderJob.update({
      where: { id: job.id },
      data: { status: "running", startedAt: this.now() },
    });
    this.options.logger.info(
      { jobId: job.id, workspaceId: job.workspaceId, attemptNumber },
      "render.job.started",
    );

    try {
      const parsedData = template.schema.parse(job.inputJson);
      const artifact = await this.renderTemplate(template, parsedData, {
        userId: job.requestedById,
        workspaceId: job.workspaceId,
        locale: "en",
      });
      await this.storeArtifact(job, template, artifact);
      const completedAt = this.now();
      await this.options.prisma.renderJobAttempt.update({
        where: { id: attempt.id },
        data: { completedAt },
      });
      await this.options.prisma.renderJob.update({
        where: { id: job.id },
        data: { status: "succeeded", completedAt },
      });
      this.options.logger.info(
        { jobId: job.id, workspaceId: job.workspaceId },
        "render.job.succeeded",
      );
    } catch (error) {
      const renderError = toRenderError(error);
      const completedAt = this.now();
      await this.options.prisma.renderJobAttempt.update({
        where: { id: attempt.id },
        data: {
          completedAt,
          error: toInputJsonValue(renderError),
        },
      });
      const hasRemainingAttempts = attemptNumber < (options.maxAttempts ?? 1);
      if (hasRemainingAttempts) {
        await this.options.prisma.renderJob.update({
          where: { id: job.id },
          data: {
            status: "queued",
            startedAt: null,
            completedAt: null,
            error: toInputJsonValue(renderError),
          },
        });
        this.options.logger.warn(
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
        await this.options.prisma.renderJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
            completedAt,
            error: toInputJsonValue(renderError),
          },
        });
        this.options.logger.error(
          { err: error, jobId: job.id, workspaceId: job.workspaceId },
          "render.job.failed",
        );
      }
      throw error;
    }
  }

  async getJobStatus(workspaceId: string, jobId: string): Promise<RenderJobStatus> {
    const job = await this.findJobForWorkspace(workspaceId, jobId);
    return this.toStatus(job);
  }

  async cancelJob(workspaceId: string, jobId: string): Promise<RenderJobStatus> {
    const job = await this.findJobForWorkspace(workspaceId, jobId);
    if (job.status !== "queued") {
      throw new BadRequestError(
        "render_job_not_cancellable",
        "Only queued rendering jobs can be cancelled",
      );
    }
    if (!this.queue) {
      throw new ServiceUnavailableError(
        "render_queue_unavailable",
        "Rendering queue is unavailable; queued job cannot be removed",
      );
    }
    const removed = await this.queue.removeWaitingJob(job.id);
    if (!removed) {
      throw new BadRequestError(
        "render_job_not_cancellable",
        "Rendering job is already running or no longer waiting in the queue",
      );
    }

    const updated = await this.options.prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        completedAt: this.now(),
        error: toInputJsonValue({
          code: "render.cancelled",
          message: "Rendering job was cancelled before it started",
        }),
      },
      include: { artifact: true },
    });
    return this.toStatus(updated);
  }

  async getResult(
    workspaceId: string,
    jobId: string,
    basePath?: string,
  ): Promise<{ readonly job: RenderJobStatus; readonly signed: SignedArtifactUrl }> {
    const job = await this.findJobForWorkspace(workspaceId, jobId);
    if (job.status !== "succeeded") {
      throw new BadRequestError(
        "render_job_not_succeeded",
        "Rendering job has not succeeded",
      );
    }
    if (!job.artifact) {
      throw new NotFoundError("render_artifact_not_found", "Rendering artifact not found");
    }
    const signedUrlOptions: Parameters<typeof createSignedArtifactUrl>[1] = {
      secret: this.options.signingSecret,
      ...(this.options.signedUrlTtlMs !== undefined ? { ttlMs: this.options.signedUrlTtlMs } : {}),
      ...(basePath !== undefined ? { basePath } : {}),
      ...(this.options.now !== undefined ? { now: this.options.now } : {}),
    };
    const signed = createSignedArtifactUrl(job.artifact.id, signedUrlOptions);

    this.options.logger.info(
      { jobId: job.id, workspaceId: job.workspaceId, artifactId: job.artifact.id },
      "render.job.delivered",
    );

    return { job: this.toStatus(job), signed };
  }

  async getArtifactForSignedUrl(input: {
    readonly artifactId: string;
    readonly expires: unknown;
    readonly signature: unknown;
  }): Promise<RenderArtifact> {
    const verifyOptions: Parameters<typeof verifySignedArtifactUrl>[3] = {
      secret: this.options.signingSecret,
      ...(this.options.now !== undefined ? { now: this.options.now } : {}),
    };
    const valid = verifySignedArtifactUrl(input.artifactId, input.expires, input.signature, verifyOptions);
    if (!valid) {
      throw new BadRequestError("invalid_render_artifact_signature", "Invalid or expired artifact URL");
    }

    const artifact = await this.options.prisma.renderArtifact.findUnique({
      where: { id: input.artifactId },
    });
    if (!artifact || artifact.expiresAt <= this.now()) {
      throw new NotFoundError("render_artifact_not_found", "Rendering artifact not found");
    }
    return artifact;
  }

  private async findJobForWorkspace(
    workspaceId: string,
    jobId: string,
  ): Promise<PrismaRenderJob & { artifact: RenderArtifact | null }> {
    const job = await this.options.prisma.renderJob.findFirst({
      where: { id: jobId, workspaceId },
      include: { artifact: true },
    });
    if (!job) {
      throw new NotFoundError("render_job_not_found", "Rendering job not found");
    }
    return job;
  }

  private resolveTemplate(ref: string): DocumentTemplate<unknown> {
    const template = getRegisteredDocumentTemplate(ref);
    if (!template) {
      throw new NotFoundError("render_template_not_found", "Rendering template not found");
    }
    return template;
  }

  private async renderTemplate<TData>(
    template: DocumentTemplate<TData>,
    data: TData,
    ctx: {
      readonly userId: string;
      readonly workspaceId: string;
      readonly locale: string;
    },
  ): Promise<RenderArtifactBytes> {
    const output = await template.render(data, {
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      locale: ctx.locale,
      logger: this.renderLogger(),
    });
    const body = await renderOutputToBytes(output);
    const format = renderFormatForKind(template.kind);

    return {
      kind: template.kind,
      contentType: format.contentType,
      filenameExtension: format.filenameExtension,
      body,
    };
  }

  private async storeArtifact(
    job: PrismaRenderJob,
    template: DocumentTemplate<unknown>,
    artifact: RenderArtifactBytes,
  ): Promise<void> {
    const sha256 = createHash("sha256").update(artifact.body).digest("hex");
    const expiresAt = new Date(this.now().getTime() + (this.options.artifactTtlMs ?? DEFAULT_ARTIFACT_TTL_MS));
    const body = toPrismaBytes(artifact.body);
    await this.options.prisma.renderArtifact.upsert({
      where: { jobId: job.id },
      create: {
        jobId: job.id,
        workspaceId: job.workspaceId,
        contentType: artifact.contentType,
        filename: this.filenameForTemplate(template, artifact.filenameExtension),
        filenameExtension: artifact.filenameExtension,
        sha256,
        bytes: artifact.body.byteLength,
        body,
        expiresAt,
      },
      update: {
        contentType: artifact.contentType,
        filename: this.filenameForTemplate(template, artifact.filenameExtension),
        filenameExtension: artifact.filenameExtension,
        sha256,
        bytes: artifact.body.byteLength,
        body,
        expiresAt,
      },
    });
  }

  private async nextAttemptNumber(jobId: string): Promise<number> {
    const attempts = await this.options.prisma.renderJobAttempt.count({
      where: { jobId },
    });
    return attempts + 1;
  }

  private toStatus(job: PrismaRenderJob & { artifact: RenderArtifact | null }): RenderJobStatus {
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

  private filenameForTemplate(
    template: Pick<DocumentTemplate<unknown>, "ref">,
    filenameExtension: string,
  ): string {
    const safeRef = template.ref
      .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
      .replaceAll(/-+/g, "-")
      .replaceAll(/^-|-$/g, "");
    return `${safeRef || "render"}.${filenameExtension}`;
  }

  private renderLogger(): RenderLogger {
    return {
      debug: (message, fields) => this.options.logger.debug(fields ?? {}, message),
      info: (message, fields) => this.options.logger.info(fields ?? {}, message),
      warn: (message, fields) => this.options.logger.warn(fields ?? {}, message),
      error: (message, fields) => this.options.logger.error(fields ?? {}, message),
    };
  }

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }
}

async function renderOutputToBytes(output: RenderOutput): Promise<Uint8Array<ArrayBuffer>> {
  if (output instanceof Uint8Array) return copyToArrayBufferBytes(output);

  const reader = output.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    total += result.value.byteLength;
  }

  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

function copyToArrayBufferBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copied = new Uint8Array(bytes.byteLength);
  copied.set(bytes);
  return copied;
}

function toPrismaBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return copyToArrayBufferBytes(bytes);
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
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

function renderFormatForKind(kind: RenderKind): {
  readonly contentType: string;
  readonly filenameExtension: string;
} {
  switch (kind) {
    case "pdf":
      return { contentType: "application/pdf", filenameExtension: "pdf" };
    case "xlsx":
      return {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filenameExtension: "xlsx",
      };
    case "csv":
      return { contentType: "text/csv; charset=utf-8", filenameExtension: "csv" };
    case "docx":
      return {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filenameExtension: "docx",
      };
    case "odt":
      return { contentType: "application/vnd.oasis.opendocument.text", filenameExtension: "odt" };
    case "html":
      return { contentType: "text/html; charset=utf-8", filenameExtension: "html" };
    case "xml":
      return { contentType: "application/xml; charset=utf-8", filenameExtension: "xml" };
    case "barcode":
    case "qr":
      return { contentType: "image/png", filenameExtension: "png" };
    case "json":
      return { contentType: "application/json; charset=utf-8", filenameExtension: "json" };
  }
}
