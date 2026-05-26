# RAW-MATERIALS-SEEDABLE-SOURCES.md
**Purpose:** Identify public/seedable sources for brewing “raw materials” datasets (malts/fermentables, hops, yeast, salts, acids, water profiles) including common specs (PPG/potential, color Lovibond/EBC/SRM, yeast attenuation, etc.).  
**Last updated:** 2026-02-12  
**Audience:** Engineering + Cursor (AI-first planning).

> **Key constraint:** Licensing must be clear enough that we can legally **store, ship, and display** the data in a commercial product. When in doubt, treat a source as **reference-only** until confirmed.

---

## 1) What we want to seed (minimum)
### 1.1 Fermentables (malts, sugars, extracts, adjuncts)
Common fields:
- `name`, `producer/maltster`, `origin`, `type`
- **Potential / yield / PPG** (and unit details)
- **Color** (Lovibond/EBC/SRM), sometimes ranges
- Optional: diastatic power, moisture, protein, max % use, notes

### 1.2 Hops
Common fields:
- `name`, `origin`, `type` (pellet/leaf), usage (bittering/aroma)
- **Alpha/Beta acids** (often ranges), cohumulone, oil content (optional)
- Aroma descriptors, substitutions, notes

### 1.3 Yeast
Common fields:
- `name`, `lab`, `type` (ale/lager/wild), `form` (dry/liquid)
- **Attenuation range**, **temperature range**, **flocculation**, alcohol tolerance
- Notes / style fit

### 1.4 Water / salts / acids (for water correction)
There usually isn’t a “canonical open DB” like there is for hops/malts/yeast.
Practical approach:
- Seed **curated** canonical salts/acids yourself (small set, high quality).
- Seed water profiles if you find a good open dataset.
- Keep one source of truth; allow “copy/duplicate” rather than shared edit state.

---

## 2) Best seed sources (license clear enough to ship)

### 2.1 BeerProto dataset (MIT) — recommended “base seed”
**What:** “A collection of common datasets used for brewing.”  
**License:** MIT (per repo license)  
**Coverage:** repo includes folders for fermentables/hops/water/culture/etc.

- Repo: https://github.com/beerproto/dataset  
- Why it’s good:
  - Permissive license (commercial-friendly)
  - Structured dataset approach
  - Good starting point for an internal canonical database

**Recommendation:** Start here as your first import.

#### 2.1.1 “Other ingredients” / “Misc” (spices, finings, herbs, flavors)
We intentionally separate:

- **Schema (shape)**: how we represent “other/misc” ingredients in recipes and (later) in canonical DB tables.
  - We align with **BeerJSON** so future import/export (BeerJSON/BeerXML) is straightforward and we avoid inventing an incompatible format.
  - BeerJSON misc schema docs: https://beerjson.github.io/beerjson/misc.json.html
  - BeerJSON license: MIT (https://raw.githubusercontent.com/beerjson/beerjson/v.1.0/LICENSE)

- **Catalog / dataset (list)**: where the actual ingredient list comes from (e.g. “Irish moss”, “ginger”, “coriander”, …).
  - BeerJSON does **not** provide a canonical list.
  - For v0, BeerProto is our chosen seed source for **malts/hops/yeast**. For “misc/other ingredients”, BeerProto’s list is a **candidate** source (not yet selected as canonical by us).
  - BeerProto misc list (ODS candidate): https://raw.githubusercontent.com/beerproto/dataset/master/miscellaneous/miscellaneous.ods

Rationale:
- BeerJSON provides a stable open standard for structure.
- BeerProto provides a practical seedable dataset for malts/hops/yeast today; “misc/other” is intentionally left open to multiple possible sources.
- This combination keeps us compatible with the ecosystem while staying pragmatic.

---

### 2.2 BrewDB (CC-BY-SA 4.0) — rich malt/yeast detail, but “ShareAlike”
**What:** SQLite DB with brewing ingredients.  
**License:** CC-BY-SA 4.0 (explicit in repo)  
**Coverage:** hops + malts + yeast; includes many spec-like fields (e.g., yield, EBC, attenuation range, temp range, etc.).

- Repo: https://github.com/sboulema/BrewDB  
- Notes:
  - Great for “spec sheet” style fields (malt yield, EBC, yeast attenuation/temp, etc.)
  - **CC-BY-SA** has obligations (attribution + share-alike). If you ship a derived dataset, you may need to provide it under the same license and keep attribution.

**Recommendation:** Use it as a second-layer enrichment **only if** you accept CC-BY-SA terms for your redistributed dataset (get legal comfort early).

---

## 3) “Reference / bootstrap” sources (useful, but treat licensing as uncertain until verified)

### 3.1 Brewtarget default database (default_db.sqlite) — likely GPL implications
**What:** Brewtarget ships a default SQLite database with ingredients/waters. Maintainer points to downloading `default_db.sqlite` from the repo and gives counts.  
**Where:** `data/default_db.sqlite` in Brewtarget repo.  
**Licensing:** Brewtarget is open-source and commonly distributed under GPL terms; **treat the DB’s redistribution rights as unclear** unless explicitly stated for the DB content.

- Discussion (maintainer answer referencing the file):  
  https://github.com/Brewtarget/brewtarget/discussions/563  
- File path (default database):  
  https://github.com/Brewtarget/brewtarget/blob/main/data/default_db.sqlite

**Recommendation:** Use as **internal bootstrap and cross-check**, but don’t ship it (or derived DB) without confirming DB content licensing constraints.

---

### 3.2 BrewUnited ingredient tables — explicitly “courtesy of BeerSmith”
BrewUnited pages explicitly say their data is courtesy of BeerSmith.

- Grain DB: https://www.brewunited.com/grain_database.php (includes “Data courtesy of BeerSmith”)  
- Hop DB: https://www.brewunited.com/hop_database.php (includes “Data courtesy of BeerSmith”)  
- Yeast DB: https://www.brewunited.com/yeast_database.php (includes “Much of this data courtesy of BeerSmith”)

**Recommendation:** Great for **manual verification** and field discovery, but assume **not redistributable** unless permission is obtained.

---

### 3.3 BeerSmith ingredient lists (commercial context)
BeerSmith publishes ingredient list pages (useful to understand fields), but BeerSmith is commercial software. Treat as reference unless you secure permission.
- Example grain list: https://beersmith.com/grain-list/

---

### 3.4 BreweryDB (API) — commercial/terms-bound
BreweryDB exists as an API (often described as requiring an API key; free tiers may exist, premium adds features).
- Example integration doc: https://www.drupal.org/project/brewery_db  
**Recommendation:** If you need a paid upstream later, this could work, but it’s not “seed-and-ship open data.”

---

## 4) Other “open-ish” datasets (not the same thing, but potentially useful)
### 4.1 Open Brewery DB (brewery locations)
Open Brewery DB is a free dataset/API for breweries/cideries/brewpubs/bottle shops.
- https://www.openbrewerydb.org/  
This is about brewery locations, not ingredient specs, but could be useful for “find breweries / clubs” features.

---

## 5) Suggested merge strategy (multiple sources is an advantage)
Goal: merge multiple datasets without creating chaos later.

### 5.1 Store provenance for every record
For each imported record, keep:
- `source_name`, `source_url`, `source_license`, `retrieved_at`
- `source_key` (original ID/name)
- `raw_payload` (JSON blob) in staging table
- `confidence_score` and `conflict_notes`

### 5.2 Canonical tables + crosswalk table
Canonical tables:
- `fermentable`, `hop`, `yeast`, `salt`, `acid`, `water_profile`

Crosswalk:
- `ingredient_source_map(ingredient_id, source_name, source_key, confidence, notes)`

### 5.3 Normalization rules (important)
- Normalize color to **EBC** (store original units too): `color_ebc`, `color_lovibond`, `color_srm` where available.
- Normalize fermentable potential:
  - store `yield_percent` and derive `ppg` (or vice-versa) consistently
  - store “as-provided” unit/range and keep the derived canonical value

### 5.4 Conflicts are expected
Example conflicts:
- same hop has slightly different alpha ranges across sources
- same malt has different yield because of maltster/crop

Approach:
- keep source-specific ranges in `ingredient_source_map`
- compute a canonical “default range” with confidence rules
- allow advanced users to override on a per-brewery basis later

---

## 6) Recommended “seed order” for day 1
1) **BeerProto dataset (MIT)** as the base canonical dataset.  
2) If acceptable, enrich with **BrewDB (CC-BY-SA 4.0)**.  
3) Use Brewtarget + BrewUnited + BeerSmith pages as **validation/reference** only unless permissions are clarified.  
4) Seed salts/acids as a **curated canonical list** maintained by you (small list, high correctness).

---

## 7) Practical next steps (implementation plan sketch)
1) Create a `seed_import` CLI in the backend repo:
   - download/clone data sources
   - parse into staging tables
   - normalize + dedupe into canonical tables
2) Add `ingredient_source_map` and `data_quality_flags` so improvements don’t require destructive rewrites.
3) Create admin-only “data curator” UI to review conflicts and accept canonical values.
4) Track licensing for every source in code + documentation; don’t mix “ship” vs “reference” data paths.

---

## 8) Cursor instruction (copy/paste)
**When Cursor plans work involving ingredient databases, it must:**
- prioritize sources with **clear permissive licensing** for redistribution
- preserve provenance for imported data
- avoid duplicating sources of truth (one canonical record, many source mappings)
- treat “reference-only” sources as non-redistributable unless permission is confirmed
