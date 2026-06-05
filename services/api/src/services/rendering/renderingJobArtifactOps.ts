import type { RenderArtifact } from "@prisma/client";
import type { RenderJobStatus } from "@umbraculum/contracts";

import { BadRequestError, NotFoundError } from "../../errors.js";
import {
  createSignedArtifactUrl,
  type SignedArtifactUrl,
  verifySignedArtifactUrl,
} from "./signedArtifactUrls.js";
import type { RenderingJobServiceDeps } from "./renderingJobService.js";
import { findJobForWorkspace, toStatus } from "./renderingJobStatusOps.js";

export async function getResult(
  deps: RenderingJobServiceDeps,
  workspaceId: string,
  jobId: string,
  basePath?: string,
): Promise<{ readonly job: RenderJobStatus; readonly signed: SignedArtifactUrl }> {
  const job = await findJobForWorkspace(deps, workspaceId, jobId);
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
    secret: deps.options.signingSecret,
    ...(deps.options.signedUrlTtlMs !== undefined ? { ttlMs: deps.options.signedUrlTtlMs } : {}),
    ...(basePath !== undefined ? { basePath } : {}),
    ...(deps.options.now !== undefined ? { now: deps.options.now } : {}),
  };
  const signed = createSignedArtifactUrl(job.artifact.id, signedUrlOptions);

  deps.options.logger.info(
    { jobId: job.id, workspaceId: job.workspaceId, artifactId: job.artifact.id },
    "render.job.delivered",
  );

  return { job: toStatus(job), signed };
}

export async function getArtifactForSignedUrl(
  deps: RenderingJobServiceDeps,
  input: {
    readonly artifactId: string;
    readonly expires: unknown;
    readonly signature: unknown;
  },
): Promise<RenderArtifact> {
  const verifyOptions: Parameters<typeof verifySignedArtifactUrl>[3] = {
    secret: deps.options.signingSecret,
    ...(deps.options.now !== undefined ? { now: deps.options.now } : {}),
  };
  const valid = verifySignedArtifactUrl(input.artifactId, input.expires, input.signature, verifyOptions);
  if (!valid) {
    throw new BadRequestError("invalid_render_artifact_signature", "Invalid or expired artifact URL");
  }

  const artifact = await deps.options.prisma.renderArtifact.findUnique({
    where: { id: input.artifactId },
  });
  if (!artifact || artifact.expiresAt <= deps.now()) {
    throw new NotFoundError("render_artifact_not_found", "Rendering artifact not found");
  }
  return artifact;
}
