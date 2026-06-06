import type { PrismaClient } from "@prisma/client";

import { WorkspacesService } from "./workspacesService.js";
import { createWaterProfile } from "./waterProfiles/ops/createProfile.js";
import { listWaterProfiles } from "./waterProfiles/ops/listProfiles.js";
import {
  deleteWaterProfile,
  setWaterProfileVerificationStatus,
  updateWaterProfile,
} from "./waterProfiles/ops/writeProfiles.js";
import type { CreateWaterProfileInput, UpdateWaterProfileInput } from "./waterProfiles/waterProfilesTypes.js";

export type { CreateWaterProfileInput, UpdateWaterProfileInput } from "./waterProfiles/waterProfilesTypes.js";

export class WaterProfilesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listProfiles(userId: string, activeWorkspaceId: string | null) {
    return listWaterProfiles(this.prisma, this.workspaces, userId, activeWorkspaceId);
  }

  async createProfile(userId: string, workspaceId: string, input: CreateWaterProfileInput) {
    return createWaterProfile(this.prisma, this.workspaces, userId, workspaceId, input);
  }

  async updateProfile(userId: string, workspaceId: string, profileId: string, input: UpdateWaterProfileInput) {
    return updateWaterProfile(this.prisma, this.workspaces, userId, workspaceId, profileId, input);
  }

  async setVerificationStatus(
    userId: string,
    workspaceId: string,
    profileId: string,
    verificationStatus: "unverified" | "verified",
  ) {
    return setWaterProfileVerificationStatus(
      this.prisma,
      this.workspaces,
      userId,
      workspaceId,
      profileId,
      verificationStatus,
    );
  }

  async deleteProfile(userId: string, workspaceId: string, profileId: string) {
    return deleteWaterProfile(this.prisma, this.workspaces, userId, workspaceId, profileId);
  }
}
