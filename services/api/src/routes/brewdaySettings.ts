import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import {
  BrewdaySettingsService,
  type BrewdaySectionConfig,
  type BrewdayCustomStep,
  type BrewdayDefaultStep,
} from "../services/brewdaySettingsService.js";

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
    obj.presetExcludes && typeof obj.presetExcludes === "object"
      ? (obj.presetExcludes as Record<string, boolean>)
      : {};
  const customSections = Array.isArray(obj.customSections)
    ? (obj.customSections as BrewdaySectionConfig["customSections"])
    : [];
  const customBrewingMethods = Array.isArray(obj.customBrewingMethods)
    ? (obj.customBrewingMethods as string[]).filter((x) => typeof x === "string")
    : [];
  return { presetExcludes, customSections, customBrewingMethods };
}

export async function brewdaySettingsRoutes(app: FastifyInstance) {
  const svc = new BrewdaySettingsService(app.prisma);

  app.get("/brewday-settings", async (req) => {
    const ctx = requireActiveAccount(req);
    const settings = await svc.getSettings(ctx.userId, ctx.activeAccountId);
    return { ok: true, settings };
  });

  app.patch("/brewday-settings", async (req) => {
    const ctx = requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const brewingType = typeof body.brewingType === "string" ? body.brewingType : "";
    const sections = parseSections(body.sections);
    const defaultSteps = Array.isArray(body.defaultSteps) ? (body.defaultSteps as BrewdayDefaultStep[]) : [];
    const customSteps = Array.isArray(body.customSteps) ? (body.customSteps as BrewdayCustomStep[]) : [];
    const notes =
      body.notes === null ? null : typeof body.notes === "string" ? body.notes : undefined;

    const updated = await svc.upsertSettings(ctx.userId, ctx.activeAccountId, {
      brewingType,
      sections,
      defaultSteps,
      customSteps,
      ...(notes !== undefined && { notes }),
    });
    return { ok: true, settings: updated };
  });
}
