import {
  SOURCE_NAME,
  roundToOrNull,
  toNumberOrNull,
  toStringOrNull,
  upsertSourceMap,
  type BeerprotoRowImportCtx,
  type PrismaLike,
} from "./beerprotoTypes.js";

export async function importYeastRow(
  prisma: PrismaLike,
  ctx: BeerprotoRowImportCtx,
): Promise<{ created: number; updated: number }> {
  const { row, sourceKey, name, dryRun } = ctx;

  const lab = toStringOrNull(row["Producer"]);
  const productId = toStringOrNull(row["Product ID"]);
  const type = toStringOrNull(row["Type"]);
  const form = toStringOrNull(row["Form"]);
  const species = toStringOrNull(row["Species"]);
  const endPhMin = roundToOrNull(toNumberOrNull(row["End pH Min"]), 3);
  const endPhMax = roundToOrNull(toNumberOrNull(row["End pH Max"]), 3);
  const flavorAroma = toStringOrNull(row["Flavor/Aroma"]);
  const pitch = toStringOrNull(row["Pitch"]);
  const pitchTempC = roundToOrNull(toNumberOrNull(row["Pitch Temp ©"]), 3);
  const tolerancePercent = roundToOrNull(toNumberOrNull(row["Tolerance (%)"]), 3);
  const notes = toStringOrNull(row["Description"]);

  const attenuationMin = roundToOrNull(toNumberOrNull(row["Attenuation Min (%)"]), 3);
  const attenuationMax = roundToOrNull(toNumberOrNull(row["Attenuation Max (%)"]), 3);
  const flocculationPercent = roundToOrNull(toNumberOrNull(row["Flocculation (%)"]), 3);
  const tempMinC = roundToOrNull(toNumberOrNull(row["Temperature Min ©"]), 3);
  const tempMaxC = roundToOrNull(toNumberOrNull(row["Temperature Max ©"]), 3);
  const bestFor = toStringOrNull(row["Best For"]);

  if (dryRun === true) return { created: 0, updated: 0 };

  const existingMap = await prisma.ingredientSourceMap.findUnique({
    where: { kind_sourceName_sourceKey: { kind: "yeast", sourceName: SOURCE_NAME, sourceKey } },
  });

  const data = {
    name,
    lab,
    productId,
    type,
    form,
    species,
    endPhMin,
    endPhMax,
    flavorAroma,
    pitch,
    pitchTempC,
    tolerancePercent,
    notes,
    attenuationMin,
    attenuationMax,
    flocculationPercent,
    tempMinC,
    tempMaxC,
    bestFor,
  };

  let yeastId: string;
  let created = 0;
  let updated = 0;
  if (existingMap?.yeastId) {
    yeastId = existingMap.yeastId;
    await prisma.yeast.update({ where: { id: yeastId }, data });
    updated++;
  } else {
    const createdRec = await prisma.yeast.create({ data });
    yeastId = createdRec.id;
    created++;
  }

  await upsertSourceMap(prisma, { kind: "yeast", sourceKey, yeastId });
  return { created, updated };
}
