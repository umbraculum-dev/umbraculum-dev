# Cursor plugins — the apparatus (install + verify)

This document describes the **umbraculum-toolset Cursor plugin pack** —
referred to throughout this repo and in [`MANIFESTO.md`](../MANIFESTO.md)
§1.2 as "the apparatus" — and how to install + verify it.

The apparatus is **the mechanism that makes AI-orchestrated code in this
repo a discipline, not a shortcut**. It encodes the project's rules (TS
strict flags, Zod v4 contract validation, ESLint flat-config hygiene, React
accessibility, Playwright/E2E conventions, monorepo boundaries, plugin-
source-vs-installed-mirror guardrail, public-endpoint verification gate,
commit-message ticket-prefix discipline, and more), skills (bounded
runbooks for common tasks), and subagents (focused verifiers and runners).
Without it loaded, Cursor's main agent will produce code that does not
match what the project's CI gates expect, and the contributor will round-
trip with reviewers.

The repo-root agent interceptor in [`../AGENTS.md`](../AGENTS.md) is what
*enforces* this — every AI session that touches non-trivial code starts
with the apparatus self-check.

## Why the apparatus matters (one paragraph)

[`MANIFESTO.md`](../MANIFESTO.md) §1.3 + §2.2 commit to keeping the
contribution bar **low** by carrying knowledge in the apparatus rather
than in prerequisite documentation. The project's CI gates are the
*enforcement* of a high quality bar; the plugin pack is the *lowering of
the experiential bar* — when the pack is loaded, an AI assistant can
produce passing code in one shot. When it is missing, the same assistant
will iterate with reviewers until it converges on what the pack would
have produced from the start. Installing the pack is therefore the
project lowering the bar for the contributor, not raising it. This is
the inverse of how most OSS projects frame contributor tooling, and it
is the most concrete expression of the manifesto's §1.2 + §1.3 claims.

## Why workspace-scoped loading matters

Custom umbraculum-toolset plugins must load **only in workspaces where they
apply**. If every plugin is copied into `~/.cursor/plugins/local/` (the old
`install-local.sh` / rsync path), Cursor loads **all** of them in **every**
workspace on your machine — Magento shops, OpenPLC brewery repos, random
projects, and umbraculum-dev alike.

That global load causes:

- **Wrong guardrails** — Magento sessions surfacing umbraculum-only gates
  (`npm run verify:pre-push`, Tamagui CLI, ci-parity tiers); umbraculum-dev
  sessions surfacing Magento-only rules (`final` class guard, `setup:di:compile`
  as default wrap-up).
- **Noisy context** — unrelated rules, skills, and subagents inflate every
  prompt; agent precision degrades.
- **False failure reports** — "the agent ignored the rule" when the wrong
  plugin family was active.

**For umbraculum-dev:** when this repo is open, exactly **three** umbraculum
plugins should load (see [Required plugin pack](#required-plugin-pack) below).
`rf-magento-cursor-assistant` and `umbraculum-openplc-python-cursor-assistant`
must **not** appear in Settings → Plugins for this workspace.

Empirical verification steps live in the toolset runbook
[`WORKSPACE-PLUGIN-LOADING.md` §5](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/WORKSPACE-PLUGIN-LOADING.md#5-verification-checklist).

## Required plugin pack

When **this repo** (`umbraculum-dev`) is the open workspace, the hook (or
post-marketplace per-workspace enablement) loads **three** plugins — not all
four rows in the table:

| Plugin | Role | Loads in umbraculum-dev? | Witness rule |
|---|---|---|---|
| [`umbraculum-toolset-common`](#umbraculum-toolset-common) | Language-agnostic meta-framework — DEVELOPMENT-LOCAL gate, Skill Contract, commit-message ticket-prefix discipline, public-endpoint verification gate, plugin-source-vs-installed-mirror guardrail. | **Yes** | `00-development-local-addendum-gate.mdc` |
| [`umbraculum-node-react-cursor-assistant`](#umbraculum-node-react-cursor-assistant) | Node/TypeScript/React/E2E guardrails — TS strict flags, Zod v4 contracts validation, ESLint flat-config hygiene, Playwright/E2E conventions, React accessibility, monorepo package boundaries, frontend known-issues. | **Yes** | `22-typescript-contracts-runtime-validation.mdc` |
| [`umbraculum-platform-tsjs-cursor-assistant`](#umbraculum-platform-tsjs-cursor-assistant) | Umbraculum-platform-specific — foundation-hardening cross-slice anchor, module-README authoring standard, package-scope migration preflight, L2 workspace isolation scaffolding, types-baseline + module-README subagents. | **Yes** | `02-foundation-hardening.mdc` |
| [`rf-magento-cursor-assistant`](#rf-magento-cursor-assistant) | Magento 2 / PHP rules + skills + subagents — DI patterns, area scoping, template / ViewModel migration, integration + unit test runbooks. | **No** (Magento workspaces only) | `00-core.mdc` |

A **fifth** plugin in the umbraculum-toolset family —
`umbraculum-openplc-python-cursor-assistant` — applies to the OpenPLC +
Python industrial-automation **sister-repo**, not to umbraculum-dev. Do
**not** install or hook-load it for this workspace.

## Strongly recommended — Prisma (official Cursor marketplace plugin)

Umbraculum-dev uses **Prisma** for Postgres (`services/api/prisma/schema.prisma`,
forward migrations, multiSchema module ownership). We **warmly advise**
installing Cursor's **official Prisma plugin** in addition to the
umbraculum-toolset pack.

| Item | Detail |
|------|--------|
| **Marketplace name** | **Prisma** (publisher: Prisma — the official plugin) |
| **Required?** | **No** — not part of the apparatus witness gate in [`../AGENTS.md`](../AGENTS.md). Missing it does not block agent sessions. |
| **Why** | MCP integration (Prisma Local / Prisma Remote), migration + schema rules, CLI skills — faster, safer schema/migration work for agents and humans. |
| **Pairs with** | Platform rule `47-prisma-multischema-module-schemas.mdc` (`umbraculum-platform-tsjs-cursor-assistant`) — Umbraculum-specific multiSchema + `registerModule({ prismaSchema })` discipline; the Prisma plugin covers generic Prisma CLI/schema conventions. |
| **Install path** | **Marketplace** (Path A below) — not part of the umbraculum-toolset hook |

### Install

1. **Cursor → Settings → Plugins → Browse Marketplace**
2. Search **Prisma** and install the **official** plugin (description: *MCP server integration, rules, skills, and automation for database development*).
3. **Developer: Reload Window** after install.
4. Optional: **Settings → Features → MCP** — enable **Prisma Local** and/or **Prisma Remote** for schema introspection from the agent.

### Verify (optional)

- **Settings → Plugins** — **Prisma** shows installed and enabled.
- Open `services/api/prisma/schema.prisma` (or a migration file) and start an
  agent session — requestable rules such as `migration-best-practices.mdc` and
  `schema-conventions.mdc` should be available.
- **Settings → Features → MCP** — Prisma MCP servers listed when enabled.

Agents may remind contributors to install Prisma when a task touches schema
or migrations; that reminder is advisory, not a hard gate.

## Install

The four umbraculum-toolset plugins are **submitted to the Cursor
marketplace during the June cutover-prep window** per
[`ROADMAP.md`](ROADMAP.md) §"Late H1 / July 2026" — Week 3; marketplace
approval is Cursor-side and may take days to weeks. **The public-alpha
procedure is COMPLETE only when the four marketplace listings are
live** — recorded as the architectural closure criterion in
[`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1. Until
the listings publish, the canonical install path is **workspace-scoped
hook + source clone** via the sister-repo
[`umbraculum-toolset`](https://github.com/umbraculum-dev/umbraculum-toolset)
(URL becomes live when the **toolset sister-repo** flips visibility from
private → public — same atomic moment as the `umbraculum-dev` public flip,
per [`ROADMAP.md`](ROADMAP.md) §"Late H1 / July 2026" Week 3 Stage 2 and
[`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 closure
criterion; pre-flip contributors use a private mirror).

### Two ways plugins get into a workspace

| Mechanism | When to use | Scope control | umbraculum-toolset today |
|---|---|---|---|
| **A — Cursor Marketplace** | Published plugins (Prisma; umbraculum-toolset **after** listings go live) | **Settings → Plugins** per-workspace toggle (`state.vscdb`) | Post-publication steady state |
| **B — `workspaceOpen` hook + source paths** | Pre-marketplace; plugin HEAD development | Hook script matches `workspace_roots` → returns `pluginPaths` | **Current canonical path** |

**Do not** rsync umbraculum or rf-magento plugins into `~/.cursor/plugins/local/`
for day-to-day use — anything there loads **globally in every workspace**,
regardless of the hook. The plugin manifest cannot express workspace gating.

**Double-load warning:** If marketplace plugin X is enabled for a workspace
**and** the hook also returns a local path to plugin X, Cursor may register
two copies from different paths. Remove the hook `add()` line or disable the
marketplace copy for that plugin.

### Official Cursor reference — `workspaceOpen` hook

Per-workspace plugin loading for source-path installs uses Cursor's documented
IDE lifecycle hook:

**[Cursor docs: `workspaceOpen` hook](https://cursor.com/docs/hooks#workspaceopen)**

On workspace open (and folder change), Cursor runs your hook script with
`workspace_roots` on stdin; stdout may return `{ "pluginPaths": ["<absolute path>", ...] }`
to load plugins for **that workspace only**. Parent reference:
[cursor.com/docs/hooks](https://cursor.com/docs/hooks).

### Current path — hook + source (until marketplace publication)

Mechanical runbook (clone, `~/.cursor/hooks.json`, discriminator script, empty
`local/`, verification): follow the toolset document end-to-end:

**[`umbraculum-toolset/cursor-plugins/docs/WORKSPACE-PLUGIN-LOADING.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/WORKSPACE-PLUGIN-LOADING.md) §0**

Summary for umbraculum-dev contributors:

1. **Clone** [`umbraculum-toolset`](https://github.com/umbraculum-dev/umbraculum-toolset) once on your machine.
2. **Copy** `cursor-plugins/scripts/register-workspace-plugins.example.sh` to
   `~/.cursor/hooks/register-workspace-plugins.sh` and register it in
   `~/.cursor/hooks.json` (see runbook §0 step 1–2).
3. **Edit path constants** in the hook script so `UMBRACULUM_PLATFORM_REPO`
   points at **your** umbraculum-dev clone (and `UMB_BASE` at your toolset
   `cursor-plugins/` directory). Paths in the example script are one maintainer's
   layout — every developer must adjust them.
4. **Remove** any umbraculum or rf-magento folders from `~/.cursor/plugins/local/`
   (runbook §0 step 3).
5. **Developer: Reload Window** (`Ctrl+Shift+P` / `Cmd+Shift+P`) — the hook
   runs on workspace open, not when the script file is saved mid-session.
6. After `git pull` in umbraculum-toolset: **Reload Window** again (no rsync).

You do **not** need the Magento plugin repo for umbraculum-dev work.

**Deprecated — do not use for normal install:**

```bash
# LEGACY ROLLBACK ONLY — globalizes all four umbraculum plugins everywhere
bash ~/path/to/umbraculum-toolset/cursor-plugins/scripts/install-local.sh.legacy
```

Running `install-local.sh.legacy` alongside the hook undoes workspace scoping.
See runbook §0 "Legacy rollback".

### umbraculum-dev pairing — what Settings → Plugins should show

With this repo open, use the **workspace filter chip** (folder name) in
**Settings → Plugins**. Expect exactly **three** hook-loaded extensions:

- `Umbraculum Toolset Common`
- `Umbraculum Node React Cursor Assistant` (or similar marketplace label)
- `Umbraculum Platform Tsjs Cursor Assistant` (or similar)

**Must NOT appear** for this workspace: `Rf Magento Cursor Assistant`,
`Umbraculum Openplc Python Cursor Assistant`.

Marketplace add-ons (e.g. **Prisma**) are independent and follow their own
per-workspace toggles.

**Settings → Hooks** — `workspaceOpen` last run should list **three**
`pluginPaths` under your umbraculum-toolset source directories.

### Cursor marketplace install (post-publication — preferred steady state)

When the four umbraculum-toolset listings publish:

1. Open **Cursor → Settings → Plugins → Browse Marketplace** and install
   the three plugins required for umbraculum-dev (common, node-react,
   platform-tsjs) **for this workspace only** — use per-workspace enablement,
   not "Add for Myself" across all workspaces unless you want them everywhere.
2. **Remove** the corresponding `add()` lines from
   `~/.cursor/hooks/register-workspace-plugins.sh` for plugins now installed
   from the marketplace (avoid double-load).
3. Keep the hook for plugins still loaded from source (plugin HEAD development)
   or for repos not yet on the marketplace.

> **Status**: as of writing, the umbraculum-toolset plugins are not yet
> on the marketplace. This section activates when the four marketplace
> listings go live (see [`ROADMAP.md`](ROADMAP.md) and
> [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1).

### Extended rules (umbraculum-toolset-common ≥ 0.0.2)

After updating from source (hook picks up changes on Reload Window), these
additional **always-on** rules ship in `umbraculum-toolset-common`:

| Rule | Purpose |
|------|---------|
| `48-rfc-companion-documentation-gate.mdc` | Read RFC §1 + companion surface docs before implementing RFC-backed consumers; update rendering registry when adding templates |
| `49-plan-documentation-context.mdc` | Feature plans include a **Documentation context** table (RFC, surfaces, plugin rules, runbook) |

Companion skills: `rfc-companion-doc-audit`, `plan-documentation-context`. Repo pointers: [`docs/rfcs/README.md`](rfcs/README.md) §3, [`docs/design/rfc-companion-documentation-audit.md`](design/rfc-companion-documentation-audit.md).

## Verify the install

### 1. Reload first

After hook setup or `git pull` in umbraculum-toolset: **Ctrl+Shift+P** →
**Developer: Reload Window** (or quit and reopen this workspace). Skipping
reload is the most common cause of "plugins missing" false failures.

### 2. Settings → Plugins (workspace filter)

Confirm exactly **three** umbraculum extensions for **this** workspace (see
[umbraculum-dev pairing](#umbraculum-dev-pairing--what-settings--plugins-should-show)).
Hook-loaded plugins show as **Extension** with rule/skill/agent counts.

### 3. Settings → Hooks

Confirm `workspaceOpen` is registered and the last run output lists **three**
`pluginPaths` pointing at your umbraculum-toolset source clone.

### 4. Agent witness-rule prompt

Open this repo in Cursor, start a fresh agent session, and ask the agent
literally:

> *List the active rules currently loaded in your context whose filename
> is exactly one of: `00-development-local-addendum-gate.mdc`,
> `22-typescript-contracts-runtime-validation.mdc`,
> `02-foundation-hardening.mdc`.*

The agent should reply with **three matches**, one per required umbraculum-
toolset plugin loaded for this workspace.

If any of the witnesses are missing, **first try a window reload** (step 1),
then re-ask. If still missing, re-check the hook script paths and
[Install](#install) above.

(The formal version of this check, run by the agent automatically as its
first action in any non-trivial task, lives in
[`../AGENTS.md`](../AGENTS.md) — including the same "try a window
reload first" pre-step in its soft-block protocol.)

### 5. Optional — plugin loader log

`~/.config/Cursor/logs/<session>/window<N>/exthost/anysphere.cursor-agent-exec/Cursor Plugins.log`

Good signals: each expected plugin registered once from your toolset source
path; `loadUserLocalPlugins … (0 plugins loaded)` when `local/` is empty.
Details: toolset [`WORKSPACE-PLUGIN-LOADING.md` §5](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/WORKSPACE-PLUGIN-LOADING.md#5-verification-checklist).

## Non-Cursor agents

If you use Claude Code, Codex CLI, or another agent that does not load
Cursor plugins natively:

- The rules + skills + agents content is still useful as **system-prompt
  / project-instructions context**. Clone the same `umbraculum-toolset`
  repo and use the agent's project-instructions mechanism to include the
  plugin content from `cursor-plugins/umbraculum-*/rules/` (and `skills/`,
  `agents/`).
- Per-agent inclusion paths:
  - **Claude Code**: project-root `CLAUDE.md` (Claude Code reads it
    automatically at session start). Append a `## Cursor plugin rules`
    section that `cat`s the umbraculum rule files.
  - **Codex CLI**: project-root `.codex/instructions` (or the equivalent
    project-instructions slot in the Codex configuration).
  - **Generic agents that honor `AGENTS.md`**: the repo-root
    [`../AGENTS.md`](../AGENTS.md) already routes through the same
    self-check; the agent just falls back to filesystem inspection
    instead of rule introspection.
- This path is supported but more manual than Cursor + plugins. Cursor
  is the recommended IDE for contributing to umbraculum; other agents
  are second-class until the toolset publishes equivalent extension
  packages (post-marketplace-flip).

## Future: minimum-version enforcement

The current [`../AGENTS.md`](../AGENTS.md) check enforces **presence
only**, not minimum versions. A future revision will:

1. Pin minimum versions in a machine-readable manifest at
   `.cursor/required-plugins.json` (single source of truth for both
   agent-side and CI-side checks).
2. Add a CI parity check that confirms PR-time CI is running the same
   plugin versions as agent-side authoring (mitigation for the
   local-vs-CI divergence mechanism documented in
   `umbraculum-node-react-cursor-assistant/rules/72-ci-parity-local-vs-ci-divergence.mdc`).
3. Update [`../AGENTS.md`](../AGENTS.md) to read the manifest and gate
   on both presence and minimum version.

The presence-only check is the **v1** gate; the version-pinned check
will follow once the plugin pack stabilizes post-marketplace-flip.

## Repo-side fallback for unenforced `alwaysApply` rules (work-in-progress; consistency-first)

The witness-rule self-check above (and in [`../AGENTS.md`](../AGENTS.md))
plus the future minimum-version pin both address **presence**: is the
plugin pack installed and loaded into the agent's context? They do **not**
address **enforcement**: does the agent observably act on the loaded
rules' directives?

The Umbraculum project treats plugin-level `alwaysApply: true`
enforcement as work-in-progress. If you observe a specific
`alwaysApply: true` rule from one of the toolset plugins failing to be
enforced reliably on this project — the rule is present per the
witness-rule introspection, but the agent's behavior is observably not
honoring the rule's directives — the documented immediate fix is to
**copy** the rule from the plugin **source clone** into this repo:

```bash
mkdir -p .cursor/rules
# Hook install (recommended): $TOOLSET = your umbraculum-toolset/cursor-plugins path
cp "$TOOLSET/<plugin-name>/rules/<rule>.mdc" \
   .cursor/rules/<rule>.mdc
git add .cursor/rules/<rule>.mdc
git commit -m "chore(.cursor/rules): copy <rule>.mdc from <plugin-name> as enforcement fallback"
```

If you deliberately use legacy global rsync (`install-local.sh.legacy`), the
source file may instead live at
`~/.cursor/plugins/local/<plugin-name>/rules/<rule>.mdc`.

Discipline summary (the full version is in the canonical policy linked
below):

- **COPY, not move.** The plugin copy stays put. Sister repos installing
  the same plugin still get the rule via the plugin.
- **Do not refactor.** The repo copy is a verbatim duplicate at the
  moment of the copy — no content, frontmatter, scope, or wording
  changes.
- **Do not delete the plugin copy.** The plugin remains the canonical
  source; the repo copy is a consistency fallback against an
  environmental enforcement gap, not a replacement.
- **Report the enforcement gap to the plugin core team — load-bearing.**
  Open an issue at
  <https://github.com/umbraculum-dev/umbraculum-toolset/issues>
  describing the rule, plugin, consuming repo, Cursor build
  (Help → About in Cursor Desktop; `cursor --version` for the CLI),
  agent runtime, expected-vs-actual behavior, and witness-rule
  introspection output. Without the report, the fallback degrades into
  silent forking — every consumer fixes its own copy, the plugin pack
  never improves, and the enforcement gap becomes permanent.

The full canonical policy — including the discipline boundaries (this
fallback is for `alwaysApply: true` rules that observably fail to
enforce; it is NOT a workaround for conditional / glob-scoped rules,
which have their own Read-based verification path per the witness-rule
contract) and the deferred-questions list (when to delete the repo
copy, drift management, longer-term architecture) — lives at the
toolset-level
[`cursor-plugins/README.md` § "Repo-side fallback for unenforced `alwaysApply` rules`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/README.md#repo-side-fallback-for-unenforced-alwaysapply-rules-work-in-progress-consistency-first).

## Plugin descriptions

### `@umbraculum/ci-parity` (npm — sibling to plugins)

Not a Cursor plugin. Published MIT package in
[`umbraculum-toolset` `packages/ci-parity`](https://github.com/umbraculum-dev/umbraculum-toolset/tree/master/packages/ci-parity)
that runs docs / lint / typecheck jobs from `.umbraculum/ci-parity.json`.
The apparatus references it via rule `72-ci-parity-local-vs-ci-divergence`
and skill `ci-parity-local-reproduction`. Install: `npx @umbraculum/ci-parity`.
See [`docs/CI-PARITY.md`](CI-PARITY.md).

### `umbraculum-toolset-common`

Common meta-framework rules + skills shared by the four umbraculum-toolset
plugins. Carries language- and domain-agnostic discipline (DEVELOPMENT-LOCAL
addendum gate, Skill Contract, commit-message ticket-prefix discipline,
plugin-source-vs-installed-mirror guardrail, public-endpoint verification
gate). Install alongside any of the other plugins; never alone. Loads on
**every** workspace (hook default branch).

### `umbraculum-node-react-cursor-assistant`

Generic Node/TypeScript/React/E2E guardrails. Safe to install in any TS/JS
project; the `umbraculum-` brand prefix is for marketplace name-uniqueness,
not because the plugin is umbraculum-specific. Covers TS strict flags,
Zod v4 runtime validation, ESLint flat-config hygiene, React accessibility,
Playwright/E2E conventions, monorepo package boundaries, container-only
Node/npm execution, and frontend known-issues patterns.

**Verification tiers (umbraculum-dev):** after TS edits, use skills
`verify-slice-runbook` (T0/T1) and `scoped-package-build-in-docker` before
declaring done; T2-PR uses **`path-aware-pre-push`** (default:
`npm run verify:pre-push`); T2-release uses `ci-parity-local-reproduction`
(`--full` / `verify:pre-push:release`). API vitest auto-runs from T2-PR when
triggered; else `api-integration-tests-pre-push`. Rule `76-verification-tiers-gate.mdc`.
Repo doc: [`docs/VERIFICATION-TIERS.md`](../docs/VERIFICATION-TIERS.md).

**Docs-site rules (umbraculum-dev):** `73-website-static-build-before-preview.mdc` (rebuild brochure `dist/` before preview); `74-docusaurus-swizzle-over-css-fights.mdc` (swizzle theme components instead of fighting `custom.css` — see [`docs-site/README.md`](../docs-site/README.md) § Theme customization).

### `umbraculum-platform-tsjs-cursor-assistant`

Umbraculum-platform-specific layer on top of
`umbraculum-node-react-cursor-assistant`. Encodes the four-slice
foundation-hardening discipline (lint + types + tests + docs) and the
multi-tenant workspace-scoped architectural patterns. Ships the
`types-baseline-verifier` and `module-readme-checker` subagents, the
`package-scope-migration-preflight`, `typescript-strict-flag-verification`,
`module-readme-verification`, and `l2-cross-workspace-isolation-test`
skills. Install **only** in umbraculum-platform projects; not useful in
generic TS/JS projects.

### `rf-magento-cursor-assistant`

Magento 2 / PHP rules + skills + subagents. Required only when the change
set touches Magento code (in **Magento workspaces**, not umbraculum-dev).
Covers DI patterns, area scoping, ObjectManager fallback discipline,
template / ViewModel migration, integration test sandboxing, unit test
runbooks, debug-mode MySQL access policy, and the Magento-specific subagents
(`magento-debugger`, `phpunit-runner`, `template-refactor-verifier`,
`verifier`, `e2e-smoke`).
