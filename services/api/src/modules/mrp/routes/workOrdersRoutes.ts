import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  ErrorResponseSchema,
  RenderJobSubmitResponseSchema,
  RenderVisibilitySchema,
} from "@umbraculum/contracts";
import {
  MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
  MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  ProductionOrderStatusSchema,
  WorkOrderPreviewResponseSchema,
} from "@umbraculum/mrp-contracts";

import { BadRequestError } from "../../../errors.js";
import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { WorkOrderDocumentService } from "../services/workOrderDocumentService.js";

const ProductionOrderIdParamsSchema = z.object({
  orderId: z.string().min(1, "orderId required"),
});

const WorkOrderRenderJobBodySchema = z
  .object({
    templateRef: z.enum([MRP_WORK_ORDER_PDF_TEMPLATE_REF, MRP_ROUTE_CARD_PDF_TEMPLATE_REF]),
    visibility: RenderVisibilitySchema.optional(),
  })
  .strict();

const MaterialRequirementsRenderJobBodySchema = z
  .object({
    visibility: RenderVisibilitySchema.optional(),
  })
  .strict();

const ProductionOrderListRenderJobBodySchema = z
  .object({
    status: ProductionOrderStatusSchema.optional(),
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
      "MRP render jobs must render asynchronously",
    );
  }
  return result;
}

export function mrpWorkOrdersRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const documents = new WorkOrderDocumentService(app.prisma);

  zodApp.get(
    "/mrp/work-orders/:orderId/preview",
    {
      schema: {
        params: ProductionOrderIdParamsSchema,
        response: {
          200: WorkOrderPreviewResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await documents.buildWorkOrderPreview(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.orderId,
      );
      return WorkOrderPreviewResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.post(
    "/mrp/work-orders/:orderId/render-jobs",
    {
      schema: {
        params: ProductionOrderIdParamsSchema,
        body: WorkOrderRenderJobBodySchema,
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
      const data =
        req.body.templateRef === MRP_WORK_ORDER_PDF_TEMPLATE_REF
          ? await documents.buildWorkOrderPdfInput(
              ctx.userId,
              ctx.activeWorkspaceId,
              req.params.orderId,
            )
          : await documents.buildRouteCardPdfInput(
              ctx.userId,
              ctx.activeWorkspaceId,
              req.params.orderId,
            );
      const result = await submitAsyncRenderJob(app, {
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        templateRef: req.body.templateRef,
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
    "/mrp/production-orders/:orderId/material-requirements/render-jobs",
    {
      schema: {
        params: ProductionOrderIdParamsSchema,
        body: MaterialRequirementsRenderJobBodySchema,
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
      const data = await documents.buildMaterialRequirementsXlsxInput(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.orderId,
      );
      const result = await submitAsyncRenderJob(app, {
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        templateRef: MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF,
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
    "/mrp/production-orders/render-jobs",
    {
      schema: {
        body: ProductionOrderListRenderJobBodySchema,
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
      const data = await documents.buildProductionOrderCsvInput(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.body.status,
      );
      const result = await submitAsyncRenderJob(app, {
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        templateRef: MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF,
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
}
