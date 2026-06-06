import {
  getRegisteredDocumentTemplate,
  type DocumentTemplate,
  type RenderDelivery,
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
import {
  filenameForTemplate,
  renderTemplate,
} from "./renderingJobRenderBytesOps.js";
import { toInputJsonValue, toStatus } from "./renderingJobStatusOps.js";

const DEFAULT_DELIVERY: RenderDelivery = {
  mode: "persist-to-media",
  visibility: "workspace",
};

const DEFAULT_MAX_SYNC_BYTES = 256 * 1024;
const HARD_MAX_SYNC_BYTES = 2 * 1024 * 1024;

export { type RenderArtifactBytes } from "./renderingJobRenderBytesOps.js";
export { filenameForTemplate, renderTemplate } from "./renderingJobRenderBytesOps.js";

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
