# Development local addendum (project-specific)

This file is the project's companion to the repo-root [`DEVELOPMENT.md`](DEVELOPMENT.md). Assistants should read it immediately after `DEVELOPMENT.md`.

The shared rules / skills / subagents this repo relies on are now delivered by the **umbraculum-toolset Cursor plugin pack** (see [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) and the apparatus self-check in [`AGENTS.md`](AGENTS.md)), not by an in-repo sync. The four plugins relevant to this monorepo:

| Plugin | Role |
|---|---|
| `umbraculum-toolset-common` | Language-agnostic meta-framework (DEVELOPMENT-LOCAL gate, Skill Contract, commit-message ticket-prefix, public-endpoint verification, plugin-source-vs-installed-mirror guardrail) |
| `umbraculum-node-react-cursor-assistant` | Node/TS/React guardrails (strict flags, Zod v4 contracts, ESLint flat-config hygiene, Playwright, accessibility, monorepo boundaries, frontend known-issues) |
| `umbraculum-platform-tsjs-cursor-assistant` | Umbraculum-platform specifics (foundation-hardening, module-README authoring, package-scope migration, L2 isolation scaffolding) |
| `rf-magento-cursor-assistant` | Magento 2 / PHP rules + skills + subagents (only relevant if a task touches Magento code) |

Their rules / skills / subagents live under `~/.cursor/plugins/local/<plugin-name>/{rules,skills,agents}/` on each contributor's machine after install.

The in-repo `.cursor/rules/` directory is **intentionally empty** and reserved as the fallback location described in [`AGENTS.md`](AGENTS.md) §"Repo-side fallback for unenforced `alwaysApply` rules" — if a plugin-shipped `alwaysApply: true` rule is observed not being enforced reliably, the immediate fix is to **copy** the rule from the plugin install path into `.cursor/rules/` (consistency-first; COPY not move; don't delete the plugin copy; report the gap upstream). Do not use this directory as the primary location for new rules.

## Project notes

- **Project values & contributor expectations**: see `MANIFESTO.md` at repo root. The AI-orchestrated-code distinction stated in §1.2 (rules + skills + agents apparatus = the default authoring path; drive-by Copilot paste = explicitly outside what the project endorses; manual writing welcomed for *learning*, discouraged for *committing*) is the contract between contributors and the project. The §3 commitments to empathy, family-friendly schedules, welcomed unionism, and explicit inclusivity are not boilerplate; new contributors should read the manifesto end-to-end before their first PR.

- **Governance & accepted RFCs**: see `docs/rfcs/`. **RFC-0001** (`docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md`, Accepted 2026-05-18; reserved-code table extended 2026-05-19 by **RFC-0004** to add `pim`) commits the canonical-module rule, the six reserved canonical codes (`mrp` / `wms` / `crm` / `crp` / `automation` / `pim`; `brewery` is the canonical tier-6 vertical-configuration example), governance for canonical-code allocation, and the horizontal-platform-services consumption contract (modules consume — never reimplement — auth / tenancy / ACL / billing / AI / observability / i18n / UI / secrets / integrations / HTTP / DB). Read RFC-0001 before any feature work that touches module shape, AI-tool registration, billing or tier limits, or any cross-cutting platform concern.

- **Platform vision**: see `docs/PLATFORM-ARCHITECTURE.md` — high-level entry point for the horizontal-platform-with-vertical-modules direction, AI consultant blueprint, and AI add-on pricing model. Read this before any product/architecture discussion.

- **Project summary**:
  - This is a **custom TypeScript project** (not Magento, not PHP).
  - Stack: **Next.js (web) + Fastify (API) + Prisma + Postgres**, with **Docker Compose + Nginx** for local routing parity.
  - Platform architecture entry point: `docs/PLATFORM-ARCHITECTURE.md`
  - Cross-platform boundaries: `docs/CROSS-PLATFORM-BOUNDARIES.md`
  - Brewery vertical implementation log: `docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md`
  - Testing strategy: `docs/TESTING.md` (single source of truth) + `docs/ROLLOUT.md` (rollout plan) + `docs/AGENTIC-JOBS.md` (L6 agentic-browser job catalog).

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
- **Big picture**: `docs/PLATFORM-ARCHITECTURE.md` (vision); `docs/CROSS-PLATFORM-BOUNDARIES.md` + `docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md` (as-built)
- **Roadmap**: `docs/ROADMAP.md`
- **Work tracker**: `internal/working-notes/TODOs.md`
- **Local dev entrypoint**: `docker compose up --build`
- **Shared packages build (native-ready)**:
  - Packages consumed by native apps ship runtime JS + `.d.ts` under `dist/` and we commit those build outputs.
  - When you change anything under `packages/i18n`, `packages/i18n-react`, `packages/navigation`, `packages/contracts`, `packages/api-client`, `packages/ui`, `packages/beerjson`, `packages/recipes-ui`, or `packages/media`, rebuild only what changed:
    - **Scoped (day-to-day):** `./scripts/build-package-in-docker.sh @umbraculum/<workspace> --include-dependents`
    - **Full monorepo (SDK / native EAS / release):** `./scripts/build-packages-in-docker.sh` (wrapper for `--all`)
    - See [`docs/VERIFICATION-TIERS.md`](docs/VERIFICATION-TIERS.md) for the T0/T1/T2 matrix.
  - Reminder: do not run npm on the host in this repo. Run the build via Docker if needed.
  - **Build order matters.** `package.json:11` runs the packages sequentially; `@umbraculum/brewery-beerjson` is built **before** `@umbraculum/brewery-recipes-ui` because recipes-ui imports types/values from beerjson at build time. Do not reorder casually — recipes-ui's `dist/` will silently encode whatever beerjson `dist/` was on disk at build time.
  - **Drift detection (catches the original 2026-05 regression).** If you add or rename a field in `packages/beerjson/src/index.ts` and forget to rebuild, downstream consumers (`apps/native` first, because it has the only repo-wide `tsc --noEmit`; web won't notice locally) will fail typecheck against the stale `packages/beerjson/dist/*.d.ts`. Two ways to catch it:
    1. **Automated, fast (preferred before pushing):** run `./scripts/check-packages-dist-up-to-date.sh` — scoped by default (rebuilds only packages with `src/` changes + dependents). Use `--all` for SDK publish / full dist audit. Exit `0` = no drift; non-zero = rebuild and commit `dist/`.
    2. **End-to-end reproduction (for understanding the symptom):**
       ```bash
       # Wipe beerjson dist to simulate "field added, dist forgot to be rebuilt"
       docker run --rm -v "$PWD:/repo" node:20-slim bash -lc 'rm -rf /repo/packages/beerjson/dist'
       ./scripts/build-packages-in-docker.sh
       grep -c lateAddition packages/beerjson/dist/index.d.ts   # expect >=1 once that field exists
       docker run --rm -v "$PWD:/repo" -w /repo/apps/native node:20-slim \
         bash -lc "npm install --no-audit --no-fund && ./node_modules/.bin/expo install --check && npm run typecheck"
       # exit 0 means the chain is healthy end-to-end
       ```
  - **Container ownership (now self-resolving from the script).** Historically, `scripts/build-packages-in-docker.sh` ran Docker as root inside the `/repo` bind-mount, which left any file it (re)wrote — anything under `packages/*/dist/*`, sometimes `package-lock.json`, sometimes files inside `apps/*` and `services/*` — owned by `root:root` on the host. Git tracks content not ownership, so this was invisible until you asked git to *replace* one of those files (stash pop, branch switch, restore, rebase): non-root users can't unlink root-owned files, and git aborts with `error: unable to unlink old '...': Permission denied`. The build script now appends a `chown -R $HOST_UID:$HOST_GID /repo/packages /repo/apps /repo/services /repo/package.json /repo/package-lock.json` step (uid/gid are resolved on the host and passed in via env vars; the chown runs unconditionally so a failed build never leaves a partial root-owned tree; `/repo/node_modules` is excluded on purpose because it's a docker named volume, not a host bind-mount). If you ever do hit `Permission denied` from git on those paths — e.g. because an older runner image or an out-of-band `docker run` wrote them as root — the manual recovery command is still:
    ```bash
    docker run --rm -v "$PWD:/repo" node:20-slim \
      chown -R "$(id -u):$(id -g)" /repo/packages /repo/apps /repo/services /repo/package.json /repo/package-lock.json
    ```
  - **CI guard.** `.github/workflows/native-deps.yml` runs the `apps/native` typecheck on every PR touching `apps/native/**`, `packages/**`, or the lockfiles. If `packages/beerjson/dist/*` is committed stale relative to `packages/beerjson/src/`, that workflow will go red — which is the desired signal. (A future, stricter CI step would invoke `./scripts/check-packages-dist-up-to-date.sh` directly to fail on *any* shared-package dist drift, not only the ones that happen to break `apps/native` typecheck.)
  - Native baseline: start `apps/native` on the latest stable Expo SDK (React 19) and keep React aligned between web and native.
  - **Native strategy + CI (prose)**: when deciding Expo Go vs custom dev clients, React drift vs web, and whether GitHub Actions are worth it, read `docs/NATIVE-STRATEGY-AND-CI.md`.
  - **Expo Go ABI exception (important)**: when developing on a physical device via Expo Go, `apps/native` MUST match the React / `react-dom` / `react-native-svg` / `expo` versions that Expo Go's installed binary ships with. If `apps/web` is on a newer React minor and Expo Go's React is older, `apps/native` follows **Expo Go**, not web — accept the temporary minor drift between web and native. Symptoms of ignoring this: blank/black screen on the device with `Incompatible React versions: react X.Y.Z vs react-native-renderer X.Y.W`, or a blank Metro web preview at `:8081/` with `Incompatible React versions: react X.Y.Z vs react-dom X.Y.W`. To re-align, run `expo install --fix` in `apps/native` and ensure `react-dom` is pinned to the same exact version as `react` (see `docs/DEVELOPMENT-NATIVE-LOCAL.md` → "Troubleshooting (native + Expo Go)" and "Native baseline"). Permanent alignment requires either bumping the Expo SDK to one that ships your target React, or moving native off Expo Go to a custom dev client.
- **Monorepo workspace deps in Docker (important)**:
  - Workspace packages are mounted under `/packages/*` in the `web` container.
  - To ensure workspace package dependencies resolve correctly, `/packages/node_modules` is symlinked to `/app/node_modules` at container startup.
- **Troubleshooting: 502 Bad Gateway on login / API calls**:
  - If Nginx returns `502 Bad Gateway` for `/api/*`, the API upstream is unreachable (often the `api` container process crashed or is still starting). Always inspect logs first to pick the right fix:
    - `docker compose logs --tail=80 api`
  - Triage by what you see in the api logs:
    1. **Prisma client not initialized** → run `docker compose exec -T api npx prisma generate` then `docker compose restart api`.
    2. **Missing API source file / stale tsx watch** (after a branch switch, pull-of-merge, or large rebase that mutated `services/api/src/**`) → just `docker compose restart api`. Do NOT `npm install` or `prisma generate` for this one (see cursor rule 51 — tsx silently registered without some imports during the git-tree mutation).
    3. **`ERR_MODULE_NOT_FOUND` from `/packages/<name>/dist/index.js`** (the failure mode that took down `/en/login` on 2026-05-25 after the RFC-0007 rendering loop closed):
       ```text
       Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@fast-csv/format'
         imported from /packages/rendering/dist/index.js
       ```
       Root cause: `packages/rendering`'s dist needs runtime deps (`eta`, `mjml`, `@fast-csv/format`, `exceljs`, `xmlbuilder2`, `bwip-js`, `bullmq`, `@babel/runtime`) but `npm install` at the workspace root **hoists** them into `./node_modules/`, leaving `packages/rendering/node_modules/` without them. The `api` container only mounts `/packages/rendering:ro` plus `/app/node_modules` — and because Node resolves from the realpath `/packages/rendering/dist/index.js`, neither location is on the resolver walk. The api crashes at boot, nothing listens on `:4000`, nginx returns 502 for every `/api/*` request.
       - Fix (one-off; container-only, no host npm, no `docker-compose.yml` change):
         ```bash
         docker run --rm \
           -v "$PWD/packages:/packages" \
           -w /packages/rendering \
           node:20-slim \
           sh -c "npm install --omit=dev --no-save --no-package-lock --ignore-scripts --legacy-peer-deps"
         docker compose restart api
         ```
       - `packages/rendering/node_modules/` is gitignored, so this is a host-only, non-committed bootstrap. Re-run it any time that directory gets wiped (`git clean -fdx`, fresh clone, accidental delete).
       - Same pattern applies if you ever add another workspace package whose built `dist/` imports runtime deps not already in `services/api/package.json` — replace `packages/rendering` in the command above with the offending package path.
    4. **`tsx` unlink / ci-parity archive disturbed bind mounts** (common after `./scripts/ci-parity-check.sh --archive run` or a long agent session that runs ci-parity then hits the dev stack):
       ```text
       tsx unlink in ./../packages/.../node_modules/... Rerunning...
       Error [ERR_MODULE_NOT_FOUND]: Cannot find package '/packages/contracts/node_modules/zod/index.js'
       ```
       Root cause: the `api` dev runner (`tsx watch`) watches bind-mounted `packages/**`; ci-parity (or host-side npm) can unlink/relink files under those trees. tsx restarts mid-relink and Node module resolution breaks. Nginx still serves `/en/login` HTML (200) but every `/api/*` proxy returns **502**.
       - Fix: `docker compose restart api` and wait for `Server listening at http://127.0.0.1:4000` in api logs. If boot still fails with `ERR_MODULE_NOT_FOUND`, run the package-local `npm install` one-off from item 3 for the package named in the error, then restart api again.
       - **Prevent:** after ci-parity archive or any change under `services/api/**` / nginx config, run `./scripts/dev-stack-smoke.sh` (or `npm run smoke:stack`) before manual browser testing. See docs/TESTING.md E2E fixture identities if login returns 401.
  - Verify with:
    - `./scripts/dev-stack-smoke.sh` (health + bearer login + cookie login + `/en/login` page)
    - Or manually:
    - `curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:18080/api/health` (expect `200`)
    - `curl -sS -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' -d '{}' http://localhost:18080/api/auth/login` (expect `400`/`401`, **not** `502`)
- **Local ports** (repo-local `.env`, not committed; see also `.env.sample` for the discovery doc):
  - `NGINX_HTTP_PORT=18080` (defaults to `18080` if unset; chosen to avoid host-OpenPLC's `:8080` — see banner in docker-compose.yml)
- **Next.js dev note**: Avoid running `docker compose exec web npm run build` while `next dev` is running. If you need typecheck/build again, either stop `web` first or be ready to wipe `.next` and restart `web`.
- **Troubleshooting: web dev gets a corrupted `.next` (missing chunks / missing `routes-manifest.json`)**:
  - Symptoms:
    - `ENOENT: no such file or directory, open '/app/.next/routes-manifest.json'`
    - `Cannot find module './5611.js'` (or other missing `.next/server/*.js` chunk)
    - `/en/*` routes return 500
  - Fast reset (safe: move aside, don’t delete). Run from repo root:
    - `cd "$REPO_ROOT"`
    - `docker compose stop web`
    - `mv apps/web/.next "apps/web/.next.bak-$(date +%s)"` (skip if missing)
    - `docker compose up -d web`
  - Full rebuild/redeploy (if fast reset didn’t help):
    - `cd "$REPO_ROOT"`
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

- **Reference-data recovery after a DB wipe / `migrate reset` (MANDATORY)**:
  - The dev DB depends on **two independent seed paths** for reference data. A `prisma migrate reset` (or any equivalent wipe-and-rebuild) re-creates the tables but **does not** re-populate them. After any such event, both commands must be run, in order:
    1. `docker compose exec -T api npm run db:seed`
       - Populates `water_profiles` (`scope='system'`, ~70 rows incl. famous brewing waters like Dusseldorf, Pilsen, Burton), `beer_styles` (BJCP-2021), sample `ads`, the dev user (`00000000-…-0001`), dev workspace (`00000000-…-00a1`), and optionally a "Seeded Owner Brewery" workspace via `SEEDED_OWNER_EMAIL` + `SEEDED_OWNER_PASSWORD` env vars.
       - Source: `services/api/prisma/seed.ts`. Idempotent (all upserts).
    2. `docker compose exec -T api npm run seed:import -- --source beerproto`
       - Populates `fermentables` (~870), `hops` (~315), `yeasts` (~445) by fetching the BeerProto CSV catalogs over the network. Records provenance into `ingredient_sources` / `ingredient_staging_rows` / `ingredient_source_maps` and writes a row to `ingredient_import_runs` per CSV (look for `status='ok'`).
       - Source: `services/api/src/cli/seed-import.ts` → `services/api/src/seed/sources/beerproto/beerproto.ts`. Re-runnable; uses ETags unless `--force` is passed.
  - Quick verification query (paste into `docker compose exec -T postgres psql -U postgres -d brewapp`):
    ```sql
    SELECT 'water_profiles_system' AS t, COUNT(*) FROM water_profiles WHERE scope='system'
    UNION ALL SELECT 'beer_styles', COUNT(*) FROM beer_styles
    UNION ALL SELECT 'fermentables', COUNT(*) FROM fermentables
    UNION ALL SELECT 'hops', COUNT(*) FROM hops
    UNION ALL SELECT 'yeasts', COUNT(*) FROM yeasts
    ORDER BY 1;
    ```
    Expected: all counts > 0 (current floor: 70 / 111 / 871 / 315 / 446).
  - **Tables NOT covered by either seed**:
    - `equipment_profiles` — user-owned; recreate via the Equipment UI. If you lost a row that is still referenced by a recipe's `recipe_ext_json.equipmentSource.equipmentProfileId`, you can restore it from the recipe's embedded equipment snapshot (`recipe_ext_json.equipment.{mash,kettle,misc}`) with the one-off CLI:
      ```bash
      docker compose exec -T api npm run db:restore:equipment-profile -- \
        --recipe-id <recipe-uuid> [--dry-run]
      ```
      Source: `services/api/src/cli/restoreEquipmentProfileFromRecipe.ts`.
    - Workspace/user data (`recipes`, `recipe_water_settings`, `brew_sessions`, `inventory_items`, `workspace_members`, …) — not seedable; restore from a Postgres dump if needed.
  - **Historical context**: on 2026-03-06 a wipe-and-restore-style event re-applied all migrations in one batch (`_prisma_migrations.finished_at` all within ~3 s) but only partially re-seeded the reference tables (`beer_styles` and `ads` got fresh `created_at`; `water_profiles`, `equipment_profiles`, `fermentables`, `hops`, `yeasts`, `ingredient_sources` were left empty). The downstream effect was "Insufficient data" on every recipe (no water profiles to pick → no `recipe_water_settings` row → null cascade in `gravityAnalysis.ts`). Always run both seed commands above to avoid recreating that gap.

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
  - If you identify a reusable Cursor Rule/Skill improvement while working, add it to `internal/working-notes/CURSOR-RULES-SKILLS-TODO.md` so it can be periodically upstreamed into the canonical rules/skills repo/plugin.

- **Cursor plugin install / refresh**:
  - Shared rules / skills / subagents arrive via the umbraculum-toolset Cursor plugin pack — see [`docs/CURSOR-PLUGINS.md`](docs/CURSOR-PLUGINS.md) for the install procedure (marketplace install where available; local install from the public `umbraculum-toolset` sister-repo as the fallback). The four plugins relevant to this repo are listed in the header of this file.
  - Sanity check that an install is loaded: every Cursor session in this repo runs the [`AGENTS.md`](AGENTS.md) apparatus self-check on the first non-trivial task; if a witness rule is missing, follow the soft-block instructions there.

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
  - Details: `docs/modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES.md` section **2.1.1**.

## Recipes: BeerJSON-first (canonical)

- **Canonical recipe JSON**:
  - `recipes.beer_json_recipe_json` is the canonical recipe document (BeerJSON).
  - `recipes.recipe_ext_json` stores internal extensions (versioned).
  - Legacy recipe JSON columns (`grist_json`, `hops_json`, `yeast_json`, `misc_json`) were removed.
- **API contract**:
  - `POST /recipes` requires `beerJsonRecipeJson` (plus `name`, `styleKey`).
  - `PATCH /recipes/:id` can update `beerJsonRecipeJson` and `recipeExtJson`.
- **Docs**:
  - See `docs/modules/verticals/brewery/BEERJSON-FIRST.md`.
