<!-- BEGIN managed-by-cursor-rules -->
# Development local addendum (project-specific, optional)

This file is an **optional** companion to the cursor-repo-root `DEVELOPMENT.md`.

- If this file exists, assistants should read it immediately after `DEVELOPMENT.md`.
- Keep this file short and high-signal.
- Prefer pointing to runbooks under `.cursor/skills/` rather than duplicating long procedures here.

## Project summary (read this first)

- This is a **custom TypeScript project** (not Magento, not PHP).
- Planned stack: **Next.js (web) + Fastify (API) + Prisma + Postgres**, with **Docker Compose + Nginx** for local routing parity.
- Canonical big-picture plan: `docs/architechture.md`

## Announcements (from cursor-rules)

- Shared runbooks (“skills”) are available under `.cursor/skills/`. Consider moving long procedures out of `.cursor/rules/*.mdc` and into skills, then link them from `DEVELOPMENT.md` / `DEVELOPMENT-LOCAL.md`.

## Canonical repo location (examples only)

- Example canonical repo root on your machine: `/abs/path/to/repo`
- Example Cursor worktree root (do not assume): `/home/<user>/.cursor/worktrees/...`

## Containers / services (fill in; do not assume)

- `<PHP_CONTAINER>`: `<fill_me>`
- `<NODE_CONTAINER>`: `<fill_me>`
- `<E2E_API_CONTAINER>`: `<fill_me>`
- Repo workdir inside containers (example): `/app`

## Local stack notes

- Known slow commands / timeouts:
  - `<fill_me>`
- Allowlist patterns you prefer (if using allowlists):
  - `<fill_me>`

## E2E defaults (only if your project has stable defaults)

- `<ORG>`: `<fill_me>`
- `<ENV>`: `<fill_me>`
- `<SITES>`: `<fill_me>`
- `<PERSONAS>`: `<fill_me>`

## Quick links to runbooks (Skills)

- `.cursor/skills/agentic-e2e-runbook.md`
- `.cursor/skills/frontend-assets-gulp-scss.md`
- `.cursor/skills/admin-theme-css-triage.md`
- `.cursor/skills/config-management-app-config-dump.md`
- `.cursor/skills/phpunit-unit-runbook.md`
- `.cursor/skills/magento-integration-tests-runbook.md`
- `.cursor/skills/magento-known-issues.md`
<!-- END managed-by-cursor-rules -->

## Project notes (unmanaged)

Anything below this heading is **project-owned** and will not be overwritten by the sync tool.

- `<fill_me>`

