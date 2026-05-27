# Plan documentation context — template

**Tier:** Public  
**Status:** Authoring template for Cursor `.plan.md` and multi-phase execution plans  
**Audience:** plan authors (human or frontier agent), non-frontier executors  

Copy the section below into feature plans. Use **repo-relative markdown links** so links render on GitHub and the future docs site.

---

## Documentation context (required)

| Role | Document |
|------|----------|
| Governing RFC | [RFC-0007](../rfcs/0007-canonical-document-rendering.md) — §12 implementation closure |
| Horizontal surface | [canonical-document-rendering-surface.md](canonical-document-rendering-surface.md) |
| Module surface | [canonical-mrp-module-surface.md](canonical-mrp-module-surface.md) §11 |
| Reference consumer | PIM PR7 — [canonical-pim-module-surface.md](canonical-pim-module-surface.md) §8.3 |
| Build log pattern | [mrp-crp-wave-5-ai-planning-advisor-build-log.md](mrp-crp-wave-5-ai-planning-advisor-build-log.md) |
| Plugin rules | `22-typescript-contracts-runtime-validation.mdc`, `45-public-endpoint-verification.mdc`, `48-rfc-companion-documentation-gate.mdc` |
| Non-frontier traps | [NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) §10 |
| Runbook | [DEVELOPMENT.md](../../DEVELOPMENT.md) — container npm, rendering stack (Gotenberg + Redis) |

**Rules:**

- Cite **§ numbers** for long RFCs and surface docs.  
- Cite **plugin rules by filename** (witness contract in [`CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md)).  
- For file paths in executor instructions, use canonical absolute paths per `97-plans-must-include-canonical-absolute-paths.mdc`.  
- When the plan adds `documentTemplates`, include updating [canonical-document-rendering-surface.md](canonical-document-rendering-surface.md) §2 in the same wave.

**Worked example:** Cursor plan `mrp_crp_wave_6_9475516e.plan.md` (author-local; not in-repo — retrofit section).
