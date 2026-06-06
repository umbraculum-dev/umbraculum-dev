import {
  SOURCE_NAME,
  roundToOrNull,
  toNumberOrNull,
  toStringOrNull,
  upsertSourceMap,
  type BeerprotoRowImportCtx,
  type PrismaLike,
} from "./beerprotoTypes.js";

export async function importHopRow(
  prisma: PrismaLike,
  ctx: BeerprotoRowImportCtx,
): Promise<{ created: number; updated: number }> {
  const { row, sourceKey, name, dryRun } = ctx;

  const country = toStringOrNull(row["Country"]);
  const purpose = toStringOrNull(row["Purpose"]);
  const notes = toStringOrNull(row["Description"]);

  const alphaMin = roundToOrNull(toNumberOrNull(row["Alpha Acid Low (%)"]), 3);
  const alphaMax = roundToOrNull(toNumberOrNull(row["Alpha Acid High (%)"]), 3);
  const betaMin = roundToOrNull(toNumberOrNull(row["Beta Acid Low (%)"]), 3);
  const betaMax = roundToOrNull(toNumberOrNull(row["Beta Acid High (%)"]), 3);

  if (dryRun === true) return { created: 0, updated: 0 };

  const existingMap = await prisma.ingredientSourceMap.findUnique({
    where: { kind_sourceName_sourceKey: { kind: "hop", sourceName: SOURCE_NAME, sourceKey } },
  });

  const data = {
    name,
    country,
    type: purpose,
    notes,
    alphaMin,
    alphaMax,
    betaMin,
    betaMax,
  };

  let hopId: string;
  let created = 0;
  let updated = 0;
  if (existingMap?.hopId) {
    hopId = existingMap.hopId;
    await prisma.hop.update({ where: { id: hopId }, data });
    updated++;
  } else {
    const createdRec = await prisma.hop.create({ data });
    hopId = createdRec.id;
    created++;
  }

  await upsertSourceMap(prisma, { kind: "hop", sourceKey, hopId });
  return { created, updated };
}
