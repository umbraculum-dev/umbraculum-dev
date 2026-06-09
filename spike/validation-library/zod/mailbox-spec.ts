/**
 * Zod v4 equivalent of packages/canonical/automation/contracts/src/mailbox-data.ts.
 *
 * Paper-design spike per docs/rfcs/0003-validation-library-adoption.md §15.
 * Replaces ~115 lines of hand-rolled assertEntry + assertSpec with a single
 * schema declaration. Drift-detection (duplicate names, duplicate addresses)
 * is expressed via superRefine — same guarantees, smaller code surface.
 */
import { z } from "zod";

const ModbusEntryKindSchema = z.enum([
  "coil",
  "discrete_input",
  "input_register",
  "holding_register",
]);

const ScalarTypeSchema = z.enum([
  "bool",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "float",
]);

const MailboxEntrySchema = z
  .object({
    name: z.string().regex(/^PI_/, "expected PI_* name"),
    address: z.number().int().nonnegative(),
    kind: ModbusEntryKindSchema,
    scalar: ScalarTypeSchema,
    scale: z.number().optional(),
    unit: z.string().optional(),
    writable: z.boolean(),
    description: z.string(),
  })
  .readonly();

export const MailboxSpecSchema = z
  .object({
    contractVersion: z.string().min(1),
    schemaMarker: z.string().optional(),
    plcVersion: z.string().optional(),
    integratedReleaseTag: z.string().optional(),
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

export type MailboxEntry = z.infer<typeof MailboxEntrySchema>;
export type MailboxSpec = z.infer<typeof MailboxSpecSchema>;

/**
 * Parse + freeze the mailbox JSON. Equivalent of the existing
 * `MAILBOX_SPEC` const at module-load time. Mirror script
 * (`scripts/sync-automation-mailbox-mirror.sh`) is unchanged.
 */
export function loadMailboxSpec(raw: unknown): MailboxSpec {
  return Object.freeze(MailboxSpecSchema.parse(raw));
}
