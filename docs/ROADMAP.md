# Roadmap (living)

This roadmap captures the agreed “direction of travel” for the product so implementation stays coherent and we avoid rework.

## Big picture

- Source of truth: `docs/architechture-Rev01.md`
- Accessibility hard constraint: `docs/DEVELOPMENT-ACCESSIBILITY.md`
- Seed data sources + licensing notes: `docs/RAW-MATERIALS-SEEDABLE-SOURCES.md`

## UI pillars (from Figma)

Figma exports live under `docs/figma/`:
- `dashboard.png`
- `edit-recipe.png`
- `water-calculator-and-mash-chemistry.png`

These map to three “pillars”:
1) Dashboard with simple navigation
2) Recipe editor (complex)
3) Water calculator / mash chemistry (complex)

## Agreed UI/UX decisions (important)

### Navigation (web)
- **Primary nav only** (no extra row of big buttons).
- **Dashboard** is the first/left-most nav item.
- Mobile-friendly by default (nav collapses later, but IA should not change).

### Recipe editing (v0)
- Single edit route with a left-side section list (in-page nav).
- Sections (initial):
  - Basics
  - Fermentables
  - Hops
  - Yeast (may start stubbed)
  - Other ingredients
  - Notes
  - Water chemistry (link-out)

### Water calculator
- Water calculator has its **own page** and is considered part of the recipe.
- The recipe editor should **not** embed the full water calculator; water chemistry in recipe edit is a link to the full calculator.
- UI preference: **dark grey background** (Cursor-like) is desired for recipe + water calculator UIs, **as long as** accessibility constraints are met.

### Recipe import/export (v1)
- Import/export actions live under **Recipes** (not the Dashboard).
- Import UX is split into:
  - **Import single recipe**: user selects a style (default Custom).
  - **Bulk import**: multi-recipe files; style is auto-matched to **BJCP 2021** (name-first, then code), else Custom.
- Export uses **strict BeerJSON** for interoperability (internal addition row `id` fields are stripped).

### Offline-forward constraint (future)
Even though v0 is server-backed, we want to design pages so we can later support offline drafts:
- Each page can maintain a clear “draft saved” model (local-first draft state, explicit save events).
- Avoid duplicated editable sources of truth (aligns with the architecture doc).

## Data prerequisites: seedable raw materials DB

To make recipes and water chemistry usable, we need canonical datasets for:
- Fermentables (malts, sugars, extracts, adjuncts)
- Hops
- Yeast (soon)
- Salts + acids for water correction (curated, small set)
- Water profiles (optional seed)

Approach (agreed direction):
- Start with **BeerProto dataset (MIT)** as the base seed where applicable.
- Preserve provenance for all imported records (source name/url/license/retrieved_at/source_key/raw payload).
- Use a crosswalk table (`ingredient_source_map`) so we can enrich from other sources later without losing traceability.
- Treat non-clear licensing sources as reference-only until confirmed.

