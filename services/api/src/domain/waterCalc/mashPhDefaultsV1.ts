export type MashPhModelKeyV1 =
  | "base_pale"
  | "base_munich"
  | "base_vienna"
  | "crystal"
  | "roasted"
  | "roasted_dehusked"
  | "acidulated"
  | "adjunct_sugar"
  | "unknown";

export type MashPhModelDefaultsV1 = {
  mashPhModelKey: MashPhModelKeyV1;
  mashPhModelSource: "defaults_v1";
  mashPhModelVersion: 1;
  /**
   * Distilled-water mash pH (room temp, ~20–25°C).
   * Often not available from public ingredient DBs; we keep defaults conservative.
   */
  mashDiPh: number | null;
  /**
   * Titratable acidity to pH 5.7 (Troester-style), in mEq/kg.
   * This is a pragmatic modeling parameter; the true value is malt-specific and must be measured or sourced.
   */
  mashTaToPh57_mEqPerKg: number | null;
};

function lc(v: unknown): string {
  return typeof v === "string" ? v.toLowerCase() : "";
}

/**
 * Infer “dehusked / debittered” roasted malts from name/notes.
 * This is intentionally conservative; users can override parameters.
 */
export function inferIsDehuskedOrDebittered(name: string | null | undefined, notes: string | null | undefined): boolean {
  const hay = `${lc(name)} ${lc(notes)}`.trim();
  if (!hay) return false;
  // Common vendor phrases
  if (hay.includes("dehusked") || hay.includes("de-husked")) return true;
  if (hay.includes("debittered") || hay.includes("de-bittered")) return true;
  // Weyermann Carafa Special line is dehusked.
  if (hay.includes("carafa") && hay.includes("special")) return true;
  // Generic “de-bittered black” markers.
  if (hay.includes("de bittered") || hay.includes("de bitter")) return true;
  return false;
}

export type FermentableLike = {
  name: string;
  group: string | null;
  type: string | null;
  notes: string | null;
  colorEbc: number | null;
};

export function inferMashPhModelKeyV1(f: FermentableLike): MashPhModelKeyV1 {
  const g = lc(f.group);
  const t = lc(f.type);
  const n = lc(f.name);
  const notes = lc(f.notes);

  if (inferIsDehuskedOrDebittered(f.name, f.notes)) return "roasted_dehusked";

  // Acidulated / sauermalz
  if (g.includes("acid") || n.includes("acid") || n.includes("sauer")) return "acidulated";

  // Sugars / adjuncts
  if (g.includes("sugar") || t.includes("sugar") || n.includes("sugar") || n.includes("dextrose") || n.includes("glucose")) {
    return "adjunct_sugar";
  }

  // Roasted / black / chocolate
  if (
    g.includes("roast") ||
    g.includes("roasted") ||
    g.includes("black") ||
    g.includes("chocolate") ||
    t.includes("roast") ||
    n.includes("roast") ||
    n.includes("black malt") ||
    n.includes("chocolate")
  ) {
    return "roasted";
  }

  // Crystal/caramel/cara
  if (g.includes("crystal") || g.includes("caramel") || g.includes("cara") || t.includes("crystal") || t.includes("caramel")) {
    return "crystal";
  }

  // Munich / Vienna families (base-ish, but more kilned)
  if (g.includes("munich") || t.includes("munich") || n.includes("munich")) return "base_munich";
  if (g.includes("vienna") || t.includes("vienna") || n.includes("vienna")) return "base_vienna";

  // Default: base malt
  if (g.includes("base") || t.includes("base") || g.includes("pale") || n.includes("pale")) return "base_pale";

  return "unknown";
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Default TA for roasted malts from color (EBC), using a weak saturating curve.
 * This is a proxy: real TA is malt-specific and should be overridden when known.
 */
function roastedTaDefaultFromEbc(input: { colorEbc: number | null; dehusked: boolean }): number {
  // Tune these constants carefully; we want to keep behavior ~40-ish for common roasted malts,
  // but still differentiate very dark malts without runaway linear growth.
  const C0_EBC = 600;
  const TA_MIN = input.dehusked ? 18 : 32;
  const TA_MAX = input.dehusked ? 30 : 44;

  const cRaw = input.colorEbc;
  const c = typeof cRaw === "number" && Number.isFinite(cRaw) && cRaw >= 0 ? cRaw : C0_EBC;

  const frac = 1 - Math.exp(-c / C0_EBC);
  const ta = TA_MIN + (TA_MAX - TA_MIN) * frac;
  return round3(clamp(ta, TA_MIN, TA_MAX));
}

export function defaultMashTaToPh57_mEqPerKg(modelKey: MashPhModelKeyV1, colorEbc: number | null): number | null {
  // Troester-inspired defaults:
  // - Roasted malts: weak color-proxy with saturation (keeps ~40-ish but differentiates extremes).
  // - Crystal/caramel trend upward with color (with scatter): a ≈ 14 + 0.13*EBC.
  // - Acidulated ~315-358 mEq/kg (use midpoint).
  // For base malts, we treat TA as 0 in v1 (baseline handled by DI pH / intercept).
  if (modelKey === "crystal") {
    if (typeof colorEbc !== "number" || !Number.isFinite(colorEbc) || colorEbc < 0) return 14;
    return round3(Math.max(0, 14 + 0.13 * colorEbc));
  }
  if (modelKey === "roasted") return roastedTaDefaultFromEbc({ colorEbc, dehusked: false });
  if (modelKey === "roasted_dehusked") return roastedTaDefaultFromEbc({ colorEbc, dehusked: true });
  if (modelKey === "acidulated") return 335; // midpoint of ~315–358
  return 0;
}

export function defaultMashDiPh(modelKey: MashPhModelKeyV1): number | null {
  // Keep conservative in v1: a single baseline for base malts; users can override per ingredient.
  if (modelKey === "base_munich") return 5.72;
  if (modelKey === "base_vienna") return 5.74;
  if (modelKey === "base_pale") return 5.76;
  return null;
}

export function getMashPhModelDefaultsV1(f: FermentableLike): MashPhModelDefaultsV1 {
  const mashPhModelKey = inferMashPhModelKeyV1(f);
  return {
    mashPhModelKey,
    mashPhModelSource: "defaults_v1",
    mashPhModelVersion: 1,
    mashDiPh: defaultMashDiPh(mashPhModelKey),
    mashTaToPh57_mEqPerKg: defaultMashTaToPh57_mEqPerKg(mashPhModelKey, f.colorEbc),
  };
}

