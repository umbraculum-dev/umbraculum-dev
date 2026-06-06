import type { PrismaClient } from "@prisma/client";

import { WorkspacesService } from "../../workspacesService.js";

export async function listWaterProfiles(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  activeWorkspaceId: string | null,
) {
  const system = await prisma.waterProfile.findMany({
    where: { scope: "system" },
    orderBy: { name: "asc" },
  });

  const publicProfiles = await prisma.waterProfile.findMany({
    where: { scope: "public" },
    orderBy: { name: "asc" },
  });

  let workspace: typeof system = [];
  if (activeWorkspaceId) {
    await workspaces.assertMembership(userId, activeWorkspaceId);
    workspace = await prisma.waterProfile.findMany({
      where: { scope: "account", workspaceId: activeWorkspaceId },
      orderBy: { name: "asc" },
    });
  }

  return { system, public: publicProfiles, workspace };
}
