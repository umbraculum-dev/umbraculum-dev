import type { PrismaClient } from "@prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";

/**
 * Numeric fields are typed as `unknown` because they cross the trust boundary
 * straight from request bodies; `toOptionalNumber` validates each one at the
 * service entry point. Promoting them to `number | null` here would require
 * the routes to either assert types via `as any` (re-introducing the warnings
 * we're cleaning up) or to duplicate the same coercion logic. Centralized
 * validation in the service keeps the rule "validate at the boundary" honest
 * while keeping routes thin.
 */
export type CreateEquipmentProfileInput = {
  name: string;

  kettleVolumeLiters?: unknown;
  kettleLossesLiters?: unknown;
  kettleBoilEvaporationRatePercentPerHour?: unknown;
  kettleCoolingShrinkagePercent?: unknown;
  kettleHopsAbsorptionLiters?: unknown;

  mashVolumeLiters?: unknown;
  mashEfficiencyPercent?: unknown;
  mashLossesLiters?: unknown;
  mashThicknessLPerKg?: unknown;
  mashGrainAbsorptionLPerKg?: unknown;
  mashWaterLeftoverLiters?: unknown;

  otherLossesLiters?: unknown;
};

export type UpdateEquipmentProfileInput = Partial<CreateEquipmentProfileInput>;

function toOptionalNumber(val: unknown, field: string) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return val;
}

export class EquipmentProfilesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listProfiles(userId: string, workspaceId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    return this.prisma.equipmentProfile.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  }

  async createProfile(userId: string, workspaceId: string, input: CreateEquipmentProfileInput) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const name = input.name.trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    return this.prisma.equipmentProfile.create({
      data: {
        workspaceId,
        name,

        kettleVolumeLiters: toOptionalNumber(input.kettleVolumeLiters, "kettleVolumeLiters") ?? null,
        kettleLossesLiters: toOptionalNumber(input.kettleLossesLiters, "kettleLossesLiters") ?? null,
        kettleBoilEvaporationRatePercentPerHour:
          toOptionalNumber(input.kettleBoilEvaporationRatePercentPerHour, "kettleBoilEvaporationRatePercentPerHour") ?? null,
        kettleCoolingShrinkagePercent: toOptionalNumber(input.kettleCoolingShrinkagePercent, "kettleCoolingShrinkagePercent") ?? null,
        kettleHopsAbsorptionLiters: toOptionalNumber(input.kettleHopsAbsorptionLiters, "kettleHopsAbsorptionLiters") ?? null,

        mashVolumeLiters: toOptionalNumber(input.mashVolumeLiters, "mashVolumeLiters") ?? null,
        mashEfficiencyPercent: toOptionalNumber(input.mashEfficiencyPercent, "mashEfficiencyPercent") ?? null,
        mashLossesLiters: toOptionalNumber(input.mashLossesLiters, "mashLossesLiters") ?? null,
        mashThicknessLPerKg: toOptionalNumber(input.mashThicknessLPerKg, "mashThicknessLPerKg") ?? null,
        mashGrainAbsorptionLPerKg: toOptionalNumber(input.mashGrainAbsorptionLPerKg, "mashGrainAbsorptionLPerKg") ?? null,
        mashWaterLeftoverLiters: toOptionalNumber(input.mashWaterLeftoverLiters, "mashWaterLeftoverLiters") ?? null,

        otherLossesLiters: toOptionalNumber(input.otherLossesLiters, "otherLossesLiters") ?? null,
      },
    });
  }

  async updateProfile(userId: string, workspaceId: string, id: string, input: UpdateEquipmentProfileInput) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const existing = await this.prisma.equipmentProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("equipment_profile_not_found", "Equipment profile not found");
    if (existing.workspaceId !== workspaceId) throw new ForbiddenError("wrong_workspace", "Equipment profile does not belong to this workspace");

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = (input.name ?? "").trim();
      if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
      data.name = name;
    }

    const numericFields = [
      "kettleVolumeLiters",
      "kettleLossesLiters",
      "kettleBoilEvaporationRatePercentPerHour",
      "kettleCoolingShrinkagePercent",
      "kettleHopsAbsorptionLiters",
      "mashVolumeLiters",
      "mashEfficiencyPercent",
      "mashLossesLiters",
      "mashThicknessLPerKg",
      "mashGrainAbsorptionLPerKg",
      "mashWaterLeftoverLiters",
      "otherLossesLiters",
    ] as const;
    const inputRec = input as Record<string, unknown>;
    for (const f of numericFields) {
      const v = inputRec[f];
      if (v !== undefined) data[f] = toOptionalNumber(v, f);
    }

    if (Object.keys(data).length === 0) throw new BadRequestError("no_updates", "No updatable fields provided");

    return this.prisma.equipmentProfile.update({
      where: { id },
      data: data,
    });
  }

  async deleteProfile(userId: string, workspaceId: string, id: string) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const existing = await this.prisma.equipmentProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("equipment_profile_not_found", "Equipment profile not found");
    if (existing.workspaceId !== workspaceId) throw new ForbiddenError("wrong_workspace", "Equipment profile does not belong to this workspace");

    await this.prisma.equipmentProfile.delete({ where: { id } });
  }
}

