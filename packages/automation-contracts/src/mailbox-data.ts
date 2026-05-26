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
import { type MailboxSpec, MailboxSpecSchema } from "./mailbox.js";
import mailboxData from "../data/mailbox.json";

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
export const MAILBOX_SPEC: MailboxSpec = Object.freeze(
  MailboxSpecSchema.parse(mailboxData),
);
