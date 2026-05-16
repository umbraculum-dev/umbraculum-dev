import type { FastifyInstance } from "fastify";
import { requireActiveWorkspace, requireUser } from "../plugins/requestContext.js";
import { WaterProfilesService } from "../services/waterProfilesService.js";

export async function waterProfilesRoutes(app: FastifyInstance) {
  const svc = new WaterProfilesService(app.prisma);

  app.get("/water-profiles", async (req) => {
    const ctx = requireUser(req);
    const list = await svc.listProfiles(ctx.userId, ctx.activeWorkspaceId);
    return { ok: true, ...list };
  });

  app.post("/water-profiles", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const created = await svc.createProfile(ctx.userId, ctx.activeWorkspaceId, {
      scope: typeof body.scope === "string" ? body.scope : undefined,
      type: typeof body.type === "string" ? body.type : "water",
      name: typeof body.name === "string" ? body.name : "",
      ph: body.ph,
      calcium: body.calcium,
      magnesium: body.magnesium,
      sodium: body.sodium,
      sulfate: body.sulfate,
      chloride: body.chloride,
      bicarbonate: body.bicarbonate,
    });

    return { ok: true, profile: created };
  });

  app.patch("/water-profiles/:id", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    const body = (req.body ?? {}) as Record<string, unknown>;

    const updated = await svc.updateProfile(ctx.userId, ctx.activeWorkspaceId, id, {
      scope: typeof body.scope === "string" ? body.scope : undefined,
      type: typeof body.type === "string" ? body.type : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
      ph: body.ph,
      calcium: body.calcium,
      magnesium: body.magnesium,
      sodium: body.sodium,
      sulfate: body.sulfate,
      chloride: body.chloride,
      bicarbonate: body.bicarbonate,
      verificationStatus: typeof body.verificationStatus === "string" ? body.verificationStatus : undefined,
    });

    return { ok: true, profile: updated };
  });

  app.post("/water-profiles/:id/verify", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";

    const updated = await svc.setVerificationStatus(ctx.userId, ctx.activeWorkspaceId, id, "verified");
    return { ok: true, profile: updated };
  });

  app.post("/water-profiles/:id/unverify", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";

    const updated = await svc.setVerificationStatus(ctx.userId, ctx.activeWorkspaceId, id, "unverified");
    return { ok: true, profile: updated };
  });

  app.delete("/water-profiles/:id", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";

    await svc.deleteProfile(ctx.userId, ctx.activeWorkspaceId, id);
    return { ok: true };
  });
}
