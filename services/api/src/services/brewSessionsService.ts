import type { BrewSessionLogKind, BrewSessionStatus, BrewSessionStepStatus, BrewSessionStepTimerState, PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { AccountsService } from "./accountsService.js";
import { BrewdaySettingsService, DEFAULT_STEPS_SEED } from "./brewdaySettingsService.js";

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
};

export class BrewSessionsService {
  private readonly accounts: AccountsService;
  private readonly brewdaySettings: BrewdaySettingsService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
    this.brewdaySettings = new BrewdaySettingsService(prisma);
  }

  private async assertRecipeInAccount(userId: string, accountId: string, recipeId: string) {
    await this.accounts.assertMembership(userId, accountId);
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, accountId },
      select: { id: true, name: true, version: true },
    });
    if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
    return recipe;
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

  async createSessionFromRecipe(userId: string, accountId: string, recipeId: string) {
    await this.assertRecipeInAccount(userId, accountId, recipeId);

    const settings = await this.brewdaySettings.getSettings(userId, accountId);
    const stepSeed = this.buildStepSeedFromSettings({ settings });

    const prefix = `BREW-${recipeId.slice(0, 6).toUpperCase()}`;
    const now = new Date();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existingCount = await this.prisma.brewSession.count({
        where: { accountId, recipeId },
      });
      const seq = existingCount + 1 + attempt;
      const code = `${prefix}-${String(seq).padStart(2, "0")}`;

      try {
        return await this.prisma.$transaction(async (tx) => {
          const session = await tx.brewSession.create({
            data: {
              accountId,
              recipeId,
              code,
              status: "draft" satisfies BrewSessionStatus,
            },
          });

          if (stepSeed.length > 0) {
            await tx.brewSessionStep.createMany({
              data: stepSeed.map((s, idx) => ({
                brewSessionId: session.id,
                sectionId: s.sectionId,
                sectionName: s.sectionName,
                name: s.name,
                isDisabled: false,
                sortOrder: idx,
                minutesPlanned: s.minutesPlanned,
                relativeToStepId: null,
                offsetMinutesFromEnd: null,
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
        if (msg.includes("brew_sessions_account_id_code_key")) {
          continue;
        }
        throw err;
      }
    }

    throw new BadRequestError("session_code_conflict", "Failed to generate unique brew session code");
  }

  async listSessionsForRecipe(userId: string, accountId: string, recipeId: string) {
    await this.assertRecipeInAccount(userId, accountId, recipeId);
    return this.prisma.brewSession.findMany({
      where: { accountId, recipeId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSessionDetail(userId: string, accountId: string, brewSessionId: string) {
    await this.accounts.assertMembership(userId, accountId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, accountId },
      include: {
        steps: { orderBy: { sortOrder: "asc" } },
        logs: { orderBy: { createdAt: "desc" }, take: 200 },
        recipe: { select: { id: true, name: true, version: true } },
      },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    return session;
  }

  async saveSteps(
    userId: string,
    accountId: string,
    brewSessionId: string,
    steps: BrewSessionStepInput[]
  ) {
    await this.accounts.assertMembership(userId, accountId);
    const existing = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, accountId },
      include: { steps: { select: { id: true } } },
    });
    if (!existing) throw new NotFoundError("brew_session_not_found", "Brew session not found");

    const normalized = steps
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
        };
      })
      .filter((s) => s.name.length > 0);

    const keepIds = new Set(normalized.map((s) => s.id));
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

  async startSession(userId: string, accountId: string, brewSessionId: string) {
    await this.accounts.assertMembership(userId, accountId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, accountId },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    if (session.status === "stopped") {
      throw new BadRequestError("session_already_stopped", "Session is already stopped");
    }

    const now = new Date();
    const nextStartedAt = session.startedAt ?? now;
    const next = await this.prisma.$transaction(async (tx) => {
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
        },
      });
      return updated;
    });
    return next;
  }

  async pauseSession(userId: string, accountId: string, brewSessionId: string) {
    await this.accounts.assertMembership(userId, accountId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, accountId },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    if (session.status !== "running") {
      throw new BadRequestError("session_not_running", "Session is not running");
    }

    const now = new Date();
    const next = await this.prisma.$transaction(async (tx) => {
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
        },
      });
      return updated;
    });
    return next;
  }

  async stopSession(userId: string, accountId: string, brewSessionId: string) {
    await this.accounts.assertMembership(userId, accountId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, accountId },
    });
    if (!session) throw new NotFoundError("brew_session_not_found", "Brew session not found");
    if (session.status === "stopped") {
      throw new BadRequestError("session_already_stopped", "Session is already stopped");
    }

    const now = new Date();
    const next = await this.prisma.$transaction(async (tx) => {
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
        },
      });
      return updated;
    });
    return next;
  }

  async saveStepLog(
    userId: string,
    accountId: string,
    brewSessionId: string,
    stepId: string,
    args: { status: BrewSessionStepStatus; note: string | null }
  ) {
    await this.accounts.assertMembership(userId, accountId);
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
        },
      });
      await tx.brewSessionLog.create({
        data: {
          brewSessionId,
          stepId,
          kind: "step_status_saved",
          message: `Step saved (${args.status}) at ${now.toISOString()}`,
          payloadJson: { status: args.status },
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

  async startStepTimer(userId: string, accountId: string, brewSessionId: string, stepId: string) {
    await this.accounts.assertMembership(userId, accountId);
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

  async pauseStepTimer(userId: string, accountId: string, brewSessionId: string, stepId: string) {
    await this.accounts.assertMembership(userId, accountId);
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

  async stopStepTimer(userId: string, accountId: string, brewSessionId: string, stepId: string) {
    await this.accounts.assertMembership(userId, accountId);
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

  async deleteSession(userId: string, accountId: string, brewSessionId: string) {
    await this.accounts.assertMembership(userId, accountId);
    const session = await this.prisma.brewSession.findFirst({
      where: { id: brewSessionId, accountId },
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

