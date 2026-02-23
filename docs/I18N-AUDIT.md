# Web UI i18n audit (hard-coded strings)

This document tracks the initial audit of user-facing strings that should be migrated to `next-intl`.

## Known hard-coded headings (examples)

- `apps/web/app/recipes/[id]/edit/page.tsx`
  - `Edit recipe`
- `apps/web/app/recipes/[id]/water/mash/page.tsx`
  - `Mash water`
  - `Result (last calculated)`
  - `Salt additions (manual, v0)`
- `apps/web/app/recipes/[id]/water/sparge/page.tsx`
  - `Sparge water`
  - `Result (last calculated)`
  - `Sparge salt additions (manual, v0)`
- `apps/web/app/recipes/[id]/water/boil/page.tsx`
  - `Additional boil water`

## Known hard-coded paragraphs / status text (examples)

- `apps/web/app/recipes/[id]/edit/page.tsx`
  - `Loading…`
- `apps/web/app/DashboardClient.tsx`
  - `Loading…`
- `apps/web/app/[locale]/(auth)/select-workspace/page.tsx`
  - `Loading…`
  - `No workspaces found.`

## Known hard-coded accessibility text (examples)

- `apps/web/app/recipes/[id]/edit/page.tsx`
  - `aria-label="Recipe sections"`
- `apps/web/app/_components/PrimaryNav.tsx`
  - `aria-label="Primary"`
  - `aria-label="Session"`

## Next steps

- Migrate the core recipe + water pages to message keys in `apps/web/messages/en.json` + `apps/web/messages/it.json`.
- Add a guardrail check script to prevent new hard-coded strings under `apps/web/app/**`.

