import type { PrismaClient } from "@prisma/client";

import { WorkspacesService } from "../../../../services/workspacesService.js";
import { getSettings, type BrewdaySettingsPayload } from "./brewdaySettingsReadOps.js";
import { upsertSettings } from "./brewdaySettingsWriteOps.js";

export { DEFAULT_STEPS_SEED } from "./brewdaySettingsReadOps.js";
export type {
  BrewdayCustomSectionConfig,
  BrewdayCustomStep,
  BrewdayDefaultStep,
  BrewdaySectionConfig,
  BrewdaySettingsPayload,
  PresetSectionKey,
} from "./brewdaySettingsReadOps.js";

export class BrewdaySettingsService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async getSettings(userId: string, workspaceId: string) {
    return getSettings(this.prisma, this.workspaces, userId, workspaceId);
  }

  async upsertSettings(userId: string, workspaceId: string, payload: BrewdaySettingsPayload) {
    return upsertSettings(this.prisma, this.workspaces, userId, workspaceId, payload);
  }
}
