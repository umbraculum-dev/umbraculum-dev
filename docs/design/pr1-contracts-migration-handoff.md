# PR 1 (packages/contracts → Zod) — migration handoff

**Tier:** Internal
**Status:** In progress — worked example landed; remaining 4 parsers + tests scheduled for next session under container access.
**Owners:** project lead
**Related:** [RFC-0003](../rfcs/0003-validation-library-adoption.md) Decision D, [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) v2.0, [`.cursor/plans/validation_library_adoption_<id>.plan.md`](../../.cursor/plans/) Phase 3 PR 1.

---

## Why a handoff doc

PR 1 has a scope envelope of ~50 file changes (5 parser source files + 5 test files + lint config + plugin-pack rule + 25+ consumer call sites). Doing it as a single agent-session bulk rewrite is not safe without container-side test verification (`npm install zod && npm run test`). This handoff splits PR 1 into two sub-PRs so review and test verification can happen incrementally.

## What landed in this session

| Artifact | Status |
|---|---|
| `packages/contracts/package.json` — added `zod: ^4.3.6` dependency | Landed |
| `packages/contracts/src/auth/meResponse.ts` — full Zod v4 migration (worked example, behavior-preserving via preprocess + per-field soft transforms) | Landed |
| `packages/contracts/src/auth/meResponse.test.ts` — rewritten assertions via `ZodError` + `expectFirstIssuePathStartsWith` helper; behavior tests preserved 1:1 | Landed |
| `eslint.config.mjs` — added `no-restricted-syntax` rule for `packages/*-contracts/**/*.{ts,tsx}` forbidding hand-rolled `function isX(v: unknown): v is X` drift | Landed |
| `.cursor/plugins/local/umbraculum-node-react-cursor-assistant/rules/22-typescript-contracts-runtime-validation.mdc` — rewritten from "do NOT introduce Zod" to "Zod v4 is the project's strategy", with library-agnostic SDK interface + backward-compat tunnel + soft-tolerance patterns documented | Landed |

## Mandatory prep before any consumer-side verification (containerized rebuild)

> [!IMPORTANT]
> Hit this gotcha during the 2026-05-19 Phase B-2 boot-fail incident — committed `packages/*/dist/**` is the contract surface that consumers actually import, NOT `packages/*/src/**`. Any time `packages/contracts/src/**` (or any other workspace package's `src/`) gains a new export, the committed `dist/` MUST be regenerated before downstream containers (api, web, native) can resolve the new symbol.

After completing each parser migration (or batching 2–3) and BEFORE restarting the `api` / `web` containers to verify, do BOTH of these in order:

1. From the host (this is the one mandatory `scripts/*.sh` exception to "no npm on host" — the script runs `npm ci` + `npm run build:packages` inside a one-off `node:20-slim` container that has `/repo` writable, so npm never actually runs on the host):
   ```bash
   cd <REPO_ROOT> && bash scripts/build-packages-in-docker.sh
   ```
   This rewrites all 11 committed `packages/*/dist/**` artifacts. Wall time ≈ 90–120s.
2. If `services/api/package.json` (or any consumer workspace's `package.json`) was edited (e.g. to add `zod` as a direct dep — see PR 3 handoff), also reinstall inside the consumer container so the bind-mounted `node_modules` picks up the new dep:
   ```bash
   docker compose exec -T <consumer> sh -c "cd /app && npm install --no-audit --no-fund"
   docker compose restart <consumer>
   ```
   `<consumer>` is `api` for backend changes, `web` for Next.js changes. (`apps/native` doesn't run in compose; rebuild via the Metro container per `docs/DEVELOPMENT.md` if/when native consumes the new symbols.)

**Failure mode if skipped**: containers boot but throw `SyntaxError: The requested module '@umbraculum/contracts' does not provide an export named 'XSchema'` on first hit — because the running container is still resolving the stale `dist/index.js` that predates the new export. Same failure mode if the consumer's `node_modules` lacks `zod` (`Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'zod' imported from /app/src/...`).

## What's pending for the next session (container required)

| File | Action | Pattern |
|---|---|---|
| `packages/contracts/src/water/waterProfile.ts` | Migrate `parseWaterProfile` + `parseWaterProfilesResponse` to Zod schemas | Mirror `meResponse.ts` pattern. Preserve dual-key tunnel (`workspace ↔ account`, `workspaceId ↔ accountId`). Preserve soft defaults (scope/type/verificationStatus fall back; missing ions default to 0; non-string ph collapses to undefined). |
| `packages/contracts/src/water/waterProfile.test.ts` | Rewrite assertions to use `expectFirstIssuePathStartsWith` helper | Mirror `meResponse.test.ts`. Behavior tests preserved 1:1. Phase 4b regression-pin (`account → workspace` legacy key) MUST be preserved. |
| `packages/contracts/src/analysis/parseGravityAnalysis.ts` | Migrate `parseGravityAnalysisResponseV1` + helpers (`parseCanonicalModels`, `parseNumberFormatHintV1`, `parseDerivationLineValue`, `parseDerivation`) | Discriminated unions: use `z.discriminatedUnion("kind", [...])` for `WaterCalcDerivationValue` (number/string/boolean/null variants). Drop-on-error semantics for invalid `derivations[k]` / `formatHints[k]` entries → preserve via per-entry `safeParse` in a thin wrapper, not as part of the top-level schema. |
| `packages/contracts/src/analysis/parseGravityAnalysis.test.ts` | Rewrite assertions | Mirror `meResponse.test.ts` pattern. |
| `packages/contracts/src/water/parseComputeAndSave.ts` | Migrate 3 top-level parsers (`parseMashComputeAndSaveResponse`, `parseSpargeComputeAndSaveResponse`, `parseBoilComputeAndSaveResponse`) + ~12 helper parsers (`parseIonProfilePpm`, `parseAcidificationResult`, `parseAcidificationManualResult`, `parseMashTargetMashPhResult`, `parseSaltAdditionsResult`, `parseOverallResult`, `parseMashAcidBlock`, `parseSpargeAcidBlock`, `parseBoilAcidBlock`, `parseDerivation`, `parseDerivationLine`, `parseDerivationValue`) | Largest file in the migration (387 LoC). The spike at `spike/validation-library/zod/parse-mash-acid-block.ts` is the working template for the discriminated-union pattern. The 3 acid-block discriminated unions (mash/sparge/boil) share `WaterAcidificationManualResultSchema` and `WaterAcidificationResultSchema` — extract these as module-level constants, do not re-inline per variant. |
| `packages/contracts/src/water/parseComputeAndSave.test.ts` | Rewrite assertions | Largest test file in the migration. Likely 80+ assertion sites. |
| `packages/contracts/src/water/parseHubSummary.ts` | Migrate `parseRecipeWaterHubSummaryResponse` + helpers (`parseIonProfilePpm`, `parseExpectedRaRange`, `parseStream`) | The stream-array helpers drop invalid entries silently (`filter(Boolean)` after `parseStream`). Preserve via per-entry `safeParse` + filter, not via top-level schema. |
| `packages/contracts/src/water/parseHubSummary.test.ts` | Rewrite assertions | Mirror `meResponse.test.ts` pattern. |

## Per-file migration checklist (use for each of the 4 remaining files)

1. Read the existing `parseX` function and identify:
   - Soft-tolerance fallbacks (non-string → default) → use per-field `z.unknown().transform()`.
   - Dual-key tunnels (legacy + canonical name) → use top-level `z.preprocess(...)`.
   - Drop-invalid-entry behaviors (array `.filter(Boolean)` after parse) → use per-entry `safeParse` in a thin wrapper, keep schema strict.
   - Discriminated unions (`if (kind === "x") return {...}`) → use `z.discriminatedUnion("kind", [...])`.
2. Declare sub-schemas first (smallest-leaf-first). Export top-level schema. Export `type X = z.infer<typeof XSchema>` (replace the existing `interface X` if it duplicates).
3. Preserve the `parseX(payload: unknown): X` export as a thin wrapper around `Schema.parse(payload)`.
4. Update the matching `.test.ts` file:
   - Replace `expect(() => parseX(bad)).toThrow(/regex/)` assertions with `expectFirstIssuePathStartsWith(bad, ['path', 'to', 'field'])` calls.
   - Preserve all behavior tests (well-formed acceptance, soft defaults, backward-compat tunnels) 1:1.
   - Import `ZodError` from `zod`.
5. Search for consumer call sites in `apps/web` and `apps/native`:
   ```bash
   rg 'parseAuthMeResponse|parseWaterProfileItem|parseWaterProfilesResponse|parseGravityAnalysisResponseV1|parseMashComputeAndSaveResponse|parseSpargeComputeAndSaveResponse|parseBoilComputeAndSaveResponse|parseRecipeWaterHubSummaryResponse' apps/
   ```
   Call sites continue to work unchanged because `parseX(unknown): X` signature is preserved. If a consumer accesses error details (`catch (e) { if (e.message.includes(...)) ...}`), update it to `if (e instanceof ZodError) { e.issues[0].path... }`.
6. Run `npm run typecheck` (container) and `npm run test` (container) inside `packages/contracts`. Fix any issues surfaced.
7. Run `npm run lint` (container) at repo root to verify the new lint rule doesn't false-positive on remaining hand-rolled type-guards in unmigrated areas. If false-positive, scope the rule down or add per-file disable comments.

## Container session checklist

Before merging PR 1:

```bash
# In api/node container (see DEVELOPMENT.md):
cd /workspace
npm install                             # installs zod ^4.3.6
cd packages/contracts
npm run typecheck                       # confirms all 5 parser files type-clean
npm run test                            # confirms 38 → ~40 tests green (test count grows slightly because the worked example added schema-export smoke tests)
cd /workspace
npm run lint -- --max-warnings 0        # confirms lint rule doesn't false-positive
```

After PR 1 merges, PR 2 (mailbox-data.ts migration) can begin. PR 2 is single-file scope and the pattern from `meResponse.ts` should transfer directly.

## Behavior changes documented in this PR

None intended. The migration is behavior-preserving: every soft-tolerance fallback, every dual-key tunnel, every default value is replicated in the Zod schema via `preprocess` and per-field `transform`. The only observable change for callers is the error envelope: `Error` → `ZodError` (richer, structured `issues[]` array with machine-readable `path`).

Per RFC-0003 Decision F (direct migration, no bridge layer), the new error envelope is the canonical wire/in-process shape. The `apps/web` and `apps/native` clients that catch and inspect `parseX` errors are updated in PR 3's window (route migration), not in PR 1.

## Latent-bug audit

The hand-rolled parsers' silent coercion of non-string fields to defaults (e.g. `isString(v['role']) ? v['role'] : null`) is *preserved* in this migration. A subsequent strict-tighten PR (tracked as a separate sub-plan, not part of RFC-0003 §10 follow-ups) may surface latent producers that have been sending malformed `role` / `activeWorkspaceId` / `preferredLocale` for some time. The migration is behavior-preserving on purpose to keep the diff focused on the validation engine, not the contract.

If the strict-tighten PR is ever opened: walk every `z.unknown().transform()` field in the migrated schemas, replace with the strictest matching primitive (`z.string().nullable()` etc.), run the test suite, and inspect every newly-failing assertion. The failures are either (a) legitimate strict-tighten test updates or (b) latent bug surfacing — distinguish per-case.
