> **AI assistants — FIRST action**: before reading further, complete the
> apparatus self-check in [`AGENTS.md`](AGENTS.md) at the repo root. If the
> umbraculum-toolset Cursor plugin pack is not loaded into your session,
> stop and report this to the user before continuing — see `AGENTS.md` for
> the soft-block protocol and [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md)
> for the install procedure.

## Development guide (read first)

This file is a **high-signal index + policy** for working in this repo. It intentionally avoids long command blocks; detailed runbooks live as **Skills** inside the umbraculum-toolset Cursor plugin pack (see [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md)), and specialized **subagents** ship in the same plugins.

If a `DEVELOPMENT-LOCAL.md` exists at the repo root, read it immediately after this file for per-developer parameters (containers, paths, defaults). It is per-developer and gitignored. To bootstrap one from this file, ask the agent: *"create my DEVELOPMENT-LOCAL.md"* — that invokes the `generate-development-local` skill from `umbraculum-toolset-common`.

## Foundation reading (the project-wide context)

These docs are the project's load-bearing references. Read them before broad work in this repo:

- [`MANIFESTO.md`](MANIFESTO.md) — the project's stated values and the AI-orchestrated-code discipline (§1.2).
- [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) — vision, audit, target architecture, AI consultant blueprint, go-public path.
- [`docs/FOUNDATION-HARDENING.md`](docs/FOUNDATION-HARDENING.md) — the four-slice (lint + types + tests + docs) discipline this repo enforces.
- [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](docs/CONTRACTS-VALIDATION-STRATEGY.md) — Zod v4 contract-validation strategy across `packages/*-contracts/` and `services/api/`.
- [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md) — TS/JS coding conventions.
- [`docs/TESTING.md`](docs/TESTING.md) — test layer map (unit / integration / contract / E2E) and per-language conventions.
- [`docs/LINTING.md`](docs/LINTING.md) — ESLint flat-config policy.
- [`docs/MODULES.md`](docs/MODULES.md) — module/vertical surface map.
- [`docs/DOCS-README-STANDARDS.md`](docs/DOCS-README-STANDARDS.md) — module-README authoring standard.
- [`docs/NATIVE-STRATEGY-AND-CI.md`](docs/NATIVE-STRATEGY-AND-CI.md) — native app build + CI strategy.

## Policies (apply by default)

- **Node / npm container-only.** Do not run `node` / `npm` / `npx` on the host for project commands. Run inside the `api` or `web` containers via `docker compose exec -T <service> ...`. See the `node-npm-container-only` skill.
- **TypeScript strict everywhere.** All non-gated workspaces must compile with the six strict flags set and `tsc --noEmit` green. Verify via the `types-baseline-verifier` subagent. See the `typescript-strict-flag-verification` skill and [`docs/FOUNDATION-HARDENING.md`](docs/FOUNDATION-HARDENING.md).
- **Contract validation via Zod v4.** Schema-first declaration (`z.object/...`); type inference (`z.infer<typeof S>`); backward-compat via `z.preprocess()`; soft-tolerance via `z.transform()`; structured errors via `ZodError.issues[]`. Hand-rolled `is(): v is X` type guards are forbidden under `packages/*-contracts/src/**`. Verify via the `contracts-zod-auditor` subagent. See [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](docs/CONTRACTS-VALIDATION-STRATEGY.md), the `zod-schema-scaffold` skill, and the `22-typescript-contracts-runtime-validation` rule.
- **Module READMEs follow the canonical template.** All `apps/*/README.md`, `services/*/README.md`, `packages/*/README.md` pass the structural + link checks. Verify via the `module-readme-checker` subagent. See [`docs/DOCS-README-STANDARDS.md`](docs/DOCS-README-STANDARDS.md) and the `module-readme-verification` skill.
- **Workspace-scoped routes need L2 isolation tests.** Any new route under `services/api/src/routes/**` that is workspace-scoped requires the canonical 6-axis L2 cross-workspace isolation test. See the `l2-cross-workspace-isolation-test` skill.
- **CI parity over local-only signals.** Local lint/typecheck can lie via three documented divergence mechanisms. Reproduce CI in a clean `git archive HEAD` snapshot before claiming green on docs / lint / typecheck. See the `ci-parity-local-reproduction` skill and the `72-ci-parity-local-vs-ci-divergence` rule.
- **Public-endpoint verification gate.** After any non-doc change to a service with a reachable URL/API, verify against the running endpoint before declaring done. Passing tests are not sufficient evidence. See the `public-endpoint-verification` skill and the `45-public-endpoint-verification` rule.
- **No hardcoded paths in E2E.** Playwright flows must avoid hardcoded navigation paths. See the `30-e2e-no-hardcoded-paths` rule.
- **Prefer fixing regressions over weakening tests.** If a refactor breaks rendering or contracts, fix the app wiring/config first. Only adjust tests for determinism when the requirement itself did not change.
- **Tests follow changes.** After non-trivial code changes, run the matching test layer and keep it green. See [`docs/TESTING.md`](docs/TESTING.md) for the unit / integration / contract / E2E layer map and the `20-tests-must-follow-changes` rule.
- **Commit messages carry the active ticket prefix** (Jira-style) so Bitbucket / GitHub / Jira smart-commit integrations link the commit to the matching ticket. See the `41-commit-message-ticket-prefix` rule from `umbraculum-toolset-common`.
- **DCO sign-off on every commit.** `git commit -s` is required — see [`CONTRIBUTING.md`](CONTRIBUTING.md) §"Developer Certificate of Origin (DCO)".

## Subagents (umbraculum-toolset plugin pack)

Cursor's main agent will delegate to these automatically based on their `description` field; you can also invoke explicitly with `/<name>`. All read-only unless noted.

| Subagent | From plugin | Role |
|---|---|---|
| `verifier` | `umbraculum-node-react-cursor-assistant` | Skeptical validator. Use proactively before declaring a fix complete (confirms public-endpoint verification + unit / integration tests are clean). |
| `contracts-zod-auditor` | `umbraculum-node-react-cursor-assistant` | Validation-slice auditor. Use after editing `packages/*-contracts/src/**` or adding a schema-bound route under `services/api/src/routes/**`. |
| `e2e-smoke` | `umbraculum-node-react-cursor-assistant` | Bounded agentic E2E control-panel run after risky frontend changes. Signal-only, background, fast. |
| `types-baseline-verifier` | `umbraculum-platform-tsjs-cursor-assistant` | Confirms `tsc --noEmit` green + six strict flags set for the affected workspace. Use after tsconfig edits or strict-flag-related refactors. |
| `module-readme-checker` | `umbraculum-platform-tsjs-cursor-assistant` | Wraps `scripts/docs/check-readmes.py` for a bounded OK / FAIL on affected module READMEs. |

For local-model (Ollama) variants of any shipped subagent, see [`DEVELOPMENT-LOCAL-MODELS-DELEGATION.md`](DEVELOPMENT-LOCAL-MODELS-DELEGATION.md) and [`DEVELOPMENT-LOCAL-OLLAMA.md`](DEVELOPMENT-LOCAL-OLLAMA.md) (project-versioned addenda for the local-model runtime profile).

## Skills (highest-signal runbooks)

The full skill inventory is per-plugin (see each plugin's `skills/` folder, indexed in [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md)). The most frequently-invoked:

- **`generate-development-local`** (toolset-common) — bootstrap `DEVELOPMENT-LOCAL.md` from this file.
- **`typescript-strict-flag-verification`** (platform-tsjs) — `tsc --noEmit` + strict-flag check.
- **`module-readme-verification`** (platform-tsjs) — module-README structural + link check.
- **`l2-cross-workspace-isolation-test`** (platform-tsjs) — scaffold the 6-axis L2 test for new workspace-scoped routes.
- **`package-scope-migration-preflight`** (platform-tsjs) — inventory + classification + hard-stop flags before any package-scope rename.
- **`zod-schema-scaffold`** (node-react) — emit the canonical Zod schema + paired test template for a new contract file.
- **`ci-parity-local-reproduction`** (node-react) — reproduce CI static-analysis in a clean `git archive HEAD` snapshot.
- **`public-endpoint-verification`** (node-react) — verify a TS/JS web app or API endpoint against the running service.
- **`build-workspace-packages-dist-in-container`** (node-react) — build workspace package `dist/` outputs inside the correct container.
- **`node-npm-container-only`** (node-react) — run Node / npm tasks inside the API or web container.
- **`playwright-runner-docs-gate`** (node-react) — pre-flight before touching `e2e/playwright/**`.
- **`docker-compose-debugging`** (node-react) — diagnose Docker Compose errors (interpolation, parse issues).
- **`cursor-tmp-scripts-and-logs`** (node-react) — robust one-off helper scripts in containerized repos.

## When in doubt

- Start with [`MANIFESTO.md`](MANIFESTO.md) and [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md).
- For contracts work: [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](docs/CONTRACTS-VALIDATION-STRATEGY.md).
- For the four-slice lint + types + tests + docs discipline: [`docs/FOUNDATION-HARDENING.md`](docs/FOUNDATION-HARDENING.md).
- For module-README authoring: [`docs/DOCS-README-STANDARDS.md`](docs/DOCS-README-STANDARDS.md).
- For native + CI strategy: [`docs/NATIVE-STRATEGY-AND-CI.md`](docs/NATIVE-STRATEGY-AND-CI.md).
- For "how do I install / verify the apparatus": [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) and [`AGENTS.md`](AGENTS.md).
