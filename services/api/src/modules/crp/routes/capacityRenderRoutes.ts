import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  ErrorResponseSchema,
  RenderJobSubmitResponseSchema,
  RenderVisibilitySchema,
} from "@umbraculum/contracts";
import {
  CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
  CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
  CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
  CRP_SCHEDULE_PDF_TEMPLATE_REF,
  CapacityLoadQuerySchema,
} from "@umbraculum/crp-contracts";

import { BadRequestError } from "../../../errors.js";
import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { CapacityExportService } from "../services/capacityExportService.js";

const RenderJobBodySchema = z
  .object({
    visibility: RenderVisibilitySchema.optional(),
  })
  .strict();

async function submitAsyncRenderJob(
  app: FastifyInstance,
  input: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly templateRef: string;
    readonly kind: "pdf" | "xlsx" | "csv";
    readonly data: unknown;
    readonly visibility?: "workspace" | "public";
  },
) {
  const result = await app.renderingJobs.submit({
    userId: input.userId,
    workspaceId: input.workspaceId,
    locale: "en",
    request: {
      templateRef: input.templateRef,
      kind: input.kind,
      data: input.data,
      delivery: {
        mode: "persist-to-media",
        visibility: input.visibility ?? "workspace",
      },
    },
  });
  if (result.kind !== "async") {
    throw new BadRequestError(
      "render_unexpected_stream_result",
      "CRP render jobs must render asynchronously",
    );
  }
  return result;
}

export function crpCapacityRenderRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const exports = new CapacityExportService(app.prisma);

  zodApp.post(
    "/crp/capacity-load/render-jobs",
    {
      schema: {
        querystring: CapacityLoadQuerySchema,
        body: RenderJobBodySchema,
        response: {
          202: RenderJobSubmitResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const data = await exports.buildCapacityLoadXlsxInput(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.query.resourceId,
      );
      const result = await submitAsyncRenderJob(app, {
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        templateRef: CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
        kind: "xlsx",
        data,
        visibility: req.body.visibility ?? "workspace",
      });
      return reply.status(202).send(
        RenderJobSubmitResponseSchema.parse({
          ok: true,
          mode: "async",
          job: result.job,
        }),
      );
    },
  );

  zodApp.post(
    "/crp/schedule/render-jobs",
    {
      schema: {
        querystring: CapacityLoadQuerySchema,
        body: RenderJobBodySchema,
        response: {
          202: RenderJobSubmitResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const data = await exports.buildSchedulePdfInput(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.query.resourceId,
      );
      const result = await submitAsyncRenderJob(app, {
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        templateRef: CRP_SCHEDULE_PDF_TEMPLATE_REF,
        kind: "pdf",
        data,
        visibility: req.body.visibility ?? "workspace",
      });
      return reply.status(202).send(
        RenderJobSubmitResponseSchema.parse({
          ok: true,
          mode: "async",
          job: result.job,
        }),
      );
    },
  );

  zodApp.post(
    "/crp/resources/calendar/render-jobs",
    {
      schema: {
        querystring: CapacityLoadQuerySchema,
        body: RenderJobBodySchema,
        response: {
          202: RenderJobSubmitResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const data = await exports.buildResourceCalendarCsvInput(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.query.resourceId,
      );
      const result = await submitAsyncRenderJob(app, {
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        templateRef: CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
        kind: "csv",
        data,
        visibility: req.body.visibility ?? "workspace",
      });
      return reply.status(202).send(
        RenderJobSubmitResponseSchema.parse({
          ok: true,
          mode: "async",
          job: result.job,
        }),
      );
    },
  );

  zodApp.post(
    "/crp/conflicts/render-jobs",
    {
      schema: {
        querystring: CapacityLoadQuerySchema,
        body: RenderJobBodySchema,
        response: {
          202: RenderJobSubmitResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const data = await exports.buildConflictReportPdfInput(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.query.resourceId,
      );
      const result = await submitAsyncRenderJob(app, {
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        templateRef: CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
        kind: "pdf",
        data,
        visibility: req.body.visibility ?? "workspace",
      });
      return reply.status(202).send(
        RenderJobSubmitResponseSchema.parse({
          ok: true,
          mode: "async",
          job: result.job,
        }),
      );
    },
  );
}
