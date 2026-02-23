import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";

export type CreateWaterProfileInput = {
  scope?: "system" | "account" | "public"; // defaults to "account"
  type: "water" | "dilution";
  name: string;
  ph?: number | null;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

export type UpdateWaterProfileInput = Partial<CreateWaterProfileInput> & {
  verificationStatus?: "unverified" | "verified";
};

function isAdminRole(role: string) {
  return role === "brewery_admin";
}

function toNumber(val: unknown, field: string) {
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return val;
}

function toOptionalPh(val: unknown) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  const n = toNumber(val, "ph");
  // Keep validation light, but guard obviously invalid values.
  if (n < 0 || n > 14) {
    throw new BadRequestError("invalid_ph", "Body.ph must be between 0 and 14");
  }
  return n;
}

export class WaterProfilesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listProfiles(userId: string, activeWorkspaceId: string | null) {
    const system = await this.prisma.waterProfile.findMany({
      where: { scope: "system" },
      orderBy: { name: "asc" },
    });

    const publicProfiles = await this.prisma.waterProfile.findMany({
      where: { scope: "public" },
      orderBy: { name: "asc" },
    });

    let workspace: typeof system = [];
    if (activeWorkspaceId) {
      await this.workspaces.assertMembership(userId, activeWorkspaceId);
      workspace = await this.prisma.waterProfile.findMany({
        where: { scope: "account", workspaceId: activeWorkspaceId },
        orderBy: { name: "asc" },
      });
    }

    return { system, public: publicProfiles, workspace };
  }

  async createProfile(userId: string, workspaceId: string, input: CreateWaterProfileInput) {
    const role = await this.workspaces.assertMembership(userId, workspaceId);
    if (!isAdminRole(role)) {
      throw new ForbiddenError("insufficient_role", "Only brewery admins can manage water profiles");
    }

    const name = input.name.trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    const scope = input.scope ?? "account";
    const type = input.type;

    return this.prisma.waterProfile.create({
      data: {
        key: `user:${randomUUID()}`,
        scope,
        type,
        workspaceId, // keep audit trail even if scope is "public"
        name,
        ph: toOptionalPh(input.ph),
        calcium: toNumber(input.calcium, "calcium"),
        magnesium: toNumber(input.magnesium, "magnesium"),
        sodium: toNumber(input.sodium, "sodium"),
        sulfate: toNumber(input.sulfate, "sulfate"),
        chloride: toNumber(input.chloride, "chloride"),
        bicarbonate: toNumber(input.bicarbonate, "bicarbonate"),
        verificationStatus: "unverified",
        submittedByUserId: userId,
        source: "user",
      },
    });
  }

  async updateProfile(userId: string, workspaceId: string, profileId: string, input: UpdateWaterProfileInput) {
    const role = await this.workspaces.assertMembership(userId, workspaceId);
    if (!isAdminRole(role)) {
      throw new ForbiddenError("insufficient_role", "Only brewery admins can manage water profiles");
    }

    const existing = await this.prisma.waterProfile.findUnique({ where: { id: profileId } });
    if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");

    if (existing.scope === "system") {
      throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
    }

    // Only allow updating profiles tied to this account (account scope) or admin-created public ones (audited).
    if (existing.workspaceId !== workspaceId) {
      throw new ForbiddenError("wrong_workspace", "Water profile does not belong to this workspace");
    }

    const data: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = (input.name ?? "").trim();
      if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
      data.name = name;
    }
    if (input.scope !== undefined) data.scope = input.scope;
    if (input.type !== undefined) data.type = input.type;

    const numericFields = [
      "ph",
      "calcium",
      "magnesium",
      "sodium",
      "sulfate",
      "chloride",
      "bicarbonate",
    ] as const;
    for (const f of numericFields) {
      const v = (input as any)[f];
      if (v !== undefined) {
        if (f === "ph") data[f] = toOptionalPh(v);
        else data[f] = toNumber(v, f);
      }
    }

    if (input.verificationStatus !== undefined) data.verificationStatus = input.verificationStatus;

    if (Object.keys(data).length === 0) {
      throw new BadRequestError("no_updates", "No updatable fields provided");
    }

    return this.prisma.waterProfile.update({
      where: { id: profileId },
      data,
    });
  }

  async setVerificationStatus(
    userId: string,
    workspaceId: string,
    profileId: string,
    verificationStatus: "unverified" | "verified",
  ) {
    const role = await this.workspaces.assertMembership(userId, workspaceId);
    if (!isAdminRole(role)) {
      throw new ForbiddenError("insufficient_role", "Only brewery admins can verify water profiles");
    }

    const existing = await this.prisma.waterProfile.findUnique({ where: { id: profileId } });
    if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");
    if (existing.scope === "system") {
      throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
    }
    if (existing.workspaceId !== workspaceId) {
      throw new ForbiddenError("wrong_workspace", "Water profile does not belong to this workspace");
    }

    return this.prisma.waterProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus,
        verifiedByUserId: userId,
        verifiedAt: verificationStatus === "verified" ? new Date() : null,
      },
    });
  }

  async deleteProfile(userId: string, workspaceId: string, profileId: string) {
    const role = await this.workspaces.assertMembership(userId, workspaceId);
    if (!isAdminRole(role)) {
      throw new ForbiddenError("insufficient_role", "Only brewery admins can manage water profiles");
    }

    const existing = await this.prisma.waterProfile.findUnique({ where: { id: profileId } });
    if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");

    if (existing.scope === "system") {
      throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
    }

    // Only allow deleting profiles tied to this account (account scope) or admin-created public ones (audited).
    if (existing.workspaceId !== workspaceId) {
      throw new ForbiddenError("wrong_workspace", "Water profile does not belong to this workspace");
    }

    await this.prisma.waterProfile.delete({ where: { id: profileId } });
    return { ok: true as const };
  }
}

