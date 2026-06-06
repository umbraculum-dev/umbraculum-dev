export interface CliArgs {
  recipeId?: string;
  equipmentId?: string;
  name?: string;
  dryRun: boolean;
}

export interface MashSnapshotBlock {
  name?: unknown;
  mashVolumeLiters?: unknown;
  mashEfficiencyPercent?: unknown;
  mashLossesLiters?: unknown;
  mashThicknessLPerKg?: unknown;
  mashGrainAbsorptionLPerKg?: unknown;
  mashWaterLeftoverLiters?: unknown;
}

export interface KettleSnapshotBlock {
  name?: unknown;
  kettleVolumeLiters?: unknown;
  kettleLossesLiters?: unknown;
  kettleBoilEvaporationRatePercentPerHour?: unknown;
  kettleCoolingShrinkagePercent?: unknown;
  kettleHopsAbsorptionLiters?: unknown;
}

export interface MiscSnapshotBlock {
  otherLossesLiters?: unknown;
}

export interface EquipmentSnapshot {
  mash?: MashSnapshotBlock;
  kettle?: KettleSnapshotBlock;
  misc?: MiscSnapshotBlock;
}

export interface EquipmentUpsertData {
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

export function parseRestoreEquipmentCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--recipe-id") args.recipeId = argv[++i]!;
    else if (a === "--equipment-id") args.equipmentId = argv[++i]!;
    else if (a === "--name") args.name = argv[++i]!;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help" || a === "-h") {
      return args;
    }
  }
  return args;
}

export function printRestoreEquipmentHelp(): void {
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

export function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function asEquipmentSnapshot(raw: unknown): EquipmentSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  return raw;
}

export function buildEquipmentUpsertData(params: {
  workspaceId: string;
  equipment: EquipmentSnapshot;
  nameOverride?: string;
}): EquipmentUpsertData {
  const { workspaceId, equipment, nameOverride } = params;
  const resolvedName =
    nameOverride ??
    asString(equipment.kettle?.name) ??
    asString(equipment.mash?.name) ??
    "Restored equipment profile";

  return {
    workspaceId,
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
}

export function resolveEquipmentProfileId(params: {
  equipmentId?: string;
  equipmentSource: Record<string, unknown>;
}): string | null {
  return params.equipmentId ?? asString(params.equipmentSource["equipmentProfileId"]) ?? null;
}
