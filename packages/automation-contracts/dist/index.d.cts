import { z } from 'zod';

/**
 * Wire-level contract version of `@umbraculum/automation-contracts`.
 *
 * Tracks the OpenPLC sister-repo integrated release tag (semver-shaped),
 * which is the only existing baseline that fits semver. The sister-repo
 * internal `CONTRACT_VERSION = "v2"` marker is preserved on every
 * mirrored mailbox spec as `MailboxSpec.schemaMarker` but is not used
 * by the version handshake (`classifyContractVersionSkew`).
 *
 * Bumped from `"0.0.0-dev"` to `"2.0.1-dev"` in Phase A step 5 when the
 * first sister-repo mailbox artifact mirrored at
 * `packages/automation-contracts/data/mailbox.json` (sister-repo
 * `brewery-alarms-tanks-supervisor` `upgrade/v2` commit `114502d`).
 *
 * Subsequent bumps follow the integrated release tag in the sister
 * repo's `tools/prepare_openplc_runtime_upload.py` and the sidecar's
 * `pi-sidecar/pyproject.toml` — both move together per the
 * integrated-release-versioning baseline rule.
 *
 * See: `docs/design/canonical-automation-module-surface.md` §12.2 (B1 SoT
 * + version handshake), §12.5 step 5, and §9 Phase A.
 */
declare const CONTRACT_VERSION: "2.0.1-dev";
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
 * v2.0 (RFC-0003 Decision A): the types in this file are *inferred from*
 * Zod schemas via `z.infer`. The schema is the single source of truth;
 * hand-authored `interface MailboxEntry { ... }` declarations were
 * removed when the migration landed.
 *
 * Until the sister-repo emitter lands, this file holds only the type
 * shapes the artifact will conform to. No literal `PI_*` names live here.
 */

declare const ModbusEntryKindSchema: z.ZodEnum<{
    coil: "coil";
    discrete_input: "discrete_input";
    input_register: "input_register";
    holding_register: "holding_register";
}>;
declare const ScalarTypeSchema: z.ZodEnum<{
    bool: "bool";
    int16: "int16";
    uint16: "uint16";
    int32: "int32";
    uint32: "uint32";
    float: "float";
}>;
declare const MailboxEntrySchema: z.ZodReadonly<z.ZodObject<{
    name: z.ZodString;
    address: z.ZodNumber;
    kind: z.ZodEnum<{
        coil: "coil";
        discrete_input: "discrete_input";
        input_register: "input_register";
        holding_register: "holding_register";
    }>;
    scalar: z.ZodEnum<{
        bool: "bool";
        int16: "int16";
        uint16: "uint16";
        int32: "int32";
        uint32: "uint32";
        float: "float";
    }>;
    scale: z.ZodOptional<z.ZodNumber>;
    unit: z.ZodOptional<z.ZodString>;
    writable: z.ZodBoolean;
    description: z.ZodString;
}, z.core.$strip>>;
declare const MailboxSpecSchema: z.ZodObject<{
    contractVersion: z.ZodString;
    schemaMarker: z.ZodOptional<z.ZodString>;
    plcVersion: z.ZodOptional<z.ZodString>;
    integratedReleaseTag: z.ZodOptional<z.ZodString>;
    entries: z.ZodArray<z.ZodReadonly<z.ZodObject<{
        name: z.ZodString;
        address: z.ZodNumber;
        kind: z.ZodEnum<{
            coil: "coil";
            discrete_input: "discrete_input";
            input_register: "input_register";
            holding_register: "holding_register";
        }>;
        scalar: z.ZodEnum<{
            bool: "bool";
            int16: "int16";
            uint16: "uint16";
            int32: "int32";
            uint32: "uint32";
            float: "float";
        }>;
        scale: z.ZodOptional<z.ZodNumber>;
        unit: z.ZodOptional<z.ZodString>;
        writable: z.ZodBoolean;
        description: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
type ModbusEntryKind = z.infer<typeof ModbusEntryKindSchema>;
type ScalarType = z.infer<typeof ScalarTypeSchema>;
type MailboxEntry = z.infer<typeof MailboxEntrySchema>;
type MailboxSpec = z.infer<typeof MailboxSpecSchema>;
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
 * Typed mirror of the sister-repo mailbox artifact.
 *
 * The JSON file at `data/mailbox.json` is a byte-for-byte mirror of
 * `out/mailbox.json` emitted by the sister repo
 * `brewery-alarms-tanks-supervisor` (`tools/build_mailbox_artifact.py`).
 *
 * This module:
 *   1. Imports the JSON via TypeScript's `resolveJsonModule`.
 *   2. Validates structure at module-load time via `MailboxSpecSchema.parse`
 *      (loud failure on drift — better than a confusing runtime exception
 *      deep in an adapter).
 *   3. Re-exports the parsed result as `MAILBOX_SPEC`, typed as `MailboxSpec`.
 *
 * v2.0 (RFC-0003 Decision A): migrated from hand-rolled `assertEntry` /
 * `assertSpec` validators (168 lines) to a Zod schema declared in
 * `mailbox.ts`. The schema captures:
 *   - Structural validation (object shape, primitive types, enum membership).
 *   - Pattern validation (`PI_*` name prefix via regex).
 *   - Cross-entry drift detection (duplicate name + duplicate address-per-kind
 *     via superRefine).
 * All checks the hand-rolled validator performed are preserved; the
 * implementation is smaller and the type is inferred from the same source.
 *
 * Refresh procedure: `bash scripts/sync-automation-mailbox-mirror.sh`
 * (copies the sister-repo `out/mailbox.json` into `data/mailbox.json`).
 *
 * See: `docs/design/canonical-automation-module-surface.md` §12.2 (M2
 * mirror mechanism), §12.5 step 5.
 */

/**
 * Validated, frozen mirror of the sister-repo mailbox artifact.
 *
 * Adapters and tests should consume this constant rather than reading
 * `data/mailbox.json` directly. Drift is caught at module-load time
 * with a `ZodError` whose `issues` array carries the per-entry path
 * (`["entries", N, "<field>"]`) and a machine-readable `code` for each
 * violation. The `ZodError.message` JSON-stringifies all issues so the
 * boot-time failure is self-describing in the log.
 */
declare const MAILBOX_SPEC: MailboxSpec;

/**
 * Capabilities a concrete adapter advertises to the canonical automation
 * supervisor. Phase A defines the shape; Phase C wires `brewery.openplc.v1`.
 *
 * `applyCommand` and `subscribeAlarms` are reserved for Phase D/E and stay
 * `false` in Phase B/C reference adapters.
 */
declare const AdapterCapabilitiesSchema: z.ZodReadonly<z.ZodObject<{
    readSnapshot: z.ZodBoolean;
    applyCommand: z.ZodBoolean;
    subscribeAlarms: z.ZodBoolean;
}, z.core.$strip>>;
/**
 * Snapshot of one vessel's current state read from the adapter.
 *
 * The shape mirrors the platform `Vessel` model fields the supervisor
 * needs (§7 of the design doc) without binding adapters to Prisma rows.
 */
declare const VesselSnapshotSchema: z.ZodReadonly<z.ZodObject<{
    vesselCode: z.ZodString;
    mode: z.ZodOptional<z.ZodString>;
    currentTempC: z.ZodOptional<z.ZodNumber>;
    targetTempC: z.ZodOptional<z.ZodNumber>;
    alarmActive: z.ZodBoolean;
    capturedAt: z.ZodString;
    raw: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodBoolean]>>>;
}, z.core.$strip>>;
/**
 * Vessel-state shape exposed to API consumers (clients + AI tools).
 *
 * Distinct from `VesselSnapshotSchema` (adapter-side, transient) and the
 * Prisma `Vessel` row (DB-side, fully owned by the service layer). This is
 * the canonical wire shape for `/automation/vessels` + `/automation/vessels/:code`
 * route responses and for the `automation.listVessels` / `automation.vesselState`
 * AI tool outputs.
 */
declare const VesselStateSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    displayName: z.ZodString;
    vesselKind: z.ZodString;
    equipmentProfileId: z.ZodNullable<z.ZodString>;
    adapterConnectionId: z.ZodNullable<z.ZodString>;
    mode: z.ZodNullable<z.ZodString>;
    currentTempC: z.ZodNullable<z.ZodNumber>;
    targetTempC: z.ZodNullable<z.ZodNumber>;
    alarmActive: z.ZodBoolean;
    lastSeenAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const VesselListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    vessels: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        displayName: z.ZodString;
        vesselKind: z.ZodString;
        equipmentProfileId: z.ZodNullable<z.ZodString>;
        adapterConnectionId: z.ZodNullable<z.ZodString>;
        mode: z.ZodNullable<z.ZodString>;
        currentTempC: z.ZodNullable<z.ZodNumber>;
        targetTempC: z.ZodNullable<z.ZodNumber>;
        alarmActive: z.ZodBoolean;
        lastSeenAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const VesselStateResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    vessel: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        displayName: z.ZodString;
        vesselKind: z.ZodString;
        equipmentProfileId: z.ZodNullable<z.ZodString>;
        adapterConnectionId: z.ZodNullable<z.ZodString>;
        mode: z.ZodNullable<z.ZodString>;
        currentTempC: z.ZodNullable<z.ZodNumber>;
        targetTempC: z.ZodNullable<z.ZodNumber>;
        alarmActive: z.ZodBoolean;
        lastSeenAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
type AdapterCapabilities = z.infer<typeof AdapterCapabilitiesSchema>;
type VesselSnapshot = z.infer<typeof VesselSnapshotSchema>;
type VesselState = z.infer<typeof VesselStateSchema>;
type VesselListResponse = z.infer<typeof VesselListResponseSchema>;
type VesselStateResponse = z.infer<typeof VesselStateResponseSchema>;
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
interface AdapterReadContext {
    readonly mailbox: MailboxSpec;
    readonly contractVersion: string;
    readonly runtimeVersion?: string;
}
/**
 * Adapter SDK contract.
 *
 * Phase A: type only — no runtime client. Phase B-2 adds the mock adapter
 * in `services/api/src/modules/automation/adapters/mockAdapter.ts`. Phase C
 * will provide a concrete implementation in `@brewery/openplc-adapter` (or
 * equivalent) that speaks Modbus TCP (bench) / Modbus RTU (field) per the
 * bench-vs-field profile rule.
 *
 * The adapter definition is intentionally a plain TypeScript `interface`
 * (not a Zod schema): adapters carry runtime functions (`readSnapshot`)
 * which Zod cannot meaningfully validate, and the surface is internal —
 * the boundary that gets schema-validated is the `VesselSnapshot[]`
 * `readSnapshot` returns.
 */
interface AutomationAdapterDefinition {
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

export { type AdapterCapabilities, AdapterCapabilitiesSchema, type AdapterReadContext, type AutomationAdapterDefinition, CONTRACT_VERSION, FIRMWARE_VERSION_REGISTER_NAME, MAILBOX_SPEC, type MailboxEntry, type MailboxSpec, type ModbusEntryKind, type ScalarType, type SemVer, type VersionMismatchSeverity, type VesselListResponse, VesselListResponseSchema, type VesselSnapshot, VesselSnapshotSchema, type VesselState, type VesselStateResponse, VesselStateResponseSchema, VesselStateSchema, classifyContractVersionSkew, findMailboxEntry, parseSemVer };
