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

## Required plugin pack

| Plugin | Role | Required for | Witness rule |
|---|---|---|---|
| [`umbraculum-toolset-common`](#umbraculum-toolset-common) | Language-agnostic meta-framework — DEVELOPMENT-LOCAL gate, Skill Contract, commit-message ticket-prefix discipline, public-endpoint verification gate, plugin-source-vs-installed-mirror guardrail. | every task | `00-development-local-addendum-gate.mdc` |
| [`umbraculum-node-react-cursor-assistant`](#umbraculum-node-react-cursor-assistant) | Node/TypeScript/React/E2E guardrails — TS strict flags, Zod v4 contracts validation, ESLint flat-config hygiene, Playwright/E2E conventions, React accessibility, monorepo package boundaries, frontend known-issues. | every task | `22-typescript-contracts-runtime-validation.mdc` |
| [`umbraculum-platform-tsjs-cursor-assistant`](#umbraculum-platform-tsjs-cursor-assistant) | Umbraculum-platform-specific — foundation-hardening cross-slice anchor, module-README authoring standard, package-scope migration preflight, L2 workspace isolation scaffolding, types-baseline + module-README subagents. | every task | `02-foundation-hardening.mdc` |
| [`rf-magento-cursor-assistant`](#rf-magento-cursor-assistant) | Magento 2 / PHP rules + skills + subagents — DI patterns, area scoping, template / ViewModel migration, integration + unit test runbooks. | tasks touching Magento code only | `00-core.mdc` |

A **fifth** plugin in the umbraculum-toolset family —
`umbraculum-openplc-python-cursor-assistant` — applies to the OpenPLC +
Python industrial-automation **sister-repo**, not to umbraculum-dev. Do
**not** install it here.

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

### Install

1. **Cursor → Settings → Plugins → Browse Marketplace**
2. Search **Prisma** and install the **official** plugin (description: *MCP server integration, rules, skills, and automation for database development*).
3. **Developer: Reload Window** after install.
4. Optional: **Settings → Features → MCP** — enable **Prisma Local** and/or **Prisma Remote** for schema introspection from the agent.

The umbraculum-toolset installer (`install-local.sh`) does **not** install
this plugin; it comes from the Cursor marketplace only.

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
the listings publish, the canonical install path is local-from-source
via the public sister-repo
[`umbraculum-toolset`](https://github.com/umbraculum-dev/umbraculum-toolset)
(URL becomes live when the **toolset sister-repo** flips visibility from
private → public — same atomic moment as the `umbraculum-dev` public flip,
per [`ROADMAP.md`](ROADMAP.md) §"Late H1 / July 2026" Week 3 Stage 2 and
[`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 closure
criterion; pre-flip contributors use a private mirror).

### Cursor marketplace install (post-submission — preferred)

Open **Cursor → Settings → Plugins → Browse Marketplace** and install the
four plugins from the table above by name. The marketplace install
delivers the plugin into `~/.cursor/plugins/<scope>/<plugin>/` (the exact
layout is Cursor-managed), enables it by default, and surfaces it in the
Plugins panel **without** a `Local` badge.

> **Status**: as of writing, the umbraculum-toolset plugins are not yet
> on the marketplace. **Submission happens during the June cutover-prep
> window per [`ROADMAP.md`](ROADMAP.md) §"Late H1 / July 2026" — Week 3;
> the public-alpha procedure is not COMPLETE until the four marketplace
> listings are live** (Cursor-side approval timing — days to weeks; see
> [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §10.1.1 closure
> criterion). This section will be updated with the four direct
> marketplace install URLs (one per plugin) immediately after the
> listings publish.

### Local install from source (current path)

```bash
# 1. Clone the public plugin-source repo
git clone https://github.com/umbraculum-dev/umbraculum-toolset.git
cd umbraculum-toolset/cursor-plugins

# 2. Run the install script (symlinks each plugin folder into
#    ~/.cursor/plugins/local/<plugin>/)
./scripts/install-local.sh

# 3. (Optional) Prune pre-rename plugin folders from prior installs
./scripts/install-local.sh --prune
```

After install, restart Cursor. The four plugins will appear in
**Cursor → Settings → Plugins** with a `Local` badge.

Enable each plugin from the Plugins settings panel.

### Extended rules (umbraculum-toolset-common ≥ 0.0.2)

After reinstalling from source, these additional **always-on** rules ship in `umbraculum-toolset-common`:

| Rule | Purpose |
|------|---------|
| `48-rfc-companion-documentation-gate.mdc` | Read RFC §1 + companion surface docs before implementing RFC-backed consumers; update rendering registry when adding templates |
| `49-plan-documentation-context.mdc` | Feature plans include a **Documentation context** table (RFC, surfaces, plugin rules, runbook) |

Companion skills: `rfc-companion-doc-audit`, `plan-documentation-context`. Repo pointers: [`docs/rfcs/README.md`](rfcs/README.md) §3, [`docs/design/rfc-companion-documentation-audit.md`](design/rfc-companion-documentation-audit.md).

## Verify the install

Open this repo in Cursor, start a fresh agent session, and ask the agent
literally:

> *List the active rules currently loaded in your context whose filename
> is exactly one of: `00-development-local-addendum-gate.mdc`,
> `22-typescript-contracts-runtime-validation.mdc`,
> `02-foundation-hardening.mdc`.*

The agent should reply with **three matches**, one per required umbraculum-
toolset plugin. If your work touches Magento code, also ask it to check
for `00-core.mdc` (witness for `rf-magento-cursor-assistant`).

If any of the witnesses are missing, **first try a window reload**
before reaching for the install procedure: press **`Ctrl+Shift+P`**
(or **`Cmd+Shift+P`** on macOS) and run **"Reload Window"**, then
re-ask the agent the same question. Plugins are sometimes installed
and enabled but not yet visible in the agent's rule context until the
window is re-initialized; this is a known false-positive on the
witness-rule check. If the witnesses are still missing after the
reload, the corresponding plugin is genuinely not loaded — see the
**Install** section above to add it, then re-verify.

(The formal version of this check, run by the agent automatically as its
first action in any non-trivial task, lives in
[`../AGENTS.md`](../AGENTS.md) — including the same "try a window
reload first" pre-step in its soft-block protocol.)

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
**copy** the rule from the installed plugin into this repo:

```bash
mkdir -p .cursor/rules
cp ~/.cursor/plugins/local/<plugin-name>/rules/<rule>.mdc \
   .cursor/rules/<rule>.mdc
git add .cursor/rules/<rule>.mdc
git commit -m "chore(.cursor/rules): copy <rule>.mdc from <plugin-name> as enforcement fallback"
```

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
[`cursor-plugins/README.md` § "Repo-side fallback for unenforced `alwaysApply` rules"](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/README.md#repo-side-fallback-for-unenforced-alwaysapply-rules-work-in-progress-consistency-first).

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
gate). Install alongside any of the other plugins; never alone.

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
set touches Magento code (currently isolated within this repo). Covers
DI patterns, area scoping, ObjectManager fallback discipline, template /
ViewModel migration, integration test sandboxing, unit test runbooks,
debug-mode MySQL access policy, and the Magento-specific subagents
(`magento-debugger`, `phpunit-runner`, `template-refactor-verifier`,
`verifier`, `e2e-smoke`).
