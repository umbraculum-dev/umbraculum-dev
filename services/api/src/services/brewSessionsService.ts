import type { BrewSessionLogKind, BrewSessionStatus, BrewSessionStepStatus, BrewSessionStepTimerState, PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";
import { BrewdaySettingsService, DEFAULT_STEPS_SEED } from "./brewdaySettingsService.js";
import { RecipeWaterSettingsService } from "./recipeWaterSettingsService.js";
import { RecipesService } from "./recipesService.js";

export type BrewSessionStepInput = {
  id?: string | null;
  sectionId: string;
  sectionName?: string | null;
  name: string;
  isDisabled: boolean;
  minutesPlanned?: number | null;
  relativeToStepId?: string | null;
  offsetMinutesFromEnd?: number | null;
  status?: BrewSessionStepStatus;
  note?: string | null;
  customTimerEnabled?: boolean;
};

type RecipeDrivenStepSeed = {
  id?: string;
  sectionId: string;
  sectionName?: string | null;
  name: string;
  minutesPlanned?: number | null;
  relativeToStepId?: string | null;
  offsetMinutesFromEnd?: number | null;
};

export class BrewSessionsService {
  private readonly workspaces: WorkspacesService;
  private readonly brewdaySettings: BrewdaySettingsService;
  private readonly recipeWaterSettings: RecipeWaterSettingsService;
  private readonly recipes: RecipesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.brewdaySettings = new BrewdaySettingsService(prisma);
    this.recipeWaterSettings = new RecipeWaterSettingsService(prisma);
    this.recipes = new RecipesService(prisma);
  }

  async updateStepCustomTimerEnabled(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    customTimerEnabled: boolean
  ) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
      select: { id: true },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");

    const step = await this.prisma.brewSessionStep.findFirst({
      where: { id: stepId, brewSessionId },
      select: { id: true },
    });
    if (!step) throw new NotFoundError("step_not_found", "Step not found");

    return this.prisma.brewSessionStep.update({
      where: { id: stepId },
      data: { customTimerEnabled },
    });
  }

  private async assertRecipeInWorkspace(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, workspaceId },
      select: { id: true, name: true, version: true },
    });
    if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
    return recipe;
  }

  private buildRecipeDrivenSteps(args: {
    beerJsonRecipeJson: unknown;
    recipeExtJson: unknown;
    waterSettings: Awaited<ReturnType<RecipeWaterSettingsService["get"]>>;
  }): RecipeDrivenStepSeed[] {
    const steps: RecipeDrivenStepSeed[] = [];
    const d = (args.beerJsonRecipeJson as any) ?? {};
    const r0 = d?.beerjson?.recipes?.[0];
    const ing = r0?.ingredients ?? {};
    const ext = args.recipeExtJson && typeof args.recipeExtJson === "object" && !Array.isArray(args.recipeExtJson)
      ? (args.recipeExtJson as Record<string, unknown>)
      : null;

    const boilTimeMinutes =
      (ext && typeof (ext as any).boilTimeMinutesOverride === "number" && Number.isFinite((ext as any).boilTimeMinutesOverride))
        ? (ext as any).boilTimeMinutesOverride
        : 60;
    const boilBaseStepId = crypto.randomUUID();

    const hops = Array.isArray(ing?.hop_additions) ? ing.hop_additions : [];
    const cultures = Array.isArray(ing?.culture_additions) ? ing.culture_additions : [];
    const misc = Array.isArray(ing?.miscellaneous_additions) ? ing.miscellaneous_additions : [];
    const mash = r0?.mash && typeof r0.mash === "object" ? r0.mash : null;
    const mashStepsRaw =
      mash && Array.isArray((mash as any).mash_steps)
        ? (mash as any).mash_steps
        : mash && Array.isArray((mash as any).mashSteps)
          ? (mash as any).mashSteps
          : [];

    const toFiniteNumber = (v: unknown): number | null => {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string" && v.trim()) {
        const n = Number(v.trim());
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const extractMashStepMinutes = (s: any): number => {
      const rawStepTime = s?.step_time;
      if (rawStepTime && typeof rawStepTime === "object") {
        const unit = typeof rawStepTime.unit === "string" ? rawStepTime.unit.trim().toLowerCase() : "";
        const value = toFiniteNumber(rawStepTime.value);
        if (value == null) return 0;
        if (!unit || unit.startsWith("min")) return Math.max(0, Math.round(value));
        if (unit.startsWith("h")) return Math.max(0, Math.round(value * 60));
        return 0;
      }

      const direct = toFiniteNumber(rawStepTime);
      if (direct != null) return Math.max(0, Math.round(direct));

      const rawDuration = s?.duration;
      if (rawDuration && typeof rawDuration === "object") {
        const unit = typeof rawDuration.unit === "string" ? rawDuration.unit.trim().toLowerCase() : "";
        const value = toFiniteNumber(rawDuration.value);
        if (value == null) return 0;
        if (!unit || unit.startsWith("min")) return Math.max(0, Math.round(value));
        if (unit.startsWith("h")) return Math.max(0, Math.round(value * 60));
        return 0;
      }

      return 0;
    };

    const hasBoilHops = hops.some(
      (h: any) =>
        (typeof h?.timing?.use === "string" && h.timing.use === "add_to_boil") ||
        (typeof h?.brewery_app_use === "string" && (h.brewery_app_use === "boil" || h.brewery_app_use === "whirlpool"))
    );
    if (hasBoilHops) {
      steps.push({
        id: boilBaseStepId,
        sectionId: "boil",
        sectionName: null,
        name: "Start boil",
        minutesPlanned: boilTimeMinutes,
      });
    }

    for (const h of hops) {
      const name = typeof h?.name === "string" ? h.name : "";
      if (!name) continue;
      const use =
        typeof h?.brewery_app_use === "string" && (h.brewery_app_use === "boil" || h.brewery_app_use === "whirlpool" || h.brewery_app_use === "dryhop")
          ? h.brewery_app_use
          : typeof h?.timing?.use === "string" && h.timing.use === "add_to_fermentation"
            ? "dryhop"
            : "boil";
      const timeMinutes = h?.timing?.duration?.unit === "min" ? Number(h?.timing?.duration?.value) : null;

      if (use === "dryhop") {
        steps.push({
          sectionId: "fermentor",
          sectionName: null,
          name: `Add dry hop: ${name}`,
        });
      } else {
        const offset = timeMinutes != null && Number.isFinite(timeMinutes) ? -timeMinutes : null;
        steps.push({
          sectionId: "boil",
          sectionName: null,
          name: `Add hops: ${name}`,
          relativeToStepId: boilBaseStepId,
          offsetMinutesFromEnd: offset,
        });
      }
    }

    for (const c of cultures) {
      const name = typeof c?.name === "string" ? c.name : "";
      if (!name) continue;
      steps.push({
        sectionId: "fermentor",
        sectionName: null,
        name: `Pitch yeast: ${name}`,
      });
    }

    const miscUseToSection: Record<string, string> = {
      mash: "mash",
      boil: "boil",
      primary: "fermentor",
      secondary: "fermentor",
      bottling: "post_boil",
    };
    for (const m of misc) {
      const name = typeof m?.name === "string" ? m.name : "";
      if (!name) continue;
      const useRaw = typeof m?.timing?.use === "string" ? m.timing.use : "";
      const use = useRaw === "add_to_mash" ? "mash" : useRaw === "add_to_boil" ? "boil" : useRaw === "add_to_fermentation" ? "primary" : useRaw === "add_to_secondary" ? "secondary" : useRaw === "add_to_package" ? "bottling" : "boil";
      const sectionId = miscUseToSection[use] ?? "boil";
      steps.push({
        sectionId,
        sectionName: null,
        name: `Add ${name}`,
      });
    }

    const mashScheduleSteps = mashStepsRaw
      .filter((s: any) => s && typeof s === "object")
      .filter((s: any) => typeof s?.name === "string" && s.name.trim())
      .filter((s: any) => !(typeof s?.type === "string" && s.type === "sparge"))
      .map((s: any) => {
        const name = String(s.name).trim();
        const minutes = extractMashStepMinutes(s);
        return { name, minutes };
      });

    if (mashScheduleSteps.length > 0) {
      const mashBaseStepId = crypto.randomUUID();
      const totalMashMin = mashScheduleSteps.reduce(
        (acc: number, s: { minutes: number }) => acc + s.minutes,
        0
      );

      steps.push({
        id: mashBaseStepId,
        sectionId: "mash",
        sectionName: null,
        name: "Start mash",
        minutesPlanned: totalMashMin,
      });

      let startAtMin = 0;
      for (const st of mashScheduleSteps) {
        const offsetMinutesFromEnd = -(totalMashMin - startAtMin);
        steps.push({
          sectionId: "mash",
          sectionName: null,
          name: st.name,
          minutesPlanned: st.minutes,
          relativeToStepId: mashBaseStepId,
          offsetMinutesFromEnd,
        });
        startAtMin += st.minutes;
      }
    }

    const ws = args.waterSettings;
    if (ws && typeof ws === "object") {
      const mashVol = (ws as any).mashWaterVolumeLiters;
      if (typeof mashVol === "number" && mashVol > 0) {
        steps.push({ sectionId: "mash", sectionName: null, name: `Add mash water (${Math.round(mashVol * 10) / 10} L)` });
      }
      const mashSalts = (ws as any).mashSaltAdditionsJson;
      if (Array.isArray(mashSalts) && mashSalts.length > 0) {
        const parts = mashSalts
          .filter((a: any) => a && typeof a === "object")
          .map((a: any) => {
            const saltKey = typeof a.saltKey === "string" ? a.saltKey : "";
            const grams = typeof a.grams === "number" && Number.isFinite(a.grams) ? a.grams : null;
            if (!saltKey || grams == null) return null;
            const saltLabel = saltKey.replaceAll("_", " ");
            const gramsLabel = Math.round(grams * 10) / 10;
            return `${saltLabel} ${gramsLabel} g`;
          })
          .filter(Boolean) as string[];
        steps.push({
          sectionId: "pre_mash",
          sectionName: null,
          name: parts.length > 0 ? `Add mash salts: ${parts.join(", ")}` : "Add mash salts",
        });
      }
      const mashAcidMl = (ws as any).mashLastAcidRequiredMl;
      if (typeof mashAcidMl === "number" && Number.isFinite(mashAcidMl) && mashAcidMl > 0) {
        const acidType = typeof (ws as any).mashAcidType === "string" ? String((ws as any).mashAcidType).trim() : "";
        const mlLabel = Math.round(mashAcidMl * 10) / 10;
        steps.push({
          sectionId: "pre_mash",
          sectionName: null,
          name: acidType ? `Add mash acid (${acidType}): ${mlLabel} ml` : `Add mash acid: ${mlLabel} ml`,
        });
      }
      const spargeVol = (ws as any).spargeVolumeLiters;
      if (typeof spargeVol === "number" && spargeVol > 0) {
        steps.push({ sectionId: "sparge", sectionName: null, name: `Add sparge water (${Math.round(spargeVol * 10) / 10} L)` });
      }
      const spargeSalts = (ws as any).spargeSaltAdditionsJson;
      if (Array.isArray(spargeSalts) && spargeSalts.length > 0) {
        steps.push({ sectionId: "sparge", sectionName: null, name: "Add sparge salts" });
      }
      const boilVol = (ws as any).boilWaterVolumeLiters;
      if (typeof boilVol === "number" && boilVol > 0) {
        steps.push({ sectionId: "boil", sectionName: null, name: `Add boil water (${Math.round(boilVol * 10) / 10} L)` });
      }
    }

    return steps;
  }

  private buildStepSeedFromSettings(args: {
    settings: Awaited<ReturnType<BrewdaySettingsService["getSettings"]>>;
  }) {
    const settings = args.settings;
    const sections = settings?.sections ?? { presetExcludes: {}, customSections: [], customBrewingMethods: [] };
    const customSectionNameById = new Map<string, string>();
    for (const cs of sections.customSections ?? []) {
      if (cs && typeof cs.id === "string" && typeof cs.name === "string") {
        customSectionNameById.set(cs.id, cs.name);
      }
    }

    const sectionExcluded = new Set<string>();
    for (const [k, v] of Object.entries(sections.presetExcludes ?? {})) {
      if (v === true) sectionExcluded.add(k);
    }
    for (const cs of sections.customSections ?? []) {
      if (cs?.exclude === true && typeof cs.id === "string") sectionExcluded.add(cs.id);
    }

    const stepsRaw =
      settings
        ? [...(settings.defaultSteps ?? []), ...(settings.customSteps ?? [])]
        : [...DEFAULT_STEPS_SEED];

    return stepsRaw
      .filter((s) => s && typeof s === "object")
      .filter((s) => s.exclude !== true)
      .filter((s) => !sectionExcluded.has(String(s.sectionId ?? "")))
      .map((s) => {
        const sectionId = String(s.sectionId ?? "").trim() || "preparation";
        const sectionName = customSectionNameById.get(sectionId) ?? null;
        const minutesPlanned =
          typeof s.minutes === "number" && Number.isInteger(s.minutes) && s.minutes >= 0 ? s.minutes : null;
        return {
          sectionId,
          sectionName,
          name: String(s.name ?? "").trim(),
          minutesPlanned,
        };
      })
      .filter((s) => s.name.length > 0);
  }

  async createSessionFromRecipe(userId: string, workspaceId: string, recipeId: string) {
    await this.assertRecipeInWorkspace(userId, workspaceId, recipeId);

    const [settings, recipe, waterSettings] = await Promise.all([
      this.brewdaySettings.getSettings(userId, workspaceId),
      this.recipes.getRecipe(userId, workspaceId, recipeId),
      this.recipeWaterSettings.get(userId, workspaceId, recipeId).catch(() => null),
    ]);

    const stepSeed = this.buildStepSeedFromSettings({ settings });
    const recipeSteps = this.buildRecipeDrivenSteps({
      beerJsonRecipeJson: (recipe as any).beerJsonRecipeJson,
      recipeExtJson: (recipe as any).recipeExtJson,
      waterSettings,
    });

    const sectionOrder = ["preparation", "mash", "lauter", "sparge", "boil", "post_boil", "fermentor", "cleanup", "quality", "miscellaneous"];
    const sectionRank = (sid: string) => {
      const i = sectionOrder.indexOf(sid);
      return i >= 0 ? i : sectionOrder.length;
    };
    const seedBySection = new Map<string, typeof stepSeed>();
    for (const s of stepSeed) {
      const list = seedBySection.get(s.sectionId) ?? [];
      list.push(s);
      seedBySection.set(s.sectionId, list);
    }
    const recipeBySection = new Map<string, RecipeDrivenStepSeed[]>();
    for (const s of recipeSteps) {
      const list = recipeBySection.get(s.sectionId) ?? [];
      list.push(s);
      recipeBySection.set(s.sectionId, list);
    }
    const allSections = new Set([...seedBySection.keys(), ...recipeBySection.keys()]);
    const sortedSections = [...allSections].sort((a, b) => sectionRank(a) - sectionRank(b));

    const merged: Array<{ sectionId: string; sectionName: string | null; name: string; minutesPlanned: number | null; id?: string; relativeToStepId?: string | null; offsetMinutesFromEnd?: number | null }> = [];
    for (const sid of sortedSections) {
      const seedList = seedBySection.get(sid) ?? [];
      const recipeList = recipeBySection.get(sid) ?? [];
      for (const s of seedList) {
        merged.push({
          sectionId: s.sectionId,
          sectionName: s.sectionName ?? null,
          name: s.name,
          minutesPlanned: s.minutesPlanned ?? null,
        });
      }
      for (const s of recipeList) {
        merged.push({
          sectionId: s.sectionId,
          sectionName: s.sectionName ?? null,
          name: s.name,
          minutesPlanned: s.minutesPlanned ?? null,
          id: s.id,
          relativeToStepId: s.relativeToStepId ?? null,
          offsetMinutesFromEnd: s.offsetMinutesFromEnd ?? null,
        });
      }
    }

    const prefix = `BREW-${recipeId.slice(0, 6).toUpperCase()}`;
    const now = new Date();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existingCount = await this.prisma.brewSession.count({
        where: { workspaceId, recipeId },
      });
      const seq = existingCount + 1 + attempt;
      const code = `${prefix}-${String(seq).padStart(2, "0")}`;

      try {
        return await this.prisma.$transaction(async (tx) => {
          const session = await tx.brewSession.create({
            data: {
              workspaceId,
              recipeId,
              code,
              status: "draft" satisfies BrewSessionStatus,
            },
          });

          if (merged.length > 0) {
            await tx.brewSessionStep.createMany({
              data: merged.map((s, idx) => ({
                id: s.id ?? crypto.randomUUID(),
                brewSessionId: session.id,
                sectionId: s.sectionId,
                sectionName: s.sectionName,
                name: s.name,
                isDisabled: false,
                sortOrder: idx,
                minutesPlanned: s.minutesPlanned,
                relativeToStepId: s.relativeToStepId ?? null,
                offsetMinutesFromEnd: s.offsetMinutesFromEnd ?? null,
                status: "pending" satisfies BrewSessionStepStatus,
                note: null,
                timerState: "idle" satisfies BrewSessionStepTimerState,
                timerAccumulatedSeconds: 0,
              })),
            });
          }

          await tx.brewSessionLog.create({
            data: {
              brewSessionId: session.id,
              kind: "session_created" satisfies BrewSessionLogKind,
              message: `Session created at ${now.toISOString()}`,
              payloadJson: { recipeId, code },
            },
          });

          const steps = await tx.brewSessionStep.findMany({
            where: { brewSessionId: session.id },
            orderBy: { sortOrder: "asc" },
          });
          return { session, steps };
        });
      } catch (err) {
        const msg = String(err);
        if (msg.includes("brew_sessions_workspace_id_code_key")) {
          continue;
        }
        throw err;
      }
    }

    throw new BadRequestError("session_code_conflict", "Failed to generate unique brew session code");
  }

  async listSessionsForRecipe(userId: string, workspaceId: string, recipeId: string) {
    await this.assertRecipeInWorkspace(userId, workspaceId, recipeId);
    return this.prisma.brewSession.findMany({
      where: { workspaceId, recipeId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSessionDetail(userId: string, workspaceId: string, brewSessionId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
      include: {
        steps: { orderBy: { sortOrder: "asc" } },
        logs: { orderBy: { createdAt: "desc" }, take: 200 },
        recipe: { select: { id: true, name: true, version: true } },
      },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    return session;
  }

  async updateSessionDate(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    scheduledDate: Date | null
  ) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const existing = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
    });
    if (!existing) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    const updated = await this.prisma.brewSession.update({
      where: { id: brewSessionId },
      data: { scheduledDate },
    });
    return updated;
  }

  async saveSteps(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    steps: BrewSessionStepInput[]
  ) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const existing = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
      include: { steps: { select: { id: true } } },
    });
    if (!existing) throw new NotFoundError("brew_session_not_found", "Brew session not found");

    const normalizedBase = steps
      .filter((s) => s && typeof s === "object")
      .map((s, idx) => {
        const id = typeof s.id === "string" && s.id.trim() ? s.id.trim() : crypto.randomUUID();
        const sectionId = typeof s.sectionId === "string" && s.sectionId.trim() ? s.sectionId.trim() : "preparation";
        const sectionName =
          s.sectionName === null ? null : typeof s.sectionName === "string" ? s.sectionName.trim() || null : null;
        const name = typeof s.name === "string" ? s.name.trim() : "";
        const isDisabled = s.isDisabled === true;
        const minutesPlanned =
          typeof s.minutesPlanned === "number" && Number.isInteger(s.minutesPlanned) && s.minutesPlanned >= 0
            ? s.minutesPlanned
            : s.minutesPlanned === null
              ? null
              : null;
        const relativeToStepId =
          typeof s.relativeToStepId === "string" && s.relativeToStepId.trim() ? s.relativeToStepId.trim() : null;
        const offsetMinutesFromEnd =
          typeof s.offsetMinutesFromEnd === "number" && Number.isInteger(s.offsetMinutesFromEnd)
            ? s.offsetMinutesFromEnd
            : s.offsetMinutesFromEnd === null
              ? null
              : null;
        const customTimerEnabled = s.customTimerEnabled === true;
        return {
          id,
          sectionId,
          sectionName,
          name,
          isDisabled,
          sortOrder: idx,
          minutesPlanned,
          relativeToStepId,
          offsetMinutesFromEnd,
          customTimerEnabled,
        };
      })
      .filter((s) => s.name.length > 0);

    const keepIds = new Set(normalizedBase.map((s) => s.id));
    const normalized = normalizedBase.map((s) => {
      // If a step is deleted, any references to it must be cleared to avoid FK violations.
      // Also prevent self-referencing relative links.
      if (!s.relativeToStepId) return s;
      if (s.relativeToStepId === s.id) {
        return { ...s, relativeToStepId: null, offsetMinutesFromEnd: null };
      }
      if (!keepIds.has(s.relativeToStepId)) {
        return { ...s, relativeToStepId: null, offsetMinutesFromEnd: null };
      }
      return s;
    });
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.brewSessionStep.deleteMany({
        where: { brewSessionId, id: { notIn: [...keepIds] } },
      });

      for (const s of normalized) {
        const exists = existing.steps.some((e) => e.id === s.id);
        if (exists) {
          await tx.brewSessionStep.update({
            where: { id: s.id },
            data: {
              sectionId: s.sectionId,
              sectionName: s.sectionName,
              name: s.name,
              isDisabled: s.isDisabled,
              sortOrder: s.sortOrder,
              minutesPlanned: s.minutesPlanned,
              relativeToStepId: s.relativeToStepId,
              offsetMinutesFromEnd: s.offsetMinutesFromEnd,
              customTimerEnabled: s.customTimerEnabled,
            },
          });
        } else {
          await tx.brewSessionStep.create({
            data: {
              id: s.id,
              brewSessionId,
              sectionId: s.sectionId,
              sectionName: s.sectionName,
              name: s.name,
              isDisabled: s.isDisabled,
              sortOrder: s.sortOrder,
              minutesPlanned: s.minutesPlanned,
              relativeToStepId: s.relativeToStepId,
              offsetMinutesFromEnd: s.offsetMinutesFromEnd,
              customTimerEnabled: s.customTimerEnabled,
              status: "pending",
              note: null,
              timerState: "idle",
              timerAccumulatedSeconds: 0,
            },
          });
        }
      }

      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          kind: "steps_saved",
          message: `Steps saved at ${now.toISOString()}`,
          payloadJson: { count: normalized.length },
        },
      });

      const stepsOut = await tx.brewSessionStep.findMany({
        where: { brewSessionId },
        orderBy: { sortOrder: "asc" },
      });

      return { steps: stepsOut };
    });

    return result;
  }

  async startSession(userId: string, workspaceId: string, brewSessionId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    if (session.status === "stopped") {
      throw new BadRequestError("session_already_stopped", "Session is already stopped");
    }

    const now = new Date();
    const nextStartedAt = session.startedAt ?? now;
    const next = await this.prisma.$transaction(async (tx) => {
      let resumedCount = 0;
      if (session.status === "paused" && session.pausedAt) {
        const pausedBySession = await tx.brewSessionStep.findMany({
          where: {
            brewSessionId,
            timerState: "paused",
            timerPausedAt: session.pausedAt,
          },
          select: { id: true },
        });
        for (const st of pausedBySession) {
          await tx.brewSessionStep.update({
            where: { id: st.id },
            data: {
              timerState: "running",
              timerLastStartedAt: now,
              timerPausedAt: null,
            },
          });
        }
        resumedCount = pausedBySession.length;
      }

      const updated = await tx.brewSession.update({
        where: { id: brewSessionId },
        data: {
          status: "running",
          startedAt: nextStartedAt,
          pausedAt: null,
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          kind: "session_started",
          message: `Brewing started at ${now.toISOString()}`,
          payloadJson: { resumedStepTimers: resumedCount },
        },
      });
      return updated;
    });
    return next;
  }

  async pauseSession(userId: string, workspaceId: string, brewSessionId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    if (session.status !== "running") {
      throw new BadRequestError("session_not_running", "Session is not running");
    }

    const now = new Date();
    const next = await this.prisma.$transaction(async (tx) => {
      const runningSteps = await tx.brewSessionStep.findMany({
        where: { brewSessionId, timerState: "running" },
        select: { id: true },
      });
      for (const st of runningSteps) {
        await this.addStepTimerDeltaSeconds({ tx, stepId: st.id, now });
        await tx.brewSessionStep.update({
          where: { id: st.id },
          data: {
            timerState: "paused",
            timerPausedAt: now,
            timerLastStartedAt: null,
          },
        });
      }

      const updated = await tx.brewSession.update({
        where: { id: brewSessionId },
        data: {
          status: "paused",
          pausedAt: now,
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          kind: "session_paused",
          message: `Brewing paused at ${now.toISOString()}`,
          payloadJson: { pausedStepTimers: runningSteps.length },
        },
      });
      return updated;
    });
    return next;
  }

  async stopSession(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    args?: { reason: "manual" | "auto" | null }
  ) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    if (session.status === "stopped") {
      throw new BadRequestError("session_already_stopped", "Session is already stopped");
    }

    const now = new Date();
    const next = await this.prisma.$transaction(async (tx) => {
      const activeSteps = await tx.brewSessionStep.findMany({
        where: { brewSessionId, timerState: { in: ["running", "paused"] } },
        select: { id: true, timerState: true },
      });
      for (const st of activeSteps) {
        if (st.timerState === "running") {
          await this.addStepTimerDeltaSeconds({ tx, stepId: st.id, now });
        }
        await tx.brewSessionStep.update({
          where: { id: st.id },
          data: {
            timerState: "stopped",
            timerStoppedAt: now,
            timerLastStartedAt: null,
            timerPausedAt: null,
          },
        });
      }

      const updated = await tx.brewSession.update({
        where: { id: brewSessionId },
        data: {
          status: "stopped",
          stoppedAt: now,
          pausedAt: null,
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          kind: "session_stopped",
          message: `Brewing stopped at ${now.toISOString()}`,
          payloadJson: { stoppedStepTimers: activeSteps.length, reason: args?.reason ?? null },
        },
      });
      return updated;
    });
    return next;
  }

  async saveStepLog(
    userId: string,
    workspaceId: string,
    brewSessionId: string,
    stepId: string,
    args: { status: BrewSessionStepStatus; note: string | null; name: string | null; isDisabled: boolean | null }
  ) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const step = await this.prisma.brewSessionStep.findFirst({
      where: { id: stepId, brewSessionId },
    });
    if (!step) throw new NotFoundError("step_not_found", "Step not found");

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.brewSessionStep.update({
        where: { id: stepId },
        data: {
          status: args.status,
          note: args.note,
          name: args.name != null && args.name.trim() ? args.name.trim() : step.name,
          isDisabled: args.isDisabled ?? step.isDisabled,
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          stepId,
          kind: "step_status_saved",
          message: `Step saved (${args.status}) at ${now.toISOString()}`,
          payloadJson: {
            status: args.status,
            nameChanged: args.name != null,
            isDisabledChanged: args.isDisabled != null,
          },
        },
      });
      return u;
    });

    return updated;
  }

  private async addStepTimerDeltaSeconds(args: {
    tx: PrismaClient;
    stepId: string;
    now: Date;
  }) {
    const step = await args.tx.brewSessionStep.findUnique({ where: { id: args.stepId } });
    if (!step) throw new NotFoundError("step_not_found", "Step not found");
    if (!step.timerLastStartedAt) return step;
    const deltaSeconds = Math.max(0, Math.floor((args.now.getTime() - step.timerLastStartedAt.getTime()) / 1000));
    return args.tx.brewSessionStep.update({
      where: { id: args.stepId },
      data: {
        timerAccumulatedSeconds: step.timerAccumulatedSeconds + deltaSeconds,
      },
    });
  }

  async startStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const step = await this.prisma.brewSessionStep.findFirst({
      where: { id: stepId, brewSessionId },
    });
    if (!step) throw new NotFoundError("step_not_found", "Step not found");
    if (step.timerState === "stopped") throw new BadRequestError("timer_stopped", "Timer is already stopped");

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.brewSessionStep.update({
        where: { id: stepId },
        data: {
          timerState: "running",
          timerStartedAt: step.timerStartedAt ?? now,
          timerLastStartedAt: now,
          timerPausedAt: null,
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          stepId,
          kind: "step_timer_started",
          message: `Step timer started at ${now.toISOString()}`,
        },
      });
      return u;
    });
    return updated;
  }

  async pauseStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const step = await this.prisma.brewSessionStep.findFirst({
      where: { id: stepId, brewSessionId },
    });
    if (!step) throw new NotFoundError("step_not_found", "Step not found");
    if (step.timerState !== "running") {
      throw new BadRequestError("timer_not_running", "Timer is not running");
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await this.addStepTimerDeltaSeconds({ tx, stepId, now });
      const u = await tx.brewSessionStep.update({
        where: { id: stepId },
        data: {
          timerState: "paused",
          timerPausedAt: now,
          timerLastStartedAt: null,
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          stepId,
          kind: "step_timer_paused",
          message: `Step timer paused at ${now.toISOString()}`,
        },
      });
      return u;
    });
    return updated;
  }

  async stopStepTimer(userId: string, workspaceId: string, brewSessionId: string, stepId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const step = await this.prisma.brewSessionStep.findFirst({
      where: { id: stepId, brewSessionId },
    });
    if (!step) throw new NotFoundError("step_not_found", "Step not found");
    if (step.timerState === "stopped") {
      throw new BadRequestError("timer_already_stopped", "Timer is already stopped");
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      if (step.timerState === "running") {
        await this.addStepTimerDeltaSeconds({ tx, stepId, now });
      }
      const u = await tx.brewSessionStep.update({
        where: { id: stepId },
        data: {
          timerState: "stopped",
          timerStoppedAt: now,
          timerLastStartedAt: null,
          timerPausedAt: null,
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          stepId,
          kind: "step_timer_stopped",
          message: `Step timer stopped at ${now.toISOString()}`,
        },
      });
      return u;
    });
    return updated;
  }

  async deleteSession(userId: string, workspaceId: string, brewSessionId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, workspaceId },
      select: { id: true, status: true },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    if (session.status === "running" || session.status === "paused") {
      throw new BadRequestError("session_not_stopped", "Session must be stopped before deletion");
    }

    await this.prisma.brewSession.delete({
      where: { id: brewSessionId },
    });
    return { ok: true };
  }
}

