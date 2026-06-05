import {
  buildCultureAddition,
  buildFermentableAddition,
  buildHopAddition,
  buildMashProcedure,
  buildMiscAddition,
  type BeerJsonDocument,
} from "./beerJsonHelpers";
import type {
  EditorGristRow,
  EditorHopRow,
  EditorMash,
  EditorMiscRow,
  EditorYeastRow,
} from "./editorTypes";

export function buildBeerJsonRecipeDocument(args: {
  name: string;
  notes: string | null;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  mash?: EditorMash | null | undefined;
  batchSizeLiters?: number | null | undefined;
  brewhouseEfficiencyPercent?: number | null | undefined;
}): BeerJsonDocument {
  const batchSizeLiters = typeof args.batchSizeLiters === "number" && Number.isFinite(args.batchSizeLiters) ? args.batchSizeLiters : 20;
  const efficiency = typeof args.brewhouseEfficiencyPercent === "number" && Number.isFinite(args.brewhouseEfficiencyPercent) ? args.brewhouseEfficiencyPercent : 75;

  const recipe: Record<string, unknown> = {
    name: args.name,
    type: "all grain",
    author: "brewery-app",
    efficiency: { brewhouse: { unit: "%", value: efficiency } },
    batch_size: { unit: "l", value: batchSizeLiters },
    ingredients: {
      fermentable_additions: args.gristRows.map(buildFermentableAddition),
      hop_additions: args.hopsRows.filter((h) => h.name).map(buildHopAddition),
      culture_additions: args.yeastRows.filter((y) => y.name).map(buildCultureAddition),
      miscellaneous_additions: args.miscRows.filter((m) => m.name).map(buildMiscAddition),
    },
  };
  if (args.notes) recipe['notes'] = args.notes;

  const mashProc = buildMashProcedure(args.mash ?? null);
  if (mashProc) recipe['mash'] = mashProc;

  return { beerjson: { version: 1, recipes: [recipe] } };
}

export function buildRecipeExtJsonFromEditorState(args: {
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  extBase?: unknown;
}): unknown {
  const extBase =
    args.extBase && typeof args.extBase === "object" && !Array.isArray(args.extBase)
      ? (args.extBase as Record<string, unknown>)
      : null;
  const ingredientLinks = {
    grist: Object.fromEntries(
      args.gristRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
    hops: Object.fromEntries(
      args.hopsRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
    yeast: Object.fromEntries(
      args.yeastRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
    misc: Object.fromEntries(
      args.miscRows
        .map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null] as const)
        .filter(([, v]) => typeof v === "string" && v.trim()),
    ),
  };

  const mashPhModel = Object.fromEntries(
    args.gristRows
      .map((r) => {
        const mashDiPh = typeof r.mashDiPh === "number" && Number.isFinite(r.mashDiPh) ? r.mashDiPh : undefined;
        const mashTaToPh57_mEqPerKg =
          typeof r.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(r.mashTaToPh57_mEqPerKg)
            ? r.mashTaToPh57_mEqPerKg
            : undefined;
        const roastDehuskedOverride =
          r.mashRoastDehuskedOverride === undefined ? undefined : r.mashRoastDehuskedOverride;
        if (mashDiPh === undefined && mashTaToPh57_mEqPerKg === undefined && roastDehuskedOverride === undefined) {
          return null;
        }
        return [
          r.id,
          {
            ...(mashDiPh === undefined ? {} : { mashDiPh }),
            ...(mashTaToPh57_mEqPerKg === undefined ? {} : { mashTaToPh57_mEqPerKg }),
            ...(roastDehuskedOverride === undefined ? {} : { roastDehuskedOverride }),
          },
        ] as const;
      })
      .filter(Boolean) as Array<readonly [string, unknown]>,
  );

  const hopFormOverrides = Object.fromEntries(
    args.hopsRows
      .map((r) =>
        r.form === "debittered_leaf" || r.form === "hop_extract"
          ? ([r.id, r.form] as const)
          : null,
      )
      .filter(Boolean) as Array<readonly [string, unknown]>,
  );

  const yeastAttenuationRange = Object.fromEntries(
    args.yeastRows
      .map((r) => {
        const min = typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin) && r.attenuationMin >= 0 && r.attenuationMin <= 100 ? r.attenuationMin : null;
        const max = typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax) && r.attenuationMax >= 0 && r.attenuationMax <= 100 ? r.attenuationMax : null;
        if (min == null || max == null) return null;
        return [r.id, { min, max }] as const;
      })
      .filter(Boolean) as Array<readonly [string, { min: number; max: number }]>,
  );

  return {
    ...(extBase ? extBase : {}),
    version: 1,
    ingredientLinks,
    ...(Object.keys(hopFormOverrides).length ? { hopFormOverrides } : {}),
    mashPhModel,
    ...(Object.keys(yeastAttenuationRange).length ? { yeastAttenuationRange } : {}),
  };
}
