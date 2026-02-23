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
      scope: typeof body.scope === "string" ? (body.scope as any) : undefined,
      type: (typeof body.type === "string" ? body.type : "water") as any,
      name: typeof body.name === "string" ? body.name : "",
      ph: typeof body.ph === "number" ? (body.ph as any) : body.ph === null ? null : undefined,
      calcium: body.calcium as any,
      magnesium: body.magnesium as any,
      sodium: body.sodium as any,
      sulfate: body.sulfate as any,
      chloride: body.chloride as any,
      bicarbonate: body.bicarbonate as any,
    });

    return { ok: true, profile: created };
  });

  app.patch("/water-profiles/:id", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    const body = (req.body ?? {}) as Record<string, unknown>;

    const updated = await svc.updateProfile(ctx.userId, ctx.activeWorkspaceId, id, {
      scope: typeof body.scope === "string" ? (body.scope as any) : undefined,
      type: typeof body.type === "string" ? (body.type as any) : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
      ph: typeof body.ph === "number" ? (body.ph as any) : body.ph === null ? null : undefined,
      calcium: body.calcium as any,
      magnesium: body.magnesium as any,
      sodium: body.sodium as any,
      sulfate: body.sulfate as any,
      chloride: body.chloride as any,
      bicarbonate: body.bicarbonate as any,
      verificationStatus:
        typeof body.verificationStatus === "string" ? (body.verificationStatus as any) : undefined,
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

