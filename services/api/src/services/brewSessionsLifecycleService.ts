import type { BrewSessionStepStatus, Prisma, PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";

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

export class BrewSessionsLifecycleService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
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
    tx: Prisma.TransactionClient;
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
