/**
 * Valibot equivalent of packages/automation-contracts/src/mailbox-data.ts.
 *
 * Paper-design spike per docs/rfcs/0003-validation-library-adoption.md §15
 * — comparison axis to the Zod v4 implementation in
 * spike/validation-library/zod/mailbox-spec.ts.
 *
 * Pattern notes:
 *  - Valibot composes via v.pipe(...) instead of method chaining.
 *  - Duplicate detection uses v.check on the parent schema, forwarding
 *    errors to the entries[index].(name|address) path.
 *  - Slightly more imports than Zod (one per primitive transformer) but
 *    each is tree-shaken individually — bundle-friendly.
 */
import {
  array,
  boolean,
  check,
  enum_,
  forward,
  literal,
  minLength,
  minValue,
  nonNullable,
  number,
  object,
  optional,
  pipe,
  regex,
  string,
  type InferOutput,
} from "valibot";

const ModbusEntryKindSchema = enum_({
  coil: "coil",
  discrete_input: "discrete_input",
  input_register: "input_register",
  holding_register: "holding_register",
});

const ScalarTypeSchema = enum_({
  bool: "bool",
  int16: "int16",
  uint16: "uint16",
  int32: "int32",
  uint32: "uint32",
  float: "float",
});

const MailboxEntrySchema = object({
  name: pipe(string(), regex(/^PI_/, "expected PI_* name")),
  address: pipe(number(), minValue(0)),
  kind: ModbusEntryKindSchema,
  scalar: ScalarTypeSchema,
  scale: optional(number()),
  unit: optional(string()),
  writable: boolean(),
  description: string(),
});

const baseMailboxSpec = object({
  contractVersion: pipe(string(), minLength(1)),
  schemaMarker: optional(string()),
  plcVersion: optional(string()),
  integratedReleaseTag: optional(string()),
  entries: array(MailboxEntrySchema),
});

export const MailboxSpecSchema = pipe(
  baseMailboxSpec,
  forward(
    check((spec) => {
      const names = new Set<string>();
      for (const e of spec.entries) {
        if (names.has(e.name)) return false;
        names.add(e.name);
      }
      return true;
    }, "duplicate PI_* name in entries"),
    ["entries"],
  ),
  forward(
    check((spec) => {
      const addrs = new Map<string, string>();
      for (const e of spec.entries) {
        const k = `${e.kind}:${e.address}`;
        if (addrs.has(k)) return false;
        addrs.set(k, e.name);
      }
      return true;
    }, "duplicate Modbus address in entries (same kind)"),
    ["entries"],
  ),
);

// Marker to keep nonNullable import in the bundle (avoids ESM tree-shake
// from erasing transformers we want measured). In real migration we'd
// retire this — including here only to make the bundle measurement
// representative of "schema authored with full toolkit available".
const _markerSchema = nonNullable(string());
void _markerSchema;
// literal kept for symmetry with zod/mailbox-spec.ts (no actual literal in
// MAILBOX_SPEC; mash-acid-block uses literals).
const _literalMarker = literal("v1");
void _literalMarker;

export type MailboxEntry = InferOutput<typeof MailboxEntrySchema>;
export type MailboxSpec = InferOutput<typeof MailboxSpecSchema>;

import { parse } from "valibot";

export function loadMailboxSpec(raw: unknown): MailboxSpec {
  return Object.freeze(parse(MailboxSpecSchema, raw)) as MailboxSpec;
}
