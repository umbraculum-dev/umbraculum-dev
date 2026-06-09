import { z } from "zod";
import { MailboxSpecSchema, type MailboxSpec } from "./mailbox.js";

/**
 * Capabilities a concrete adapter advertises to the canonical automation
 * supervisor. Phase A defines the shape; Phase C wires `brewery.openplc.v1`.
 *
 * `applyCommand` and `subscribeAlarms` are reserved for Phase D/E and stay
 * `false` in Phase B/C reference adapters.
 */
export const AdapterCapabilitiesSchema = z
  .object({
    readSnapshot: z.boolean(),
    applyCommand: z.boolean(),
    subscribeAlarms: z.boolean(),
  })
  .readonly();

/**
 * Snapshot of one vessel's current state read from the adapter.
 *
 * The shape mirrors the platform `Vessel` model fields the supervisor
 * needs (§7 of the design doc) without binding adapters to Prisma rows.
 */
export const VesselSnapshotSchema = z
  .object({
    vesselCode: z.string().min(1, "vesselCode required"),
    mode: z.string().optional(),
    currentTempC: z.number().finite().optional(),
    targetTempC: z.number().finite().optional(),
    alarmActive: z.boolean(),
    /** ISO 8601 timestamp the adapter assigned when the read completed. */
    capturedAt: z
      .string()
      .min(1, "capturedAt required")
      .refine(
        (s) => !Number.isNaN(Date.parse(s)),
        "capturedAt must be ISO 8601",
      ),
    /**
     * Optional raw mailbox values keyed by `PI_*` name — informational, for
     * debugging and AI tools. Not the source of truth for `Vessel` rows.
     */
    raw: z.record(z.string(), z.union([z.number(), z.boolean()])).optional(),
  })
  .readonly();

/**
 * Vessel-state shape exposed to API consumers (clients + AI tools).
 *
 * Distinct from `VesselSnapshotSchema` (adapter-side, transient) and the
 * Prisma `Vessel` row (DB-side, fully owned by the service layer). This is
 * the canonical wire shape for `/automation/vessels` + `/automation/vessels/:code`
 * route responses and for the `automation.listVessels` / `automation.vesselState`
 * AI tool outputs.
 */
export const VesselStateSchema = z.object({
  id: z.string().min(1, "id required"),
  workspaceId: z.string().min(1, "workspaceId required"),
  code: z.string().min(1, "code required"),
  displayName: z.string().min(1, "displayName required"),
  vesselKind: z.string().min(1, "vesselKind required"),
  equipmentProfileId: z.string().nullable(),
  adapterConnectionId: z.string().nullable(),
  mode: z.string().nullable(),
  currentTempC: z.number().finite().nullable(),
  targetTempC: z.number().finite().nullable(),
  alarmActive: z.boolean(),
  /** ISO 8601 timestamp; null until the first adapter snapshot lands. */
  lastSeenAt: z.string().nullable(),
});

export const VesselListResponseSchema = z.object({
  ok: z.literal(true),
  vessels: z.array(VesselStateSchema),
});

export const VesselStateResponseSchema = z.object({
  ok: z.literal(true),
  vessel: VesselStateSchema,
});

export type AdapterCapabilities = z.infer<typeof AdapterCapabilitiesSchema>;
export type VesselSnapshot = z.infer<typeof VesselSnapshotSchema>;
export type VesselState = z.infer<typeof VesselStateSchema>;
export type VesselListResponse = z.infer<typeof VesselListResponseSchema>;
export type VesselStateResponse = z.infer<typeof VesselStateResponseSchema>;

/**
 * Context passed to adapter read calls. The supervisor injects the active
 * `MailboxSpec` and version triple so adapters do not parse the artifact
 * themselves.
 *
 * Kept as a plain interface (not a Zod schema) because `mailbox` here is
 * already a validated `MailboxSpec` from `MailboxSpecSchema.parse(...)` at
 * boot — passing a Zod-validated value across an internal boundary does
 * not need a second validation pass per the
 * `22-typescript-contracts-runtime-validation.mdc` rule (only external /
 * unknown-typed boundaries get re-validated).
 */
export interface AdapterReadContext {
  readonly mailbox: MailboxSpec;
  readonly contractVersion: string;
  readonly runtimeVersion?: string;
}

/**
 * Adapter SDK contract.
 *
 * Phase A: type only — no runtime client. Phase B-2 adds the mock adapter
 * in `services/api/src/modules/automation/adapters/mockAdapter.ts`. Phase C
 * will provide a concrete implementation in `@umbraculum/openplc-adapter`
 * (or equivalent) that speaks Modbus TCP (bench) / Modbus RTU (field) per
 * the bench-vs-field profile rule.
 *
 * The adapter definition is intentionally a plain TypeScript `interface`
 * (not a Zod schema): adapters carry runtime functions (`readSnapshot`)
 * which Zod cannot meaningfully validate, and the surface is internal —
 * the boundary that gets schema-validated is the `VesselSnapshot[]`
 * `readSnapshot` returns.
 */
export interface AutomationAdapterDefinition {
  /** Adapter kind identifier (e.g. `"brewery.openplc.v1"`, `"automation.mock.v0"`). */
  readonly kind: string;
  /** Human-readable display name. */
  readonly displayName: string;
  /** Wire protocol family (informational; transport choice is per-instance). */
  readonly protocol: "modbus_tcp" | "modbus_rtu" | "http" | "mock";
  /**
   * Required mailbox contract version this adapter speaks.
   *
   * The supervisor compares this against the active `CONTRACT_VERSION`
   * via `classifyContractVersionSkew()` and applies the §12.2 mismatch
   * policy (`major` refuses, `minor` warns, `patch` silent).
   */
  readonly requiresContractVersion: string;
  readonly capabilities: AdapterCapabilities;
  /**
   * Read one round of vessel snapshots.
   *
   * The supervisor re-parses the returned array via `VesselSnapshotSchema`
   * before persisting to the `vessels` table (adapter-source-of-truth
   * boundary).
   */
  readSnapshot(context: AdapterReadContext): Promise<readonly VesselSnapshot[]>;
}

// MailboxSpecSchema referenced for module-graph completeness; concrete usage
// is in `adapters/mockAdapter.ts` where the context is constructed.
void MailboxSpecSchema;
