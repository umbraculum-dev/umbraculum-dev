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

---

## Local verification before push (required)

Copy and **strike** rows that do not apply to this plan. At plan completion, add matching YAML `todos` (see rule `49-plan-documentation-context.mdc`).

**Executor rule:** run pertinent rows before push — not every GHA workflow. T0/T1 during implementation; T2 before push.

| Change surface (this plan) | Before done (T0/T1) | Before push (T2) | GHA workflow(s) |
|----------------------------|---------------------|------------------|-----------------|
| Docs / README only | — | `npx @umbraculum/ci-parity run --jobs docs-readmes` | `docs-readmes.yml` |
| TS/JS lint surface | `npm run verify:from-diff` or named slice | `npx @umbraculum/ci-parity run --jobs lint` | `web-lint.yml` |
| TS typecheck surface | scoped slice + `build-package-in-docker.sh` as needed | `npx @umbraculum/ci-parity run --jobs typecheck` | `typecheck.yml` |
| `services/api/**`, OpenAPI, contracts routes | `npm run verify:openapi` | ci-parity pertinent jobs **+** skill `api-integration-tests-pre-push` | `api.yml` + ci-parity |
| `packages/**` dist / SDK | `check-packages-dist-up-to-date.sh` | `npx @umbraculum/ci-parity run --jobs sdk-publish-prep` (when SDK batch) | `packages-dist-check.yml`, `publish-sdk-batch.yml` |
| Full unknown mixed diff | `npm run verify:from-diff` | `npm run verify:pre-push` | all ci-parity + API reminder |

**Skills:** `verify-slice-runbook`, `scoped-package-build-in-docker`, `ci-parity-local-reproduction`, `api-integration-tests-pre-push`, `docker-npm-volumes-runbook`.

**Plan YAML todos (required at plan completion):**

```yaml
todos:
  - id: verify-t1-openapi
    content: "T1: npm run verify:openapi (or verify:from-diff)"
  - id: verify-t2-ci-parity
    content: "T2: npx @umbraculum/ci-parity run --jobs lint,typecheck"
  - id: verify-t2-api
    content: "T2: api-integration-tests-pre-push when services/api/** changed"
```
