/**
 * Legacy grist/hops/yeast/misc JSON validators — retained for future BeerJSON row mapping.
 * Currently unused (underscore-prefixed); see docs/LINTING.md Phase 6c dead-code policy.
 */
import type { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../errors.js";
import {
  defaultMashDiPh,
  defaultMashTaToPh57_mEqPerKg,
  inferIsDehuskedOrDebittered,
  inferMashPhModelKeyV1,
} from "../domain/waterCalc/mashPhDefaultsV1.js";

async function _snapshotGristRows(prisma: PrismaClient, rows: GristRow[]): Promise<GristRow[]> {
  const ids = Array.from(
    new Set(
      rows
        .map((r) => (typeof r.ingredientId === "string" ? r.ingredientId : null))
        .filter((v): v is string => Boolean(v)),
    ),
  );
  if (ids.length === 0) return rows;

  const fermentables = await prisma.fermentable.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      producer: true,
      group: true,
      type: true,
      notes: true,
      colorEbc: true,
      mashDiPh: true,
      mashTaToPh57_mEqPerKg: true,
    },
  });
  const byId = new Map(fermentables.map((f) => [f.id, f]));

  return rows.map((r) => {
    const ingredientId = typeof r.ingredientId === "string" ? r.ingredientId : null;
    if (!ingredientId) return r;
    const f = byId.get(ingredientId);
    if (!f) return r;

    const wantsOverride =
      (typeof r.mashDiPh === "number" && Number.isFinite(r.mashDiPh)) ||
      (typeof r.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(r.mashTaToPh57_mEqPerKg));

    const colorEbc = typeof f.colorEbc === "number" && Number.isFinite(f.colorEbc) ? f.colorEbc : null;
    const canonicalName = f.name ?? r.name;

    const inferredKey = inferMashPhModelKeyV1({
      name: canonicalName,
      group: f.group ?? null,
      type: f.type ?? null,
      notes: f.notes ?? null,
      colorEbc,
    });

    // Dehusked / de-bittered handling for roasted malts:
    // - default: infer from canonical ingredient name/notes
    // - user can override (persisted in recipeExtJson mashPhModel)
    const isRoastedLike = inferredKey === "roasted" || inferredKey === "roasted_dehusked";
    let mashRoastDehuskedOverride: boolean | null = null;
    let mashRoastDehuskedSource: GristRow["mashRoastDehuskedSource"] = "unknown";
    let isRoastDehusked: boolean | null = null;

    if (isRoastedLike) {
      if (typeof r.mashRoastDehuskedOverride === "boolean") {
        mashRoastDehuskedOverride = r.mashRoastDehuskedOverride;
        mashRoastDehuskedSource = "override";
        isRoastDehusked = mashRoastDehuskedOverride;
      } else {
        isRoastDehusked = inferIsDehuskedOrDebittered(canonicalName, f.notes ?? null);
        mashRoastDehuskedSource = "inferred";
      }
    }

    const mashPhModelKey = isRoastedLike
      ? isRoastDehusked
        ? "roasted_dehusked"
        : "roasted"
      : inferredKey;

    const defaults = {
      mashDiPh: defaultMashDiPh(mashPhModelKey),
      mashTaToPh57_mEqPerKg: defaultMashTaToPh57_mEqPerKg(mashPhModelKey, colorEbc),
    };

    const mashDiPh =
      wantsOverride && r.mashDiPh !== null && r.mashDiPh !== undefined
        ? r.mashDiPh
        : typeof f.mashDiPh === "number" && Number.isFinite(f.mashDiPh)
          ? f.mashDiPh
          : defaults.mashDiPh;
    const mashTaToPh57_mEqPerKg =
      wantsOverride && r.mashTaToPh57_mEqPerKg !== null && r.mashTaToPh57_mEqPerKg !== undefined
        ? r.mashTaToPh57_mEqPerKg
        : typeof f.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(f.mashTaToPh57_mEqPerKg)
          ? f.mashTaToPh57_mEqPerKg
          : defaults.mashTaToPh57_mEqPerKg;

    const mashPhModelSource: GristRow["mashPhModelSource"] = wantsOverride
      ? "override"
      : mashDiPh === null && mashTaToPh57_mEqPerKg === null
        ? "unknown"
        : "default";

    return {
      ...r,
      producer: r.producer ?? f.producer ?? null,
      group: r.group ?? f.group ?? null,
      mashDiPh: mashDiPh ?? null,
      mashTaToPh57_mEqPerKg: mashTaToPh57_mEqPerKg ?? null,
      mashPhModelSource,
      mashRoastDehuskedOverride,
      mashRoastDehuskedSource,
    };
  });
}

type GristPotential =
  | { kind: "ppg"; value: number }
  | { kind: "yieldPercent"; value: number }
  | { kind: "sg"; value: number };

type GristMaltClass = "base" | "crystal" | "roast" | "acid";

type GristRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  producer?: string | null;
  group?: string | null;
  mashDiPh?: number | null;
  mashTaToPh57_mEqPerKg?: number | null;
  mashPhModelSource?: "default" | "override" | "unknown";
  mashRoastDehuskedOverride?: boolean | null;
  mashRoastDehuskedSource?: "inferred" | "override" | "unknown";
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential | null;
  maltClass: GristMaltClass;
};

function ensureFinite(n: unknown, field: string) {
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return n;
}

function _validateGristJson(value: unknown): GristRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_grist_json", "Body.gristJson must be an array");
  }

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o['id'] === "string" ? o['id'].trim() : "";
    const ingredientIdRaw = o['ingredientId'];
    const ingredientId =
      ingredientIdRaw === null || ingredientIdRaw === undefined
        ? null
        : typeof ingredientIdRaw === "string"
          ? ingredientIdRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_ingredient_id",
                `Body.gristJson[${idx}].ingredientId must be a string or null`,
              );
            })();
    const name = typeof o['name'] === "string" ? o['name'].trim() : "";
    const producerRaw = o['producer'];
    const producer =
      producerRaw === null || producerRaw === undefined
        ? null
        : typeof producerRaw === "string"
          ? producerRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_producer",
                `Body.gristJson[${idx}].producer must be a string or null`,
              );
            })();

    const groupRaw = o['group'];
    const group =
      groupRaw === null || groupRaw === undefined
        ? null
        : typeof groupRaw === "string"
          ? groupRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_group",
                `Body.gristJson[${idx}].group must be a string or null`,
              );
            })();

    const mashDiPhRaw = o['mashDiPh'];
    const mashDiPh =
      mashDiPhRaw === null || mashDiPhRaw === undefined
        ? null
        : typeof mashDiPhRaw === "number"
          ? mashDiPhRaw
          : NaN;
    if (typeof mashDiPh === "number" && (!Number.isFinite(mashDiPh) || mashDiPh < 0 || mashDiPh > 14)) {
      throw new BadRequestError(
        "invalid_grist_row_mash_di_ph",
        `Body.gristJson[${idx}].mashDiPh must be null or a finite number between 0 and 14`,
      );
    }

    const mashTaRaw = o['mashTaToPh57_mEqPerKg'];
    const mashTaToPh57_mEqPerKg =
      mashTaRaw === null || mashTaRaw === undefined
        ? null
        : typeof mashTaRaw === "number"
          ? mashTaRaw
          : NaN;
    if (
      typeof mashTaToPh57_mEqPerKg === "number" &&
      (!Number.isFinite(mashTaToPh57_mEqPerKg) || mashTaToPh57_mEqPerKg < 0)
    ) {
      throw new BadRequestError(
        "invalid_grist_row_mash_ta",
        `Body.gristJson[${idx}].mashTaToPh57_mEqPerKg must be null or a finite number >= 0`,
      );
    }

    const mashPhModelSourceRaw = o['mashPhModelSource'];
    const mashPhModelSource: GristRow["mashPhModelSource"] =
      mashPhModelSourceRaw === "default" || mashPhModelSourceRaw === "override" || mashPhModelSourceRaw === "unknown"
        ? mashPhModelSourceRaw
        : undefined;

    const mashRoastDehuskedOverrideRaw = o['mashRoastDehuskedOverride'];
    const mashRoastDehuskedOverride =
      mashRoastDehuskedOverrideRaw === null || mashRoastDehuskedOverrideRaw === undefined
        ? null
        : typeof mashRoastDehuskedOverrideRaw === "boolean"
          ? mashRoastDehuskedOverrideRaw
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_mash_roast_dehusked_override",
                `Body.gristJson[${idx}].mashRoastDehuskedOverride must be a boolean or null`,
              );
            })();

    const mashRoastDehuskedSourceRaw = o['mashRoastDehuskedSource'];
    const mashRoastDehuskedSource: GristRow["mashRoastDehuskedSource"] =
      mashRoastDehuskedSourceRaw === null || mashRoastDehuskedSourceRaw === undefined
        ? undefined
        : mashRoastDehuskedSourceRaw === "inferred" ||
            mashRoastDehuskedSourceRaw === "override" ||
            mashRoastDehuskedSourceRaw === "unknown"
          ? mashRoastDehuskedSourceRaw
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_mash_roast_dehusked_source",
                `Body.gristJson[${idx}].mashRoastDehuskedSource must be "inferred", "override", "unknown" or null`,
              );
            })();
    const amountKg = ensureFinite(o['amountKg'], `gristJson[${idx}].amountKg`);
    const colorLovibondRaw = o['colorLovibond'];
    const colorLovibond =
      colorLovibondRaw === null
        ? null
        : colorLovibondRaw === undefined
          ? null
          : ensureFinite(colorLovibondRaw, `gristJson[${idx}].colorLovibond`);

    if (!id) {
      throw new BadRequestError("invalid_grist_row_id", `Body.gristJson[${idx}].id is required`);
    }
    if (!name) {
      throw new BadRequestError("invalid_grist_row_name", `Body.gristJson[${idx}].name is required`);
    }
    if (!(amountKg > 0)) {
      throw new BadRequestError(
        "invalid_grist_row_amount",
        `Body.gristJson[${idx}].amountKg must be > 0`,
      );
    }
    if (colorLovibond !== null && !(colorLovibond >= 0)) {
      throw new BadRequestError(
        "invalid_grist_row_color",
        `Body.gristJson[${idx}].colorLovibond must be >= 0`,
      );
    }

    const maltClassRaw = o['maltClass'];
    const maltClass: GristMaltClass =
      maltClassRaw === undefined || maltClassRaw === null
        ? "base"
        : maltClassRaw === "base" || maltClassRaw === "crystal" || maltClassRaw === "roast" || maltClassRaw === "acid"
          ? maltClassRaw
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_malt_class",
                `Body.gristJson[${idx}].maltClass must be one of: base, crystal, roast, acid`,
              );
            })();

    const potentialRaw = o['potential'];
    let potential: GristPotential | null = null;
    if (potentialRaw === null || potentialRaw === undefined) {
      potential = null;
    } else if (typeof potentialRaw === "object") {
      const p = potentialRaw as Record<string, unknown>;
      const kind = p['kind'];
      const pv = ensureFinite(p['value'], `gristJson[${idx}].potential.value`);
      if (kind !== "ppg" && kind !== "yieldPercent" && kind !== "sg") {
        throw new BadRequestError(
          "invalid_grist_row_potential_kind",
          `Body.gristJson[${idx}].potential.kind is invalid`,
        );
      }
      if (!(pv > 0)) {
        throw new BadRequestError(
          "invalid_grist_row_potential_value",
          `Body.gristJson[${idx}].potential.value must be > 0`,
        );
      }
      potential = { kind, value: pv };
    } else {
      throw new BadRequestError(
        "invalid_grist_row_potential",
        `Body.gristJson[${idx}].potential must be an object or null`,
      );
    }

    const out: Record<string, unknown> = {
      id,
      name,
      amountKg,
      colorLovibond,
      potential,
      maltClass,
    };
    if (ingredientId) out['ingredientId'] = ingredientId;
    if (producer) out['producer'] = producer;
    if (group) out['group'] = group;
    if (mashDiPh !== null) out['mashDiPh'] = mashDiPh;
    if (mashTaToPh57_mEqPerKg !== null) out['mashTaToPh57_mEqPerKg'] = mashTaToPh57_mEqPerKg;
    if (mashPhModelSource) out['mashPhModelSource'] = mashPhModelSource;
    if (mashRoastDehuskedOverride !== null) out['mashRoastDehuskedOverride'] = mashRoastDehuskedOverride;
    if (mashRoastDehuskedSource) out['mashRoastDehuskedSource'] = mashRoastDehuskedSource;
    return out as GristRow;
  });
}

type HopUse = "boil" | "whirlpool" | "dryhop";

type HopRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  country?: string | null;
  form?: "extract" | "leaf" | "leaf (wet)" | "pellet" | "powder" | "plug" | "debittered_leaf" | "hop_extract" | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: HopUse;
  timeMinutes: number | null;
};

function _validateHopsJson(value: unknown): HopRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) throw new BadRequestError("invalid_hops_json", "Body.hopsJson must be an array");

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o['id'] === "string" ? o['id'].trim() : "";
    if (!id) throw new BadRequestError("invalid_hop_row_id", `Body.hopsJson[${idx}].id is required`);

    const ingredientIdRaw = o['ingredientId'];
    const ingredientId =
      ingredientIdRaw === null || ingredientIdRaw === undefined
        ? null
        : typeof ingredientIdRaw === "string"
          ? ingredientIdRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_hop_row_ingredient_id",
                `Body.hopsJson[${idx}].ingredientId must be a string or null`,
              );
            })();

    const name = typeof o['name'] === "string" ? o['name'].trim() : "";
    if (!name) throw new BadRequestError("invalid_hop_row_name", `Body.hopsJson[${idx}].name is required`);

    const countryRaw = o['country'];
    const country =
      countryRaw === null || countryRaw === undefined
        ? null
        : typeof countryRaw === "string"
          ? countryRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_hop_row_country",
                `Body.hopsJson[${idx}].country must be a string or null`,
              );
            })();

    const formRaw = o['form'];
    const form =
      formRaw === null || formRaw === undefined
        ? null
        : typeof formRaw === "string"
          ? (formRaw === "extract" ||
              formRaw === "leaf" ||
              formRaw === "leaf (wet)" ||
              formRaw === "pellet" ||
              formRaw === "powder" ||
              formRaw === "plug" ||
              formRaw === "debittered_leaf" ||
              formRaw === "hop_extract"
              ? (formRaw as HopRow["form"])
              : (() => {
                  throw new BadRequestError(
                    "invalid_hop_row_form",
                    `Body.hopsJson[${idx}].form must be one of: extract, leaf, leaf (wet), pellet, powder, plug, debittered_leaf, hop_extract`,
                  );
                })())
          : (() => {
              throw new BadRequestError(
                "invalid_hop_row_form",
                `Body.hopsJson[${idx}].form must be a string or null`,
              );
            })();

    const amountGrams = ensureFinite(o['amountGrams'], `hopsJson[${idx}].amountGrams`);
    if (!(amountGrams >= 0)) {
      throw new BadRequestError("invalid_hop_row_amount", `Body.hopsJson[${idx}].amountGrams must be >= 0`);
    }

    const alphaRaw = o['alphaAcidPercent'];
    const alphaAcidPercent =
      alphaRaw === null || alphaRaw === undefined
        ? null
        : typeof alphaRaw === "number"
          ? alphaRaw
          : NaN;
    if (typeof alphaAcidPercent === "number" && (!Number.isFinite(alphaAcidPercent) || alphaAcidPercent < 0)) {
      throw new BadRequestError(
        "invalid_hop_row_alpha",
        `Body.hopsJson[${idx}].alphaAcidPercent must be null or a number >= 0`,
      );
    }

    const useRaw = o['use'];
    const use: HopUse =
      useRaw === "boil" || useRaw === "whirlpool" || useRaw === "dryhop"
        ? useRaw
        : (() => {
            throw new BadRequestError(
              "invalid_hop_row_use",
              `Body.hopsJson[${idx}].use must be one of: boil, whirlpool, dryhop`,
            );
          })();

    const timeRaw = o['timeMinutes'];
    const timeMinutes =
      timeRaw === null || timeRaw === undefined ? null : typeof timeRaw === "number" ? timeRaw : NaN;
    if (typeof timeMinutes === "number" && (!Number.isFinite(timeMinutes) || timeMinutes < 0)) {
      throw new BadRequestError(
        "invalid_hop_row_time",
        `Body.hopsJson[${idx}].timeMinutes must be null or a number >= 0`,
      );
    }

    const out: Record<string, unknown> = {
      id,
      ingredientId,
      name,
      amountGrams,
      alphaAcidPercent,
      use,
      timeMinutes,
    };
    if (country) out['country'] = country;
    if (form) out['form'] = form;
    return out as HopRow;
  });
}

type YeastRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

function _validateYeastJson(value: unknown): YeastRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) throw new BadRequestError("invalid_yeast_json", "Body.yeastJson must be an array");

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o['id'] === "string" ? o['id'].trim() : "";
    if (!id) throw new BadRequestError("invalid_yeast_row_id", `Body.yeastJson[${idx}].id is required`);

    const ingredientIdRaw = o['ingredientId'];
    const ingredientId =
      ingredientIdRaw === undefined
        ? undefined
        : ingredientIdRaw === null
          ? null
          : typeof ingredientIdRaw === "string"
            ? ingredientIdRaw.trim() || null
            : (() => {
                throw new BadRequestError(
                  "invalid_yeast_row_ingredient_id",
                  `Body.yeastJson[${idx}].ingredientId must be a string or null`,
                );
              })();

    const name = typeof o['name'] === "string" ? o['name'].trim() : "";
    if (!name) throw new BadRequestError("invalid_yeast_row_name", `Body.yeastJson[${idx}].name is required`);

    const labRaw = o['lab'];
    const lab =
      labRaw === null || labRaw === undefined
        ? null
        : typeof labRaw === "string"
          ? labRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_yeast_row_lab",
                `Body.yeastJson[${idx}].lab must be a string or null`,
              );
            })();

    const productIdRaw = o['productId'];
    const productId =
      productIdRaw === undefined
        ? undefined
        : productIdRaw === null
          ? null
          : typeof productIdRaw === "string"
            ? productIdRaw.trim() || null
            : (() => {
                throw new BadRequestError(
                  "invalid_yeast_row_product_id",
                  `Body.yeastJson[${idx}].productId must be a string or null`,
                );
              })();

    const attenuationMinRaw = o['attenuationMin'];
    const attenuationMin =
      attenuationMinRaw === undefined
        ? undefined
        : attenuationMinRaw === null
          ? null
          : typeof attenuationMinRaw === "number"
            ? attenuationMinRaw
            : NaN;
    if (
      typeof attenuationMin === "number" &&
      (!Number.isFinite(attenuationMin) || attenuationMin < 0 || attenuationMin > 100)
    ) {
      throw new BadRequestError(
        "invalid_yeast_row_attenuation_min",
        `Body.yeastJson[${idx}].attenuationMin must be null or a finite number between 0 and 100`,
      );
    }

    const attenuationMaxRaw = o['attenuationMax'];
    const attenuationMax =
      attenuationMaxRaw === undefined
        ? undefined
        : attenuationMaxRaw === null
          ? null
          : typeof attenuationMaxRaw === "number"
            ? attenuationMaxRaw
            : NaN;
    if (
      typeof attenuationMax === "number" &&
      (!Number.isFinite(attenuationMax) || attenuationMax < 0 || attenuationMax > 100)
    ) {
      throw new BadRequestError(
        "invalid_yeast_row_attenuation_max",
        `Body.yeastJson[${idx}].attenuationMax must be null or a finite number between 0 and 100`,
      );
    }

    const out: Record<string, unknown> = { id, name };
    if (ingredientIdRaw !== undefined) out['ingredientId'] = ingredientId;
    if (lab) out['lab'] = lab;
    if (productIdRaw !== undefined) out['productId'] = productId;
    if (attenuationMinRaw !== undefined) out['attenuationMin'] = attenuationMin;
    if (attenuationMaxRaw !== undefined) out['attenuationMax'] = attenuationMax;
    return out as YeastRow;
  });
}

async function _snapshotYeastRows(prisma: PrismaClient, rows: YeastRow[]): Promise<YeastRow[]> {
  const ids = Array.from(
    new Set(
      rows
        .map((r) => (typeof r.ingredientId === "string" ? r.ingredientId : null))
        .filter((v): v is string => Boolean(v)),
    ),
  );
  if (ids.length === 0) return rows;

  const yeasts = await prisma.yeast.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      lab: true,
      productId: true,
      attenuationMin: true,
      attenuationMax: true,
    },
  });
  const byId = new Map(yeasts.map((y) => [y.id, y]));

  return rows.map((r) => {
    const ingredientId = typeof r.ingredientId === "string" ? r.ingredientId : null;
    if (!ingredientId) return r;
    const y = byId.get(ingredientId);
    if (!y) return r;

    const wantsOverride =
      (typeof r.productId === "string" && r.productId.trim() !== "") ||
      (typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin)) ||
      (typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax));

    const productId =
      wantsOverride && r.productId !== null && r.productId !== undefined
        ? r.productId
        : typeof y.productId === "string" && y.productId.trim()
          ? y.productId
          : null;

    const attenuationMin =
      wantsOverride && r.attenuationMin !== null && r.attenuationMin !== undefined
        ? r.attenuationMin
        : typeof y.attenuationMin === "number" && Number.isFinite(y.attenuationMin)
          ? y.attenuationMin
          : null;

    const attenuationMax =
      wantsOverride && r.attenuationMax !== null && r.attenuationMax !== undefined
        ? r.attenuationMax
        : typeof y.attenuationMax === "number" && Number.isFinite(y.attenuationMax)
          ? y.attenuationMax
          : null;

    return {
      ...r,
      lab: r.lab ?? y.lab ?? null,
      productId: productId ?? null,
      attenuationMin: attenuationMin ?? null,
      attenuationMax: attenuationMax ?? null,
    };
  });
}

type MiscType = "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
type MiscUse = "boil" | "mash" | "primary" | "secondary" | "bottling";

type MiscRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  type: MiscType;
  use: MiscUse;
  timeMinutes: number | null;
  /** If amountIsWeight=true: kilograms. If false: liters. */
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null;
  notes?: string | null;
};

function _validateMiscJson(value: unknown): MiscRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) throw new BadRequestError("invalid_misc_json", "Body.miscJson must be an array");

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o['id'] === "string" ? o['id'].trim() : "";
    if (!id) throw new BadRequestError("invalid_misc_row_id", `Body.miscJson[${idx}].id is required`);

    const ingredientIdRaw = o['ingredientId'];
    const ingredientId =
      ingredientIdRaw === undefined
        ? undefined
        : ingredientIdRaw === null
          ? null
          : typeof ingredientIdRaw === "string"
            ? ingredientIdRaw.trim() || null
            : (() => {
                throw new BadRequestError(
                  "invalid_misc_row_ingredient_id",
                  `Body.miscJson[${idx}].ingredientId must be a string or null`,
                );
              })();

    const name = typeof o['name'] === "string" ? o['name'].trim() : "";
    if (!name) throw new BadRequestError("invalid_misc_row_name", `Body.miscJson[${idx}].name is required`);

    const typeRaw = o['type'];
    const type: MiscType =
      typeRaw === "spice" ||
      typeRaw === "fining" ||
      typeRaw === "water_agent" ||
      typeRaw === "herb" ||
      typeRaw === "flavor" ||
      typeRaw === "other"
        ? typeRaw
        : (() => {
            throw new BadRequestError(
              "invalid_misc_row_type",
              `Body.miscJson[${idx}].type must be one of: spice, fining, water_agent, herb, flavor, other`,
            );
          })();

    const useRaw = o['use'];
    const use: MiscUse =
      useRaw === "boil" || useRaw === "mash" || useRaw === "primary" || useRaw === "secondary" || useRaw === "bottling"
        ? useRaw
        : (() => {
            throw new BadRequestError(
              "invalid_misc_row_use",
              `Body.miscJson[${idx}].use must be one of: boil, mash, primary, secondary, bottling`,
            );
          })();

    const timeRaw = o['timeMinutes'];
    const timeMinutes = timeRaw === null || timeRaw === undefined ? null : typeof timeRaw === "number" ? timeRaw : NaN;
    if (typeof timeMinutes === "number" && (!Number.isFinite(timeMinutes) || timeMinutes < 0)) {
      throw new BadRequestError(
        "invalid_misc_row_time",
        `Body.miscJson[${idx}].timeMinutes must be null or a number >= 0`,
      );
    }

    const amount = ensureFinite(o['amount'], `miscJson[${idx}].amount`);
    if (!(amount > 0)) {
      throw new BadRequestError("invalid_misc_row_amount", `Body.miscJson[${idx}].amount must be > 0`);
    }

    const amountIsWeightRaw = o['amountIsWeight'];
    if (typeof amountIsWeightRaw !== "boolean") {
      throw new BadRequestError(
        "invalid_misc_row_amount_is_weight",
        `Body.miscJson[${idx}].amountIsWeight must be a boolean`,
      );
    }
    const amountIsWeight = amountIsWeightRaw;

    const useForRaw = o['useFor'];
    const useFor =
      useForRaw === null || useForRaw === undefined
        ? null
        : typeof useForRaw === "string"
          ? useForRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_misc_row_use_for",
                `Body.miscJson[${idx}].useFor must be a string or null`,
              );
            })();

    const notesRaw = o['notes'];
    const notes =
      notesRaw === null || notesRaw === undefined
        ? null
        : typeof notesRaw === "string"
          ? notesRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_misc_row_notes",
                `Body.miscJson[${idx}].notes must be a string or null`,
              );
            })();

    const out: Record<string, unknown> = {
      id,
      name,
      type,
      use,
      timeMinutes,
      amount,
      amountIsWeight,
    };
    if (ingredientIdRaw !== undefined) out['ingredientId'] = ingredientId;
    if (useFor) out['useFor'] = useFor;
    if (notes) out['notes'] = notes;
    return out as MiscRow;
  });
}
