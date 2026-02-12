# Ingredient seed/import scaffolding

This folder is the starting point for importing “raw materials” datasets (fermentables, hops, yeast, salts, acids, water profiles).

## Why this exists

Recipes and the water calculator need a canonical ingredient database. We want to seed it from sources with clear licensing (see `docs/RAW-MATERIALS-SEEDABLE-SOURCES.md`).

## Data strategy (high level)

### Canonical tables (long-term goal)
- `fermentable`
- `hop`
- `yeast`
- `salt`
- `acid`
- `water_profile`

### Crosswalk/provenance (required)
For every imported record, preserve provenance:
- `source_name`, `source_url`, `source_license`, `retrieved_at`
- `source_key` (original identifier/name)
- `raw_payload` (JSON blob) in a staging table
- `confidence_score` and `conflict_notes`

Crosswalk idea:
- `ingredient_source_map(ingredient_id, source_name, source_key, confidence, notes)`

## Seed order (recommended)
1) BeerProto dataset (MIT) as the base seed.
2) Optionally enrich with other sources only after licensing is clear.
3) Salts/acids should be curated and maintained by us (small set, high correctness).

## Next implementation steps

1) Add Prisma models for canonical ingredient tables + staging/provenance tables.
2) Implement the CLI entrypoint: `npm run seed:import` (see `src/cli/seed-import.ts`).
3) Add source-specific parsers under `src/seed/sources/*`.

