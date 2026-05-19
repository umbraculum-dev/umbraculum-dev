/**
 * Modbus mailbox spec types — the typed mirror of the OpenPLC sister
 * repo `PI_*` mailbox.
 *
 * The actual address map and semantics are owned by the sister repo.
 * This package mirrors a sister-repo-emitted artifact via PR per the M2
 * mechanism in `docs/design/canonical-automation-module-surface.md` §12.2.
 *
 * Until the sister-repo emitter lands, this file holds only the type
 * shapes the artifact will conform to. No literal `PI_*` names live here.
 */

export type ModbusEntryKind =
  | "coil"
  | "discrete_input"
  | "input_register"
  | "holding_register";

export type ScalarType = "bool" | "int16" | "uint16" | "int32" | "uint32" | "float";

export interface MailboxEntry {
  /** PI_* name from the sister repo (e.g. `"PI_K1_CURRENT_TEMP_C_X10"`). */
  readonly name: string;
  /** 0-based Modbus address. */
  readonly address: number;
  /** Modbus function-code family. */
  readonly kind: ModbusEntryKind;
  /** Scalar interpretation. */
  readonly scalar: ScalarType;
  /**
   * Optional fixed-point scale: engineering value = raw * scale.
   * Omitted for non-scalar / boolean entries.
   */
  readonly scale?: number;
  /** Engineering unit (e.g. `"degC"`, `"bbl"`, `"%"`) — informational. */
  readonly unit?: string;
  /** Whether the platform is allowed to write this entry. */
  readonly writable: boolean;
  /** Human-readable description from the sister repo. */
  readonly description: string;
}

export interface MailboxSpec {
  /**
   * Platform-facing semver-shaped version string used by the version
   * handshake (`classifyContractVersionSkew`). Phase A reuses the
   * sister-repo integrated release tag because it is the only existing
   * baseline that is semver-shaped.
   */
  readonly contractVersion: string;
  /**
   * Sister-repo internal schema marker (e.g. `"v2"`). Informational —
   * not consumed by the version handshake. Captures the
   * monotonically-bumped marker the sister repo uses internally when
   * the address layout changes.
   */
  readonly schemaMarker?: string;
  /** Sister-repo `PLC_VERSION` (PLC firmware/runtime tag). */
  readonly plcVersion?: string;
  /**
   * Sister-repo `INTEGRATED_RELEASE_TAG`. Phase A this is identical
   * to `contractVersion` (same value, distinct field for forward
   * compatibility when the rails diverge).
   */
  readonly integratedReleaseTag?: string;
  /** All `PI_*` entries the runtime exposes. */
  readonly entries: readonly MailboxEntry[];
}

/**
 * Reserved PI_* register name slot for the runtime firmware version.
 *
 * Not a Modbus address (the sister-repo artifact assigns the address).
 * Adapters use this name to look up the register via `MailboxSpec.entries`
 * and report `AdapterConnection.runtimeVersion` for the version handshake
 * documented in §12.2.
 */
export const FIRMWARE_VERSION_REGISTER_NAME = "PI_FIRMWARE_VERSION" as const;

/**
 * Find a mailbox entry by its `PI_*` name. Returns `undefined` if absent.
 *
 * Intentionally a linear scan — mailbox specs in practice are small
 * (<200 entries) and adapters call this at boot, not in the read loop.
 */
export function findMailboxEntry(
  spec: MailboxSpec,
  name: string,
): MailboxEntry | undefined {
  return spec.entries.find((entry) => entry.name === name);
}
