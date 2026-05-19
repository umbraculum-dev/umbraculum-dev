/**
 * Wire-level contract version of `@brewery/automation-contracts`.
 *
 * Tracks the OpenPLC sister-repo `contract_version` from the integrated
 * release baseline (sister-repo `pyproject.toml` is canonical per the
 * integrated-release-versioning rule).
 *
 * Phase A pre-release: `0.0.0-dev`. The first non-dev tag is agreed with
 * the sister-repo maintainer when the mailbox artifact emitter lands and
 * a `PI_FIRMWARE_VERSION` register exists.
 *
 * See: `docs/design/canonical-automation-module-surface.md` §12.2 (B1 SoT
 * + version handshake) and §9 Phase A.
 */
declare const CONTRACT_VERSION: "0.0.0-dev";
interface SemVer {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease?: string;
}
/**
 * Lenient semver parser for the subset this package needs.
 *
 * Accepts `MAJOR.MINOR.PATCH` and `MAJOR.MINOR.PATCH-prerelease`. Build
 * metadata (`+...`) is intentionally not supported here — Phase A does
 * not need it and adding it later is non-breaking.
 */
declare function parseSemVer(input: string): SemVer | null;
type VersionMismatchSeverity = "match" | "patch" | "minor" | "major" | "unparseable";
/**
 * Classify a runtime version against the platform `CONTRACT_VERSION`.
 *
 * Per design doc §12.2 mismatch policy:
 * - `major` -> adapter refuses to connect, raises `AutomationAlarmEvent`.
 * - `minor` -> connect with warning surfaced on `automation.adapterHealth`.
 * - `patch` -> silent.
 * - `match` -> ok.
 * - `unparseable` -> treat as a hard failure at the call site.
 */
declare function classifyContractVersionSkew(runtime: string, expected?: string): VersionMismatchSeverity;

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
type ModbusEntryKind = "coil" | "discrete_input" | "input_register" | "holding_register";
type ScalarType = "bool" | "int16" | "uint16" | "int32" | "uint32" | "float";
interface MailboxEntry {
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
interface MailboxSpec {
    /** Tracks sister-repo `contract_version`. */
    readonly contractVersion: string;
    /** Tracks sister-repo `integrated_release_tag`, if available. */
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
declare const FIRMWARE_VERSION_REGISTER_NAME: "PI_FIRMWARE_VERSION";
/**
 * Find a mailbox entry by its `PI_*` name. Returns `undefined` if absent.
 *
 * Intentionally a linear scan — mailbox specs in practice are small
 * (<200 entries) and adapters call this at boot, not in the read loop.
 */
declare function findMailboxEntry(spec: MailboxSpec, name: string): MailboxEntry | undefined;

/**
 * Capabilities a concrete adapter advertises to the canonical automation
 * supervisor. Phase A defines the shape; Phase C wires `brewery.openplc.v1`.
 *
 * `applyCommand` and `subscribeAlarms` are reserved for Phase D/E and stay
 * `false` in Phase B/C reference adapters.
 */
interface AdapterCapabilities {
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
interface VesselSnapshot {
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
interface AdapterReadContext {
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
interface AutomationAdapterDefinition {
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

export { type AdapterCapabilities, type AdapterReadContext, type AutomationAdapterDefinition, CONTRACT_VERSION, FIRMWARE_VERSION_REGISTER_NAME, type MailboxEntry, type MailboxSpec, type ModbusEntryKind, type ScalarType, type SemVer, type VersionMismatchSeverity, type VesselSnapshot, classifyContractVersionSkew, findMailboxEntry, parseSemVer };
