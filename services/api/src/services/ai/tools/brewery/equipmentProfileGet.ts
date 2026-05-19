import type { AiTool } from "@umbraculum/contracts";
import type { PrismaClient } from "@prisma/client";

import { EquipmentProfilesService } from "../../../equipmentProfilesService.js";

interface EquipmentProfileGetInput {
  idOrName: string;
}

interface EquipmentProfileGetOutput {
  matched: Array<{
    id: string;
    name: string;
    kettleVolumeLiters: number | null;
    kettleBoilEvaporationRatePercentPerHour: number | null;
    mashVolumeLiters: number | null;
    mashEfficiencyPercent: number | null;
    mashThicknessLPerKg: number | null;
  }>;
  totalCount: number;
}

export function createEquipmentProfileGetTool(
  prisma: PrismaClient,
): AiTool<EquipmentProfileGetInput, EquipmentProfileGetOutput> {
  const equipment = new EquipmentProfilesService(prisma);

  return {
    name: "brewery.equipmentProfileGet",
    description:
      "Look up equipment profiles (mash tun, kettle, fermenters) in the user's workspace by id or name fragment.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        idOrName: {
          type: "string",
          description: "Equipment profile id (UUID) or a case-insensitive name fragment",
        },
      },
      required: ["idOrName"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const all = await equipment.listProfiles(ctx.userId, ctx.workspaceId);
      const needle = input.idOrName.toLowerCase();
      const filtered = all.filter((p) => {
        if (p.id === input.idOrName) return true;
        if (typeof p.name === "string" && p.name.toLowerCase().includes(needle)) return true;
        return false;
      });
      const matched = filtered.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        kettleVolumeLiters: p.kettleVolumeLiters ?? null,
        kettleBoilEvaporationRatePercentPerHour: p.kettleBoilEvaporationRatePercentPerHour ?? null,
        mashVolumeLiters: p.mashVolumeLiters ?? null,
        mashEfficiencyPercent: p.mashEfficiencyPercent ?? null,
        mashThicknessLPerKg: p.mashThicknessLPerKg ?? null,
      }));
      return { matched, totalCount: filtered.length };
    },
  };
}
