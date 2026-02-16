import { Prisma, type PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { getMashPhModelDefaultsV1 } from "../domain/waterCalc/mashPhDefaultsV1.js";
import { AccountsService } from "./accountsService.js";

export type CreateRecipeInput = {
  name: string;
  style?: string | null;
  notes?: string | null;
  gristJson?: unknown;
  hopsJson?: unknown;
  yeastJson?: unknown;
};

export type UpdateRecipeInput = {
  name?: string | null;
  style?: string | null;
  notes?: string | null;
  gristJson?: unknown;
  hopsJson?: unknown;
  yeastJson?: unknown;
};

export class RecipesService {
  private readonly accounts: AccountsService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
  }

  async listRecipes(userId: string, accountId: string) {
    await this.accounts.assertMembership(userId, accountId);

    return this.prisma.recipe.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getRecipe(userId: string, accountId: string, recipeId: string) {
    await this.accounts.assertMembership(userId, accountId);

    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, accountId },
    });
    if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
    return recipe;
  }

  async createRecipe(userId: string, accountId: string, input: CreateRecipeInput) {
    await this.accounts.assertMembership(userId, accountId);

    const name = input.name.trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    const style = input.style?.trim() || null;
    const notes = input.notes?.trim() || null;
    const gristJsonRaw = validateGristJson(input.gristJson);
    const gristJson =
      Array.isArray(gristJsonRaw) ? await snapshotGristRows(this.prisma, gristJsonRaw) : gristJsonRaw;
    const hopsJson = validateHopsJson(input.hopsJson);
    const yeastJsonRaw = validateYeastJson(input.yeastJson);
    const yeastJson =
      Array.isArray(yeastJsonRaw) ? await snapshotYeastRows(this.prisma, yeastJsonRaw) : yeastJsonRaw;

    return this.prisma.recipe.create({
      data: {
        accountId,
        name,
        style,
        notes,
        gristJson: gristJson === undefined ? undefined : (gristJson as any),
        hopsJson: hopsJson === undefined ? undefined : (hopsJson as any),
        yeastJson: yeastJson === undefined ? undefined : (yeastJson as any),
      },
    });
  }

  async updateRecipe(userId: string, accountId: string, recipeId: string, input: UpdateRecipeInput) {
    await this.accounts.assertMembership(userId, accountId);

    // Ensure account scoping is enforced even if IDs collide across accounts.
    await this.getRecipe(userId, accountId, recipeId);

    const data: Prisma.RecipeUpdateInput = {};

    if (input.name !== undefined) {
      const name = (input.name ?? "").trim();
      if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
      data.name = name;
    }

    if (input.style !== undefined) data.style = input.style?.trim() || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.gristJson !== undefined) {
      const gristJson = validateGristJson(input.gristJson);
      if (gristJson === undefined) {
        // no-op
      } else if (gristJson === null) {
        data.gristJson = Prisma.JsonNull;
      } else {
        data.gristJson = (await snapshotGristRows(this.prisma, gristJson)) as unknown as Prisma.InputJsonValue;
      }
    }

    if (input.hopsJson !== undefined) {
      const hopsJson = validateHopsJson(input.hopsJson);
      if (hopsJson === undefined) {
        // no-op
      } else if (hopsJson === null) {
        data.hopsJson = Prisma.JsonNull;
      } else {
        data.hopsJson = hopsJson as unknown as Prisma.InputJsonValue;
      }
    }

    if (input.yeastJson !== undefined) {
      const yeastJson = validateYeastJson(input.yeastJson);
      if (yeastJson === undefined) {
        // no-op
      } else if (yeastJson === null) {
        data.yeastJson = Prisma.JsonNull;
      } else {
        data.yeastJson =
          (await snapshotYeastRows(this.prisma, yeastJson)) as unknown as Prisma.InputJsonValue;
      }
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestError("no_updates", "No updatable fields provided");
    }

    return this.prisma.recipe.update({
      where: { id: recipeId },
      data,
    });
  }

  async deleteRecipe(userId: string, accountId: string, recipeId: string) {
    await this.accounts.assertMembership(userId, accountId);

    // Enforce account scoping.
    await this.getRecipe(userId, accountId, recipeId);

    await this.prisma.recipe.delete({ where: { id: recipeId } });
    return { ok: true as const };
  }
}

async function snapshotGristRows(prisma: PrismaClient, rows: GristRow[]): Promise<GristRow[]> {
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

    const defaults = getMashPhModelDefaultsV1({
      name: r.name,
      group: f.group ?? null,
      type: f.type ?? null,
      notes: f.notes ?? null,
      colorEbc: typeof f.colorEbc === "number" && Number.isFinite(f.colorEbc) ? f.colorEbc : null,
    });

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
    } as GristRow;
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

function validateGristJson(value: unknown): GristRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_grist_json", "Body.gristJson must be an array");
  }

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const ingredientIdRaw = o.ingredientId;
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
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const producerRaw = o.producer;
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

    const groupRaw = o.group;
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

    const mashDiPhRaw = o.mashDiPh;
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

    const mashTaRaw = o.mashTaToPh57_mEqPerKg;
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

    const mashPhModelSourceRaw = o.mashPhModelSource;
    const mashPhModelSource: GristRow["mashPhModelSource"] =
      mashPhModelSourceRaw === "default" || mashPhModelSourceRaw === "override" || mashPhModelSourceRaw === "unknown"
        ? mashPhModelSourceRaw
        : undefined;
    const amountKg = ensureFinite(o.amountKg, `gristJson[${idx}].amountKg`);
    const colorLovibondRaw = o.colorLovibond;
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

    const maltClassRaw = o.maltClass;
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

    const potentialRaw = o.potential;
    let potential: GristPotential | null = null;
    if (potentialRaw === null || potentialRaw === undefined) {
      potential = null;
    } else if (typeof potentialRaw === "object") {
      const p = potentialRaw as Record<string, unknown>;
      const kind = p.kind;
      const pv = ensureFinite(p.value, `gristJson[${idx}].potential.value`);
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
      potential = { kind, value: pv } as GristPotential;
    } else {
      throw new BadRequestError(
        "invalid_grist_row_potential",
        `Body.gristJson[${idx}].potential must be an object or null`,
      );
    }

    const out: any = {
      id,
      name,
      amountKg,
      colorLovibond,
      potential,
      maltClass,
    };
    if (ingredientId) out.ingredientId = ingredientId;
    if (producer) out.producer = producer;
    if (group) out.group = group;
    if (mashDiPh !== null) out.mashDiPh = mashDiPh;
    if (mashTaToPh57_mEqPerKg !== null) out.mashTaToPh57_mEqPerKg = mashTaToPh57_mEqPerKg;
    if (mashPhModelSource) out.mashPhModelSource = mashPhModelSource;
    return out as GristRow;
  });
}

type HopUse = "boil" | "whirlpool" | "dryhop";

type HopRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: HopUse;
  timeMinutes: number | null;
};

function validateHopsJson(value: unknown): HopRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) throw new BadRequestError("invalid_hops_json", "Body.hopsJson must be an array");

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!id) throw new BadRequestError("invalid_hop_row_id", `Body.hopsJson[${idx}].id is required`);

    const ingredientIdRaw = o.ingredientId;
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

    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) throw new BadRequestError("invalid_hop_row_name", `Body.hopsJson[${idx}].name is required`);

    const countryRaw = o.country;
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

    const amountGrams = ensureFinite(o.amountGrams, `hopsJson[${idx}].amountGrams`);
    if (!(amountGrams >= 0)) {
      throw new BadRequestError("invalid_hop_row_amount", `Body.hopsJson[${idx}].amountGrams must be >= 0`);
    }

    const alphaRaw = o.alphaAcidPercent;
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

    const useRaw = o.use;
    const use: HopUse =
      useRaw === "boil" || useRaw === "whirlpool" || useRaw === "dryhop"
        ? useRaw
        : (() => {
            throw new BadRequestError(
              "invalid_hop_row_use",
              `Body.hopsJson[${idx}].use must be one of: boil, whirlpool, dryhop`,
            );
          })();

    const timeRaw = o.timeMinutes;
    const timeMinutes =
      timeRaw === null || timeRaw === undefined ? null : typeof timeRaw === "number" ? timeRaw : NaN;
    if (typeof timeMinutes === "number" && (!Number.isFinite(timeMinutes) || timeMinutes < 0)) {
      throw new BadRequestError(
        "invalid_hop_row_time",
        `Body.hopsJson[${idx}].timeMinutes must be null or a number >= 0`,
      );
    }

    const out: any = {
      id,
      ingredientId,
      name,
      amountGrams,
      alphaAcidPercent,
      use,
      timeMinutes,
    };
    if (country) out.country = country;
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

function validateYeastJson(value: unknown): YeastRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) throw new BadRequestError("invalid_yeast_json", "Body.yeastJson must be an array");

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!id) throw new BadRequestError("invalid_yeast_row_id", `Body.yeastJson[${idx}].id is required`);

    const ingredientIdRaw = o.ingredientId;
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

    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) throw new BadRequestError("invalid_yeast_row_name", `Body.yeastJson[${idx}].name is required`);

    const labRaw = o.lab;
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

    const productIdRaw = o.productId;
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

    const attenuationMinRaw = o.attenuationMin;
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

    const attenuationMaxRaw = o.attenuationMax;
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

    const out: any = { id, name };
    if (ingredientIdRaw !== undefined) out.ingredientId = ingredientId;
    if (lab) out.lab = lab;
    if (productIdRaw !== undefined) out.productId = productId;
    if (attenuationMinRaw !== undefined) out.attenuationMin = attenuationMin;
    if (attenuationMaxRaw !== undefined) out.attenuationMax = attenuationMax;
    return out as YeastRow;
  });
}

async function snapshotYeastRows(prisma: PrismaClient, rows: YeastRow[]): Promise<YeastRow[]> {
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
    } as YeastRow;
  });
}

