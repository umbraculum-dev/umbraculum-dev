import type { PrismaClient, Vessel } from "@prisma/client";
import {
  VesselStateSchema,
  type VesselState,
} from "@brewery/automation-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

/**
 * Phase B-2 vessels service — read path only.
 *
 * Owns the translation between the Prisma `Vessel` row and the wire shape
 * `VesselState` (canonical for both `/automation/vessels` route responses
 * and `automation.listVessels` / `automation.vesselState` AI tool outputs).
 *
 * The translation is centralized here so route handlers + AI tools cannot
 * drift; both call `service.listVessels(...)` and `service.getVesselByCode(...)`.
 *
 * Phase C will add the write path (`createVessel`, `updateVessel` from
 * adapter snapshots) once `brewery.openplc.v1` is wired and the version
 * handshake is enforced.
 */
export class VesselsService {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly workspaces = new WorkspacesService(this.prisma);

  /**
   * List all vessels in the active workspace, ordered by `code` for a
   * deterministic UI surface (tests can pin order without insertion-order
   * coupling).
   */
  async listVessels(userId: string, workspaceId: string): Promise<readonly VesselState[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.vessel.findMany({
      where: { workspaceId },
      orderBy: [{ code: "asc" }],
    });
    return rows.map((row) => this.toVesselState(row));
  }

  /**
   * Get one vessel by its workspace-unique `code`. Throws `NotFoundError`
   * if the code is not present in the workspace (matches the route-layer
   * 404 contract documented in the PR3 handoff for similar
   * workspace-scoped lookups).
   */
  async getVesselByCode(
    userId: string,
    workspaceId: string,
    code: string,
  ): Promise<VesselState> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.vessel.findUnique({
      where: { workspaceId_code: { workspaceId, code } },
    });
    if (!row) {
      throw new NotFoundError("vessel_not_found", `No vessel with code ${code}`);
    }
    return this.toVesselState(row);
  }

  /**
   * Prisma-row → wire-shape translation. Parsed through `VesselStateSchema`
   * to enforce the canonical contract even though the inputs are typed —
   * the parse catches Prisma-side drift (e.g. a forgotten field addition
   * after a future migration) at the service boundary rather than at the
   * client. Matches RFC-0003 Decision A guidance: a Zod schema is the
   * single source of truth, even on internal-typed boundaries when the
   * boundary value is then re-serialized to JSON.
   */
  private toVesselState(row: Vessel): VesselState {
    return VesselStateSchema.parse({
      id: row.id,
      workspaceId: row.workspaceId,
      code: row.code,
      displayName: row.displayName,
      vesselKind: row.vesselKind,
      equipmentProfileId: row.equipmentProfileId,
      adapterConnectionId: row.adapterConnectionId,
      mode: row.mode,
      currentTempC: row.currentTempC,
      targetTempC: row.targetTempC,
      alarmActive: row.alarmActive,
      lastSeenAt: row.lastSeenAt ? row.lastSeenAt.toISOString() : null,
    });
  }
}
