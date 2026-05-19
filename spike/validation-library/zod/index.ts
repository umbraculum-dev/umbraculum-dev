/**
 * Aggregating entry point for the Zod spike bundle measurement
 * (npm run bundle:zod). Re-exports the three spike contracts so the
 * bundle reflects realistic consumer surface, not just one schema.
 */
export { MailboxSpecSchema, loadMailboxSpec } from "./mailbox-spec.js";
export type { MailboxEntry, MailboxSpec } from "./mailbox-spec.js";
export { MashAcidComputeBlockSchema } from "./parse-mash-acid-block.js";
export type { MashAcidComputeBlock } from "./parse-mash-acid-block.js";
export { signupRouteZod } from "./auth-signup-route.js";
