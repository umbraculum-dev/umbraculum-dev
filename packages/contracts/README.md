# @brewery/contracts

Shared DTOs, types, and runtime parsers for the Brewery app. Used by web and future native clients.

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

## Build output (native-ready)

This package is consumed by web and native clients and must ship runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

When you change `packages/contracts/src/**`, rebuild the package outputs (from repo root):

- `npm run build:packages`
