import type {
  PrismaClient,
  WaterProfileScope,
  WaterProfileType,
  WaterProfileVerificationStatus,
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { AccountsService } from "./accountsService.js";

export type CreateWaterProfileInput = {
  scope?: WaterProfileScope; // defaults to "account"
  type: WaterProfileType;
  name: string;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

export type UpdateWaterProfileInput = Partial<CreateWaterProfileInput> & {
  verificationStatus?: WaterProfileVerificationStatus;
};

function isAdminRole(role: string) {
  return role === "owner" || role === "brewery_admin";
}

function toNumber(val: unknown, field: string) {
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return val;
}

export class WaterProfilesService {
  private readonly accounts: AccountsService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
  }

  async listProfiles(userId: string, activeAccountId: string | null) {
    const system = await this.prisma.waterProfile.findMany({
      where: { scope: "system" },
      orderBy: { name: "asc" },
    });

    const publicProfiles = await this.prisma.waterProfile.findMany({
      where: { scope: "public" },
      orderBy: { name: "asc" },
    });

    let account: typeof system = [];
    if (activeAccountId) {
      await this.accounts.assertMembership(userId, activeAccountId);
      account = await this.prisma.waterProfile.findMany({
        where: { scope: "account", accountId: activeAccountId },
        orderBy: { name: "asc" },
      });
    }

    return { system, public: publicProfiles, account };
  }

  async createProfile(userId: string, accountId: string, input: CreateWaterProfileInput) {
    const role = await this.accounts.assertMembership(userId, accountId);
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
        accountId, // keep audit trail even if scope is "public"
        name,
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

  async updateProfile(userId: string, accountId: string, profileId: string, input: UpdateWaterProfileInput) {
    const role = await this.accounts.assertMembership(userId, accountId);
    if (!isAdminRole(role)) {
      throw new ForbiddenError("insufficient_role", "Only brewery admins can manage water profiles");
    }

    const existing = await this.prisma.waterProfile.findUnique({ where: { id: profileId } });
    if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");

    if (existing.scope === "system") {
      throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
    }

    // Only allow updating profiles tied to this account (account scope) or admin-created public ones (audited).
    if (existing.accountId !== accountId) {
      throw new ForbiddenError("wrong_account", "Water profile does not belong to this account");
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
      "calcium",
      "magnesium",
      "sodium",
      "sulfate",
      "chloride",
      "bicarbonate",
    ] as const;
    for (const f of numericFields) {
      const v = (input as any)[f];
      if (v !== undefined) data[f] = toNumber(v, f);
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
    accountId: string,
    profileId: string,
    verificationStatus: WaterProfileVerificationStatus,
  ) {
    const role = await this.accounts.assertMembership(userId, accountId);
    if (!isAdminRole(role)) {
      throw new ForbiddenError("insufficient_role", "Only brewery admins can verify water profiles");
    }

    const existing = await this.prisma.waterProfile.findUnique({ where: { id: profileId } });
    if (!existing) throw new NotFoundError("water_profile_not_found", "Water profile not found");
    if (existing.scope === "system") {
      throw new ForbiddenError("system_profile_readonly", "System water profiles are read-only");
    }
    if (existing.accountId !== accountId) {
      throw new ForbiddenError("wrong_account", "Water profile does not belong to this account");
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
}

