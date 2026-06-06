/**
 * Restore an `equipment_profiles` row from a recipe's embedded equipment snapshot.
 */
import { PrismaClient } from "@prisma/client";

import { persistRestoredEquipmentProfile } from "./restoreEquipmentProfileFromRecipePersist.js";
import {
  asEquipmentSnapshot,
  buildEquipmentUpsertData,
  parseRestoreEquipmentCliArgs,
  printRestoreEquipmentHelp,
  resolveEquipmentProfileId,
} from "./restoreEquipmentProfileFromRecipeParse.js";

async function main(): Promise<void> {
  const args = parseRestoreEquipmentCliArgs(process.argv.slice(2));

  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printRestoreEquipmentHelp();
    process.exit(0);
  }

  if (!args.recipeId) {
    printRestoreEquipmentHelp();
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: args.recipeId },
      select: { id: true, workspaceId: true, recipeExtJson: true },
    });

    if (!recipe) {
      console.error(`recipe not found: ${args.recipeId}`);
      process.exit(1);
    }

    const ext = (recipe.recipeExtJson ?? {}) as Record<string, unknown>;
    const equipment = asEquipmentSnapshot(ext["equipment"]);

    if (!equipment) {
      console.error(
        `recipe_ext_json.equipment is missing on ${recipe.id}; nothing to restore`,
      );
      process.exit(1);
    }

    const equipmentSource = (ext["equipmentSource"] ?? {}) as Record<string, unknown>;
    const equipmentId = resolveEquipmentProfileId({
      ...(args.equipmentId ? { equipmentId: args.equipmentId } : {}),
      equipmentSource,
    });

    if (!equipmentId) {
      console.error(
        "could not resolve equipment profile id; pass --equipment-id or set recipe_ext_json.equipmentSource.equipmentProfileId",
      );
      process.exit(1);
    }

    const data = buildEquipmentUpsertData({
      workspaceId: recipe.workspaceId,
      equipment,
      ...(args.name ? { nameOverride: args.name } : {}),
    });

    await persistRestoredEquipmentProfile({
      prisma,
      equipmentId,
      data,
      dryRun: args.dryRun,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
