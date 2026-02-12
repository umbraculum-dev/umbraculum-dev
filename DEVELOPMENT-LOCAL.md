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

- **ACCESSIBILITY-FIRST (MANDATORY)**:
  - Before implementing or modifying ANY UI, read: `docs/DEVELOPMENT-ACCESSIBILITY.md` and follow it as a hard constraint.
  - Target: WCAG 2.2 AA + EN 301 549 outcomes (web + native).
  - Prefer semantic HTML / native controls; avoid div-based interactive elements.
  - All interactive controls MUST have accessible names:
    - Web: visible `<label>` or `aria-label`/`aria-labelledby` for icon-only controls
    - Mobile: `accessibilityLabel`/`accessibilityRole` as appropriate
  - Keyboard: all flows must be operable via keyboard (web); never introduce focus traps; keep visible focus.
  - Forms: label + error wiring is mandatory; errors must be perceivable and announced (`aria-describedby` + summary/live region).
  - Modals/menus/popovers: correct roles + focus management (focus in, trap, return); ESC closes where appropriate.
  - Respect reduced motion preferences (`prefers-reduced-motion` / OS settings).
  - Color is never the only signal; maintain contrast for text/critical UI.
  - Testing: add/maintain Playwright coverage for changed flows; use `getByRole`/`getByLabel` when stable and `data-testid` only for workflow-critical elements/custom widgets.
  - CI hygiene: no new critical a11y lint issues; if axe checks exist for the flow, they must pass or be justified + tracked as tech debt.
  - If accessibility requirements conflict with design, propose an accessible alternative—do not ship inaccessible UI.

- **Big picture**: `docs/architechture.md`
- **Roadmap**: `docs/ROADMAP.md`
- **Work tracker**: `TODOs.md`
- **Local dev entrypoint**: `docker compose up --build`
- **Local ports** (repo-local `.env`, not committed):
  - `NGINX_HTTP_PORT=18080` (defaults to `8080` if unset)
- **Next.js dev note**: Avoid running `docker compose exec web npm run build` while `next dev` is running. If you need typecheck/build again, either stop `web` first or be ready to wipe `.next` and restart `web`.

