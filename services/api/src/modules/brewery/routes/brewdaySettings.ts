import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { BrewdaySettingsPatchRequestSchema, BrewdaySettingsResponseSchema } from "@umbraculum/brewery-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import {
  BrewdaySettingsService,
  type BrewdayCustomStep,
  type BrewdayDefaultStep,
  type BrewdaySectionConfig,
} from "../../../services/brewdaySettingsService.js";

function parseSections(body: unknown): BrewdaySectionConfig {
  if (!body || typeof body !== "object" || !("presetExcludes" in body)) {
    return {
      presetExcludes: {},
      customSections: [],
      customBrewingMethods: [],
    };
  }
  const obj = body as Record<string, unknown>;
  const presetExcludes =
    obj["presetExcludes"] && typeof obj["presetExcludes"] === "object"
      ? (obj["presetExcludes"] as Record<string, boolean>)
      : {};
  const customSections = Array.isArray(obj["customSections"])
    ? (obj["customSections"] as BrewdaySectionConfig["customSections"])
    : [];
  const customBrewingMethods = Array.isArray(obj["customBrewingMethods"])
    ? (obj["customBrewingMethods"] as string[]).filter((x) => typeof x === "string")
    : [];
  return { presetExcludes, customSections, customBrewingMethods };
}

export function brewdaySettingsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new BrewdaySettingsService(app.prisma);

  zodApp.get(
    "/brewday-settings",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: BrewdaySettingsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const settings = await svc.getSettings(ctx.userId, ctx.activeWorkspaceId);
      return BrewdaySettingsResponseSchema.parse({ ok: true, settings });
    },
  );

  zodApp.patch(
    "/brewday-settings",
    {
      schema: {
        tags: ["brewery"],
        body: BrewdaySettingsPatchRequestSchema,
        response: {
          200: BrewdaySettingsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const brewingType = typeof body["brewingType"] === "string" ? body["brewingType"] : "";
      const sections = parseSections(body["sections"]);
      const defaultSteps = Array.isArray(body["defaultSteps"])
        ? (body["defaultSteps"] as BrewdayDefaultStep[])
        : [];
      const customSteps = Array.isArray(body["customSteps"])
        ? (body["customSteps"] as BrewdayCustomStep[])
        : [];
      const notesRaw = body["notes"];
      const notes =
        notesRaw === null ? null : typeof notesRaw === "string" ? notesRaw : undefined;

      const updated = await svc.upsertSettings(ctx.userId, ctx.activeWorkspaceId, {
        brewingType,
        sections,
        defaultSteps,
        customSteps,
        ...(notes !== undefined && { notes }),
      });
      return BrewdaySettingsResponseSchema.parse({ ok: true, settings: updated });
    },
  );
}
