import type { CrpResource, PrismaClient } from "@prisma/client";
import {
  ResourceSchema,
  type Resource,
} from "@umbraculum/crp-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export class CrpResourcesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listResources(userId: string, workspaceId: string, kind?: string): Promise<readonly Resource[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.crpResource.findMany({
      where: { workspaceId, ...(kind ? { kind } : {}) },
      orderBy: [{ code: "asc" }],
    });
    return rows.map((row) => toResource(row));
  }

  async getResourceById(userId: string, workspaceId: string, resourceId: string): Promise<Resource> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.crpResource.findFirst({
      where: { id: resourceId, workspaceId },
    });
    if (!row) {
      throw new NotFoundError("resource_not_found", `No resource with id ${resourceId}`);
    }
    return toResource(row);
  }
}

function toResource(row: CrpResource): Resource {
  return ResourceSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    code: row.code,
    name: row.name,
    kind: row.kind,
    status: row.status,
    sourceModule: row.sourceModule,
    sourceRefId: row.sourceRefId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
