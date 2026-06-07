# AGENTS.md — repo-root agent interceptor

Repo-root instructions for AI assistants in the **Umbraculum** monorepo. This
file is read at session start by Cursor, Claude Code, Codex CLI, and any
agentic IDE that honors the `AGENTS.md` convention. It precedes
[`DEVELOPMENT.md`](DEVELOPMENT.md).

If you are a human contributor, read [`README.md`](README.md) and
[`CONTRIBUTING.md`](CONTRIBUTING.md) instead — this file is the agent-facing
gate, not the human onboarding doc.

## Apparatus self-check (FIRST action in any non-trivial task)

Umbraculum is an **AI-orchestrated-code project** by stated design
([`MANIFESTO.md`](MANIFESTO.md) §1.2). The project's CI gates — lint, types,
tests, docs structural checks, module-README audits, contract-validation
audits — are calibrated to the bar the *umbraculum-toolset Cursor plugin pack*
("the apparatus") encodes. Without the apparatus loaded into your session, the
code you produce is unlikely to clear those gates in one shot; the contributor
will round-trip with reviewers until the code converges on what the apparatus
would have produced from the start. Installing the apparatus is the project
**lowering the contribution bar**, not raising it
([`MANIFESTO.md`](MANIFESTO.md) §1.3, §2.2).

So the first thing you do in this repo, before any non-trivial change, is
confirm the apparatus is loaded.

### Required plugin pack (presence check)

Confirm the following Cursor plugins are loaded in your session. Each plugin
has a unique "witness rule" — a rule file whose presence confirms the plugin
is installed. **Witness rules fall into two categories** that require
different verification mechanisms:

| # | Plugin | Required for | Witness rule | Category |
|---|---|---|---|---|
| 1 | `umbraculum-toolset-common` | every task | `00-development-local-addendum-gate.mdc` | unconditional |
| 2 | `umbraculum-node-react-cursor-assistant` | every task | `22-typescript-contracts-runtime-validation.mdc` | **conditional** |
| 3 | `umbraculum-platform-tsjs-cursor-assistant` | every task | `02-foundation-hardening.mdc` | unconditional |
| 4 | `rf-magento-cursor-assistant` | tasks touching Magento code only | `00-core.mdc` | unconditional |

**Unconditional witnesses** (rules 1, 3, 4) have `alwaysApply: true` in
their frontmatter, so Cursor loads them into your agent context regardless
of which files are open. **Verify by introspecting your own active rule
set** — the witness rule's filename must appear in the always-applied or
agent-requestable workspace rules listing surfaced in your system prompt.

**Conditional witnesses** (rule 2) have `alwaysApply: false` plus `globs:`
that scope the rule to TS/JS files under `apps/`, `services/`, and
`packages/`. Cursor only auto-attaches them when a matching file is in
the conversation's active context, so they can be **silently absent** from
your loaded rule list in conversations with no TS file open even when the
plugin is correctly installed. **Verify by attempting to Read the rule
file at its canonical installed path**
`~/.cursor/plugins/local/umbraculum-node-react-cursor-assistant/rules/22-typescript-contracts-runtime-validation.mdc`:

- **Read succeeds** → the plugin is installed AND the rule's full content
  has now entered your conversation context as a side effect of the Read.
  Treat its directives as binding for the remainder of this session,
  identical to the effect of Cursor auto-attaching it.
- **Read fails** (file not found / permission denied) → the plugin is
  missing or broken. Apply the fail-mode below.

Why a Read-based check rather than rule-list introspection for this one:
rule 22 is deliberately scoped to TS/JS files because its content (Zod v4
runtime validation, [`RFC-0003`](docs/rfcs/0003-validation-library-adoption.md))
is umbraculum-specific. Flipping it to `alwaysApply: true` would
cross-pollute non-TS work in this repo *and* every non-umbraculum workspace
sharing this Cursor install. The `umbraculum-toolset-common` plugin codifies
this as the **witness-rule contract**; see `cursor-plugins/README.md`
§ "Witness-rule contract" in the umbraculum-toolset sister-repo for the
full version.

Plugins 1–3 are required for **every** non-trivial task in this repo.
Plugin 4 is required only when the change set touches the Magento sub-tree
(check the change set scope before declaring it required).

A fifth plugin in the umbraculum-toolset — `umbraculum-openplc-python-cursor-assistant`
— applies to the OpenPLC + Python industrial-automation **sister-repo**, not
to this repo. Do **not** require it here.

### Strongly recommended — Prisma (official Cursor marketplace plugin)

Umbraculum-dev is a **Prisma** monorepo (`services/api/prisma/`, multiSchema
module ownership per RFC-0010). We **warmly advise** installing Cursor's
**official Prisma plugin** (marketplace name: **Prisma**, publisher: Prisma)
**alongside** the umbraculum-toolset pack.

It is **not** part of the apparatus witness gate above and **not** shipped
from [`umbraculum-toolset`](https://github.com/umbraculum-dev/umbraculum-toolset).
Missing it does **not** trigger the soft-block or `apparatus: override` path.

**Why install it:** MCP servers (local/remote schema tooling), migration and
schema-convention rules, and CLI-oriented skills for Prisma workflows. These
complement — do not replace — the platform rule
`47-prisma-multischema-module-schemas.mdc` in
`umbraculum-platform-tsjs-cursor-assistant` (module `prismaSchema` registration,
forward-only migrations, `@@schema("…")` discipline).

**Install:** Cursor → Settings → Plugins → Browse Marketplace → **Prisma**
(official). Enable **Prisma Local** / **Prisma Remote** under Settings →
Features → MCP when you want schema introspection from the agent.

**Verify (optional, not session-blocking):** Settings → Plugins shows
**Prisma** installed and enabled; when `schema.prisma` or migration SQL is
in context, Prisma rules such as `migration-best-practices.mdc` and
`schema-conventions.mdc` appear in the agent's requestable rules; MCP panel
lists the Prisma servers when enabled.

Full contributor-facing detail:
[`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) §"Strongly recommended —
Prisma".

### Fail-mode (soft block — recommended workflow)

If any of plugins 1–3 is missing (or 4 is missing on a Magento-touching task),
**do not silently proceed**. In your first reply to the user:

1. **Advise a window reload as the first attempt** — *cheap, frequent
   false-positive fix; try this before the heavier install procedure*. A
   missing-witness result is sometimes a stale-session artifact: the
   plugin is installed and enabled but the active Cursor session has not
   re-loaded its rules into the agent's context yet. Ask the user
   literally:

   > *Before installing anything, please try a window reload:* **`Ctrl+Shift+P`** *(or* **`Cmd+Shift+P`** *on macOS)* → *"Reload Window"*. *Then re-ask me to re-run the self-check. The plugins are sometimes installed but not yet visible in my rule context until the window is re-initialized.*

   Wait for the user to reload + re-prompt. Re-run the witness-rule
   presence check from scratch. If the previously-missing witnesses are
   now present, the absence was transient — proceed with the task and do
   **not** continue to steps 2–5. Only continue to steps 2–5 if the
   witnesses are still missing after the reload.

2. State explicitly which plugins are still missing (by name, from the
   table above) after the reload step.

3. Explain why it matters, in the project's own terms:

   > *The Umbraculum CI gates (lint, types, tests, docs structural checks,
   > module-README audits, contract-validation audits) are calibrated to a
   > high bar that the umbraculum-toolset plugin pack is designed to make
   > one-shot achievable. Without the pack loaded, the code I produce here is
   > unlikely to pass CI in one shot — expect a CI-feedback loop with
   > reviewers until the code converges on what the pack would have produced
   > from the start. Installing the pack is what
   > [`MANIFESTO.md`](MANIFESTO.md) §1.3 and §2.2 call "the equalizer that
   > keeps the contribution bar low" — it is the project lowering the bar,
   > not raising it.*

4. Point the user at [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) for
   the install procedure (marketplace install where available; local install
   from the public `umbraculum-toolset` sister-repo as the fallback).

5. Offer an explicit override:

   > *If you would like to proceed without the apparatus anyway (e.g. you are
   > making a documentation-only fix, or a one-line typo correction, where
   > the apparatus would be overkill), tell me **`apparatus: override`** and
   > I will continue. Note: any code I produce in override mode is more
   > likely to need CI-feedback iterations before merge.*

Do **not** refuse the task outright. Do **not** auto-override. Wait for the
user's explicit choice.

## Scope notes

- **Presence is the v1 gate.** This interceptor currently checks plugin
  *presence* only. A future revision will pin minimum versions in a
  machine-readable manifest (`.cursor/required-plugins.json`) and add a CI
  parity check that confirms PR-time CI is running the same plugin versions
  as agent-side authoring. Until that revision lands, presence of the witness
  rules is sufficient.

- **Presence verification ≠ enforcement.** The witness-rule self-check
  above verifies that the plugin pack's rules are **loaded** into the
  agent's context; it does not verify that the agent observably **acts on**
  the rules' directives. The Umbraculum project treats plugin-level
  `alwaysApply: true` enforcement as work-in-progress. If you observe a
  specific `alwaysApply: true` rule from one of the toolset plugins failing
  to be enforced reliably on this project (rule is present per the
  witness-rule check, but the agent's behavior is observably not honoring
  the rule's directives), the documented immediate fix is to **copy** the
  rule from `~/.cursor/plugins/local/<plugin-name>/rules/<rule>.mdc` into
  this repo's `.cursor/rules/<rule>.mdc` (consistency-first; COPY not
  move; do not refactor the content; do not delete the plugin copy; and
  **report the enforcement gap to the plugin core team via a
  [`umbraculum-toolset` issue](https://github.com/umbraculum-dev/umbraculum-toolset/issues)**
  — the report is what eventually closes the gap at the source).
  See the canonical policy at the toolset-level
  [`cursor-plugins/README.md` § "Repo-side fallback for unenforced `alwaysApply` rules"](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/README.md#repo-side-fallback-for-unenforced-alwaysapply-rules-work-in-progress-consistency-first)
  for the full policy, the discipline boundaries (NOT a workaround for
  conditional / glob-scoped rules — see the witness-rule anti-pattern),
  and the deferred-questions list.

- **Magento conditional.** The `rf-magento-cursor-assistant` requirement
  applies only when the change set touches files under the Magento sub-tree.
  Inspect the change set before declaring it required, to avoid blocking
  pure-TS/JS tasks on a Magento-only plugin.

- **Non-Cursor agents** (Claude Code, Codex CLI, others). If you are an
  agent that does not natively load Cursor plugins, see
  [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) §"Non-Cursor agents"
  for the equivalent rule-pack inclusion path. The introspection check above
  still applies — your equivalent is "are the umbraculum-toolset rules in my
  system-prompt / project-instructions context?".

- **Documentation-only tasks** (typo fixes, link updates, prose-only doc
  edits) are the standard override case. The user-issued
  `apparatus: override` covers them; the apparatus is not required for prose
  changes that touch no code.

- **Prisma plugin (recommended, not gated).** The official Cursor **Prisma**
  marketplace plugin is warmly advised for this repo but is **not** checked
  in the apparatus self-check above. See the subsection *Strongly recommended
  — Prisma* and [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md).

## What this file is NOT

- Not the place for repository workflow guidance — that is
  [`DEVELOPMENT.md`](DEVELOPMENT.md).
- Not the place for human-contributor onboarding — that is
  [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Not the place for the project's values / license posture — that is
  [`MANIFESTO.md`](MANIFESTO.md).
- Not the place for the plugin install procedure — that is
  [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md).

This file's single job is: ensure the agent confirms the apparatus is
present *before* it starts producing changes.

## SOLID and dependency direction (D)

Umbraculum uses **repo-native** SOLID — dependency *direction* and single
ownership, not generic DI-container dogma. **D (Dependency)** here means:
high-level policy (UI, routes) must not import low-level implementation
(server source, sibling feature folders, Prisma). Communication crosses
**HTTP + Zod contracts** (`@umbraculum/api-client`, `*-contracts`), not
TypeScript paths into `services/api/**`.

**Read when touching `apps/**`, `services/api/src/modules/**`, or
cross-package imports:**

| Topic | Document |
|-------|----------|
| S-O-L-I-D rubric | [`docs/design/solid-audit-charter.md`](docs/design/solid-audit-charter.md) §2 (mapping), §11 (WS5 apps) |
| Program status (S closed; D enforced) | [`docs/design/solid-post-wave17-closure.md`](docs/design/solid-post-wave17-closure.md) §4, §7–§8 |
| Findings + Tier A/B/C backlog | [`docs/design/solid-decoupling-audit.md`](docs/design/solid-decoupling-audit.md) |
| Layer taxonomy | [`docs/design/application-surfaces-vs-platform-backbone.md`](docs/design/application-surfaces-vs-platform-backbone.md) |
| Client vs server data access | [`docs/DATA-ACCESS-BOUNDARIES.md`](docs/DATA-ACCESS-BOUNDARIES.md) §6 |
| Lint rules + how to fix violations | [`docs/LINTING.md`](docs/LINTING.md) — [Canonical module boundaries](docs/LINTING.md#canonical-module-boundaries), [App layer boundaries (WS5)](docs/LINTING.md#app-layer-boundaries-ws5), [Client-safe (WS6)](docs/LINTING.md#client-safe-package-imports-ws6) |

**Mechanical enforcement (CI-blocking `error` on `lint`):**

| Rule | Scope | Spike |
|------|-------|-------|
| **B5** `boundaries/element-types` | Sibling canonical modules (`services/api/src/modules/**`) | [`solid-boundaries-eslint-spike.md`](docs/design/solid-boundaries-eslint-spike.md) |
| **WS5** `boundaries/element-types` | App segment / locale vertical fences (`apps/{web,native}/**`) | [`solid-boundaries-eslint-apps-spike.md`](docs/design/solid-boundaries-eslint-apps-spike.md) |
| **WS6** `no-restricted-imports` | Apps → no `@prisma/*`, no `services/api/**` source | [`solid-client-safe-imports-spike.md`](docs/design/solid-client-safe-imports-spike.md) |

**Apparatus rule (glob-attached when editing matching paths):**
`03-layering-and-coupling-discipline.mdc` in
`umbraculum-platform-tsjs-cursor-assistant` — dependency direction,
`@arch-boundary` for rare intentional coupling.

**Report-only drift (not push proof):** `npm run audit:solid-inventory`.

**Agent discipline:** Do **not** schedule mechanical S hygiene waves (Wave
18+). Split opportunistically on feature work. Do **not** import
`services/api/**` or sibling segments to “save time” — move shared code to
`_lib` / `_hooks` or a `@umbraculum/*` package instead.

## Adjacent context for plan authors and executors

This file deliberately doesn't carry the deeper *"how do I draft a plan
for executor X?"* or *"what FAIL patterns has executor X exhibited
historically?"* knowledge. For that, see
[`docs/NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](docs/NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md):

- If you are **drafting a plan** that will be handed to a *non-frontier*
  AI executor (e.g. `composer-2.5-fast`, Cursor-fast variants, future
  local models), read the tracker's §10 *before* drafting. It enumerates
  the load-bearing extra-specifications (enumerate gate skills by name,
  enumerate per-file artifacts, pre-author README boilerplate, etc.)
  that prior runs have shown are needed for non-frontier executors to
  land plans correctly on the first pass.

- If you **are** a non-frontier executor about to execute a plan in this
  repo, skim the per-run WRONG-rows in §6.1 — those are the known FAIL
  patterns your model family exhibited on the last assessed run. Treat
  them as traps to actively avoid, not as *"this won't happen to me."*

The tracker is per-run and append-only; the §10 lessons are the
distilled, actionable section. The same guidance is also carried by the
`umbraculum-toolset-common` Cursor plugin (rule
`43-non-frontier-executor-fitness-tracker.mdc`) so it propagates to
sibling Umbraculum repos when they adopt the toolset.

### RFC and plan documentation quality

Before implementing or reviewing code tied to an **accepted RFC** (especially
horizontal services in [RFC-0001](docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2 — rendering, notifications, validation):

1. Read the RFC §1 summary and the **companion artifacts** listed in
   [`docs/rfcs/README.md`](docs/rfcs/README.md) §3 and the row for that RFC in
   [`docs/design/rfc-companion-documentation-audit.md`](docs/design/rfc-companion-documentation-audit.md).
2. Do not ship consumer features (new `documentTemplates`, delivery modes, module
   export routes) without updating the **horizontal or module surface doc** and,
   for rendering, the template registry in
   [`docs/design/canonical-document-rendering-surface.md`](docs/design/canonical-document-rendering-surface.md).
3. When **authoring** a multi-phase Cursor/plan file, include a **Documentation
   context** table per
   [`docs/design/plan-documentation-context-template.md`](docs/design/plan-documentation-context-template.md).

Toolset witnesses (when installed): `48-rfc-companion-documentation-gate.mdc`,
`49-plan-documentation-context.mdc`.

## Pre-push CI parity (agent-owned — do not delegate to the operator)

When **you** changed TypeScript, ESLint surface, module READMEs, lockfiles, or
CI workflows and are about to **commit and push**, **you** run the parity gate —
not the human contributor. Do not end a session with "before you push, run …".

**Mandatory sequence before push:**

1. **Commit** all intended changes (ci-parity archive mode tests **committed**
   tree only — uncommitted fixes can hide broken `HEAD`).
2. With a **clean working tree**, run the pre-push gate (same commands for agents and human contributors):

```bash
npm run verify:pre-push              # T2-PR — default (path-aware + parallel)
npm run verify:pre-push:release      # T2-release — manifest / SDK tags / ci-parity pins
npm run validate:gha-triggers        # optional: drift check for trigger-map editors
python3 scripts/lib/verify-slice.py --repo-root . resolve-gha-triggers --base origin/master
```

   `verify:pre-push` selects `--archive` automatically when the tree is clean.
   On Windows without bash, use `npm exec --yes @umbraculum/ci-parity@<same-version-as-CI_PARITY_PKG_VERSION> -- run --archive` (read `CI_PARITY_PKG_VERSION` from [`scripts/ci-parity-check.sh`](scripts/ci-parity-check.sh)).
   Skill: **`path-aware-pre-push`**. Full table: [`docs/CI-PARITY.md`](docs/CI-PARITY.md) § Pre-push commands reference.

   **Agent anti-pattern (do not repeat):** `./scripts/ci-parity-check.sh --archive run`
   **with no `--jobs`** runs the **entire manifest sequentially** (~8–15 min) and **skips**
   path-aware job selection, **parallel** execution, and **native companions** (API vitest,
   `packages-dist-check`, etc.). That is **not** T2-PR and is **not** equivalent to
   `npm run verify:pre-push`. For pre-push, **always** use `npm run verify:pre-push` unless
   you are intentionally running a **named subset** with explicit `--jobs` (and usually
   `--parallel --isolated-install`). Incident: Wave 3b push prep, 2026-06-06.

   **SOLID program:** closed post–Wave 17 — see [`docs/design/solid-post-wave17-closure.md`](docs/design/solid-post-wave17-closure.md) §6 (verification gates; do not treat pre-push as a new SOLID initiative).
3. T2-PR **auto-runs API vitest** when the diff matches `.github/workflows/api.yml`
   paths (via `.umbraculum/gha-trigger-map.json`). For manifest-only work outside
   the resolver, still run skill **`api-integration-tests-pre-push`** when applicable.
4. **Only after** step 2 (and 3 when applicable) is green, push.

**Native Expo config (`app.config.js`, `metro.config.js`) — agent-only lint gate:**
When **you** add or edit these files (or touch their `eslint.config.mjs` override
row), **you** run archive lint before push — same job as **`web-lint`** (~2 min):

```bash
./scripts/ci-parity-check.sh --archive run --jobs lint
```

(`npm run verify:pre-push` includes `lint` when the manifest runs the full T2
set.) They use CommonJS `require()`; missing an eslint override fails
**`web-lint`** on CI while host-only iteration can look green. **Do not** end the
session with “before you push, run lint” for the operator — **you** run it.
Incident: `8a05b6c` / fix `9c41400`.

**During iteration (not the push gate):** `./scripts/ci-parity-check.sh run`
(`--ci`, working tree + warm volumes) is fine for fast WIP feedback — but
**never** treat `--ci` green alone as push proof if you have not yet run archive
mode on the commit you will push.

**Agent invocation (Cursor / agentic shells on Linux):** run
**`./scripts/ci-parity-check.sh`** — not bare **`npx @umbraculum/ci-parity`**.
The wrapper prepends system `PATH` so Node/npm are not resolved through Cursor's
AppImage mount (bare `npx` can fail with ENOENT before any job runs). This is an
**agent execution requirement**, not something to delegate to the human
contributor.

Do **not** treat `docker compose exec … npm run typecheck`, host `python3
scripts/docs/…`, host `npm run build:packages`, or ad-hoc `docker run …
bash -lc` on the live workspace as pre-push proof — those are fast iteration
or Linux-biased debug only.

Manifest source of truth: `.umbraculum/ci-parity.json` — when adding or
changing a GHA workflow's verify steps, **add the same commands as a ci-parity
job** in the manifest; do not invent host-only verification scripts.

## Dev stack health after ci-parity / API / nginx (agent-owned — do not delegate)

When **you** run `./scripts/ci-parity-check.sh` (especially **`--archive`**),
edit **`services/api/**`**, change **nginx** / **`docker-compose.yml`** api or
nginx services, or otherwise touch the **live compose stack**, **you** must prove
the dev stack is still reachable through nginx — **not** the human contributor.
Do not end a session with “try restarting api” or “run smoke before you test in
the browser” unless you have already run the sequence below yourself.

**Why this gate exists:** ci-parity runs `npm ci` inside ephemeral Docker
containers. The live **`api`** service bind-mounts `packages/**` and runs
`tsx watch`. Archive/ci-parity runs can emit **`unlink`** events under those
mounts; tsx restarts mid-relink and the api process crashes with
`ERR_MODULE_NOT_FOUND` (e.g. `packages/platform/contracts` → `zod`). **Nginx still serves
`/en/login` HTML (200)** but **every `/api/*` proxy returns 502** — including
`GET /api/auth/me` and `POST /api/auth/login` that the login page needs.

**Triggers — run the mandatory sequence when any of these apply:**

| Trigger | Examples |
|---------|----------|
| ci-parity while compose is up | `./scripts/ci-parity-check.sh --archive run`, `npm run verify:pre-push` |
| API / nginx surface changed | `services/api/**`, nginx config, `docker-compose.yml` api/nginx |
| User reports 502 on login or `/api/*` | `/en/login` loads but auth calls 502 |
| You restarted api/web/nginx | Recovery after crash, rule 51 git-tree mutation |

**Mandatory sequence (agent runs this — max ~30s after api is listening):**

1. **`docker compose restart api`** — wait until api logs show
   `Server listening at http://127.0.0.1:4000` (nginx restart usually **not**
   required when only the api upstream died).
2. **`npm run smoke:stack`** (alias for [`scripts/dev-stack-smoke.sh`](scripts/dev-stack-smoke.sh)) —
   must exit **0**. This checks `/api/health`, **cookie-session**
   `POST /api/auth/login` (browser UI path), bearer `POST /api/auth/login/native`,
   `/api/auth/me`, catalog reads, and **`GET /en/login` → 200**.
3. **If smoke fails on boot** with `ERR_MODULE_NOT_FOUND` from
   `/packages/<name>/…`: follow [`DEVELOPMENT-LOCAL.md`](DEVELOPMENT-LOCAL.md)
   § “502 Bad Gateway” items **3–4** (package-local bootstrap if needed), then
   **`docker compose restart api`** again and re-run step 2.
4. **If login returns 401** (not 502): seed E2E personas —
   `docker compose exec api npm run seed:e2e` — then re-run step 2. Credentials:
   [`docs/TESTING.md`](docs/TESTING.md) § “E2E fixture identities”
   (`e2e-admin@brewery.local` / `e2e-admin-pw!` by default).

**Relationship to other gates (none substitutes for `smoke:stack` here):**

| Gate | When |
|------|------|
| **`api-integration-tests-pre-push`** | Pre-push vitest in api container — does **not** prove nginx → api proxy |
| **`public-endpoint-verification`** skill | Spot-check a route **you changed** — use **in addition** when declaring UI/API work done |
| **`smoke:stack`** | **After ci-parity or api/nginx drift** — proves login path through `:18080` |

Optional full UI login (slower): Playwright
[`apps/web/e2e/smoke/auth.spec.ts`](apps/web/e2e/smoke/auth.spec.ts)
(`npm run test:smoke` in `apps/web/e2e` workspace).

## GHA workflow authoring

When adding or editing `.github/workflows/*.yml`:

- **No cron by default.** Do not add `on.schedule` / `cron:` unless the user
  **specifically asks** for scheduled runs. Do not add weekly crons as a
  "helpful default" or by copying an existing workflow. Existing scheduled
  workflows are documented exceptions (see inventory below) — do not extend
  that list without instruction.
- **Weekly cron inventory (this repo, 2026-06-03):**
  - [`dogfood-npm-smoke.yml`](.github/workflows/dogfood-npm-smoke.yml) —
    `0 6 * * 1` (Mon 06:00 UTC); registry install smoke (~1 min).
  - [`integrator-live-smoke.yml`](.github/workflows/integrator-live-smoke.yml) —
    **no cron** (opt-in label + `workflow_dispatch` only; weekly cron removed
    2026-06-03).
  - **Sister repo** [`umbraculum-integrator-sample`](https://github.com/umbraculum-dev/umbraculum-integrator-sample) —
    no schedule; live job is `workflow_dispatch` only.
- **Heavy workflows.** Prefer `workflow_dispatch` + PR label opt-in over
  automatic `push` / ungated `pull_request` for jobs that need full Docker
  stacks or multi-minute runtime (see `integrator-live-smoke.yml`).
- **Path discipline.** Match path filters to the smallest surface that actually
  requires the job.
- **Standard GitHub-hosted runners.** Default `runs-on: ubuntu-latest` (or
  `windows-latest` / `macos-latest` only when the job requires that OS). Do not
  add larger runners or custom high-core runner labels without explicit
  maintainer approval — larger runners bill even on public repos. Standard
  runners are minute-free on public repositories per
  [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
  See [`DEVELOPMENT.md`](DEVELOPMENT.md) policies.
- **`native-eas-build` + Expo free tier.** EAS cloud builds are **not
  unlimited** — Free plan **monthly** caps (~**30** builds: **≤15 Android** +
  **≤15 iOS**), **1 concurrency**, plus EAS Update MAU/bandwidth limits (see
  [Expo billing FAQ](https://docs.expo.dev/billing/faq/)). Queue on the free
  tier (*waiting for concurrency* / *available worker*) can be **slow (often
  30–90+ minutes)** — **acceptable** for occasional demo APKs, not a CI bug. GHA
  may log *Waiting for build to complete* while Expo shows *Waiting to start*.
  **Private repo:** do not leave this workflow running during a long queue
  (minute burn). **Public repo:** manual dispatch is fine on `ubuntu-latest`.
  See [`apps/native/EAS-DEMO-SETUP.md`](apps/native/EAS-DEMO-SETUP.md) § “Expo
  free tier”.

## ci-parity manifest / version changes (agent mandatory — do not skip)

**You** own this sequence when editing `.umbraculum/ci-parity.json` or adding a
new manifest job `id`. Do **not** tell the operator to fix red `typecheck` /
`web-lint` after a version skew — prevent it before push.

### Why this matters

`@umbraculum/ci-parity` validates the **entire manifest** before running **any**
job. If the manifest contains a job `id` the installed package version does not
know (e.g. `dogfood-npm-smoke` on `@1.0.8`), **every** workflow fails at Zod
parse — including `lint` and `typecheck` on unrelated PRs. Symptom:

`Invalid discriminator value … path ["jobs", N, "id"]`.

### When a new job `id` needs a new `@umbraculum/ci-parity` release

1. **umbraculum-toolset:** add job schema + runner branch in
   `packages/ci-parity/`, bump `package.json` version, commit, push, tag
   `ci-parity-vX.Y.Z`, wait for **`publish-ci-parity`** green (OIDC — no laptop
   `npm publish`; see § npm publish discipline below).
2. Confirm: `npm view @umbraculum/ci-parity version` matches the tag.
3. **umbraculum-dev — one commit** with manifest + **all** version pins (never
   bump only the workflow for the new job):

| File | Field |
|------|--------|
| `.umbraculum/ci-parity.json` | new/updated job |
| `.github/workflows/typecheck.yml` | `ci_parity_version` |
| `.github/workflows/web-lint.yml` | `ci_parity_version` |
| `.github/workflows/docs-readmes.yml` | `ci_parity_version` |
| `.github/workflows/dogfood-npm-smoke.yml` | `ci_parity_version` (if present) |
| `.github/workflows/ci-parity-validate.yml` | `npx @umbraculum/ci-parity@X.Y.Z` |
| `scripts/ci-parity-check.sh` | `CI_PARITY_PKG_VERSION` default |

4. **Pre-push proof that matches GHA** (mandatory — not optional):

```bash
./scripts/ci-parity-check.sh --archive run --jobs lint,typecheck
# or: npm run verify:pre-push
```

Use **`./scripts/ci-parity-check.sh`** only — it pins the same npm version as
GHA. Do **not** use:

| Anti-pattern | Why it lies |
|--------------|-------------|
| `node …/umbraculum-toolset/packages/ci-parity/dist/cli.js` | Built from source; skips npm version GHA installs |
| `npx @umbraculum/ci-parity@^1` | Stale npx cache can stay on old patch (1.0.8 vs 1.0.9) |
| `--jobs docs-readmes,dogfood-npm-smoke` only | Never exercises `lint`/`typecheck` path at the GHA pin |
| Pushing manifest before npm has the new package | All reusable callers fail at manifest parse |

Historical incident: **2026-06-02** — `dogfood-npm-smoke` merged with pins on
2/5 workflows only; `typecheck` + `web-lint` stayed on `@1.0.8` until
`f869918`. Details: [`docs/CI-PARITY.md`](docs/CI-PARITY.md) § manifest job ids.

### When manifest changes do **not** need a new ci-parity release

Editing commands/workspaces inside **existing** job ids (`lint`, `typecheck`,
`docs-readmes`, `sdk-publish-prep`, `dogfood-npm-smoke`) — no toolset publish;
still run `./scripts/ci-parity-check.sh --archive run` before push.

GHA minutes are for integration steps that truly need GitHub (OIDC publish,
EAS, etc.) — not for discovering failures ci-parity can catch locally.

Host prerequisites for ci-parity: **git**, **Docker**, and **Node** (to launch
the CLI via `./scripts/ci-parity-check.sh` or `npm run verify:pre-push`). Job
commands execute inside the manifest's container image (`node:20-slim`), not
on the host shell/OS.

Witness rule: `72-ci-parity-local-vs-ci-divergence.mdc` (agent anti-patterns
for pre-push verification).

## npm publish discipline (agents — do not local-publish)

**Maintainers authenticate to npm in the browser** for account/package settings.
That is **not** the publish path agents should use.

**Do not run `npm publish` (or `npm publish --otp=…`) from a laptop/container
to ship `@umbraculum/*` packages** unless the human maintainer **explicitly**
asks for a one-off manual publish. Local publish often fails with OTP/2FA
prompts and is **not** how this project ships routine bumps.

| Package(s) | Repo | Publish trigger (preferred) | Workflow |
|------------|------|----------------------------|----------|
| `@umbraculum/ci-parity` | **umbraculum-toolset** | Git tag `ci-parity-vX.Y.Z` | `publish-ci-parity.yml` |
| MIT SDK batch (7 packages) | **umbraculum-dev** | Git tag `sdk-batch-vX.Y.Z` | `publish-sdk-batch.yml` |
| `@umbraculum/contracts` + `@umbraculum/api-client` | **umbraculum-dev** | Git tag `sdk-contracts-vX.Y.Z` | `publish-contracts-api-client.yml` |

**Agent sequence after changing a publishable package:**

1. Bump `package.json` `version` (no `v` prefix in the file).
2. Commit in the **source repo** (toolset for ci-parity; umbraculum-dev for SDK).
3. Push branch, then push the matching **Git tag** (e.g. `ci-parity-v1.0.9`).
4. Wait for the GHA workflow to go green; confirm with `npm view <pkg> version`.
5. **Then** bump **`ci_parity_version` on every row in the table above** +
   `CI_PARITY_PKG_VERSION` in `scripts/ci-parity-check.sh` (same commit as
   manifest changes when possible). See § ci-parity manifest / version changes.

Auth is **npm Trusted Publishing (OIDC)** from GitHub Actions — no `NPM_TOKEN`,
no laptop OTP. Runbooks: [`docs/design/ci-parity-npm-trusted-publishing.md`](docs/design/ci-parity-npm-trusted-publishing.md), [`docs/design/npm-sdk-trusted-publishing.md`](docs/design/npm-sdk-trusted-publishing.md).

**If a manifest job needs a newer `@umbraculum/ci-parity` on npm** (e.g. new job
id in `.umbraculum/ci-parity.json`), follow § **ci-parity manifest / version
changes** — toolset tag first, then bump **all** workflow pins in one commit.
Do **not** block on local `npm publish`.

## Release/version notation guardrail

When touching release metadata, preserve the repo convention from
[`DEVELOPMENT.md`](DEVELOPMENT.md) §"Release and version notation":
Git release tags carry a leading `v` (for example `v0.0.1`), while
`package.json` `version` fields use plain npm SemVer with no `v` prefix
(for example `0.0.1`). Do not create paired `vX.Y.Z` and `X.Y.Z` Git tags for
the same release, and never write a `v` prefix into package manifest versions.

## Production hosting sister repos

Forum and demo **VPS operator** scripts live in separate public repos — **not** under `infra/community-forum/` in this monorepo.

| Repo | Purpose |
|------|---------|
| `github.com/umbraculum-dev/umbraculum-hosting-common` | Shared VPS hardening (`vps-hardening-baseline.sh`) |
| `github.com/umbraculum-dev/umbraculum-hosting-forum` | `forum.umbraculum.dev` — Discourse ops, `bin/pull`, `bin/harden` |
| `github.com/umbraculum-dev/umbraculum-hosting-demo` | `demo.umbraculum.dev` — Traefik/compose (scaffold; product build still here) |

Local maintainer layout: `/home/rf/dkprojects/rfapps/umbraculum-hosting/{common,forum,demo}/` — see [`docs/design/production-hosts.md`](docs/design/production-hosts.md).

**Agent rules:**

- Do **not** add new forum/demo VPS automation under `umbraculum-dev/infra/community-forum/` (stub only).
- Forum **governance** (categories, §7 Discourse settings, flip-day) stays in **this repo** (`docs/design/community-forum-runbook.md` §6–§7).
- Forum/demo **install, hardening, launcher** → edit **hosting-forum** or **hosting-demo**; bump `common/` submodule when hardening changes.
- Tasks scoped to "forum VPS" may target the **hosting-forum** workspace, not umbraculum-dev.
- Full apparatus / ci-parity gate applies to **this repo**; hosting repos are bash-only unless explicitly opened.

## Forward

If the apparatus check passes (or the user explicitly overrides it),
continue with [`DEVELOPMENT.md`](DEVELOPMENT.md) — the repo's policy,
runbook, and subagent inventory you operate inside.
