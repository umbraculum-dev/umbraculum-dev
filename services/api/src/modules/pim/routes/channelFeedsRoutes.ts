import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  ErrorResponseSchema,
  RenderJobSubmitResponseSchema,
  RenderVisibilitySchema,
} from "@umbraculum/contracts";

import { BadRequestError } from "../../../errors.js";
import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { PIM_PRODUCT_CATALOG_CSV_TEMPLATE_REF } from "../documentTemplates.js";
import { ProductCatalogFeedService } from "../services/productCatalogFeedService.js";

const ProductCatalogFeedSubmitRequestSchema = z.preprocess(
  (raw) => raw ?? {},
  z
    .object({
      visibility: RenderVisibilitySchema.optional(),
    })
    .strict(),
);

export function pimChannelFeedsRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const feeds = new ProductCatalogFeedService(app.prisma);

  zodApp.post(
    "/pim/channel-feeds/product-catalog-csv/jobs",
    {
      schema: {
        tags: ["pim"],
        body: ProductCatalogFeedSubmitRequestSchema,
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
      const feed = await feeds.buildActiveProductCatalogFeed(
        ctx.userId,
        ctx.activeWorkspaceId,
        new Date(),
      );
      const result = await app.renderingJobs.submit({
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        locale: "en",
        request: {
          templateRef: PIM_PRODUCT_CATALOG_CSV_TEMPLATE_REF,
          kind: "csv",
          data: feed,
          delivery: {
            mode: "persist-to-media",
            visibility: req.body.visibility ?? "workspace",
          },
        },
      });

      if (result.kind !== "async") {
        throw new BadRequestError(
          "render_unexpected_stream_result",
          "PIM channel feeds must render asynchronously",
        );
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
}
