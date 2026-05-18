/**
 * Restore an `equipment_profiles` row from a recipe's embedded equipment snapshot.
 *
 * Context
 * -------
 * When a recipe is edited with a chosen equipment profile attached, the values
 * at the moment of editing are persisted into `recipes.recipe_ext_json.equipment`
 * (mash + kettle + misc sub-blocks), and the chosen profile ID is stored at
 * `recipes.recipe_ext_json.equipmentSource.equipmentProfileId`
 * (alongside a `copiedAt` ISO timestamp).
 *
 * If the underlying `equipment_profiles` row is lost (typically due to an
 * operational migrate-reset / partial re-seed event — see the 2026-03-06
 * data-loss writeup in DEVELOPMENT-LOCAL.md), recipe-level references become
 * dangling. This CLI re-inserts (or refreshes) the row from the recipe's
 * snapshot with the original ID so those references resolve again.
 *
 * Usage (inside the api container)
 * --------------------------------
 *   docker compose exec -T api npm run db:restore:equipment-profile -- \
 *     --recipe-id <recipe-uuid> [--equipment-id <uuid>] [--name <string>] [--dry-run]
 *
 * Behavior
 * --------
 *   - Reads the recipe.
 *   - Pulls `recipe_ext_json.equipment` as the source of truth.
 *   - Resolves the target equipment_profiles.id from --equipment-id, else from
 *     `recipe_ext_json.equipmentSource.equipmentProfileId`.
 *   - Upserts the row in the recipe's workspace; idempotent.
 *   - Prints a JSON summary to stdout.
 *
 * Failure modes (clear, fail-loud)
 * --------------------------------
 *   - Recipe not found.
 *   - `recipe_ext_json.equipment` missing.
 *   - Equipment profile ID cannot be resolved.
 *   - Unique constraint violation on (workspace_id, name): re-run with --name.
 */

import { PrismaClient } from "@prisma/client";

interface CliArgs {
  recipeId?: string;
  equipmentId?: string;
  name?: string;
  dryRun: boolean;
}

interface MashSnapshotBlock {
  name?: unknown;
  mashVolumeLiters?: unknown;
  mashEfficiencyPercent?: unknown;
  mashLossesLiters?: unknown;
  mashThicknessLPerKg?: unknown;
  mashGrainAbsorptionLPerKg?: unknown;
  mashWaterLeftoverLiters?: unknown;
}

interface KettleSnapshotBlock {
  name?: unknown;
  kettleVolumeLiters?: unknown;
  kettleLossesLiters?: unknown;
  kettleBoilEvaporationRatePercentPerHour?: unknown;
  kettleCoolingShrinkagePercent?: unknown;
  kettleHopsAbsorptionLiters?: unknown;
}

interface MiscSnapshotBlock {
  otherLossesLiters?: unknown;
}

interface EquipmentSnapshot {
  mash?: MashSnapshotBlock;
  kettle?: KettleSnapshotBlock;
  misc?: MiscSnapshotBlock;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--recipe-id") args.recipeId = argv[++i];
    else if (a === "--equipment-id") args.equipmentId = argv[++i];
    else if (a === "--name") args.name = argv[++i];
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp(): void {
   
  console.log(
    [
      "restoreEquipmentProfileFromRecipe",
      "",
      "Usage:",
      "  npm run db:restore:equipment-profile -- --recipe-id <uuid> [flags]",
      "",
      "Required:",
      "  --recipe-id      Recipe whose recipe_ext_json.equipment is the source",
      "                   of truth for the snapshot.",
      "",
      "Optional:",
      "  --equipment-id   Override the equipment_profiles.id to upsert.",
      "                   Defaults to recipe_ext_json.equipmentSource.equipmentProfileId.",
      "  --name           Override the equipment_profiles.name.",
      "                   Defaults to equipment.kettle.name (else equipment.mash.name).",
      "  --dry-run        Print what would be upserted; do not write.",
      "",
      "Notes:",
      "  - The upsert is idempotent. Re-running refreshes columns to match",
      "    the recipe's current snapshot.",
      "  - If a different equipment_profiles row already exists with the same",
      "    (workspace_id, name) tuple, re-run with --name to avoid the unique",
      "    constraint collision.",
    ].join("\n"),
  );
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asEquipmentSnapshot(raw: unknown): EquipmentSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  return raw;
}

interface EquipmentUpsertData {
  workspaceId: string;
  name: string;
  kettleVolumeLiters: number | null;
  kettleLossesLiters: number | null;
  kettleBoilEvaporationRatePercentPerHour: number | null;
  kettleCoolingShrinkagePercent: number | null;
  kettleHopsAbsorptionLiters: number | null;
  mashVolumeLiters: number | null;
  mashEfficiencyPercent: number | null;
  mashLossesLiters: number | null;
  mashThicknessLPerKg: number | null;
  mashGrainAbsorptionLPerKg: number | null;
  mashWaterLeftoverLiters: number | null;
  otherLossesLiters: number | null;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.recipeId) {
    printHelp();
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
    const equipment = asEquipmentSnapshot(ext['equipment']);

    if (!equipment) {
       
      console.error(
        `recipe_ext_json.equipment is missing on ${recipe.id}; nothing to restore`,
      );
      process.exit(1);
    }

    const equipmentSource = (ext['equipmentSource'] ?? {}) as Record<string, unknown>;
    const equipmentId =
      args.equipmentId ?? asString(equipmentSource['equipmentProfileId']);

    if (!equipmentId) {
       
      console.error(
        "could not resolve equipment profile id; pass --equipment-id or set recipe_ext_json.equipmentSource.equipmentProfileId",
      );
      process.exit(1);
    }

    const resolvedName =
      args.name ??
      asString(equipment.kettle?.name) ??
      asString(equipment.mash?.name) ??
      "Restored equipment profile";

    const data: EquipmentUpsertData = {
      workspaceId: recipe.workspaceId,
      name: resolvedName,
      kettleVolumeLiters: asNumber(equipment.kettle?.kettleVolumeLiters),
      kettleLossesLiters: asNumber(equipment.kettle?.kettleLossesLiters),
      kettleBoilEvaporationRatePercentPerHour: asNumber(
        equipment.kettle?.kettleBoilEvaporationRatePercentPerHour,
      ),
      kettleCoolingShrinkagePercent: asNumber(
        equipment.kettle?.kettleCoolingShrinkagePercent,
      ),
      kettleHopsAbsorptionLiters: asNumber(
        equipment.kettle?.kettleHopsAbsorptionLiters,
      ),
      mashVolumeLiters: asNumber(equipment.mash?.mashVolumeLiters),
      mashEfficiencyPercent: asNumber(equipment.mash?.mashEfficiencyPercent),
      mashLossesLiters: asNumber(equipment.mash?.mashLossesLiters),
      mashThicknessLPerKg: asNumber(equipment.mash?.mashThicknessLPerKg),
      mashGrainAbsorptionLPerKg: asNumber(
        equipment.mash?.mashGrainAbsorptionLPerKg,
      ),
      mashWaterLeftoverLiters: asNumber(
        equipment.mash?.mashWaterLeftoverLiters,
      ),
      otherLossesLiters: asNumber(equipment.misc?.otherLossesLiters),
    };

    if (args.dryRun) {
       
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
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
   
  console.error(err);
  process.exit(1);
});
