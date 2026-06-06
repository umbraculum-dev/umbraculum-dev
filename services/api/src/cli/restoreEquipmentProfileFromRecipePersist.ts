import type { PrismaClient } from "@prisma/client";

import type { EquipmentUpsertData } from "./restoreEquipmentProfileFromRecipeParse.js";

export async function persistRestoredEquipmentProfile(params: {
  prisma: PrismaClient;
  equipmentId: string;
  data: EquipmentUpsertData;
  dryRun: boolean;
}) {
  const { prisma, equipmentId, data, dryRun } = params;

  if (dryRun) {
    console.log(
      JSON.stringify({ dryRun: true, equipmentId, data }, null, 2),
    );
    return;
  }

  const existing = await prisma.equipmentProfile.findUnique({
    where: { id: equipmentId },
    select: { id: true },
  });

  const result = await prisma.equipmentProfile.upsert({
    where: { id: equipmentId },
    create: { id: equipmentId, ...data },
    update: data,
    select: {
      id: true,
      workspaceId: true,
      name: true,
      updatedAt: true,
    },
  });

  console.log(
    JSON.stringify(
      { ok: true, action: existing ? "updated" : "created", profile: result },
      null,
      2,
    ),
  );
}
