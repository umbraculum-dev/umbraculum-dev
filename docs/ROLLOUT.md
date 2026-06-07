# Testing scaffolding — rollout plan

Companion to [docs/TESTING.md](TESTING.md). `TESTING.md` answers "what do I test, where, and how"; this file answers "how do we land the L1-L6 scaffolding without surprising anybody".

This file has two independent scopes:
1. **Brewery scaffolding** (vitest in shared packages, smoke + seeder, API CI workflow, Playwright suite, `@umbraculum/test-mcp`, agentic-browser jobs).
2. **umbraculum-toolset plugin-pack adoption** for the generic test-following rule and the two reusable testing skills (`agentic-browser-web-app`, `test-mcp-server`).

They're independent: brewery scaffolding works as repo-local test infrastructure; the Cursor plugin pack only controls how AI assistants discover and follow the corresponding guardrails.

---

## Scope 1 — Brewery scaffolding

### Slice strategy

Each phase was built to be mergeable on its own. Recommended slice order = phase order (cheapest+most-foundational first). At any slice, you can stop and the repo still works.

| Slice | Files | Risk | Reversibility | Value if merged alone |
|---|---|---|---|---|
| **S1 — Docs + rule pre-align** | `docs/TESTING.md`, `docs/TESTING-DECISION.md`, `docs/AGENTIC-JOBS.md`, `docs/ROLLOUT.md`, `CURSOR-RULES-SKILLS-TODO.md`, packages/platform/test-mcp/README + src comment updates, `apps/web/e2e/brewday/recipe-create.spec.ts` + `apps/web/e2e/support/locators.ts` comment updates. (`.cursor/*` is gitignored.) | Zero (docs only) | Trivial (revert .md files) | Policy is now written; agent already starts proposing test diffs |
| **S2 — L1 unit** | `packages/platform/contracts/vitest.config.ts`, `packages/platform/contracts/src/**/*.test.ts`, `packages/verticals/brewery/core/vitest.config.ts`, `packages/verticals/brewery/core/src/**/*.test.ts`, packages' `package.json` dev-dep + `test` script, root `test:packages`/`test:all` scripts | Very low (vitest added as dev dep; existing runtime code untouched) | `npm uninstall vitest -w ...` | L1 layer functional |
| **S3 — L3 smoke + seeder** | `scripts/smoke.sh`, `services/api/src/cli/seedE2eFixture.ts`, `services/api/package.json` (`seed:e2e` script), root `smoke`/`seed:e2e` scripts | Low (idempotent seeder; only writes `e2e-*` rows) | `npm run seed:e2e -- --clean` | L3 functional; manual stack-up workflows get a `./scripts/smoke.sh` gate |
| **S4 — L2 + L4 + CI gate** | `.github/workflows/api.yml`, `services/api/package.json` (`test:db:prepare`, `contracts:check`, `contracts:update`), `services/api/src/tests/contracts/**` | **Medium** — CI becomes blocking on PRs touching `services/api/**` or `packages/**` | Disable the workflow file | L1+L2+L4 gate every PR; biggest payoff |
| **S5 — L5 Playwright** | `apps/web/e2e/**`, `apps/web/e2e/.gitignore`, `apps/web/e2e/README.md` | Low (separate workspace; nothing imports from it) | Delete the directory | L5 reproducible locally via `docker run` |
| **S6 — `@umbraculum/test-mcp`** | `packages/platform/test-mcp/**` + workspace registration | Low (new package; opt-in for agentic surface) | Remove the package | Lets agents one-shot smoke/seed/run without re-implementing |

Natural stopping point: **after S4**. That's the "deterministic CI gate is in place" moment. S5+S6 are amplifiers.

### Per-slice verification gate

Before considering a slice done, verify it works **locally** (no merge required — `40-workflow-and-navigation.mdc` says don't commit by default).

- **S1**: docs render OK; rule appears in editor preview.
- **S2**: `docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc "npm install --workspaces --include-workspace-root --no-audit --no-fund && npm run test:packages"` → green.
- **S3**: stack up → `docker compose exec api npm run seed:e2e` → `./scripts/smoke.sh` exit 0. Then `npm run seed:e2e` again (idempotency check — second run reports "already present").
- **S4**: open a no-op PR touching `services/api/src/**` (e.g. comment) on a throwaway branch → workflow runs → both jobs green. Revert.
- **S5**: `docker run --rm --network host -v "$PWD/apps/web/e2e:/e2e" -w /e2e mcr.microsoft.com/playwright:v1.60.0-noble bash -lc "npm install --no-audit --no-fund && npx playwright test --project=smoke"` → green.
- **S6**: `cd packages/platform/test-mcp && npm install && npm run start`; `curl -fsS http://localhost:8932/` lists tools; `curl -fsS -X POST http://localhost:8932/smokeStack -H 'content-type: application/json' --data '{}'` returns `runDir` + `pass`.

### Out of scope (deliberately, for now)

- `apps/native` E2E (Detox/Maestro).
- Load/perf testing.
- Visual regression (axe handles a11y; no pixel diffs).
- Cross-browser Playwright (only Chromium in `smoke` project).

Add later as separate phases when they earn their cost.

---

## Scope 2 — umbraculum-toolset plugin-pack adoption

### Install / verify path

The generic AI-assistant guardrails for this rollout now ship via the Cursor plugin pack, not via in-repo `.cursor/` sync:

- `20-tests-must-follow-changes.mdc` ships with `umbraculum-node-react-cursor-assistant`.
- `agentic-browser-web-app` ships with `umbraculum-node-react-cursor-assistant` under `skills/agentic-browser-web-app/SKILL.md`.
- `test-mcp-server` ships with `umbraculum-node-react-cursor-assistant` under `skills/test-mcp-server/SKILL.md`.

Install / refresh the plugin pack using [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md). Every non-trivial Cursor session in this repo verifies the required witnesses through the [`AGENTS.md`](../AGENTS.md) apparatus self-check.

### What changes for consumer DX

- `20-tests-must-follow-changes.mdc` is `alwaysApply: true`. Its TS/JS monorepo section is a prompt-time guardrail for all repos that install the plugin pack. It is harmless for Magento-only consumers because the table starts with "if your monorepo has apps/services/packages".
- The two skills are discoverable but not always-on, so there is zero behavior change unless the agent looks them up for a testing task.

### Troubleshooting / rollback

Plugin rollback is handled by disabling or reverting the plugin install in Cursor, not by running an npm package-sync cleanup. Brewery's project-local files in `docs/AGENTIC-JOBS.md` and `packages/platform/test-mcp/` are unaffected by plugin enablement either way.

Repo-local `.cursor/rules/` remains available only as the troubleshooting fallback documented in [`AGENTS.md`](../AGENTS.md): if a plugin-shipped `alwaysApply: true` rule is present but not reliably enforced, copy that rule from `~/.cursor/plugins/local/<plugin-name>/rules/` into `.cursor/rules/` and report the enforcement gap upstream.

---

## End-to-end verification chain

When the stack is up, this is the sequence — each step gates the next.

1. **Stack health**

   ```bash
   docker compose up -d
   docker compose ps   # expect web, api, nginx, postgres, redis healthy
   ```

2. **Seed fixture** (idempotent)

   ```bash
   docker compose exec api npm run seed:e2e
   ```

3. **L3 smoke**

   ```bash
   ./scripts/smoke.sh   # exit 0 required before anything else
   ```

4. **L1 unit** (node container, no host npm)

   ```bash
   docker run --rm -v "$PWD:/repo" -w /repo node:20-slim \
     bash -lc "npm install --workspaces --include-workspace-root --no-audit --no-fund && npm run test:packages"
   ```

5. **L2 API integration** (uses `brewapp_test` inside the api container)

   ```bash
   docker compose exec api npm test
   ```

6. **L4 contract snapshots**

   ```bash
   docker compose exec api npm run contracts:check
   ```

7. **L5 Playwright smoke** (one-shot container, no compose edits)

   ```bash
   docker run --rm --network host \
     -v "$PWD/apps/web/e2e:/e2e" -w /e2e \
     mcr.microsoft.com/playwright:v1.60.0-noble \
     bash -lc "npm install --no-audit --no-fund && npx playwright test --project=smoke"
   ```

8. **`@umbraculum/test-mcp` reachable** (optional but valuable)

   ```bash
   curl -fsS http://localhost:8932/
   curl -fsS -X POST http://localhost:8932/smokeStack -H 'content-type: application/json' --data '{}'
   ```

9. **L6 agentic — one job, one persona, one run** (on demand)

   - Pick one job from [`docs/AGENTIC-JOBS.md`](AGENTIC-JOBS.md) (`agenticWaterCalcSanity` is the safest — no DB writes).
  - Drive it via Cursor's integrated browser following the `agentic-browser-web-app` skill shipped by `umbraculum-node-react-cursor-assistant`.
   - Confirm `var/test-runs/<ts>-agenticWaterCalcSanity/verdict.txt` says `pass`.

If any step is red, [`docs/TESTING.md`](TESTING.md) § "What to do when a test fails" has the decision tree.

---

## Risks / exit ramps

| Concern | Mitigation |
|---|---|
| S4 (CI workflow) gates PRs that currently merge without it | Land the workflow first on a feature branch; observe a few PRs; flip to "required" only once stable. |
| Playwright image (`v1.50.0-noble`) is heavy (~2 GB) | One-shot pull only; CI caches by tag. Not run by `compose up`. |
| Agentic L6 burns expensive tokens | [`docs/TESTING.md`](TESTING.md) § "How layers reinforce each other" already requires green L1-L5 first; the plugin-shipped skill bakes "signal-only" into the contract. |
| Plugin-pack update misbehaves on another team's repo | Disable/revert the plugin update in Cursor while the plugin-source fix lands; repo-local `.cursor/rules/` copies are fallback-only for troubleshooting observed `alwaysApply` enforcement gaps. |
| E2E persona password drift (env `E2E_ADMIN_PASSWORD`) between dev and CI | Documented in [`docs/TESTING.md`](TESTING.md) fixture identities table; smoke gives a precise "wrong password" message. |

---

## Recommended order of operations

1. **Don't commit anything yet.** Bring the stack up and run the End-to-end verification chain. That's the only thing that proves the work is real.
2. If chain step 4 (L1 unit) fails — most likely failure mode — root-cause in the test files **before** committing anything.
3. If chain steps 1-7 all green: slice into **S1+S2+S3** commit, then **S4** separately, then **S5+S6** separately. Three reviewable units, none coupled to the others.
4. For plugin-pack changes: verify the relevant witness rule / skill is available in the installed plugin, then run the same end-to-end chain against this repo before asking other teams to update.
5. Hold off on agentic L6 until you actually need it — it's there, but it's the most expensive layer to operate.

---

## Note: file relocations after this rollout

The S1 row above (and a few §S1-related references elsewhere) names `CURSOR-RULES-SKILLS-TODO.md` at the repo root, which is where it lived at the time of the S1 slice. As of the 2026-05-18 docs hygiene pass, that file (and the other repo-root TODO scratchpads) moved to `internal/working-notes/CURSOR-RULES-SKILLS-TODO.md`. The historical S1 narrative is intentionally preserved as-written; cite the new path when working with the file today.
