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

## Cross-platform shape (web + native, one source of truth)

Umbraculum commits to **one source of truth shipping to both web and native almost out of the box** ([`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §1.1; [`MANIFESTO.md`](MANIFESTO.md) §2.2 reach-both-surfaces clause). That commitment is what selected Tamagui (one component tree → real DOM on web + real React Native on device — see [`docs/TAMAGUI.md`](docs/TAMAGUI.md) for the alternatives comparison and accepted-cost discipline) and what shapes the per-module β layout where `apps/native/src/modules/<code>/` is one of the four coordinated slices ([RFC-0002](docs/rfcs/0002-canonical-module-physical-layout.md) §3).

The native-facing operational docs form one bundle — read them together when touching `apps/native/**` or any cross-platform package (`packages/ui/`, `packages/recipes-ui/`, `packages/navigation/`, `packages/i18n-react/`, `packages/api-client/`, `packages/media/`):

- [`docs/NATIVE-STRATEGY-AND-CI.md`](docs/NATIVE-STRATEGY-AND-CI.md) — strategy, risk posture, optional CI (includes **EAS free-tier queue** expectations and when to use **native-eas-build** on GHA vs local `eas build`).
- [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](docs/DEVELOPMENT-NATIVE-LOCAL.md) — local dev (Metro, LAN-IP autodetect, troubleshooting).
- [`docs/REACT-NATIVE-KICKOFF-READINESS.md`](docs/REACT-NATIVE-KICKOFF-READINESS.md) — kickoff readiness criteria.
- [`docs/TAMAGUI.md`](docs/TAMAGUI.md) — Tamagui type-system caveats + adaptation strategy.
- [`apps/native/README.md`](apps/native/README.md) — the native app's own module README.

The module SDK ([`packages/module-sdk/README.md`](packages/module-sdk/README.md)) is **contract-only plus registration helpers** — native code does not live there. Per-module native screens, navigation entries, and native-only components live in `apps/native/src/modules/<code>/` (the native β slice from RFC-0002 §3); the SDK only owns the registration shape (`registerModule`, `registerWebModule`, and the future `registerNativeModule` exported from the same package per RFC-0002 §5).

## Path convention in docs

Public docs use **`$REPO_ROOT`** for the monorepo clone directory (for example `~/src/umbraculum-dev`). Set it once per shell: `export REPO_ROOT=~/src/umbraculum-dev`. Docker examples mount `-v "$REPO_ROOT:/repo"`. Per-developer paths belong in gitignored `DEVELOPMENT-LOCAL.md`, not in Tier: Public prose.

## Pre-push commands (T2 — contributors and agents)

Commit first; working tree clean. From repo root:

```bash
npm run verify:pre-push              # default before push (T2-PR)
npm run verify:pre-push:release      # manifest / SDK tags / ci-parity pin changes
npm run validate:gha-triggers        # when editing workflow paths: or trigger map
```

Inspect resolved jobs: `python3 scripts/lib/verify-slice.py --repo-root . resolve-gha-triggers --base origin/master`. WIP iteration only: `./scripts/ci-parity-check.sh run` (not push proof). **Do not** use `./scripts/ci-parity-check.sh --archive run` without `--jobs` as pre-push — use `npm run verify:pre-push`. See [`docs/CI-PARITY.md`](docs/CI-PARITY.md) § Pre-push commands reference and [`docs/VERIFICATION-TIERS.md`](docs/VERIFICATION-TIERS.md).

## Policies (apply by default)

- **Node / npm container-only.** Do not run `node` / `npm` / `npx` on the host for project commands. Run inside the `api` or `web` containers via `docker compose exec -T <service> ...`. See the `node-npm-container-only` skill.
- **npm persistence (Composer-like).** Dev installs use **named Docker volumes** for `node_modules` and a shared npm cache — not a full reinstall on every test. See [`docs/DEVELOPMENT-NPM-VOLUMES.md`](docs/DEVELOPMENT-NPM-VOLUMES.md). One-shots: `./scripts/docker-npm-run.sh`; package builds: `./scripts/build-package-in-docker.sh`.
- **Published SDK dogfood (contracts + api-client + module-sdk α batch).** Consumer manifests (`apps/web`, `apps/native`, `services/api`, `packages/rendering`) pin published `@umbraculum/*` packages at registry semver (`^0.0.1` / `^0.0.2` / `^0.1.1` per package); npm workspaces still symlink in-tree sources for active co-dev. Publisher packages (`packages/api-client`, `packages/module-sdk`) keep `file:` co-dev links. After each npm semver bump, run [`scripts/dogfood-npm-smoke.sh`](scripts/dogfood-npm-smoke.sh). Policy: [`docs/design/npm-sdk-monorepo-dogfood.md`](docs/design/npm-sdk-monorepo-dogfood.md).
- **External integrator sample.** Public sister repo [`umbraculum-integrator-sample`](https://github.com/umbraculum-dev/umbraculum-integrator-sample) mirrors [`scripts/integrator-bearer-smoke.mjs`](scripts/integrator-bearer-smoke.mjs). Sync `quickstart.mjs` when bearer smoke or published semver changes. Live verification: [`scripts/integrator-bearer-npm-smoke.sh`](scripts/integrator-bearer-npm-smoke.sh) (registry npm) and [`.github/workflows/integrator-live-smoke.yml`](.github/workflows/integrator-live-smoke.yml) (compose stack; **opt-in** — PR label `run-integrator-smoke` or manual workflow dispatch).
- **TypeScript strict everywhere.** All non-gated workspaces must compile with the six strict flags set and `tsc --noEmit` green. Verify via the `types-baseline-verifier` subagent. See the `typescript-strict-flag-verification` skill and [`docs/FOUNDATION-HARDENING.md`](docs/FOUNDATION-HARDENING.md).
- **Contract validation via Zod v4.** Schema-first declaration (`z.object/...`); type inference (`z.infer<typeof S>`); backward-compat via `z.preprocess()`; soft-tolerance via `z.transform()`; structured errors via `ZodError.issues[]`. Hand-rolled `is(): v is X` type guards are forbidden under `packages/*-contracts/src/**`. Verify via the `contracts-zod-auditor` subagent. See [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](docs/CONTRACTS-VALIDATION-STRATEGY.md), the `zod-schema-scaffold` skill, and the `22-typescript-contracts-runtime-validation` rule.
- **Module READMEs follow the canonical template.** All `apps/*/README.md`, `services/*/README.md`, `packages/*/README.md` pass the structural + link checks. Verify via the `module-readme-checker` subagent. See [`docs/DOCS-README-STANDARDS.md`](docs/DOCS-README-STANDARDS.md) and the `module-readme-verification` skill.
- **Workspace-scoped routes need L2 isolation tests.** Any new route under `services/api/src/routes/**` that is workspace-scoped requires the canonical 6-axis L2 cross-workspace isolation test. See the `l2-cross-workspace-isolation-test` skill.
- **CI parity over local-only signals.** Use **T1** slice verification while iterating (`npm run verify:from-diff` or a named `verify:*` script — see [`docs/VERIFICATION-TIERS.md`](docs/VERIFICATION-TIERS.md)). **Before pushing**, run **T2-PR**: commit first, then **`npm run verify:pre-push`** (path-aware parallel ci-parity on committed HEAD + auto API vitest when triggered). Use **`npm run verify:pre-push:release`** for manifest/SDK tag prep. **Do not** substitute bare `./scripts/ci-parity-check.sh --archive run` (no `--jobs`) — that runs all manifest jobs sequentially and skips native companions; see [`AGENTS.md`](AGENTS.md) § Pre-push CI parity. Use `./scripts/ci-parity-check.sh run` (`--ci`) only for WIP iteration, not as the push gate. See [`docs/CI-PARITY.md`](docs/CI-PARITY.md) § T2-PR vs T2-release and the `path-aware-pre-push` skill.
- **SOLID program (2026): closed.** Mechanical S waves and D enforcement (B5/WS5/WS6 via `lint`) are complete — do not schedule Wave 18+. See [`docs/design/solid-post-wave17-closure.md`](docs/design/solid-post-wave17-closure.md) and [`AGENTS.md`](AGENTS.md) § SOLID and dependency direction (D).
- **GitHub Actions: standard hosted runners by default.** New or edited workflows under `.github/workflows/` must use **standard** GitHub-hosted runners (`ubuntu-latest` unless the job truly needs Windows or macOS). Do **not** use [larger runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-larger-runners/about-larger-runners) or org-specific high-core labels without an explicit maintainer decision — they are **always billed**, even on public repositories ([GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)). On **public** repos, standard Linux runners incur **no minute charges**; on **private** repos, minutes count against the org plan. This repo’s workflows today all use `ubuntu-latest`; keep that pattern unless a runbook documents an exception.
- **Agents own pre-push verification** — do not tell the contributor to run ci-parity/lint before push; run [`AGENTS.md`](AGENTS.md) § “Pre-push CI parity” yourself. Touching `apps/native/app.config.js` or `metro.config.js` requires archive **`lint`** (same as `web-lint`) before push.
- **Agents own dev-stack health after ci-parity / API / nginx** — when **you** run ci-parity (especially archive), change `services/api/**` or nginx, or the user sees **502 on `/api/*`**, **you** run `docker compose restart api` then **`npm run smoke:stack`** before declaring the stack healthy or telling the user to test in the browser. Do not delegate that sequence. See [`AGENTS.md`](AGENTS.md) § “Dev stack health after ci-parity / API / nginx”.
- **EAS demo builds: free tier, monthly caps, slow queue.** Expo **Free** plan limits reset **each calendar month** (not unlimited): **~30 cloud builds** ( **≤15 Android** + **≤15 iOS** ), **1 concurrency**, plus **EAS Update** caps (**1,000 MAUs**, **100 GiB** bandwidth / month). [`native-eas-build`](.github/workflows/native-eas-build.yml) and local `eas build` also sit in the **free-tier queue** — long *waiting for worker* time is **acceptable** for occasional demo APKs, not a failed pipeline. **Private repo:** avoid holding **native-eas-build** open while queued (Actions minute burn). **Public repo:** manual GHA dispatch is fine on `ubuntu-latest`. Details: [`apps/native/EAS-DEMO-SETUP.md`](apps/native/EAS-DEMO-SETUP.md) § “Expo free tier”, [`docs/NATIVE-STRATEGY-AND-CI.md`](docs/NATIVE-STRATEGY-AND-CI.md) §5, [Expo billing FAQ](https://docs.expo.dev/billing/faq/).
- **Public-endpoint verification gate.** After any non-doc change to a service with a reachable URL/API, verify against the running endpoint before declaring done. Passing tests are not sufficient evidence. See the `public-endpoint-verification` skill and the `45-public-endpoint-verification` rule.
- **No hardcoded paths in E2E.** Playwright flows must avoid hardcoded navigation paths. See the `30-e2e-no-hardcoded-paths` rule.
- **Prefer fixing regressions over weakening tests.** If a refactor breaks rendering or contracts, fix the app wiring/config first. Only adjust tests for determinism when the requirement itself did not change.
- **Tests follow changes.** After non-trivial code changes, run the matching test layer and keep it green. See [`docs/TESTING.md`](docs/TESTING.md) for the unit / integration / contract / E2E layer map and the `20-tests-must-follow-changes` rule.
- **Commit messages carry the active ticket prefix** (Jira-style) so Bitbucket / GitHub / Jira smart-commit integrations link the commit to the matching ticket. See the `41-commit-message-ticket-prefix` rule from `umbraculum-toolset-common`.
- **DCO sign-off on every commit.** `git commit -s` is required — see [`CONTRIBUTING.md`](CONTRIBUTING.md) §"Developer Certificate of Origin (DCO)".

## Release and version notation

- **Git release tags use a leading `v`**: the public repository baseline tag is `v0.0.1`, and future repository-level release tags should keep that shape (`vX.Y.Z`).
- **Package manifests use plain SemVer with no `v` prefix**: `package.json` `version` fields are `0.0.1`, `1.2.3`, etc. This is the npm-compatible form and applies to root/workspace package manifests.
- **Do not mix the two forms.** Never write `v0.0.1` into a `package.json` `version`, and do not create a duplicate Git tag named `0.0.1` for the same release.

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
- **`ci-parity-local-reproduction`** (node-react) — T2 static analysis; **pre-push default is `npm run verify:pre-push`** (path-aware parallel archive + companions). Use `./scripts/ci-parity-check.sh run` (`--ci`, working tree) for WIP only. Use `--archive` with explicit `--jobs` (or `--sha`) via the skill when debugging archive drift — not bare `--archive run` without `--jobs` for pre-push.
- **`verify-slice-runbook`** (node-react) — run T0/T1 verification for a named slice or git diff.
- **`scoped-package-build-in-docker`** (node-react) — rebuild one workspace `dist/` without full `build:packages`.
- **`api-integration-tests-pre-push`** (node-react) — T2 API vitest gate (separate from ci-parity).
- **`public-endpoint-verification`** (node-react) — verify a TS/JS web app or API endpoint against the running service.
- **`build-workspace-packages-dist-in-container`** (node-react) — full `build:packages` fallback inside Docker.
- **`node-npm-container-only`** (node-react) — run Node / npm tasks inside the API or web container.
- **`playwright-runner-docs-gate`** (node-react) — pre-flight before touching `e2e/playwright/**`.
- **`docker-compose-debugging`** (node-react) — diagnose Docker Compose errors (interpolation, parse issues).
- **`cursor-tmp-scripts-and-logs`** (node-react) — robust one-off helper scripts in containerized repos.

## Postgres + pgvector (AI RAG)

Dev and CI Postgres services use **`pgvector/pgvector:pg16`**, not stock `postgres:16`, because Layer C RAG (post-α H2 D1) requires the `vector` extension for `ai.doc_chunks`. This is a structural requirement documented in [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md) §3 gaps / §4.3 Layer C and [`docs/design/canonical-ai-rag-surface.md`](docs/design/canonical-ai-rag-surface.md).

- **Upgrading a long-running dev stack:** `docker compose pull postgres postgres-replica && docker compose up -d --force-recreate postgres postgres-replica` then `docker compose exec -T api npx prisma migrate deploy` — **preserves** data on existing `pgdata` volumes; does not run `migrate reset`.
- **RAG ingest:** after migrations, populate chunks:

  ```bash
  docker compose exec -T api npm run rag:ingest
  ```

  Optional: set `AI_RAG_INGEST_ON_BOOT=1` on the `api` service to re-ingest on every container start (dev only).

- **Brochure site (Cloudflare Pages):** `apps/website/` builds static `umbraculum.dev` output; deploy in Phase 2 per [`docs/design/public-alpha-cloudflare-pages-runbook.md`](docs/design/public-alpha-cloudflare-pages-runbook.md).
- **Brochure local dev:** `docker compose up -d website` → `http://127.0.0.1:4321` (see `WEBSITE_PORT`; rebuilds `dist/` from `public/` on start). Product nginx `:18080` does **not** serve the brochure.

## Documentation site (`docs-site/`)

- **Local dev:** `docker compose up -d docs-site` → `http://127.0.0.1:3001` (see `DOCS_SITE_PORT` in compose).
- **Build:** `npm run build -w @umbraculum/docs-site` (Node 20 container only).
- **Pre-flip SEO:** `noIndex: true` + `static/robots.txt` until public α — remove at flip per [`docs/design/public-alpha-cloudflare-pages-runbook.md`](docs/design/public-alpha-cloudflare-pages-runbook.md).
- **Search:** lunr.js fallback until Algolia DocSearch credentials land ([`docs/design/docsearch-application-draft.md`](docs/design/docsearch-application-draft.md)).
- **Contracts doc snapshots (P6):** first execution per [`docs/design/docs-site-contracts-versioning-runbook.md`](docs/design/docs-site-contracts-versioning-runbook.md).
- **Flip announcement draft:** [`docs/PUBLIC-ALPHA-ANNOUNCEMENT.md`](docs/PUBLIC-ALPHA-ANNOUNCEMENT.md).
- **Flip-day runbook (Stage 2c):** [`docs/design/public-alpha-flip-day-runbook.md`](docs/design/public-alpha-flip-day-runbook.md).
- **npm SDK publish preflight (2e):** [`docs/design/npm-sdk-publish-preflight.md`](docs/design/npm-sdk-publish-preflight.md).
- **Pre-flip docs hygiene:** `check-public-docs-no-internal-links.py` (no links into `internal/`); `check-public-docs-no-personal-paths.py` (paths + merged denylist — see [`docs/design/public-surface-personal-identifier-hygiene.md`](docs/design/public-surface-personal-identifier-hygiene.md)).

Replication/pgpool behavior is unchanged; see [`docs/POSTGRES-REPLICATION-ARCHITECTURE.md`](docs/POSTGRES-REPLICATION-ARCHITECTURE.md) §"pgvector image".

## When in doubt

- Start with [`MANIFESTO.md`](MANIFESTO.md) and [`docs/PLATFORM-ARCHITECTURE.md`](docs/PLATFORM-ARCHITECTURE.md).
- For contracts work: [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](docs/CONTRACTS-VALIDATION-STRATEGY.md).
- For the four-slice lint + types + tests + docs discipline: [`docs/FOUNDATION-HARDENING.md`](docs/FOUNDATION-HARDENING.md).
- For module-README authoring: [`docs/DOCS-README-STANDARDS.md`](docs/DOCS-README-STANDARDS.md).
- For native + CI strategy: [`docs/NATIVE-STRATEGY-AND-CI.md`](docs/NATIVE-STRATEGY-AND-CI.md).
- For "how do I install / verify the apparatus": [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) and [`AGENTS.md`](AGENTS.md).
