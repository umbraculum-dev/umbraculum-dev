import type { PrismaClient, WorkspaceAiSettings as PrismaWorkspaceAiSettings } from "@prisma/client";
import type {
  AiRoleLimits,
  UpdateWorkspaceAiSettingsRequest,
  WorkspaceAiSettings,
} from "@brewery/contracts";

import { ForbiddenError } from "../../errors.js";
import { WorkspacesService } from "../workspacesService.js";
import { getKeyVaultFromEnv, type KeyVault } from "./keyVault.js";

/**
 * CRUD around the per-workspace AI settings row. Admin-only writes; reads
 * are scoped to workspace members.
 *
 * Security invariants:
 *   - `encryptedKey` never leaves this module; clients see only `hasKey`.
 *   - Decryption happens only in `getDecryptedKey` and only the orchestrator
 *     should ever call it.
 *   - When the workspace is downgraded back to `free`, the row is preserved
 *     (the memory + key configuration are part of the workspace moat per
 *     internal/MOAT-AND-COMPETITIVE-STRATEGY.md).
 */
export class AiSettingsService {
  private readonly workspaces: WorkspacesService;
  private readonly keyVault: KeyVault;

  constructor(
    private readonly prisma: PrismaClient,
    options?: { keyVault?: KeyVault },
  ) {
    this.workspaces = new WorkspacesService(prisma);
    this.keyVault = options?.keyVault ?? getKeyVaultFromEnv();
  }

  /** Load or lazily create the workspace's AI settings row. Member-scoped. */
  async getOrCreate(userId: string, workspaceId: string): Promise<PrismaWorkspaceAiSettings> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const existing = await this.prisma.workspaceAiSettings.findUnique({
      where: { workspaceId },
    });
    if (existing) return existing;
    return this.prisma.workspaceAiSettings.create({
      data: { workspaceId },
    });
  }

  /** Convert the Prisma row to the public DTO (no `encryptedKey`). */
  toDto(row: PrismaWorkspaceAiSettings): WorkspaceAiSettings {
    return {
      workspaceId: row.workspaceId,
      provider: row.provider,
      hasKey: typeof row.encryptedKey === "string" && row.encryptedKey.length > 0,
      enabled: row.enabled,
      roleLimits: (row.roleLimits ?? {}) as AiRoleLimits,
      perUserDailyCap: row.perUserDailyCap,
      dataEgressAccepted: row.dataEgressAccepted,
      dataEgressAcceptedAt: row.dataEgressAcceptedAt ? row.dataEgressAcceptedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Apply a partial update. `apiKey` is write-only:
   *   - non-empty string → encrypt + store
   *   - empty string → clear the stored key
   *   - undefined → leave existing key untouched
   */
  async update(
    userId: string,
    workspaceId: string,
    input: UpdateWorkspaceAiSettingsRequest,
  ): Promise<PrismaWorkspaceAiSettings> {
    const role = await this.workspaces.assertMembership(userId, workspaceId);
    if (role !== "brewery_admin") {
      throw new ForbiddenError("ai_admin_only", "Only workspace admins can change AI settings");
    }

    await this.getOrCreate(userId, workspaceId);

    const data: Record<string, unknown> = {};
    if (input.provider !== undefined) data['provider'] = input.provider;
    if (input.enabled !== undefined) data['enabled'] = input.enabled;
    if (input.roleLimits !== undefined) data['roleLimits'] = input.roleLimits;
    if (input.perUserDailyCap !== undefined) data['perUserDailyCap'] = input.perUserDailyCap;
    if (input.dataEgressAccepted !== undefined) {
      data['dataEgressAccepted'] = input.dataEgressAccepted;
      data['dataEgressAcceptedAt'] = input.dataEgressAccepted ? new Date() : null;
    }
    if (input.apiKey !== undefined) {
      if (input.apiKey === "") {
        data['encryptedKey'] = null;
      } else {
        data['encryptedKey'] = this.keyVault.encrypt(input.apiKey);
      }
    }

    return this.prisma.workspaceAiSettings.update({
      where: { workspaceId },
      data,
    });
  }

  /**
   * Decrypt and return the stored provider key. Throws if no key is set.
   * Intended for orchestrator use only.
   */
  async getDecryptedKey(workspaceId: string): Promise<string> {
    const row = await this.prisma.workspaceAiSettings.findUnique({
      where: { workspaceId },
    });
    if (!row || !row.encryptedKey) {
      throw new Error("ai_no_key: workspace has no provider key configured");
    }
    return this.keyVault.decrypt(row.encryptedKey);
  }
}
