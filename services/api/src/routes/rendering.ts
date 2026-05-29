import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  RenderJobCancelResponseSchema,
  RenderJobResultResponseSchema,
  RenderJobStatusResponseSchema,
  RenderJobSubmitRequestSchema,
  RenderJobSubmitResponseSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../plugins/requestContext.js";

const JobIdParamsSchema = z
  .object({
    jobId: z.string().min(1, "jobId required"),
  })
  .strict();

const ArtifactParamsSchema = z
  .object({
    artifactId: z.string().min(1, "artifactId required"),
  })
  .strict();

const ArtifactQuerySchema = z
  .object({
    expires: z.string().min(1, "expires required"),
    signature: z.string().min(1, "signature required"),
  })
  .strict();

function externalArtifactBasePath(rawPrefix: unknown): string | undefined {
  const prefix: unknown = Array.isArray(rawPrefix)
    ? (rawPrefix as readonly unknown[])[0]
    : rawPrefix;
  if (typeof prefix !== "string" || prefix.length === 0) return undefined;
  if (!prefix.startsWith("/") || prefix.startsWith("//")) return undefined;
  if (prefix.includes("?") || prefix.includes("#")) return undefined;

  const normalized = prefix.replace(/\/+$/, "");
  return normalized.length > 0 ? `${normalized}/rendering/artifacts` : undefined;
}

export function renderingRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

  zodApp.post(
    "/rendering/jobs",
    {
      schema: {
        tags: ["rendering"],
        body: RenderJobSubmitRequestSchema,
        response: {
          202: RenderJobSubmitResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const result = await app.renderingJobs.submit({
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        request: req.body,
        locale: "en",
      });

      if (result.kind === "stream") {
        reply.header("Content-Type", result.contentType);
        reply.header("Content-Length", String(result.body.byteLength));
        reply.header("Content-Disposition", `attachment; filename="${result.filename}"`);
        const binaryReply: FastifyReply = reply;
        return binaryReply.send(Buffer.from(result.body));
      }

      return reply.status(202).send(
        RenderJobSubmitResponseSchema.parse({
          ok: true,
          mode: "async",
          job: result.job,
        }),
      );
    },
  );

  zodApp.get(
    "/rendering/jobs/:jobId",
    {
      schema: {
        tags: ["rendering"],
        params: JobIdParamsSchema,
        response: {
          200: RenderJobStatusResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const job = await app.renderingJobs.getJobStatus(
        ctx.activeWorkspaceId,
        req.params.jobId,
      );
      return RenderJobStatusResponseSchema.parse({ ok: true, job });
    },
  );

  zodApp.post(
    "/rendering/jobs/:jobId/cancel",
    {
      schema: {
        tags: ["rendering"],
        params: JobIdParamsSchema,
        response: {
          200: RenderJobCancelResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const job = await app.renderingJobs.cancelJob(
        ctx.activeWorkspaceId,
        req.params.jobId,
      );
      return RenderJobCancelResponseSchema.parse({ ok: true, job });
    },
  );

  zodApp.get(
    "/rendering/jobs/:jobId/result",
    {
      schema: {
        tags: ["rendering"],
        params: JobIdParamsSchema,
        response: {
          200: RenderJobResultResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const result = await app.renderingJobs.getResult(
        ctx.activeWorkspaceId,
        req.params.jobId,
        externalArtifactBasePath(req.headers["x-forwarded-prefix"]),
      );
      return RenderJobResultResponseSchema.parse({
        ok: true,
        job: result.job,
        signedUrl: result.signed.url,
        expiresAt: result.signed.expiresAt.toISOString(),
      });
    },
  );

  zodApp.get(
    "/rendering/artifacts/:artifactId",
    {
      schema: {
        tags: ["rendering"],
        params: ArtifactParamsSchema,
        querystring: ArtifactQuerySchema,
        response: {
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const artifact = await app.renderingJobs.getArtifactForSignedUrl({
        artifactId: req.params.artifactId,
        expires: req.query.expires,
        signature: req.query.signature,
      });

      reply.header("Content-Type", artifact.contentType);
      reply.header("Content-Length", String(artifact.bytes));
      reply.header("Content-Disposition", `attachment; filename="${artifact.filename}"`);
      reply.header("Cache-Control", "private, no-store");
      const binaryReply: FastifyReply = reply;
      return binaryReply.send(Buffer.from(artifact.body));
    },
  );
}
