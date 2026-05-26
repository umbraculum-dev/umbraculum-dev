# CURSOR-RULES-SKILLS-TODO (plugin backlog)

This file tracks candidate Cursor **Rules** and **Skills** discovered while evolving this repo.

Purpose:
- keep improvements recorded in an upstream-ready format
- periodically port reusable items into the umbraculum-toolset Cursor plugin pack
- reserve repo-local `.cursor/rules/` only for troubleshooting an observed plugin `alwaysApply` enforcement gap (copy from the plugin install path; do not author a fork from scratch)

## Entry template (copy/paste)

- **Title**:
- **Rule_or_Skill**: Rule | Skill
- **Why (problem it prevents)**:
- **Scope**: repo-specific | reusable-across-repos
- **Notes/Links**:
  - Related files in this repo:

### If Skill (must follow Skill Contract)

- **Inputs_required (do_not_assume)**:
- **Prerequisites**:
- **Commands**: (max 5 commands; no loops/polling)
- **Stop_conditions**:
- **Bounds (hard)**:

## Backlog

- **Title**: Extend `20-tests-must-follow-changes.mdc` from Magento-only to Magento + TS/JS monorepos
  - **Rule_or_Skill**: Rule
  - **Why (problem it prevents)**: Keep tests evolving with code in TS monorepos (apps/services/packages), not just Magento `app/code`. Drives the cheapest-test-layer choice via a small mapping table; defers project specifics to a per-project `docs/TESTING.md`.
  - **Scope**: reusable-across-repos
  - **Status**: ✅ Migrated to the `umbraculum-node-react-cursor-assistant` plugin.
  - **Notes/Links**:
    - Plugin file: `~/.cursor/plugins/local/umbraculum-node-react-cursor-assistant/rules/20-tests-must-follow-changes.mdc`
    - Project-local single source of truth (brewery): [`docs/TESTING.md`](docs/TESTING.md)
    - Companion skill consulted by the new section: `~/.cursor/plugins/local/umbraculum-node-react-cursor-assistant/skills/node-npm-container-only/SKILL.md`

- **Title**: New skill `agentic-browser-web-app.md` — agent-driven integrated-browser E2E for TS/JS web apps
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: Standardizes how the agent drives the integrated browser against a running TS/JS web app for exploratory / on-demand E2E (L6 in brewery terms): inputs (persona/fixture/job), mandatory run-dir layout, signal-only semantics, max-5-commands bound. Sibling of the existing `agentic-e2e-runbook.md` (which is for control-panel CLI E2E).
  - **Scope**: reusable-across-repos
  - **Status**: ✅ Migrated to the `umbraculum-node-react-cursor-assistant` plugin.
  - **Notes/Links**:
    - Plugin file: `~/.cursor/plugins/local/umbraculum-node-react-cursor-assistant/skills/agentic-browser-web-app/SKILL.md`
    - Brewery job catalog (where the upstream skill defers to): [`docs/AGENTIC-JOBS.md`](docs/AGENTIC-JOBS.md)
    - Brewery test-MCP package (provides `loginAs`, etc.): [`packages/test-mcp`](packages/test-mcp)
  - **Inputs_required (do_not_assume)**: `<APP_BASE_URL>`, `<PERSONA_EMAIL>`, `<PERSONA_PASSWORD>`, `<FIXTURE_FILE>`, `<JOB>`, optional `<RUN_DIR_ROOT>`, `<MCP_BASE_URL>`
  - **Commands**: max 5 (discover → smoke → optional loginAs → drive job → write artifacts)
  - **Stop_conditions**: smoke red; 502/500 after one retry; UI hang > 30s; ambiguous selector; one full run

- **Title**: New skill `test-mcp-server.md` — project-local test-MCP HTTP server pattern
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: Standardizes the "expose project test tools as one-call JSON endpoints" pattern (smoke, seed, run-unit/integration/contracts, Playwright, loginAs) with a recommended tool catalog and a run-dir contract aligned with the agentic-browser skill. Lets parent agents have a uniform "where did the last run go" answer regardless of which surface ran it.
  - **Scope**: reusable-across-repos
  - **Status**: ✅ Migrated to the `umbraculum-node-react-cursor-assistant` plugin.
  - **Notes/Links**:
    - Plugin file: `~/.cursor/plugins/local/umbraculum-node-react-cursor-assistant/skills/test-mcp-server/SKILL.md`
    - Brewery implementation (reference subset): [`packages/test-mcp`](packages/test-mcp), [`packages/test-mcp/README.md`](packages/test-mcp/README.md)
  - **Inputs_required (do_not_assume)**: `<TEST_MCP_BASE_URL>`, `<TOOL>`, `<ARGS>`, optional `<RUN_DIR_ROOT>`, `<APP_BASE_URL>`
  - **Commands**: max 5 (discover → smoke → optional seed → invoke tool → read run-dir)
  - **Stop_conditions**: tool not in discovery list; smoke red; non-JSON or HTTP >= 400; missing `verdict.txt`; one invocation per session

- **Title**: Build shared packages (`dist/`) in container
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: Avoid Metro consuming raw workspace TS; ensure `dist/` is up to date without running npm on host.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Related files in this repo:
      - `package.json` (`build:packages`)
      - `packages/*/package.json` (`build` scripts)

- **Title**: Guardrail: apps/services must not import `packages/*/src/**`
  - **Rule_or_Skill**: Rule
  - **Why (problem it prevents)**: Prevent web-only coupling that breaks native; enforce package `exports` boundaries.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Related files in this repo:
      - `docs/CODING-STANDARDS.md` (“Native-ready packages” + strict placement)

- **Title**: npm workspaces + package-lock link entries can break installs
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: `npm install` may fail with `Invalid Version` when nested workspace link entries are `{}` in `package-lock.json`.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Related files in this repo:
      - `package-lock.json` (link entries under `services/api/node_modules/@brewery/*`)

- **Title**: Decision-log audit-table convention (architectural deferral docs)
  - **Rule_or_Skill**: Rule (or addition to an existing rule like `13-rule-skill-authoring-gate`)
  - **Why (problem it prevents)**: When an architectural decision is deferred with explicit "re-evaluate when X" trigger criteria (Zod / Valibot / TypeBox migration is the canonical example here, but the pattern generalises to "should we adopt React Server Components", "should we move from REST to tRPC", "should we replace Tamagui with X", etc.), the natural lazy outcome is "we never actually re-evaluate." Without a structured cadence, the doc rots: the trigger criteria stay phrased the same way the day they were written, the decision stays "no" by default, and a future maintainer faced with one of the criteria firing has no way to know whether the deferral was last looked at 6 months ago or 3 years ago. The audit-log table convention solves this by making each scheduled re-evaluation a structured per-criterion column append, so the doc accumulates evidence over time and a future re-opener can see how each criterion's signal has trended across audits.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Canonical example added in this repo: [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](docs/CONTRACTS-VALIDATION-STRATEGY.md) § Audit log (introduced 2026-05-16, commit `084e871`).
    - Convention: each audit appends a rightmost column to the per-criterion table; archive into `<doc>-AUDIT-ARCHIVE.md` when the column count gets unwieldy. The decision log row references the audit-log section by anchor link.
    - Suggested upstream form: a one-paragraph rule (`xx-deferred-architectural-decision-doc-convention.mdc`) that lays out the structure (status banner with last-audited date, decision log most-recent-first, audit log per-criterion table) without dictating content. Applies to any `docs/*-STRATEGY.md` that has the form "we considered X, decided to defer, here's why, here's when to revisit."

- **Title**: Repo-local `.cursor/rules/` fallback for plugin `alwaysApply` enforcement gaps
  - **Rule_or_Skill**: Rule
  - **Why (problem it prevents)**: The normal delivery path is the umbraculum-toolset plugin pack. If a plugin-shipped `alwaysApply: true` rule is present but Cursor fails to enforce it reliably, the documented immediate fix is to copy that rule into repo-local `.cursor/rules/` so the current repo remains consistent while the plugin enforcement gap is reported and fixed upstream. This prevents contributors from inventing divergent local policy while still giving maintainers an emergency troubleshooting path.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Canonical policy: [`AGENTS.md`](../../AGENTS.md) § "Repo-side fallback for unenforced `alwaysApply` rules".
    - Copy from `~/.cursor/plugins/local/<plugin-name>/rules/<rule>.mdc` into `.cursor/rules/<rule>.mdc`; COPY not move; do not edit installed plugin mirrors.
    - Use only for observed enforcement failures, not as the primary authoring path for new rules.

