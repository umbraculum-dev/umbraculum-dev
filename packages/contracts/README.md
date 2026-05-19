# @umbraculum/contracts

Shared DTOs, types, and runtime parsers. The contract layer between the API and every client.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). Renamed from `@brewery/contracts` to `@umbraculum/contracts` as sub-plan #9 slot 9 (heaviest slot at 75-file footprint; first slot to open two simultaneous transient cross-scope states for slots 10 + 11).

## What this is

The single source of truth for every cross-boundary type in the platform — auth payloads, water-chemistry compute responses, gravity-analysis results, AI-tool I/O shapes, format hints. Both the API (`services/api`) and the clients (`apps/web`, `apps/native`, `@umbraculum/api-client`) import the same `ResponseV1` / `RequestV1` types and the same hand-rolled runtime parsers, which guarantees that what the API serializes is exactly what the client deserializes — type-checked at compile time and shape-validated at runtime.

The package uses **hand-rolled validators** (rather than Zod / Valibot / TypeBox) for the reasons documented in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md): the trade-off between dependency surface, parser-payload size on native bundles, and type-system fidelity favors the hand-rolled approach for now; the doc tracks trigger criteria for revisiting.

## Scope

- **Contains**: DTO/type definitions and their matching `parse*` runtime validators; format-hint types (`NumberFormatHintV1`, `NumberFormatUnit`); response envelopes (`MashComputeAndSaveResponseV1`, etc.); AI-tool I/O contracts.
- **Does not contain**: the Prisma schema (lives in `services/api/prisma/`); HTTP route handlers (live in `services/api/src/routes/`); UI rendering of contract data (lives in `@umbraculum/brewery-recipes-ui` / `apps/web` / `apps/native`); transport-layer concerns (auth headers, retries — those live in `@umbraculum/api-client`).

## Exports

### Auth
- `AuthMeResponse`, `parseAuthMeResponse` — `/auth/me` response and parser

### Water
- **Profiles**: `IonProfilePpm`, `WaterProfile`, water hub summary types
- **Compute-and-save**: `MashComputeAndSaveResponseV1`, `SpargeComputeAndSaveResponseV1`, `BoilComputeAndSaveResponseV1`
- **Parsers**: `parseMashComputeAndSaveResponse`, `parseSpargeComputeAndSaveResponse`, `parseBoilComputeAndSaveResponse`

### Analysis
- **Types**: `GravityAnalysisResponseV1`, `GravityAnalysisResultV1`, `GravityAnalysisWarningCode`, etc.
- **Parser**: `parseGravityAnalysisResponseV1`

### Format
- `NumberFormatHintV1`, `NumberFormatUnit` — numeric display hints for consistent web/native rendering
- Water hub and compute-and-save responses include `formatHints` keyed by unit (L, pH, ppm_as_CaCO3, ppm, g, mL, kg)

## Build / test / lint (local)

This package is consumed by web and native clients and the API itself; it ships runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

Commands (run from repo root, container-friendly per the [`node-npm-container-only`](../../.cursor/skills/node-npm-container-only.md) rule):

- **Build**: `npm run build:packages`
- **Test**: `npm run test --workspace=@umbraculum/contracts` (vitest in container; see [`docs/TESTING.md`](../../docs/TESTING.md)).
- **Lint**: `npm run lint --workspace=@umbraculum/contracts`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace landed all 6 candidate strict flags after Phase 6h — `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`).
- **Contracts check**: when an API response shape changes, run `npm run contracts:check` (or `contracts:update` to refresh the snapshot) inside the api container.

## How it fits in

- **Consumed by**: `services/api` (the producer side), `apps/web` and `apps/native` (the consumer sides), `@umbraculum/api-client` (transport layer that returns parsed responses).
- **Depends on**: nothing in the workspace scope. This package is at the bottom of the package dependency stack alongside `@umbraculum/i18n` and `@umbraculum/media`.

## Status

The contract surface is versioned per-response-type (`*ResponseV1`, `*RequestV1`). When breaking changes are needed, ship `*V2` alongside the existing `*V1` and migrate consumers one at a time; do not mutate `*V1` in place. The validation-library evaluation criteria are documented in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md); revisit when one of those triggers fires.

## Further reading

- [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md) — why this package uses hand-rolled validators today
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`docs/TYPING.md`](../../docs/TYPING.md) — TypeScript strategy (strict-flag rollout history)
