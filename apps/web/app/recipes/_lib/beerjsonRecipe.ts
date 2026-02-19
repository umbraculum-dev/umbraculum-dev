type BeerJsonDocument = {
  beerjson: {
    version: number;
    recipes: any[];
  };
};

type GristPotential =
  | { kind: "ppg"; value: number }
  | { kind: "yieldPercent"; value: number }
  | { kind: "sg"; value: number }
  | null;

export type EditorGristRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  producer?: string | null;
  group?: string | null;
  mashDiPh?: number | null;
  mashTaToPh57_mEqPerKg?: number | null;
  mashRoastDehuskedOverride?: boolean | null;
  mashRoastDehuskedSource?: "unknown" | "inferred" | "override";
  mashPhModelSource?: "unknown" | "default" | "override";
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential;
  maltClass: "base" | "crystal" | "roast" | "acid";
  /** When add_to_boil: late extract / kettle addition; excluded from mash grist for water calc. */
  timingUse?: "add_to_mash" | "add_to_boil";
};

export type EditorHopRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: "boil" | "whirlpool" | "dryhop";
  timeMinutes: number | null;
};

export type EditorYeastRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

export type EditorMiscRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  type: "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
  use: "boil" | "mash" | "primary" | "secondary" | "bottling";
  timeMinutes: number | null;
  /** If amountIsWeight=true: kilograms. If false: liters. */
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null;
  notes?: string | null;
};

export type EditorMashStepType =
  | "infusion"
  | "temperature"
  | "decoction"
  | "souring mash"
  | "souring wort"
  | "drain mash tun"
  | "sparge";

export const MASH_STEP_TYPE_OPTIONS: { value: EditorMashStepType; label: string }[] = [
  { value: "infusion", label: "Infusion" },
  { value: "temperature", label: "Temperature" },
  { value: "decoction", label: "Decoction" },
  { value: "souring mash", label: "Souring mash" },
  { value: "souring wort", label: "Souring wort" },
  { value: "drain mash tun", label: "Drain mash tun" },
  { value: "sparge", label: "Sparge" },
];

export const MASH_TEMPLATES: { id: string; labelKey: string; steps: Omit<EditorMashStep, "id">[] }[] = [
  {
    id: "single_infusion",
    labelKey: "mashingTemplateSingleInfusion",
    steps: [{ name: "Mash In", type: "infusion", stepTemperatureC: 67, stepTimeMin: 60 }],
  },
  {
    id: "step_mash",
    labelKey: "mashingTemplateStepMash",
    steps: [
      { name: "Protein rest", type: "infusion", stepTemperatureC: 52, stepTimeMin: 15 },
      { name: "Saccharification", type: "temperature", stepTemperatureC: 65, stepTimeMin: 30 },
      { name: "Mash out", type: "temperature", stepTemperatureC: 72, stepTimeMin: 20 },
    ],
  },
  {
    id: "temperature",
    labelKey: "mashingTemplateTemperature",
    steps: [{ name: "Single rest", type: "temperature", stepTemperatureC: 68, stepTimeMin: 60 }],
  },
  {
    id: "decoction",
    labelKey: "mashingTemplateDecoction",
    steps: [
      { name: "Dough in", type: "infusion", stepTemperatureC: 45, stepTimeMin: 15 },
      { name: "Protein rest", type: "decoction", stepTemperatureC: 52, stepTimeMin: 20 },
      { name: "Saccharification", type: "decoction", stepTemperatureC: 65, stepTimeMin: 30 },
      { name: "Mash out", type: "decoction", stepTemperatureC: 76, stepTimeMin: 10 },
    ],
  },
  {
    id: "sparge",
    labelKey: "mashingTemplateSparge",
    steps: [{ name: "Sparge", type: "sparge", stepTemperatureC: 76, stepTimeMin: 0 }],
  },
];

export function newMashRowId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

export type EditorMashStep = {
  id: string;
  name: string;
  type: EditorMashStepType;
  stepTemperatureC: number;
  stepTimeMin: number;
  amountL?: number | null;
  deduceFromMashIn?: boolean;
  rampTimeMin?: number | null;
  endTemperatureC?: number | null;
  infuseTemperatureC?: number | null;
  description?: string | null;
};

export type EditorMash = {
  name: string;
  grainTemperatureC: number;
  steps: EditorMashStep[];
  notes?: string | null;
} | null;

function safeNum(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function ppgToSg(ppg: number) {
  return 1 + ppg / 1000;
}

function maltClassToGrainGroup(maltClass: EditorGristRow["maltClass"]) {
  switch (maltClass) {
    case "base":
      return "base";
    case "crystal":
      return "caramel";
    case "roast":
      return "roasted";
    case "acid":
      return "specialty";
    default:
      return "base";
  }
}

function hopUseToTiming(use: EditorHopRow["use"], timeMinutes: number | null) {
  const timing: any = { use: use === "dryhop" ? "add_to_fermentation" : "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing.duration = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}

function miscUseToTiming(use: EditorMiscRow["use"], timeMinutes: number | null) {
  const useMap: Record<EditorMiscRow["use"], string> = {
    mash: "add_to_mash",
    boil: "add_to_boil",
    primary: "add_to_fermentation",
    secondary: "add_to_fermentation",
    bottling: "add_to_package",
  };
  const timing: any = { use: useMap[use] ?? "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing.duration = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}

function miscTypeToBeerJsonType(t: EditorMiscRow["type"]) {
  return t === "water_agent" ? "water agent" : t;
}

function buildFermentableAddition(row: EditorGristRow) {
  const yieldObj =
    row.potential?.kind === "yieldPercent"
      ? { fine_grind: { unit: "%", value: row.potential.value } }
      : row.potential?.kind === "sg"
        ? { potential: { unit: "sg", value: row.potential.value } }
        : row.potential?.kind === "ppg"
          ? { potential: { unit: "sg", value: ppgToSg(row.potential.value) } }
          : { fine_grind: { unit: "%", value: 0 } };

  const colorLovibond =
    typeof row.colorLovibond === "number" && Number.isFinite(row.colorLovibond) && row.colorLovibond >= 0
      ? row.colorLovibond
      : null;

  const timingUse = row.timingUse ?? "add_to_mash";
  return {
    // Not in BeerJSON schema, but allowed (additionalProperties is not false on this type).
    id: row.id,
    name: row.name,
    type: "grain",
    producer: row.producer ?? undefined,
    grain_group: maltClassToGrainGroup(row.maltClass),
    yield: yieldObj,
    ...(colorLovibond === null ? {} : { color: { unit: "Lovi", value: colorLovibond } }),
    amount: { unit: "kg", value: row.amountKg },
    timing: { use: timingUse },
  };
}

function buildHopAddition(row: EditorHopRow) {
  return {
    id: row.id,
    name: row.name,
    origin: row.country ?? undefined,
    alpha_acid: { unit: "%", value: row.alphaAcidPercent ?? 0 },
    amount: { unit: "g", value: row.amountGrams },
    timing: hopUseToTiming(row.use, row.timeMinutes),
    // Not in BeerJSON schema, but allowed (additionalProperties is not false on this type).
    // We store this so the API/editor can distinguish boil vs whirlpool vs dry hop.
    brewery_app_use: row.use,
  };
}

function buildCultureAddition(row: EditorYeastRow) {
  const attMin = typeof row.attenuationMin === "number" && Number.isFinite(row.attenuationMin) ? row.attenuationMin : null;
  const attMax = typeof row.attenuationMax === "number" && Number.isFinite(row.attenuationMax) ? row.attenuationMax : null;
  const attenuation =
    attMin != null && attMax != null ? (attMin + attMax) / 2 : attMin != null ? attMin : attMax != null ? attMax : null;
  const out: any = {
    id: row.id,
    name: row.name,
    // BeerJSON required fields:
    type: "ale",
    form: "dry",
    producer: row.lab ?? undefined,
    product_id: row.productId ?? undefined,
    amount: { unit: "pkg", value: 1 },
  };
  if (attenuation != null) out.attenuation = { unit: "%", value: attenuation };
  return out;
}

function buildMiscAddition(row: EditorMiscRow) {
  const out: any = {
    id: row.id,
    name: row.name,
    type: miscTypeToBeerJsonType(row.type),
    timing: miscUseToTiming(row.use, row.timeMinutes),
    amount: row.amountIsWeight ? { unit: "kg", value: row.amount } : { unit: "l", value: row.amount },
  };
  if (row.useFor) out.use_for = row.useFor;
  if (row.notes) out.notes = row.notes;
  return out;
}

const VALID_MASH_STEP_TYPES: EditorMashStepType[] = [
  "infusion",
  "temperature",
  "decoction",
  "souring mash",
  "souring wort",
  "drain mash tun",
  "sparge",
];

function buildMashStep(step: EditorMashStep): any {
  const out: any = {
    name: step.name,
    type: step.type,
    step_temperature: { unit: "C" as const, value: step.stepTemperatureC },
    step_time: { unit: "min" as const, value: Math.max(0, step.stepTimeMin) },
  };
  if (step.amountL != null && Number.isFinite(step.amountL) && step.amountL >= 0) {
    out.amount = { unit: "l" as const, value: step.amountL };
  }
  if (step.rampTimeMin != null && Number.isFinite(step.rampTimeMin) && step.rampTimeMin >= 0) {
    out.ramp_time = { unit: "min" as const, value: step.rampTimeMin };
  }
  if (step.endTemperatureC != null && Number.isFinite(step.endTemperatureC)) {
    out.end_temperature = { unit: "C" as const, value: step.endTemperatureC };
  }
  if (step.infuseTemperatureC != null && Number.isFinite(step.infuseTemperatureC)) {
    out.infuse_temperature = { unit: "C" as const, value: step.infuseTemperatureC };
  }
  if (typeof step.description === "string" && step.description.trim()) {
    out.description = step.description.trim();
  }
  return out;
}

function buildMashProcedure(mash: EditorMash): any {
  if (!mash || !mash.steps.length) return null;
  return {
    name: mash.name,
    grain_temperature: { unit: "C" as const, value: mash.grainTemperatureC },
    mash_steps: mash.steps.map(buildMashStep),
    ...(typeof mash.notes === "string" && mash.notes.trim() ? { notes: mash.notes.trim() } : {}),
  };
}

export function validateMashBeforeSave(mash: EditorMash): { ok: true } | { ok: false; errors: string } {
  if (!mash) return { ok: true };
  if (typeof mash.name !== "string" || !mash.name.trim()) {
    return { ok: false, errors: "Mash procedure name is required" };
  }
  if (typeof mash.grainTemperatureC !== "number" || !Number.isFinite(mash.grainTemperatureC)) {
    return { ok: false, errors: "Grain temperature must be a valid number" };
  }
  if (mash.grainTemperatureC < -20 || mash.grainTemperatureC > 100) {
    return { ok: false, errors: "Grain temperature must be between -20 and 100 °C" };
  }
  if (!Array.isArray(mash.steps)) {
    return { ok: false, errors: "Mash steps must be an array" };
  }
  if (mash.steps.length === 0) {
    return { ok: true };
  }
  const errs: string[] = [];
  mash.steps.forEach((s, idx) => {
    if (typeof s.name !== "string" || !s.name.trim()) {
      errs.push(`Step ${idx + 1}: name is required`);
    }
    if (!VALID_MASH_STEP_TYPES.includes(s.type)) {
      errs.push(`Step ${idx + 1}: invalid type "${s.type}"`);
    }
    if (typeof s.stepTemperatureC !== "number" || !Number.isFinite(s.stepTemperatureC)) {
      errs.push(`Step ${idx + 1}: step temperature must be a valid number`);
    } else if (s.stepTemperatureC < 0 || s.stepTemperatureC > 100) {
      errs.push(`Step ${idx + 1}: step temperature must be between 0 and 100 °C`);
    }
    if (typeof s.stepTimeMin !== "number" || !Number.isFinite(s.stepTimeMin)) {
      errs.push(`Step ${idx + 1}: step time must be a valid number`);
    } else if (s.stepTimeMin < 0) {
      errs.push(`Step ${idx + 1}: step time must be >= 0`);
    }
  });
  if (errs.length) return { ok: false, errors: errs.join("; ") };
  return { ok: true };
}

/**
 * Replaces only the mash in an existing BeerJSON document.
 * Used when saving mash steps from the mash page without rebuilding the full recipe.
 */
export function replaceMashInBeerJsonDocument(
  doc: unknown,
  mash: EditorMash | null,
): { beerjson: { version: number; recipes: any[] } } {
  const cloned = JSON.parse(JSON.stringify(doc)) as { beerjson?: { version?: number; recipes?: any[] } };
  const r0 = cloned?.beerjson?.recipes?.[0];
  if (!r0 || typeof r0 !== "object") {
    return cloned as { beerjson: { version: number; recipes: any[] } };
  }
  const mashProc = buildMashProcedure(mash);
  if (mashProc) {
    r0.mash = mashProc;
  } else {
    delete r0.mash;
  }
  return cloned as { beerjson: { version: number; recipes: any[] } };
}

export function buildBeerJsonRecipeDocument(args: {
  name: string;
  notes: string | null;
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  mash?: EditorMash | null;
  batchSizeLiters?: number | null;
  brewhouseEfficiencyPercent?: number | null;
}): BeerJsonDocument {
  const batchSizeLiters = typeof args.batchSizeLiters === "number" && Number.isFinite(args.batchSizeLiters) ? args.batchSizeLiters : 20;
  const efficiency = typeof args.brewhouseEfficiencyPercent === "number" && Number.isFinite(args.brewhouseEfficiencyPercent) ? args.brewhouseEfficiencyPercent : 75;

  const recipe: any = {
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
  if (args.notes) recipe.notes = args.notes;

  const mashProc = buildMashProcedure(args.mash ?? null);
  if (mashProc) recipe.mash = mashProc;

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

  return {
    ...(extBase ? extBase : {}),
    version: 1,
    ingredientLinks,
    mashPhModel,
  };
}

function parseMashFromBeerJson(r0: any): EditorMash {
  const mash = r0?.mash;
  if (!mash || typeof mash !== "object") return null;
  const name = typeof mash.name === "string" ? mash.name.trim() : "";
  const grainTemp =
    mash.grain_temperature?.unit === "C" && typeof mash.grain_temperature?.value === "number" && Number.isFinite(mash.grain_temperature.value)
      ? mash.grain_temperature.value
      : mash.grain_temperature?.unit === "F"
        ? ((mash.grain_temperature.value - 32) * 5) / 9
        : null;
  if (!name || grainTemp == null) return null;

  const stepsRaw = Array.isArray(mash.mash_steps) ? mash.mash_steps : [];
  const steps: EditorMashStep[] = stepsRaw
    .map((s: any) => {
      const stepName = typeof s?.name === "string" ? s.name.trim() : "";
      const typeRaw = typeof s?.type === "string" ? s.type : "";
      const type: EditorMashStepType = VALID_MASH_STEP_TYPES.includes(typeRaw as EditorMashStepType) ? (typeRaw as EditorMashStepType) : "infusion";
      const stepTemp =
        s?.step_temperature?.unit === "C" && typeof s?.step_temperature?.value === "number" && Number.isFinite(s.step_temperature.value)
          ? s.step_temperature.value
          : s?.step_temperature?.unit === "F" && typeof s?.step_temperature?.value === "number"
            ? ((s.step_temperature.value - 32) * 5) / 9
            : null;
      const stepTime =
        s?.step_time?.unit === "min" && typeof s?.step_time?.value === "number" && Number.isFinite(s.step_time.value)
          ? s.step_time.value
          : null;
      if (!stepName || stepTemp == null || stepTime == null) return null;

      const amountL =
        s?.amount?.unit === "l" && typeof s?.amount?.value === "number" && Number.isFinite(s.amount.value)
          ? s.amount.value
          : s?.amount?.unit === "ml"
            ? s.amount.value / 1000
            : null;
      const rampTimeMin =
        s?.ramp_time?.unit === "min" && typeof s?.ramp_time?.value === "number" && Number.isFinite(s.ramp_time.value) && s.ramp_time.value >= 0
          ? s.ramp_time.value
          : null;
      const endTemp =
        s?.end_temperature?.unit === "C" && typeof s?.end_temperature?.value === "number" && Number.isFinite(s.end_temperature.value)
          ? s.end_temperature.value
          : s?.end_temperature?.unit === "F" && typeof s?.end_temperature?.value === "number"
            ? ((s.end_temperature.value - 32) * 5) / 9
            : null;
      const infuseTemp =
        s?.infuse_temperature?.unit === "C" && typeof s?.infuse_temperature?.value === "number" && Number.isFinite(s.infuse_temperature.value)
          ? s.infuse_temperature.value
          : s?.infuse_temperature?.unit === "F" && typeof s?.infuse_temperature?.value === "number"
            ? ((s.infuse_temperature.value - 32) * 5) / 9
            : null;
      const description = typeof s?.description === "string" ? s.description.trim() || null : null;

      return {
        id: typeof s?.id === "string" ? s.id : `${Date.now()}-${Math.random()}`,
        name: stepName,
        type,
        stepTemperatureC: stepTemp,
        stepTimeMin: Math.max(0, stepTime),
        amountL: amountL ?? undefined,
        rampTimeMin: rampTimeMin ?? undefined,
        endTemperatureC: endTemp ?? undefined,
        infuseTemperatureC: infuseTemp ?? undefined,
        description: description ?? undefined,
      } as EditorMashStep;
    })
    .filter(Boolean) as EditorMashStep[];

  if (steps.length === 0) return null;

  return {
    name,
    grainTemperatureC: grainTemp,
    steps,
    notes: typeof mash.notes === "string" ? mash.notes.trim() || undefined : undefined,
  };
}

/**
 * Merges deduceFromMashIn from recipeExtJson into mash steps.
 * Stored in recipeExtJson.mashStepDeduceFromMashIn (keyed by step id) because BeerJSON schema disallows additional properties.
 */
export function mergeMashDeduceFromExt(mash: EditorMash | null, recipeExtJson: unknown): EditorMash | null {
  if (!mash || !mash.steps.length) return mash;
  const ext = recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson) ? (recipeExtJson as Record<string, unknown>) : null;
  const map = ext?.mashStepDeduceFromMashIn && typeof ext.mashStepDeduceFromMashIn === "object" && !Array.isArray(ext.mashStepDeduceFromMashIn)
    ? (ext.mashStepDeduceFromMashIn as Record<string, boolean>)
    : null;
  if (!map) return mash;
  const steps = mash.steps.map((s) => ({
    ...s,
    deduceFromMashIn: map[s.id] === true,
  }));
  return { ...mash, steps };
}

export function editorStateFromBeerJson(doc: unknown): {
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  mash: EditorMash;
} {
  const d = (doc ?? {}) as any;
  const r0 = d?.beerjson?.recipes?.[0];
  const ing = r0?.ingredients ?? {};

  const fermentables = Array.isArray(ing?.fermentable_additions) ? ing.fermentable_additions : [];
  const hops = Array.isArray(ing?.hop_additions) ? ing.hop_additions : [];
  const cultures = Array.isArray(ing?.culture_additions) ? ing.culture_additions : [];
  const misc = Array.isArray(ing?.miscellaneous_additions) ? ing.miscellaneous_additions : [];

  const gristRows: EditorGristRow[] = fermentables
    .map((f: any) => {
      const id = typeof f?.id === "string" ? f.id : `${Date.now()}-${Math.random()}`;
      const name = typeof f?.name === "string" ? f.name : "";
      if (!name) return null;
      const amountKg =
        f?.amount?.unit === "kg" ? safeNum(f?.amount?.value, 0) : f?.amount?.unit === "g" ? safeNum(f?.amount?.value, 0) / 1000 : 0;
      const colorLovibond =
        f?.color?.unit === "Lovi" && typeof f?.color?.value === "number" && Number.isFinite(f.color.value) && f.color.value >= 0
          ? safeNum(f.color.value, 0)
          : null;

      const potential: GristPotential =
        f?.yield?.potential?.unit === "sg" && typeof f?.yield?.potential?.value === "number"
          ? { kind: "sg", value: f.yield.potential.value }
          : f?.yield?.fine_grind?.unit === "%" && typeof f?.yield?.fine_grind?.value === "number"
            ? { kind: "yieldPercent", value: f.yield.fine_grind.value }
            : null;

      const grainGroup = typeof f?.grain_group === "string" ? f.grain_group : "";
      const maltClass: EditorGristRow["maltClass"] =
        grainGroup === "roasted" ? "roast" : grainGroup === "caramel" ? "crystal" : "base";

      const timingUseRaw = typeof f?.timing?.use === "string" ? f.timing.use : "";
      const timingUse: EditorGristRow["timingUse"] =
        timingUseRaw === "add_to_boil" || timingUseRaw === "add_to_fermentation" || timingUseRaw === "add_to_package"
          ? "add_to_boil"
          : "add_to_mash";

      return {
        id,
        ingredientId: null,
        name,
        producer: typeof f?.producer === "string" ? f.producer : null,
        // UI-only convenience: BeerProto had a "group" field; BeerJSON has `grain_group`.
        // We surface the BeerJSON grain_group here so the editor isn't blank.
        group: grainGroup || null,
        mashDiPh: null,
        mashTaToPh57_mEqPerKg: null,
        mashRoastDehuskedOverride: null,
        amountKg,
        colorLovibond,
        potential,
        maltClass,
        timingUse,
      } as EditorGristRow;
    })
    .filter(Boolean) as EditorGristRow[];

  const hopsRows: EditorHopRow[] = hops
    .map((h: any) => {
      const id = typeof h?.id === "string" ? h.id : `${Date.now()}-${Math.random()}`;
      const name = typeof h?.name === "string" ? h.name : "";
      if (!name) return null;
      const amountGrams =
        h?.amount?.unit === "g" ? safeNum(h?.amount?.value, 0) : h?.amount?.unit === "kg" ? safeNum(h?.amount?.value, 0) * 1000 : 0;
      const alphaAcidPercent = h?.alpha_acid?.unit === "%" ? safeNum(h?.alpha_acid?.value, 0) : null;
      const timingUse = typeof h?.timing?.use === "string" ? h.timing.use : "";
      const savedUseRaw = typeof h?.brewery_app_use === "string" ? h.brewery_app_use : "";
      const savedUse: EditorHopRow["use"] | null =
        savedUseRaw === "boil" || savedUseRaw === "whirlpool" || savedUseRaw === "dryhop" ? savedUseRaw : null;

      const use: EditorHopRow["use"] =
        timingUse === "add_to_fermentation" ? "dryhop" : savedUse != null ? savedUse : "boil";
      const timeMinutes = h?.timing?.duration?.unit === "min" ? safeNum(h?.timing?.duration?.value, 0) : null;
      return {
        id,
        ingredientId: null,
        name,
        country: typeof h?.origin === "string" ? h.origin : null,
        amountGrams,
        alphaAcidPercent,
        use,
        timeMinutes,
      } as EditorHopRow;
    })
    .filter(Boolean) as EditorHopRow[];

  const yeastRows: EditorYeastRow[] = cultures
    .map((c: any) => {
      const id = typeof c?.id === "string" ? c.id : `${Date.now()}-${Math.random()}`;
      const name = typeof c?.name === "string" ? c.name : "";
      if (!name) return null;
      const att = c?.attenuation?.unit === "%" ? safeNum(c?.attenuation?.value, 0) : null;
      return {
        id,
        ingredientId: null,
        name,
        lab: typeof c?.producer === "string" ? c.producer : null,
        productId: typeof c?.product_id === "string" ? c.product_id : null,
        attenuationMin: att,
        attenuationMax: att,
      } as EditorYeastRow;
    })
    .filter(Boolean) as EditorYeastRow[];

  const miscRows: EditorMiscRow[] = misc
    .map((m: any) => {
      const id = typeof m?.id === "string" ? m.id : `${Date.now()}-${Math.random()}`;
      const name = typeof m?.name === "string" ? m.name : "";
      if (!name) return null;
      const amountIsWeight = m?.amount?.unit === "kg" || m?.amount?.unit === "g";
      const amount =
        m?.amount?.unit === "kg" ? safeNum(m?.amount?.value, 0) : m?.amount?.unit === "g" ? safeNum(m?.amount?.value, 0) / 1000 : m?.amount?.unit === "l" ? safeNum(m?.amount?.value, 0) : 0;
      const timingUse = typeof m?.timing?.use === "string" ? m.timing.use : "";
      const use: EditorMiscRow["use"] =
        timingUse === "add_to_mash"
          ? "mash"
          : timingUse === "add_to_fermentation"
            ? "secondary"
            : timingUse === "add_to_package"
              ? "bottling"
              : "boil";
      const timeMinutes = m?.timing?.duration?.unit === "min" ? safeNum(m?.timing?.duration?.value, 0) : null;
      const typeRaw = typeof m?.type === "string" ? m.type : "other";
      const type: EditorMiscRow["type"] = typeRaw === "water agent" ? "water_agent" : typeRaw;
      return {
        id,
        ingredientId: null,
        name,
        type,
        use,
        timeMinutes,
        amount,
        amountIsWeight,
        useFor: typeof m?.use_for === "string" ? m.use_for : null,
        notes: typeof m?.notes === "string" ? m.notes : null,
      } as EditorMiscRow;
    })
    .filter(Boolean) as EditorMiscRow[];

  const mash = parseMashFromBeerJson(r0);

  return { gristRows, hopsRows, yeastRows, miscRows, mash };
}

