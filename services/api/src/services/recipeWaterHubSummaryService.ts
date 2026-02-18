import type { PrismaClient } from "@prisma/client";
import type { ExpectedRaRange, RecipeWaterHubStreamSummary, RecipeWaterHubSummary } from "@brewery/contracts";
import { AccountsService } from "./accountsService.js";
import { RecipesService } from "./recipesService.js";
import type { IonProfilePpm } from "../domain/waterCalc/saltAdditions.js";
import { combineAfterSaltsAndAcid } from "../domain/waterCalc/overall.js";

type MashOverallLastResultJson = {
  ionsPpm: IonProfilePpm;
  finalAlkalinityPpmCaCO3: number;
  ph: { kind: "target" | "estimated"; value: number };
};

function displayAlkalinityPpmCaCO3(v: number): number {
  if (v < 0 && v > -1) return 0;
  return v;
}

function calcResidualAlkalinityPpmCaCO3(args: {
  alkalinityPpmCaCO3: number;
  calciumPpm: number;
  magnesiumPpm: number;
}): number {
  return args.alkalinityPpmCaCO3 - 0.713 * args.calciumPpm - 0.588 * args.magnesiumPpm;
}

function parseMashOverallLastResultJson(v: unknown): MashOverallLastResultJson | null {
  if (!v || typeof v !== "object") return null;
  const o = v as any;
  const ph = o?.ph;
  const ionsPpm = o?.ionsPpm;
  if (!ph || typeof ph !== "object") return null;
  if (!ionsPpm || typeof ionsPpm !== "object") return null;
  if (typeof o?.finalAlkalinityPpmCaCO3 !== "number") return null;
  if (typeof (ph as any).kind !== "string" || typeof (ph as any).value !== "number") return null;

  const p = ionsPpm as any;
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) if (typeof p[k] !== "number") return null;

  const kind = (ph as any).kind === "target" ? "target" : "estimated";
  return {
    ionsPpm: {
      calcium: p.calcium,
      magnesium: p.magnesium,
      sodium: p.sodium,
      sulfate: p.sulfate,
      chloride: p.chloride,
      bicarbonate: p.bicarbonate,
    },
    finalAlkalinityPpmCaCO3: o.finalAlkalinityPpmCaCO3,
    ph: { kind, value: (ph as any).value },
  };
}

function parseSaltsBreakdown(v: unknown): Array<{ saltKey: string; grams: number }> | null {
  if (!v || typeof v !== "object") return null;
  const o = v as any;
  const b = o?.result?.breakdown;
  if (!Array.isArray(b)) return null;

  const out: Array<{ saltKey: string; grams: number }> = [];
  for (const row of b) {
    if (!row || typeof row !== "object") continue;
    const r = row as any;
    const saltKey = typeof r.saltKey === "string" ? r.saltKey : null;
    const grams = typeof r.grams === "number" && Number.isFinite(r.grams) ? r.grams : null;
    if (!saltKey || grams == null || !(grams > 0)) continue;
    out.push({ saltKey, grams });
  }
  return out.length ? out : null;
}

function parseSaltsResultingProfile(v: unknown): IonProfilePpm | null {
  if (!v || typeof v !== "object") return null;
  const o = v as any;
  const r = o?.result?.resultingProfile;
  if (!r || typeof r !== "object") return null;
  const p = r as any;
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) if (typeof p[k] !== "number") return null;
  return {
    calcium: p.calcium,
    magnesium: p.magnesium,
    sodium: p.sodium,
    sulfate: p.sulfate,
    chloride: p.chloride,
    bicarbonate: p.bicarbonate,
  };
}

function inferExpectedRa(style: { name: string; category: string | null }): ExpectedRaRange | null {
  const text = `${style.category ?? ""} ${style.name}`.trim().toLowerCase();
  const includes = (needle: string) => text.includes(needle);

  if (
    includes("stout") ||
    includes("porter") ||
    includes("schwarz") ||
    includes("dunkel") ||
    includes("dark") ||
    includes("black")
  ) {
    return { min: 50, max: 200, rationaleKey: "styleExpectedRaDark" };
  }
  if (
    includes("ipa") ||
    includes("pale") ||
    includes("pils") ||
    includes("lager") ||
    includes("blonde") ||
    includes("kölsch") ||
    includes("kolsch") ||
    includes("saison")
  ) {
    return { min: -50, max: 50, rationaleKey: "styleExpectedRaPale" };
  }
  if (
    includes("amber") ||
    includes("red") ||
    includes("brown") ||
    includes("bock") ||
    includes("vienna") ||
    includes("märzen") ||
    includes("marzen")
  ) {
    return { min: 0, max: 100, rationaleKey: "styleExpectedRaAmber" };
  }

  return null;
}

export class RecipeWaterHubSummaryService {
  private readonly accounts: AccountsService;
  private readonly recipes: RecipesService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
    this.recipes = new RecipesService(prisma);
  }

  async get(userId: string, accountId: string, recipeId: string): Promise<RecipeWaterHubSummary> {
    await this.accounts.assertMembership(userId, accountId);
    const recipe = await this.recipes.getRecipe(userId, accountId, recipeId);

    const settings = await this.prisma.recipeWaterSettings.findUnique({ where: { recipeId } });

    const styleKey = (recipe as any)?.styleKey;
    const style =
      typeof styleKey === "string" && styleKey && styleKey !== "custom"
        ? await this.prisma.beerStyle.findUnique({ where: { key: styleKey } })
        : null;
    const expectedRa = style ? inferExpectedRa({ name: style.name, category: style.category }) : null;

    const mashOverall = parseMashOverallLastResultJson(settings?.mashOverallLastResultJson ?? null);

    const mashTap = typeof settings?.tapWaterVolumeLiters === "number" ? settings.tapWaterVolumeLiters : 0;
    const mashDil = typeof settings?.dilutionWaterVolumeLiters === "number" ? settings.dilutionWaterVolumeLiters : 0;
    const mashMixTotal = Math.max(0, mashTap) + Math.max(0, mashDil);
    const mashLegacy = typeof settings?.mashWaterVolumeLiters === "number" ? settings.mashWaterVolumeLiters : null;
    const mashVolumeLiters = mashMixTotal > 0 ? mashMixTotal : mashLegacy;

    const mashPh = mashOverall?.ph?.value ?? null;
    const mashFinalAlk = mashOverall?.finalAlkalinityPpmCaCO3 ?? null;
    const mashIonsAfterAcid = mashOverall?.ionsPpm ?? null;

    const spargeVolumeLiters = typeof settings?.spargeVolumeLiters === "number" ? settings.spargeVolumeLiters : null;
    const spargePh =
      settings?.spargeAcidificationMode === "manual"
        ? settings?.spargeManualLastAchievedPh ?? null
        : typeof settings?.spargeTargetPh === "number"
          ? settings.spargeTargetPh
          : null;
    const spargeFinalAlk = settings?.spargeLastFinalAlkalinityPpmCaCO3 ?? null;
    const spargeAfterSalts = parseSaltsResultingProfile(settings?.spargeSaltsLastResultJson ?? null);
    const spargeIonsAfterAcid =
      spargeAfterSalts && spargeFinalAlk != null
        ? combineAfterSaltsAndAcid({
            afterSalts: spargeAfterSalts,
            acidResult: {
              finalAlkalinityPpmCaCO3: spargeFinalAlk,
              sulfateAddedPpm: settings?.spargeLastSulfateAddedPpm ?? 0,
              chlorideAddedPpm: settings?.spargeLastChlorideAddedPpm ?? 0,
            },
          })
        : null;

    const boilVolumeLiters = typeof settings?.boilWaterVolumeLiters === "number" ? settings.boilWaterVolumeLiters : null;
    const boilPh =
      settings?.boilAcidificationMode === "manual"
        ? settings?.boilManualLastAchievedPh ?? null
        : typeof settings?.boilTargetPh === "number"
          ? settings.boilTargetPh
          : null;
    const boilFinalAlk = settings?.boilLastFinalAlkalinityPpmCaCO3 ?? null;
    const boilAfterSalts = parseSaltsResultingProfile(settings?.boilSaltsLastResultJson ?? null);
    const boilIonsAfterAcid =
      boilAfterSalts && boilFinalAlk != null
        ? combineAfterSaltsAndAcid({
            afterSalts: boilAfterSalts,
            acidResult: {
              finalAlkalinityPpmCaCO3: boilFinalAlk,
              sulfateAddedPpm: settings?.boilLastSulfateAddedPpm ?? 0,
              chlorideAddedPpm: settings?.boilLastChlorideAddedPpm ?? 0,
            },
          })
        : null;

    const streams: RecipeWaterHubStreamSummary[] = [
      {
        key: "mash",
        volumeLiters: mashVolumeLiters,
        ph: mashPh,
        finalAlkalinityPpmCaCO3: mashFinalAlk,
        ionsPpm: mashIonsAfterAcid,
        saltsBreakdown: parseSaltsBreakdown(settings?.mashSaltsLastResultJson ?? null),
        acidType: settings?.mashAcidType ?? null,
        acidMode:
          settings?.mashAcidificationMode === "manual" ? "manual" : settings?.mashAcidificationMode ? "required" : null,
        acidStrengthKind: settings?.mashStrengthKind ?? null,
        acidStrengthValue: settings?.mashStrengthValue ?? null,
        acidAmountMl:
          settings?.mashAcidificationMode === "manual"
            ? (settings?.mashManualAcidAddedMl ?? null)
            : (settings?.mashLastAcidRequiredMl ?? null),
        acidAmountGrams:
          settings?.mashAcidificationMode === "manual"
            ? (settings?.mashManualAcidAddedGrams ?? null)
            : (settings?.mashLastAcidRequiredGrams ?? null),
      },
      {
        key: "sparge",
        volumeLiters: spargeVolumeLiters,
        ph: spargePh,
        finalAlkalinityPpmCaCO3: spargeFinalAlk,
        ionsPpm: spargeIonsAfterAcid,
        saltsBreakdown: parseSaltsBreakdown(settings?.spargeSaltsLastResultJson ?? null),
        acidType: settings?.spargeAcidType ?? null,
        acidMode:
          settings?.spargeAcidificationMode === "manual"
            ? "manual"
            : settings?.spargeAcidificationMode
              ? "required"
              : null,
        acidStrengthKind: settings?.spargeStrengthKind ?? null,
        acidStrengthValue: settings?.spargeStrengthValue ?? null,
        acidAmountMl:
          settings?.spargeAcidificationMode === "manual"
            ? (settings?.spargeManualAcidAddedMl ?? null)
            : (settings?.spargeLastAcidRequiredMl ?? null),
        acidAmountGrams:
          settings?.spargeAcidificationMode === "manual"
            ? (settings?.spargeManualAcidAddedGrams ?? null)
            : (settings?.spargeLastAcidRequiredGrams ?? null),
      },
      {
        key: "boil",
        volumeLiters: boilVolumeLiters,
        ph: boilPh,
        finalAlkalinityPpmCaCO3: boilFinalAlk,
        ionsPpm: boilIonsAfterAcid,
        saltsBreakdown: parseSaltsBreakdown(settings?.boilSaltsLastResultJson ?? null),
        acidType: settings?.boilAcidType ?? null,
        acidMode:
          settings?.boilAcidificationMode === "manual" ? "manual" : settings?.boilAcidificationMode ? "required" : null,
        acidStrengthKind: settings?.boilStrengthKind ?? null,
        acidStrengthValue: settings?.boilStrengthValue ?? null,
        acidAmountMl:
          settings?.boilAcidificationMode === "manual"
            ? (settings?.boilManualAcidAddedMl ?? null)
            : (settings?.boilLastAcidRequiredMl ?? null),
        acidAmountGrams:
          settings?.boilAcidificationMode === "manual"
            ? (settings?.boilManualAcidAddedGrams ?? null)
            : (settings?.boilLastAcidRequiredGrams ?? null),
      },
    ];

    const validForMerge = streams.filter((s) => s.volumeLiters && s.volumeLiters > 0 && s.ionsPpm);
    const totalV = validForMerge.reduce((acc, s) => acc + (s.volumeLiters as number), 0);
    const mergedIons: IonProfilePpm | null =
      totalV > 0
        ? (["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"] as const).reduce((acc, k) => {
            const sum = validForMerge.reduce(
              (a, s) => a + ((s.ionsPpm as IonProfilePpm)[k] * (s.volumeLiters as number)),
              0,
            );
            (acc as any)[k] = sum / totalV;
            return acc;
          }, {} as any as IonProfilePpm)
        : null;

    const mergedFinalAlk =
      totalV > 0
        ? validForMerge.reduce((a, s) => a + ((s.finalAlkalinityPpmCaCO3 ?? 0) * (s.volumeLiters as number)), 0) / totalV
        : null;

    const validPh = streams.filter((s) => s.volumeLiters && s.volumeLiters > 0 && typeof s.ph === "number");
    const totalPhV = validPh.reduce((a, s) => a + (s.volumeLiters as number), 0);
    const mergedPh =
      totalPhV > 0
        ? (() => {
            const h =
              validPh.reduce((a, s) => a + (10 ** (-(s.ph as number)) * (s.volumeLiters as number)), 0) / totalPhV;
            return -Math.log10(h);
          })()
        : null;

    const raMashOverall =
      mashOverall && mashOverall.ionsPpm
        ? calcResidualAlkalinityPpmCaCO3({
            alkalinityPpmCaCO3: displayAlkalinityPpmCaCO3(mashOverall.finalAlkalinityPpmCaCO3),
            calciumPpm: mashOverall.ionsPpm.calcium,
            magnesiumPpm: mashOverall.ionsPpm.magnesium,
          })
        : null;

    const raMerged =
      mergedIons && typeof mergedFinalAlk === "number"
        ? calcResidualAlkalinityPpmCaCO3({
            alkalinityPpmCaCO3: displayAlkalinityPpmCaCO3(mergedFinalAlk),
            calciumPpm: mergedIons.calcium,
            magnesiumPpm: mergedIons.magnesium,
          })
        : null;

    return {
      version: 1,
      status: {
        mashAcidificationMode: settings?.mashAcidificationMode ?? null,
        spargeAcidificationMode: settings?.spargeAcidificationMode ?? null,
        boilAcidificationMode: settings?.boilAcidificationMode ?? null,
        mashLastCalculatedAt: settings?.mashLastCalculatedAt ? settings.mashLastCalculatedAt.toISOString() : null,
        spargeLastCalculatedAt: settings?.spargeLastCalculatedAt ? settings.spargeLastCalculatedAt.toISOString() : null,
        boilLastCalculatedAt: settings?.boilLastCalculatedAt ? settings.boilLastCalculatedAt.toISOString() : null,
        mashOverallSnapshot: mashOverall
          ? {
              ph: mashOverall.ph,
              finalAlkalinityPpmCaCO3: mashOverall.finalAlkalinityPpmCaCO3,
            }
          : null,
      },
      streams,
      merged: {
        totalVolumeLiters: totalV,
        ph: mergedPh,
        finalAlkalinityPpmCaCO3: mergedFinalAlk,
        ionsPpm: mergedIons,
      },
      finalRecap: {
        predictedMashPh: mashOverall?.ph ?? null,
        residualAlkalinityMashOverallPpmCaCO3: raMashOverall,
        residualAlkalinityMergedPpmCaCO3: raMerged,
        styleExpectedRa: expectedRa,
      },
    };
  }
}

