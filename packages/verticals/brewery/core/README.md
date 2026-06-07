# @umbraculum/brewery-core

Brewery-vertical brewing math — gravity conversions, unit normalization, and mash pH defaults.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications. Renamed from `@brewery/core` to `@umbraculum/brewery-core` as sub-plan #9 slot 6 (2026-05-19); see [`docs/design/brewery-scope-migration-plan.md`](../../../docs/design/brewery-scope-migration-plan.md). **Vertical-prefixed scope** — this package is brewery-domain math, not platform-wide infrastructure. The bare `@umbraculum/core` name is reserved for a future platform-core framework package.

## What this is

Pure JavaScript brewing calculations shared by the brewery vertical's web app, native app, API importers, and `@umbraculum/brewery-beerjson`. It owns gravity (Plato ↔ SG), mass/volume unit conversion with warnings, rounding helpers, and the default mash target pH constant used when a recipe omits one. No React, no BeerJSON schema types, no I/O — safe to import from services and tests.

## Scope

- **Contains**: `platoToSg` / `sgToPlato`; mass/volume converters (`massToKg`, `volumeToLiters`, …); imperial helpers (`kgToLb`, `litersToUsGallons`); `roundTo`; `DEFAULT_MASH_TARGET_PH`; unit guard helpers (`isMassUnitV1`, `isVolumeUnitV1`).
- **Does not contain**: BeerJSON document shapes (see [`@umbraculum/brewery-beerjson`](../beerjson/README.md)); recipe editor UI (see [`@umbraculum/brewery-recipes-ui`](../recipes-ui/README.md)); water chemistry solvers beyond the shared default pH constant (extended models live in brewery docs under [`docs/modules/verticals/brewery/`](../../../docs/modules/verticals/brewery/)).

## Exports / Surface

| Export area | Key symbols |
|---|---|
| Gravity | `platoToSg`, `sgToPlato` |
| Units | `massToKg`, `massToGrams`, `volumeToLiters`, `kgToLb`, `litersToUsGallons`, `roundTo` |
| Water defaults | `DEFAULT_MASH_TARGET_PH` |
| Types | `MassUnitV1`, `VolumeUnitV1`, `UnitConversionWarningV1` |

Source: [`packages/verticals/brewery/core/src/`](src/) (`gravity.js`, `water.js`, `units/`).

## Usage

```js
import { sgToPlato, massToKg, DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

const plato = sgToPlato(1.052);
const kg = massToKg(10, "lb");
const targetPh = DEFAULT_MASH_TARGET_PH;
```

## Build / test / lint (local)

This package ships runtime JS directly from `src/` (no separate build step). Commands run from repo root inside the Node container per the `node-npm-container-only` skill:

- **Test**: `npm run test --workspace=@umbraculum/brewery-core`
- **Lint**: `npm run lint --workspace=@umbraculum/brewery-core` (when configured for this workspace)
- **Typecheck**: types in `src/index.d.ts`; broader workspace gates in [`docs/TYPING.md`](../../../docs/TYPING.md)

After changes under any `packages/**` workspace, rebuild dependents when needed: `npm run build:packages` (or `./scripts/build-packages-in-docker.sh`).

## How it fits in

- **Consumed by**: `@umbraculum/brewery-beerjson`, `@umbraculum/brewery-recipes-ui`, brewery API routes and importers under `services/api/src/modules/brewery/`.
- **Depends on**: nothing in the workspace — leaf package.

## Status

Stable for the brewery vertical's current gravity and unit-conversion needs. Non-brewery verticals should not depend on this package; extract shared math into a horizontal package only when a second vertical genuinely needs the same primitives.

## Further reading

- [`docs/modules/packages/README.md`](../../../docs/modules/packages/README.md) — package index (horizontal vs vertical-flavored)
- [`docs/modules/verticals/brewery/README.md`](../../../docs/modules/verticals/brewery/README.md) — reference vertical overview
- [`@umbraculum/brewery-beerjson`](../beerjson/README.md) — BeerJSON layer built on these math primitives
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — README standard this file follows
