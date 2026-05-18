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
  - **Status**: ✅ Upstreamed in `@rftsu/cursor-rules` **3.1.1** (2026-05-12). Pending the next `npm install` of v3.1.1+ to land via sync. umbraculum-dev has been pre-aligned to the new text.
  - **Notes/Links**:
    - Upstream file: `~/dkprojects/thesiteup/cursor-rules/github-repo/.cursor/rules/20-tests-must-follow-changes.mdc`
    - Project-local single source of truth (brewery): [`docs/TESTING.md`](docs/TESTING.md)
    - Companion rule consulted by the new section: `.cursor/skills/node-npm-container-only.md`

- **Title**: New skill `agentic-browser-web-app.md` — agent-driven integrated-browser E2E for TS/JS web apps
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: Standardizes how the agent drives the integrated browser against a running TS/JS web app for exploratory / on-demand E2E (L6 in brewery terms): inputs (persona/fixture/job), mandatory run-dir layout, signal-only semantics, max-5-commands bound. Sibling of the existing `agentic-e2e-runbook.md` (which is for control-panel CLI E2E).
  - **Scope**: reusable-across-repos
  - **Status**: ✅ Upstreamed in `@rftsu/cursor-rules` **3.1.1** (2026-05-12). Pending `npm install` sync.
  - **Notes/Links**:
    - Upstream file: `~/dkprojects/thesiteup/cursor-rules/github-repo/.cursor/skills/agentic-browser-web-app.md`
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
    - Upstream file: `~/dkprojects/thesiteup/cursor-rules/github-repo/.cursor/skills/test-mcp-server.md`
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

- **Title**: `git+ssh` cursor-rules sync path (avoid GitHub Packages PAT friction)
  - **Rule_or_Skill**: Skill (extension to an existing cursor-rules-sync skill, or a new one)
  - **Why (problem it prevents)**: When a repo consumes a GitHub-Packages-hosted private package (`@<scope>/<package>` on `npm.pkg.github.com`) via a one-off `npx` rather than as a dependency in `package.json`, the standard guidance is "set `GITHUB_TOKEN` to a PAT with `read:packages`." This routinely breaks: the PAT is missing, expired, in the wrong account, or scoped wrong, producing `npm error 401 Unauthenticated` with no actionable next step. The friction-free alternative is to use `npx -p git+ssh://...` with an SSH alias that has access to the source repository — npx clones the package via SSH (using the existing key + agent), bypassing npm registry auth entirely. This works whenever the consumer has an SSH key configured for the source-repo host (which they typically do, since they already pushed to that host).
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Documented in this repo: [`DEVELOPMENT-LOCAL.md`](DEVELOPMENT-LOCAL.md) "Cursor rules/skills sync command (one-off, not in package files)" bullet.
    - Canonical command form (replace placeholders): `npx -y -p 'git+ssh://git@<SSH_HOST_ALIAS>:<ORG>/<REPO>.git#v<TAG>' <CLI_NAME>` — e.g. `npx -y -p 'git+ssh://git@github-thesiteup:rftsu/cursor-rules.git#v3.1.11' cursor-rules-sync`.
    - Discovered after a real `E401` failure pivoted into a working sync this session (commit `084e871`).
    - Suggested upstream form: a small skill that documents the two paths (PAT-based, `git+ssh://`-based) side-by-side with the failure modes of each. Should be referenced from any cursor-rules-sync runbook.

