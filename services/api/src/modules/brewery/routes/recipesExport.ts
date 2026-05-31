import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema, IdParamsSchema } from "@umbraculum/contracts";
import { z } from "zod";

import { exportRecipeStrict } from "../../../beerjson/strictExport.js";
import { BadRequestError } from "../../../errors.js";
import { isObject } from "../../../lib/typeGuards.js";
import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { RecipesService } from "../../../services/recipesService.js";
import { BREWERY_BEERJSON_EXPORT_TEMPLATE_REF } from "../documentTemplates.js";

function safeFilenamePart(v: string) {
  const trimmed = v.trim();
  if (!trimmed) return "";
  return trimmed
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

/** Binary export responses — OpenAPI documents presence only. */
const BinaryExportResponseSchema = z.object({});

export function recipesExportRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const recipes = new RecipesService(app.prisma);

  async function renderBeerJsonExport(input: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly document: unknown;
    readonly filename: string;
  }) {
    const result = await app.renderingJobs.submit({
      userId: input.userId,
      workspaceId: input.workspaceId,
      locale: "en",
      request: {
        templateRef: BREWERY_BEERJSON_EXPORT_TEMPLATE_REF,
        kind: "json",
        data: input.document,
        delivery: { mode: "stream-response" },
      },
    });

    if (result.kind !== "stream") {
      throw new BadRequestError(
        "render_unexpected_async_result",
        "BeerJSON export must render synchronously",
      );
    }

    return {
      contentType: result.contentType,
      filename: input.filename,
      body: result.body,
    };
  }

  zodApp.get(
    "/recipes/:id/export/beerjson",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: BinaryExportResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const recipeId = req.params.id;

      const recipe = await recipes.getRecipe(ctx.userId, ctx.activeWorkspaceId, recipeId);
      const strictDoc = exportRecipeStrict(recipe);

      const namePart = safeFilenamePart(recipe.name ?? "");
      const filename = namePart ? `${namePart}.beerjson.json` : `recipe-${recipeId}.beerjson.json`;
      const rendered = await renderBeerJsonExport({
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        document: strictDoc,
        filename,
      });

      reply.header("Content-Type", rendered.contentType);
      reply.header("Content-Disposition", `attachment; filename="${rendered.filename}"`);
      return reply.send(Buffer.from(rendered.body));
    },
  );

  zodApp.get(
    "/recipes/export/beerjson",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: BinaryExportResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const list = await recipes.listRecipes(ctx.userId, ctx.activeWorkspaceId);

      const outRecipes: unknown[] = [];
      for (const r of list) {
        const strictDoc = exportRecipeStrict(r);
        const beerjson = isObject(strictDoc) && isObject(strictDoc["beerjson"]) ? strictDoc["beerjson"] : null;
        const recipesArr: unknown[] =
          beerjson && Array.isArray(beerjson["recipes"]) ? beerjson["recipes"] : [];
        const r0 = recipesArr[0] ?? null;
        if (r0) outRecipes.push(r0);
      }

      const doc = { beerjson: { version: 1, recipes: outRecipes } };
      const rendered = await renderBeerJsonExport({
        userId: ctx.userId,
        workspaceId: ctx.activeWorkspaceId,
        document: doc,
        filename: "recipes.beerjson.json",
      });

      reply.header("Content-Type", rendered.contentType);
      reply.header("Content-Disposition", `attachment; filename="${rendered.filename}"`);
      return reply.send(Buffer.from(rendered.body));
    },
  );
}
