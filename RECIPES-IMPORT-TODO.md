# Recipe import (BeerXML / BeerJSON) – path forward (TODO)

This document captures the agreed direction for adding **recipe import** without implementing it yet.

Goals:
- Let a logged-in user create a new `Recipe` from an imported file/template.
- Keep v1 **server-side only** (parsing/mapping runs in the API).
- Prefer minimal dependencies and clear licensing boundaries.

Non-goals (v1):
- No public “recipe library” redistribution (copyright/licensing risk).
- No browser-side parsing.
- No complex process modeling (equipment, mash schedule, fermentation program, packaging, etc.) unless needed for a first useful import.

---

## Current state (what we can already store)

The app persists recipes as:
- `Recipe.name`, `Recipe.style`, `Recipe.notes`
- `Recipe.beerJsonRecipeJson` (canonical BeerJSON document)
- `Recipe.recipeExtJson` (internal extensions/overrides; versioned)

The web editor is BeerJSON-first, so imports should ultimately produce a valid BeerJSON document (plus optional `recipeExtJson`).

---

## Two import “tracks”

### Track A — Manual import (user-provided, logged-in) (recommended first)

**User story**
- As an authenticated user with an active account, I can import a BeerXML/BeerJSON file and create a new recipe from it.

**Why this track is safest**
- The user provides their own content.
- We don’t redistribute third-party recipe datasets.

**UX options**
- File upload (preferred):
  - User selects a `.xml` or `.json` file.
  - Server validates + previews the parsed recipe.
  - User confirms and creates a new `Recipe`.
- Paste content (secondary):
  - Paste XML/JSON into a text area.
  - Same preview → confirm flow.

**API shape (proposal)**
- `POST /recipes/import/preview`
  - Input: `{ format: "beerxml" | "beerjson", content: string }`
  - Output: `{ ok: true, preview: { name, notes, beerJsonRecipeJson }, warnings: string[] }`
- `POST /recipes/import`
  - Input: `{ format, content, nameOverride?, styleOverride? }`
  - Output: `{ ok: true, recipe: { id, ... } }`

Rationale:
- Preview prevents polluting the DB with bad parses.
- Preview can show warnings (unknown units, missing hop times, ingredients not matched to DB, etc.).

**Auth / tenancy**
- Requires session auth + active account (same rules as `/recipes` endpoints).

---

### Track B — System server-side import (external libraries + mapping modules)

This is not a “recipe dataset”. It’s the **import pipeline** implemented on the API:
- Parse BeerXML / BeerJSON safely
- Normalize units
- Map into our internal JSON row contracts
- Best-effort link ingredients to canonical DB entries

**Why this matters**
- It keeps the importer consistent and testable.
- It enables future batch imports (admin tools) without changing the web client.

---

## External libraries shortlist (server-side)

### BeerJSON
- **Schema + validation**: `@beerjson/beerjson` (MIT)
  - Use to validate inputs before mapping.
  - We still implement mapping BeerJSON → our row contracts.

### BeerXML
- **XML parsing**: `fast-xml-parser` (MIT)
  - Use for XML → JS object conversion.
  - We still implement mapping BeerXML → our row contracts.

Avoid for new implementation unless proven necessary:
- Legacy BeerXML-specific converters/parsers that appear unmaintained.

---

## Mapping strategy (v1 minimal, useful subset)

### What we map first
- Recipe metadata: name, style (if present), notes (if present)
- BeerJSON recipe + ingredients (minimal useful subset):
  - Fermentables: `name`, `amount`, `color`, best-effort `yield`
  - Hops: `name`, `amount`, best-effort timing + alpha acid
  - Culture: `name`, best-effort `producer`/`product_id`/`attenuation`
  - Misc: `name`, `type`, `amount`, best-effort timing

### What we intentionally ignore first
- Equipment profiles
- Detailed mash schedules (steps, temps)
- Water chemistry, salts, acids
- Fermentation profiles, packaging, carbonation
- Targets (OG/FG/ABV/IBU), unless trivially available

---

## Ingredient linking (optional best-effort)

Imported rows should always preserve the human-readable `name`, and optionally include `ingredientId` if we can match it.

Match ladder (proposal):
1. Exact match by canonical ingredient name in our DB (case-insensitive, trimmed).
2. Alias/producer-aware match if we introduce aliases later.
3. If the imported format provides stable source IDs that we have mappings for (e.g., BeerProto IDs), use `IngredientSourceMap`.
4. If no match: keep `ingredientId: null` and rely on the text `name` (still editable).

Important:
- Never block import on imperfect linking; instead emit warnings.

---

## Security + robustness requirements

- **Size limits**: cap upload/paste size (e.g. 1–2 MB initially).
- **XML safety**:
  - Reject/ignore `DOCTYPE` and external entity resolution (avoid XXE-style issues).
  - Avoid any parser modes that fetch external resources.
- **Validation**:
  - BeerJSON: schema validate before mapping (reject with clear errors).
  - BeerXML: validate minimal expected structure (reject with clear errors).
- **Unit normalization**: all amounts stored in our expected units.
- **Warnings**: return a list of warnings (unknown hop use/time, missing amounts, unparseable units, etc.).

---

## Licensing policy

Default policy:
- Import only **user-provided** recipe files (BeerXML/BeerJSON).
- Do **not** ship or sync third-party recipe libraries unless the dataset is clearly licensed for redistribution.

If we later consider pre-seeding templates:
- Prefer a small curated set authored by us, or
- Only import datasets with explicit permissive licenses and clear provenance.

---

## Deliverables (when we implement)

1. API importer module(s)
   - `beerxmlImporter.ts` (parse + map + warnings)
   - `beerjsonImporter.ts` (validate + map + warnings)
2. Routes
   - `/recipes/import/preview`
   - `/recipes/import`
3. Web UI
   - Import panel on `/[locale]/recipes` (file upload first)
4. Tests
   - Fixture BeerXML/BeerJSON files
   - Assertions on generated canonical `beerJsonRecipeJson`

