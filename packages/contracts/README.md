# @umbraculum/contracts

Shared DTOs, types, and runtime parsers. The wire-shape contract layer between the API and every client.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications.

**npm (external integrators):**

```bash
npm install @umbraculum/contracts@0.0.1
```

Monorepo contributors use workspace `file:` links — see [`DEVELOPMENT.md`](../../DEVELOPMENT.md).

**Relationship to `@umbraculum/*-contracts`:** This package holds **platform** wire parsers (auth, workspaces, rendering jobs, ads, AI settings/usage) plus **reference-vertical** brewery DTOs used by the in-repo brewery module. Canonical domain modules (`automation`, `pim`, `mrp`, `crp`) ship separate `@umbraculum/<code>-contracts` packages — pin those for adapter/integration work against a canonical module.

## What this is

The single source of truth for every wire-shape type in the platform — auth payloads, water-chemistry compute responses, gravity-analysis results, AI-settings + AI-usage-ledger DTOs, format hints. Both the API (`services/api`) and the clients (`apps/web`, `apps/native`, `@umbraculum/api-client`) import the same `ResponseV1` / `RequestV1` types and the same runtime parsers, which guarantees that what the API serializes is exactly what the client deserializes — type-checked at compile time and shape-validated at runtime. The AI-tool SDK contract (`AiTool<I, O>`, `AiToolContext`, `AiToolScope`, `AiToolRegistry`, `AiToolDefinition`) was extracted to [`@umbraculum/ai-tool-sdk`](../ai-tool-sdk/) on 2026-05-21 — that surface is library-agnostic SDK contract, not wire shape, and lives there now.

The package uses **Zod v4 schemas** for new and migrated wire-shape contracts per [RFC-0003](../../docs/rfcs/0003-validation-library-adoption.md). Older parser files may still carry staged-migration history, but the current authoring rule is schema-first: exported schemas are the source of truth, public types are inferred with `z.infer`, and thin `parse*` wrappers preserve call-site stability.

## Scope

- **Contains**: DTO/type definitions and their matching Zod schemas / `parse*` runtime validators; format-hint types (`NumberFormatHintV1`, `NumberFormatUnit`); response envelopes (`MashComputeAndSaveResponseV1`, etc.); workspace AI-settings + AI-usage-ledger wire shapes (`WorkspaceAiSettings`, `AiRoleLimits`, `AiUsageLedgerEntry`, `AiToolCallRecord`); rendering job wire contracts (`RenderJobSubmitRequest`, `RenderJobStatusResponse`, `RenderJobResultResponse`).
- **Does not contain**: the AI-tool SDK contract — extracted to [`@umbraculum/ai-tool-sdk`](../ai-tool-sdk/) on 2026-05-21; the Prisma schema (lives in `services/api/prisma/`); HTTP route handlers (live in `services/api/src/routes/`); UI rendering of contract data (lives in `@umbraculum/brewery-recipes-ui` / `apps/web` / `apps/native`); transport-layer concerns (auth headers, retries — those live in `@umbraculum/api-client`).

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

### AI (wire-shape only — SDK contract moved)
- `WorkspaceAiSettings`, `AiProvider`, `AiRoleLimits` — `GET/PUT /workspaces/:id/ai/settings` shapes
- `AiUsageLedgerEntry`, `AiToolCallRecord` — usage-ledger wire shapes
- *(For the AI-tool SDK contract — `AiTool`, `AiToolContext`, `AiToolScope`, `AiToolRegistry`, `AiToolDefinition` — see [`@umbraculum/ai-tool-sdk`](../ai-tool-sdk/). Extracted from this package on 2026-05-21.)*

### Rendering
- `RenderJobSubmitRequest`, `RenderJobStatusResponse`, `RenderJobResultResponse` — canonical document/file rendering job HTTP payloads from RFC-0007 PR3

## Build / test / lint (local)

This package is consumed by web and native clients and the API itself; it ships runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

Commands (run from repo root, container-friendly per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`):

- **Build**: `npm run build:packages`
- **Test**: `npm run test --workspace=@umbraculum/contracts` (vitest in container; see [`docs/TESTING.md`](../../docs/TESTING.md)).
- **Lint**: `npm run lint --workspace=@umbraculum/contracts`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace landed all 6 candidate strict flags after Phase 6h — `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`).
- **Contracts check**: when an API response shape changes, run `npm run contracts:check` (or `contracts:update` to refresh the snapshot) inside the api container.

## How it fits in

- **Consumed by**: `services/api` (the producer side), `apps/web` and `apps/native` (the consumer sides), `@umbraculum/api-client` (transport layer that returns parsed responses).
- **Depends on**: nothing in the workspace scope. This package is at the bottom of the package dependency stack alongside `@umbraculum/i18n` and `@umbraculum/media`.

## Status

The contract surface is versioned per-response-type where an existing client contract already carries a `V1` suffix. When breaking changes are needed, ship `*V2` alongside the existing `*V1` and migrate consumers one at a time; do not mutate `*V1` in place. New RFC-0003-era surfaces use Zod schemas directly as the versioned source of truth.

## Further reading

- [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md) — why this package uses hand-rolled validators today
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`docs/TYPING.md`](../../docs/TYPING.md) — TypeScript strategy (strict-flag rollout history)
