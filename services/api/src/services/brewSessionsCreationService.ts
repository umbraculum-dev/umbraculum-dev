import type { BrewSessionLogKind, BrewSessionStatus, BrewSessionStepStatus, BrewSessionStepTimerState, PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";
import { BrewdaySettingsService } from "./brewdaySettingsService.js";
import { RecipeWaterSettingsService } from "../modules/brewery/services/recipeWaterSettingsService.js";
import { RecipesService } from "./recipesService.js";
import {
  buildRecipeDrivenSteps,
  buildStepSeedFromSettings,
  type RecipeDrivenStepSeed,
} from "./brewSessionsRecipeStepSeeding.js";

export class BrewSessionsCreationService {
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

  private async assertRecipeInWorkspace(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, workspaceId },
      select: { id: true, name: true, version: true },
    });
    if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
    return recipe;
  }

  async createSessionFromRecipe(userId: string, workspaceId: string, recipeId: string) {
    await this.assertRecipeInWorkspace(userId, workspaceId, recipeId);

    const [settings, recipe, waterSettings] = await Promise.all([
      this.brewdaySettings.getSettings(userId, workspaceId),
      this.recipes.getRecipe(userId, workspaceId, recipeId),
      this.recipeWaterSettings.get(userId, workspaceId, recipeId).catch(() => null),
    ]);

    const stepSeed = buildStepSeedFromSettings({ settings });
    const recipeSteps = buildRecipeDrivenSteps({
      beerJsonRecipeJson: recipe.beerJsonRecipeJson,
      recipeExtJson: recipe.recipeExtJson,
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

    const merged: Array<{
      sectionId: string;
      sectionName: string | null;
      name: string;
      minutesPlanned: number | null;
      id?: string | undefined;
      relativeToStepId?: string | null | undefined;
      offsetMinutesFromEnd?: number | null | undefined;
      breweryAppStepKind?: RecipeDrivenStepSeed["breweryAppStepKind"] | undefined;
    }> = [];
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
          breweryAppStepKind: s.breweryAppStepKind ?? null,
        });
      }
    }

    const mashInNameMatch = (name: string) => name.toLowerCase().includes("mash in");
    const vorlaufNameMatch = (name: string) => {
      const n = name.toLowerCase();
      return n.includes("vorlauf") || n.includes("volauf");
    };
    const isMash = (s: (typeof merged)[number]) => s.sectionId === "mash";
    const isEarlyFermentable = (s: (typeof merged)[number]) => s.breweryAppStepKind === "fermentable_early";
    const isLateFermentable = (s: (typeof merged)[number]) => s.breweryAppStepKind === "fermentable_late";

    const mashSteps = merged.filter(isMash);
    const earlyFermentables = mashSteps.filter(isEarlyFermentable);
    const lateFermentables = mashSteps.filter(isLateFermentable);
    const mashWithoutFermentables = mashSteps.filter((s) => !isEarlyFermentable(s) && !isLateFermentable(s));

    if (earlyFermentables.length > 0 || lateFermentables.length > 0) {
      const mashInIdx = mashWithoutFermentables.findIndex((s) => mashInNameMatch(s.name));
      const earlyInsertAt = mashInIdx >= 0 ? mashInIdx + 1 : mashWithoutFermentables.length > 0 ? 1 : 0;

      const withEarly = [...mashWithoutFermentables];
      withEarly.splice(earlyInsertAt, 0, ...earlyFermentables);

      const vorlaufIdx = withEarly.findIndex((s) => vorlaufNameMatch(s.name));
      const lateInsertAt = vorlaufIdx >= 0 ? vorlaufIdx : withEarly.length;
      withEarly.splice(lateInsertAt, 0, ...lateFermentables);

      const nextMerged: typeof merged = [];
      let insertedMash = false;
      for (const s of merged) {
        if (s.sectionId !== "mash") {
          nextMerged.push(s);
          continue;
        }
        if (insertedMash) continue;
        nextMerged.push(...withEarly);
        insertedMash = true;
      }

      if (!insertedMash) nextMerged.push(...withEarly);

      merged.length = 0;
      merged.push(...nextMerged);
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
}
