/**
 * Typed mirror of the sister-repo mailbox artifact.
 *
 * The JSON file at `data/mailbox.json` is a byte-for-byte mirror of
 * `out/mailbox.json` emitted by the sister repo
 * `brewery-alarms-tanks-supervisor` (`tools/build_mailbox_artifact.py`).
 *
 * This module:
 *   1. Imports the JSON via TypeScript's `resolveJsonModule`.
 *   2. Runs a structural validator at module-load time (loud failure on
 *      drift — better than a confusing runtime exception deep in an
 *      adapter).
 *   3. Re-exports it as `MAILBOX_SPEC`, typed as `MailboxSpec`.
 *
 * Refresh procedure: `bash scripts/sync-automation-mailbox-mirror.sh`
 * (copies the sister-repo `out/mailbox.json` into `data/mailbox.json`).
 *
 * See: `docs/design/canonical-automation-module-surface.md` §12.2 (M2
 * mirror mechanism), §12.5 step 5.
 */
import type {
  MailboxEntry,
  MailboxSpec,
  ModbusEntryKind,
  ScalarType,
} from "./mailbox.js";
import mailboxData from "../data/mailbox.json";

const VALID_KINDS: ReadonlySet<ModbusEntryKind> = new Set<ModbusEntryKind>([
  "coil",
  "discrete_input",
  "input_register",
  "holding_register",
]);

const VALID_SCALARS: ReadonlySet<ScalarType> = new Set<ScalarType>([
  "bool",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "float",
]);

class MailboxMirrorError extends Error {
  override readonly name = "MailboxMirrorError";
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function assertEntry(raw: unknown, idx: number): MailboxEntry {
  if (!isPlainObject(raw)) {
    throw new MailboxMirrorError(
      `entries[${idx}]: expected object, got ${typeof raw}`,
    );
  }
  const name = raw["name"];
  if (typeof name !== "string" || !name.startsWith("PI_")) {
    throw new MailboxMirrorError(
      `entries[${idx}].name: expected string starting with "PI_", got ${JSON.stringify(name)}`,
    );
  }
  const address = raw["address"];
  if (typeof address !== "number" || !Number.isInteger(address) || address < 0) {
    throw new MailboxMirrorError(
      `entries[${idx}] (${name}).address: expected non-negative integer, got ${JSON.stringify(address)}`,
    );
  }
  const kind = raw["kind"];
  if (typeof kind !== "string" || !VALID_KINDS.has(kind as ModbusEntryKind)) {
    throw new MailboxMirrorError(
      `entries[${idx}] (${name}).kind: expected one of ${[...VALID_KINDS].join("|")}, got ${JSON.stringify(kind)}`,
    );
  }
  const scalar = raw["scalar"];
  if (typeof scalar !== "string" || !VALID_SCALARS.has(scalar as ScalarType)) {
    throw new MailboxMirrorError(
      `entries[${idx}] (${name}).scalar: expected one of ${[...VALID_SCALARS].join("|")}, got ${JSON.stringify(scalar)}`,
    );
  }
  const writable = raw["writable"];
  if (typeof writable !== "boolean") {
    throw new MailboxMirrorError(
      `entries[${idx}] (${name}).writable: expected boolean, got ${typeof writable}`,
    );
  }
  const description = raw["description"];
  if (typeof description !== "string") {
    throw new MailboxMirrorError(
      `entries[${idx}] (${name}).description: expected string, got ${typeof description}`,
    );
  }
  // Optional fields (exactOptionalPropertyTypes: omit if absent rather than set to undefined).
  const entry: MailboxEntry = {
    name,
    address,
    kind: kind as ModbusEntryKind,
    scalar: scalar as ScalarType,
    writable,
    description,
    ...(typeof raw["scale"] === "number" ? { scale: raw["scale"] } : {}),
    ...(typeof raw["unit"] === "string" ? { unit: raw["unit"] } : {}),
  };
  return entry;
}

function assertSpec(raw: unknown): MailboxSpec {
  if (!isPlainObject(raw)) {
    throw new MailboxMirrorError(
      `top-level: expected object, got ${typeof raw}`,
    );
  }
  const contractVersion = raw["contractVersion"];
  if (typeof contractVersion !== "string" || contractVersion.length === 0) {
    throw new MailboxMirrorError(
      `contractVersion: expected non-empty string, got ${JSON.stringify(contractVersion)}`,
    );
  }
  const entriesRaw = raw["entries"];
  if (!Array.isArray(entriesRaw)) {
    throw new MailboxMirrorError(
      `entries: expected array, got ${typeof entriesRaw}`,
    );
  }
  const entries: MailboxEntry[] = entriesRaw.map((e, i) => assertEntry(e, i));

  // Duplicate-detection — same checks the sister-repo emitter performs;
  // re-validated here so any drift in the mirror is caught at boot.
  const seenNames = new Set<string>();
  const seenAddresses = new Map<string, string>();
  for (const e of entries) {
    if (seenNames.has(e.name)) {
      throw new MailboxMirrorError(`duplicate PI_* name: ${e.name}`);
    }
    seenNames.add(e.name);
    const addrKey = `${e.kind}:${e.address}`;
    const prior = seenAddresses.get(addrKey);
    if (prior !== undefined) {
      throw new MailboxMirrorError(
        `duplicate ${e.kind} address ${e.address}: ${prior} vs ${e.name}`,
      );
    }
    seenAddresses.set(addrKey, e.name);
  }

  const spec: MailboxSpec = {
    contractVersion,
    entries,
    ...(typeof raw["schemaMarker"] === "string" ? { schemaMarker: raw["schemaMarker"] } : {}),
    ...(typeof raw["plcVersion"] === "string" ? { plcVersion: raw["plcVersion"] } : {}),
    ...(typeof raw["integratedReleaseTag"] === "string"
      ? { integratedReleaseTag: raw["integratedReleaseTag"] }
      : {}),
  };
  return spec;
}

/**
 * Validated, frozen mirror of the sister-repo mailbox artifact.
 *
 * Adapters and tests should consume this constant rather than reading
 * `data/mailbox.json` directly. Drift is caught at module-load time
 * with a `MailboxMirrorError`.
 */
export const MAILBOX_SPEC: MailboxSpec = Object.freeze(assertSpec(mailboxData));
