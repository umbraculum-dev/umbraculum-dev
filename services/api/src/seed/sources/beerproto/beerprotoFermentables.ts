import {
  SOURCE_NAME,
  ebcToLovibondApprox,
  ebcToSrm,
  pickColorUnit,
  roundTo,
  roundToOrNull,
  toNumberOrNull,
  toStringOrNull,
  upsertSourceMap,
  type BeerprotoRowImportCtx,
  type PrismaLike,
} from "./beerprotoTypes.js";

export async function importFermentableRow(
  prisma: PrismaLike,
  ctx: BeerprotoRowImportCtx,
): Promise<{ created: number; updated: number }> {
  const { row, sourceKey, name, dryRun } = ctx;

  const producer = toStringOrNull(row["Producer"]);
  const group = toStringOrNull(row["Group"]);
  const type = toStringOrNull(row["Type"]);
  const country = toStringOrNull(row["Country"]);
  const notes = toStringOrNull(row["Notes"]);
  const standard = toStringOrNull(row["Standard (ASBC/EBC/ION)"]);

  const yieldPercent = roundToOrNull(toNumberOrNull(row["Extract, F.G. dry (%)"]), 3);
  const potentialSgRaw = toNumberOrNull(row["Potential (SG)"]);
  const colorEbcRaw = toNumberOrNull(row["Color (EBC)"]);

  const colorEbc = roundToOrNull(colorEbcRaw, 3);
  const colorSrm = typeof colorEbc === "number" ? roundTo(ebcToSrm(colorEbc), 3) : null;
  const colorLovibond = typeof colorEbc === "number" ? roundTo(ebcToLovibondApprox(colorEbc), 3) : null;

  const potentialSgUnrounded =
    typeof potentialSgRaw === "number" && Number.isFinite(potentialSgRaw)
      ? potentialSgRaw
      : typeof yieldPercent === "number"
        ? 1 + ((yieldPercent / 100) * 46) / 1000
        : null;

  const potentialSg = roundToOrNull(potentialSgUnrounded, 3);
  const ppgUnrounded =
    typeof potentialSgUnrounded === "number"
      ? (potentialSgUnrounded - 1) * 1000
      : typeof yieldPercent === "number"
        ? (yieldPercent / 100) * 46
        : null;
  const ppg = roundToOrNull(ppgUnrounded, 3);

  if (dryRun === true) return { created: 0, updated: 0 };

  const existingMap = await prisma.ingredientSourceMap.findUnique({
    where: { kind_sourceName_sourceKey: { kind: "fermentable", sourceName: SOURCE_NAME, sourceKey } },
  });

  const data = {
    name,
    producer,
    group,
    type,
    country,
    notes,
    standard,
    colorEbc,
    colorOriginal: colorEbc,
    colorOriginalUnit: pickColorUnit(standard),
    colorLovibond,
    colorSrm,
    potentialSg,
    yieldPercent,
    ppg,
  };

  let fermentableId: string;
  let created = 0;
  let updated = 0;
  if (existingMap?.fermentableId) {
    fermentableId = existingMap.fermentableId;
    await prisma.fermentable.update({ where: { id: fermentableId }, data });
    updated++;
  } else {
    const createdRec = await prisma.fermentable.create({ data });
    fermentableId = createdRec.id;
    created++;
  }

  await upsertSourceMap(prisma, { kind: "fermentable", sourceKey, fermentableId });
  return { created, updated };
}
