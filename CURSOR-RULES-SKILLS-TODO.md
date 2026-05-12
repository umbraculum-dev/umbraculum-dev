# CURSOR-RULES-SKILLS-TODO (upstream backlog)

This file tracks candidate Cursor **Rules** and **Skills** discovered while evolving this repo.

Purpose:
- keep improvements recorded in an upstream-ready format
- periodically port them into the canonical rules/skills repo (outside this project) or a Cursor plugin

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
  - **Status**: ✅ Upstreamed in `@rftsu/cursor-rules` **3.1.1** (2026-05-12). Pending the next `npm install` of v3.1.1+ to land via sync. brewery-app has been pre-aligned to the new text.
  - **Notes/Links**:
    - Upstream file: `/home/rf/dkprojects/thesiteup/cursor-rules/github-repo/.cursor/rules/20-tests-must-follow-changes.mdc`
    - Project-local single source of truth (brewery): [`docs/TESTING.md`](docs/TESTING.md)
    - Companion rule consulted by the new section: `.cursor/skills/node-npm-container-only.md`

- **Title**: New skill `agentic-browser-web-app.md` — agent-driven integrated-browser E2E for TS/JS web apps
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: Standardizes how the agent drives the integrated browser against a running TS/JS web app for exploratory / on-demand E2E (L6 in brewery terms): inputs (persona/fixture/job), mandatory run-dir layout, signal-only semantics, max-5-commands bound. Sibling of the existing `agentic-e2e-runbook.md` (which is for control-panel CLI E2E).
  - **Scope**: reusable-across-repos
  - **Status**: ✅ Upstreamed in `@rftsu/cursor-rules` **3.1.1** (2026-05-12). Pending `npm install` sync.
  - **Notes/Links**:
    - Upstream file: `/home/rf/dkprojects/thesiteup/cursor-rules/github-repo/.cursor/skills/agentic-browser-web-app.md`
    - Brewery job catalog (where the upstream skill defers to): [`docs/agentic-jobs.md`](docs/agentic-jobs.md)
    - Brewery test-MCP package (provides `loginAs`, etc.): [`packages/test-mcp`](packages/test-mcp)
  - **Inputs_required (do_not_assume)**: `<APP_BASE_URL>`, `<PERSONA_EMAIL>`, `<PERSONA_PASSWORD>`, `<FIXTURE_FILE>`, `<JOB>`, optional `<RUN_DIR_ROOT>`, `<MCP_BASE_URL>`
  - **Commands**: max 5 (discover → smoke → optional loginAs → drive job → write artifacts)
  - **Stop_conditions**: smoke red; 502/500 after one retry; UI hang > 30s; ambiguous selector; one full run

- **Title**: New skill `test-mcp-server.md` — project-local test-MCP HTTP server pattern
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: Standardizes the "expose project test tools as one-call JSON endpoints" pattern (smoke, seed, run-unit/integration/contracts, Playwright, loginAs) with a recommended tool catalog and a run-dir contract aligned with the agentic-browser skill. Lets parent agents have a uniform "where did the last run go" answer regardless of which surface ran it.
  - **Scope**: reusable-across-repos
  - **Status**: ✅ Upstreamed in `@rftsu/cursor-rules` **3.1.1** (2026-05-12). Pending `npm install` sync.
  - **Notes/Links**:
    - Upstream file: `/home/rf/dkprojects/thesiteup/cursor-rules/github-repo/.cursor/skills/test-mcp-server.md`
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

