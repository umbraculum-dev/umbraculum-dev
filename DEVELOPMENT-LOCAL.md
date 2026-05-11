<!-- BEGIN managed-by-cursor-rules -->
# Development local addendum (project-specific, optional)

This file is an **optional** companion to the cursor-repo-root `DEVELOPMENT.md`.

- If this file exists, assistants should read it immediately after `DEVELOPMENT.md`.
- Keep this file short and high-signal.
- Prefer pointing to runbooks under `.cursor/skills/` rather than duplicating long procedures here.

## Project summary (read this first)

- This is a **custom TypeScript project** (not Magento, not PHP).
- Planned stack: **Next.js (web) + Fastify (API) + Prisma + Postgres**, with **Docker Compose + Nginx** for local routing parity.
- Canonical big-picture plan: `docs/architechture-Rev02.md`

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

- **CSS structure**: See `docs/CODING-STANDARDS.md` → "CSS structure" for file layout and naming.
- **Big picture**: `docs/architechture-Rev02.md`
- **Roadmap**: `docs/ROADMAP.md`
- **Work tracker**: `TODOs.md`
- **Local dev entrypoint**: `docker compose up --build`
- **Shared packages build (native-ready)**:
  - Packages consumed by native apps ship runtime JS + `.d.ts` under `dist/` and we commit those build outputs.
  - When you change anything under `packages/i18n`, `packages/contracts`, `packages/api-client`, `packages/ui`, or `packages/recipes-ui`, rebuild the shared packages from repo root:
    - `./scripts/build-packages-in-docker.sh`
    - (Equivalent inside a Node container: `npm run build:packages`)
  - Reminder: do not run npm on the host in this repo. Run the build via Docker if needed.
  - Native baseline: start `apps/native` on the latest stable Expo SDK (React 19) and keep React aligned between web and native.
  - **Native strategy + CI (prose)**: when deciding Expo Go vs custom dev clients, React drift vs web, and whether GitHub Actions are worth it, read `docs/NATIVE-STRATEGY-AND-CI.md`.
  - **Expo Go ABI exception (important)**: when developing on a physical device via Expo Go, `apps/native` MUST match the React / `react-dom` / `react-native-svg` / `expo` versions that Expo Go's installed binary ships with. If `apps/web` is on a newer React minor and Expo Go's React is older, `apps/native` follows **Expo Go**, not web — accept the temporary minor drift between web and native. Symptoms of ignoring this: blank/black screen on the device with `Incompatible React versions: react X.Y.Z vs react-native-renderer X.Y.W`, or a blank Metro web preview at `:8081/` with `Incompatible React versions: react X.Y.Z vs react-dom X.Y.W`. To re-align, run `expo install --fix` in `apps/native` and ensure `react-dom` is pinned to the same exact version as `react` (see `docs/DEVELOPMENT-NATIVE-LOCAL.md` → "Troubleshooting (native + Expo Go)" and "Native baseline"). Permanent alignment requires either bumping the Expo SDK to one that ships your target React, or moving native off Expo Go to a custom dev client.
- **Monorepo workspace deps in Docker (important)**:
  - Workspace packages are mounted under `/packages/*` in the `web` container.
  - To ensure workspace package dependencies resolve correctly, `/packages/node_modules` is symlinked to `/app/node_modules` at container startup.
- **Troubleshooting: 502 Bad Gateway on login / API calls**:
  - If Nginx returns `502 Bad Gateway` for `/api/*`, the API upstream is unreachable (often the `api` container process crashed or is still starting).
  - Quick fix (from repo root):
    - `docker compose exec api npm install`
    - If API logs mention Prisma client not initialized, also run:
      - `docker compose exec -T api npx prisma generate`
    - `docker compose restart api`
- **Local ports** (repo-local `.env`, not committed; see also `.env.sample` for the discovery doc):
  - `NGINX_HTTP_PORT=18080` (defaults to `18080` if unset; chosen to avoid host-OpenPLC's `:8080` — see banner in docker-compose.yml)
- **Next.js dev note**: Avoid running `docker compose exec web npm run build` while `next dev` is running. If you need typecheck/build again, either stop `web` first or be ready to wipe `.next` and restart `web`.
- **Troubleshooting: web dev gets a corrupted `.next` (missing chunks / missing `routes-manifest.json`)**:
  - Symptoms:
    - `ENOENT: no such file or directory, open '/app/.next/routes-manifest.json'`
    - `Cannot find module './5611.js'` (or other missing `.next/server/*.js` chunk)
    - `/en/*` routes return 500
  - Fast reset (safe: move aside, don’t delete). Run from repo root:
    - `cd /home/rf/dkprojects/rfapps/brewery-app`
    - `docker compose stop web`
    - `mv apps/web/.next "apps/web/.next.bak-$(date +%s)"` (skip if missing)
    - `docker compose up -d web`
  - Full rebuild/redeploy (if fast reset didn’t help):
    - `cd /home/rf/dkprojects/rfapps/brewery-app`
    - `docker compose up -d --build web`
  - Quick verification:
    - `curl -i "http://localhost:3000/en/login" | head -n 5`
    - `docker compose logs --tail=80 web`
- **Tamagui non-boolean DOM attributes**: Tamagui components (e.g. `Select.Viewport`) may default `elevate={true}` or `bordered={true}`, causing React to warn: "Received `true`/`false` for a non-boolean attribute". Fix: pass `elevate={undefined}` and `bordered={undefined}` to override defaults and prevent forwarding to the DOM. Example: `<Select.Viewport elevate={undefined} bordered={undefined} elevation={0}>`.
- **`<details>/<summary>` (IMPORTANT for i18n + UX)**: Browsers show a built-in fallback label (often “Details”) when a `<details>` does not have a real `<summary>` element as its first child. That fallback does **not** follow app locale/i18n. In this repo, use `RecipeEditSummary` (`apps/web/app/_components/recipe-edit/RecipeEditSummary.tsx`) so we always render a real `<summary>` and keep native click-to-expand behavior.
- **Shared media (MANDATORY)**:
  - **Source of truth**: `packages/media/assets/**` — all images and other shared media live here.
  - **Web**: assets are synced into `apps/web/public/media/**` via `apps/web/scripts/sync-media.mjs` (runs on postinstall, predev, prebuild, prestart). Reference them as `/media/<domain>/<filename>` (e.g. `/media/yeast/dilution-1-100.png`).
  - **Do not** add or edit images directly under `apps/web/public/**`; use `packages/media` only.
  - **Docker**: the `web` (and `api`) containers mount `./packages/media:/packages/media:ro` so the sync script can read the source.
- **Auth (local dev)**:
  - Auth is **cookie-session-based** (`sid` httpOnly cookie). Dev header auth (`X-User-Id` / `X-Account-Id`) is not supported.
  - Use `http://localhost:18080/en/signup` or `http://localhost:18080/en/login`.
  - If you have multiple workspaces, use `http://localhost:18080/en/select-workspace` (calls `POST /api/auth/active-workspace`) to set `activeWorkspaceId` in your session.
  - Native apps use `POST /auth/login/native` (returns `token`) and `Authorization: Bearer <token>`. See `docs/AUTH-STRATEGY.md`.
  - **Session cleanup**: Run `docker compose exec api npm run job:session-cleanup` periodically (e.g. daily) to delete expired sessions.
- **Prisma schema changes (IMPORTANT)**:
  - If you add/rename Prisma fields (edit `services/api/prisma/schema.prisma`) and the API throws errors like:
    - `Unknown argument "someNewField"` (Prisma Client is stale)
    - `P1012` / select-field mismatch (schema/client out of sync)
  - Fix (run inside the `api` container):
    - Apply migrations:
      - `docker compose exec -T api npx prisma migrate dev`
        - (In production jobs/servers use `npx prisma migrate deploy` instead.)
    - Regenerate Prisma Client:
      - `docker compose exec -T api npx prisma generate`
    - Restart API to load the new generated client:
      - `docker compose restart api`
  - If it still errors, rebuild the api image (last resort):
    - `docker compose up -d --build api`
  - **Do NOT** use `docker compose down -v` unless you intentionally want to wipe local DB volumes.

- **Database naming convention (Postgres + Prisma)**:
  - **DB identifiers**: use **lowercase `snake_case`** for **tables and columns** (no quoting needed in pgAdmin / raw SQL).
    - Example: `recipes`, `recipe_water_settings`, `style_key`, `created_at`
  - **Prisma identifiers**:
    - Models remain **PascalCase** (e.g. `RecipeWaterSettings`)
    - Fields remain **camelCase** (e.g. `styleKey`, `createdAt`)
    - Prisma maps to DB names via `@@map("table_name")` and `@map("column_name")` in `services/api/prisma/schema.prisma`.
  - **Migrations**:
    - When changing mappings/identifiers, prefer **rename-only migrations** (`ALTER TABLE ... RENAME`, `RENAME COLUMN`) to avoid drops.
    - In non-interactive environments, use `docker compose exec -T api npx prisma migrate deploy`.
- **Editor / TypeScript (Cursor) dependency resolution**:
  - We intentionally bind-mount `services/api/node_modules` into the `api` container (see `docker-compose.yml`) so the editor can resolve devDependencies like `vitest`.
  - Treat `node_modules/` as **generated artifacts**: never edit them directly; always change dependencies via `package.json` and run installs.
  - If Docker creates the folder with unexpected ownership, prefer reinstalling from the host or adjusting ownership rather than manually editing contents.
- **Cursor rules/skills upstream backlog**:
  - If you identify a reusable Cursor Rule/Skill improvement while working, add it to `CURSOR-RULES-SKILLS-TODO.md` (repo root) so it can be periodically upstreamed into the canonical rules/skills repo/plugin.

- **Coding standards (TypeScript/React)**
  - **Default**: use `interface` for object contracts (DTOs, component props, service inputs/outputs). Use `type` for unions/compositions.
  - **Styling**: avoid inline styles where you can; Tamagui props and components are the preferred replacement. Use `className` when Tamagui does not apply (e.g. native `<select>`, `<table>`).
  - **External APIs (future: malt/hops/yeast DBs)**:
    - Define an `interface` for the server response shape.
    - Always validate runtime `unknown` payloads via a `parseXxx()`/`assertIsXxx()` function (or schema validation later). Avoid `as SomeType` casts on network payloads.
  - **JSDoc**: required on exported/shared contracts when semantics aren’t obvious (units, ranges, invariants).
  - More detail: `docs/CODING-STANDARDS.md`
  - **UI CTAs (MANDATORY)**: use the **Draft vs Snapshot vs Preview** naming convention from `docs/CODING-STANDARDS.md` to avoid user confusion.

- **Internationalization / i18n (MANDATORY for all user-facing web UI)**
  - **Routing**: all app routes are **locale-prefixed**: `/en/...`, `/it/...` (default: `en`). Unprefixed URLs are redirected by middleware.
  - **No hard-coded UI strings**: do not add new user-facing text inline in JSX.
    - Put strings in `packages/i18n/src/en.json` and `packages/i18n/src/it.json`.
    - Use `useTranslations('namespace')` and `t('key')` (or `t.rich(...)` when you need markup).
  - **Multi-line strings (MathHelpPopover / formula bodies)**:
    - Use JSON `\\n` escapes as `\n` (single backslash) to create real newlines.
    - Do **not** write `\\n` (double backslash) in the JSON value, or the UI will render the literal `\\n` text.
  - **Locale-aware links**: use `apps/web/src/i18n/navigation.ts` `Link` instead of `next/link` for app navigation (keeps locale correct).
  - **Numbers**: prefer `apps/web/src/i18n/format.ts` helpers (e.g. `formatFixed(locale, value, 2)`) instead of `toFixed()` so decimals can localize.
  - **Add routes under locale**: new pages should live under `apps/web/app/[locale]/...` (or use a locale wrapper that re-exports an existing non-locale page when needed for incremental migration).
  - **Config files**:
    - `apps/web/middleware.ts` controls locale prefix + cookie.
    - `apps/web/i18n/request.ts` provides `next-intl` request config + message loading.
    - `apps/web/next.config.js` must keep the `next-intl` plugin enabled.

- **Reverts (MANDATORY protocol)**:
  - Before reverting any change(s), the assistant must provide a short list of exactly what will be reverted (files + a brief description).
  - The assistant must then wait for explicit confirmation before proceeding with the revert.

- **Ingredient catalogs vs schemas (MANDATORY)**:
  - Treat **BeerJSON** as the **schema/shape** for recipe ingredients (especially “misc/other” ingredients).
  - Treat **BeerProto** as the **seedable catalog/dataset** for malts/hops/yeast ingredient lists (current choice).
  - Treat BeerProto “miscellaneous” as a **candidate** source for “other/misc” ingredients until we explicitly select a canonical list.
  - Details: `docs/RAW-MATERIALS-SEEDABLE-SOURCES.md` section **2.1.1**.

## Recipes: BeerJSON-first (canonical)

- **Canonical recipe JSON**:
  - `recipes.beer_json_recipe_json` is the canonical recipe document (BeerJSON).
  - `recipes.recipe_ext_json` stores internal extensions (versioned).
  - Legacy recipe JSON columns (`grist_json`, `hops_json`, `yeast_json`, `misc_json`) were removed.
- **API contract**:
  - `POST /recipes` requires `beerJsonRecipeJson` (plus `name`, `styleKey`).
  - `PATCH /recipes/:id` can update `beerJsonRecipeJson` and `recipeExtJson`.
- **Docs**:
  - See `docs/BEERJSON-FIRST.md`.
