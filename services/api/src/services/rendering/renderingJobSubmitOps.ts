import {
  getRegisteredDocumentTemplate,
  type DocumentTemplate,
  type RenderDelivery,
  type RenderKind,
  type RenderLogger,
  type RenderOutput,
} from "@umbraculum/module-sdk";
import type { RenderJobSubmitRequest } from "@umbraculum/contracts";

import {
  BadRequestError,
  NotFoundError,
  ServiceUnavailableError,
} from "../../errors.js";
import type {
  RenderingJobServiceDeps,
  SubmitRenderResult,
} from "./renderingJobService.js";
import { toInputJsonValue, toStatus } from "./renderingJobStatusOps.js";

const DEFAULT_DELIVERY: RenderDelivery = {
  mode: "persist-to-media",
  visibility: "workspace",
};

const DEFAULT_MAX_SYNC_BYTES = 256 * 1024;
const HARD_MAX_SYNC_BYTES = 2 * 1024 * 1024;

export interface RenderArtifactBytes {
  readonly kind: RenderKind;
  readonly contentType: string;
  readonly filenameExtension: string;
  readonly body: Uint8Array<ArrayBuffer>;
}

export async function submitRenderJob(
  deps: RenderingJobServiceDeps,
  input: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly request: RenderJobSubmitRequest;
    readonly locale: string;
  },
): Promise<SubmitRenderResult> {
  const template = resolveTemplate(input.request.templateRef);
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
    const artifact = await renderTemplate(deps, template, parsedData, {
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
      filename: filenameForTemplate(template, artifact.filenameExtension),
      body: artifact.body,
    };
  }

  const queue = deps.getQueue();
  if (!queue) {
    throw new ServiceUnavailableError(
      "render_queue_unavailable",
      "Rendering queue is unavailable; Redis is required for async rendering",
    );
  }

  const job = await deps.options.prisma.renderJob.create({
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

  await queue.enqueue(job.id, template.retryPolicy);
  deps.options.logger.info(
    {
      jobId: job.id,
      workspaceId: job.workspaceId,
      templateRef: job.templateRef,
    },
    "render.job.queued",
  );

  return {
    kind: "async",
    job: toStatus(job),
  };
}

export function resolveTemplate(ref: string): DocumentTemplate<unknown> {
  const template = getRegisteredDocumentTemplate(ref);
  if (!template) {
    throw new NotFoundError("render_template_not_found", "Rendering template not found");
  }
  return template;
}

export async function renderTemplate<TData>(
  deps: RenderingJobServiceDeps,
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
    logger: renderLogger(deps),
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

export function filenameForTemplate(
  template: Pick<DocumentTemplate<unknown>, "ref">,
  filenameExtension: string,
): string {
  const safeRef = template.ref
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
  return `${safeRef || "render"}.${filenameExtension}`;
}

function renderLogger(deps: RenderingJobServiceDeps): RenderLogger {
  return {
    debug: (message, fields) => deps.options.logger.debug(fields ?? {}, message),
    info: (message, fields) => deps.options.logger.info(fields ?? {}, message),
    warn: (message, fields) => deps.options.logger.warn(fields ?? {}, message),
    error: (message, fields) => deps.options.logger.error(fields ?? {}, message),
  };
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
