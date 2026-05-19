import type { MailboxSpec } from "./mailbox.js";

/**
 * Capabilities a concrete adapter advertises to the canonical automation
 * supervisor. Phase A defines the shape; Phase C wires `brewery.openplc.v1`.
 *
 * `applyCommand` and `subscribeAlarms` are reserved for Phase D/E and stay
 * `false` in Phase B/C reference adapters.
 */
export interface AdapterCapabilities {
  readonly readSnapshot: boolean;
  readonly applyCommand: boolean;
  readonly subscribeAlarms: boolean;
}

/**
 * Snapshot of one vessel's current state read from the adapter.
 *
 * The shape mirrors the platform `Vessel` model fields the supervisor
 * needs (§7 of the design doc) without binding adapters to Prisma rows.
 */
export interface VesselSnapshot {
  readonly vesselCode: string;
  readonly mode?: string;
  readonly currentTempC?: number;
  readonly targetTempC?: number;
  readonly alarmActive: boolean;
  /** ISO 8601 timestamp the adapter assigned when the read completed. */
  readonly capturedAt: string;
  /**
   * Optional raw mailbox values keyed by `PI_*` name — informational, for
   * debugging and AI tools. Not the source of truth for `Vessel` rows.
   */
  readonly raw?: Readonly<Record<string, number | boolean>>;
}

/**
 * Context passed to adapter read calls. The supervisor injects the active
 * `MailboxSpec` and version triple so adapters do not parse the artifact
 * themselves.
 */
export interface AdapterReadContext {
  readonly mailbox: MailboxSpec;
  readonly contractVersion: string;
  readonly runtimeVersion?: string;
}

/**
 * Adapter SDK contract.
 *
 * Phase A: type only — no runtime client. Phase C will provide a concrete
 * implementation in `@brewery/openplc-adapter` (or equivalent) that
 * speaks Modbus TCP (bench) / Modbus RTU (field) per the bench-vs-field
 * profile rule.
 */
export interface AutomationAdapterDefinition {
  /** Adapter kind identifier (e.g. `"brewery.openplc.v1"`). */
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
   * Phase A: declared only. Implementations land in Phase C.
   */
  readSnapshot(context: AdapterReadContext): Promise<readonly VesselSnapshot[]>;
}
