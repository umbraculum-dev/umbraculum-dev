import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";

const SCOPE_VALUES = ["system", "account", "public"] as const;
type WaterProfileScope = (typeof SCOPE_VALUES)[number];

const TYPE_VALUES = ["water", "dilution"] as const;
type WaterProfileType = (typeof TYPE_VALUES)[number];

const VERIFICATION_STATUS_VALUES = ["unverified", "verified"] as const;
type VerificationStatus = (typeof VERIFICATION_STATUS_VALUES)[number];

/**
 * Numeric and enum fields are typed as `unknown`/`string | undefined` because
 * they cross the trust boundary directly from request bodies; the service
 * validates each one (`toNumber`, `toScope`, …) at the entry point. Promoting
 * them to their narrow types would force routes to either re-introduce `as
 * any` casts or duplicate the same coercion logic. See also
 * `equipmentProfilesService.ts` for the matching pattern.
 */
export type CreateWaterProfileInput = {
  scope?: string;
  type?: string;
  name: string;
  ph?: unknown;
  calcium?: unknown;
  magnesium?: unknown;
  sodium?: unknown;
  sulfate?: unknown;
  chloride?: unknown;
  bicarbonate?: unknown;
};

export type UpdateWaterProfileInput = Partial<CreateWaterProfileInput> & {
  verificationStatus?: string;
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

function toScope(val: unknown): WaterProfileScope | undefined {
  if (val === undefined) return undefined;
  if (typeof val === "string" && (SCOPE_VALUES as readonly string[]).includes(val)) {
    return val as WaterProfileScope;
  }
  throw new BadRequestError("invalid_scope", `Body.scope must be one of ${SCOPE_VALUES.join(", ")}`);
}

function toType(val: unknown): WaterProfileType | undefined {
  if (val === undefined) return undefined;
  if (typeof val === "string" && (TYPE_VALUES as readonly string[]).includes(val)) {
    return val as WaterProfileType;
  }
  throw new BadRequestError("invalid_type", `Body.type must be one of ${TYPE_VALUES.join(", ")}`);
}

function toVerificationStatus(val: unknown): VerificationStatus | undefined {
  if (val === undefined) return undefined;
  if (typeof val === "string" && (VERIFICATION_STATUS_VALUES as readonly string[]).includes(val)) {
    return val as VerificationStatus;
  }
  throw new BadRequestError(
    "invalid_verification_status",
    `Body.verificationStatus must be one of ${VERIFICATION_STATUS_VALUES.join(", ")}`,
  );
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

    const scope: WaterProfileScope = toScope(input.scope) ?? "account";
    const type = toType(input.type);
    if (!type) throw new BadRequestError("invalid_type", "Body.type is required");

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
    if (input.scope !== undefined) data.scope = toScope(input.scope);
    if (input.type !== undefined) data.type = toType(input.type);

    const numericFields = [
      "ph",
      "calcium",
      "magnesium",
      "sodium",
      "sulfate",
      "chloride",
      "bicarbonate",
    ] as const;
    const inputRec = input as Record<string, unknown>;
    for (const f of numericFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (f === "ph") data[f] = toOptionalPh(v);
        else data[f] = toNumber(v, f);
      }
    }

    if (input.verificationStatus !== undefined) data.verificationStatus = toVerificationStatus(input.verificationStatus);

    if (Object.keys(data).length === 0) {
      throw new BadRequestError("no_updates", "No updatable fields provided");
    }

    return this.prisma.waterProfile.update({
      where: { id: profileId },
      data: data,
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

