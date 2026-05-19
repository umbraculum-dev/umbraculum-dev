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
import { z } from "zod";

export const ModbusEntryKindSchema = z.enum([
  "coil",
  "discrete_input",
  "input_register",
  "holding_register",
]);

export const ScalarTypeSchema = z.enum([
  "bool",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "float",
]);

export const MailboxEntrySchema = z
  .object({
    /** PI_* name from the sister repo (e.g. `"PI_K1_CURRENT_TEMP_C_X10"`). */
    name: z.string().regex(/^PI_/, "expected PI_* name"),
    /** 0-based Modbus address. */
    address: z.number().int().nonnegative(),
    /** Modbus function-code family. */
    kind: ModbusEntryKindSchema,
    /** Scalar interpretation. */
    scalar: ScalarTypeSchema,
    /**
     * Optional fixed-point scale: engineering value = raw * scale.
     * Omitted for non-scalar / boolean entries.
     */
    scale: z.number().optional(),
    /** Engineering unit (e.g. `"degC"`, `"bbl"`, `"%"`) — informational. */
    unit: z.string().optional(),
    /** Whether the platform is allowed to write this entry. */
    writable: z.boolean(),
    /** Human-readable description from the sister repo. */
    description: z.string(),
  })
  .readonly();

export const MailboxSpecSchema = z
  .object({
    /**
     * Platform-facing semver-shaped version string used by the version
     * handshake (`classifyContractVersionSkew`). Phase A reuses the
     * sister-repo integrated release tag because it is the only existing
     * baseline that is semver-shaped.
     */
    contractVersion: z.string().min(1),
    /**
     * Sister-repo internal schema marker (e.g. `"v2"`). Informational —
     * not consumed by the version handshake. Captures the
     * monotonically-bumped marker the sister repo uses internally when
     * the address layout changes.
     */
    schemaMarker: z.string().optional(),
    /** Sister-repo `PLC_VERSION` (PLC firmware/runtime tag). */
    plcVersion: z.string().optional(),
    /**
     * Sister-repo `INTEGRATED_RELEASE_TAG`. Phase A this is identical
     * to `contractVersion` (same value, distinct field for forward
     * compatibility when the rails diverge).
     */
    integratedReleaseTag: z.string().optional(),
    /** All `PI_*` entries the runtime exposes. */
    entries: z.array(MailboxEntrySchema),
  })
  .superRefine((spec, ctx) => {
    const seenNames = new Set<string>();
    const seenAddresses = new Map<string, string>();
    for (let i = 0; i < spec.entries.length; i++) {
      const e = spec.entries[i]!;
      if (seenNames.has(e.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", i, "name"],
          message: `duplicate PI_* name: ${e.name}`,
        });
      }
      seenNames.add(e.name);
      const addrKey = `${e.kind}:${e.address}`;
      const prior = seenAddresses.get(addrKey);
      if (prior !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", i, "address"],
          message: `duplicate ${e.kind} address ${e.address}: ${prior} vs ${e.name}`,
        });
      }
      seenAddresses.set(addrKey, e.name);
    }
  });

export type ModbusEntryKind = z.infer<typeof ModbusEntryKindSchema>;
export type ScalarType = z.infer<typeof ScalarTypeSchema>;
export type MailboxEntry = z.infer<typeof MailboxEntrySchema>;
export type MailboxSpec = z.infer<typeof MailboxSpecSchema>;

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
