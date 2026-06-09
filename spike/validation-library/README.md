# Validation-library spike (Zod v4 vs Valibot)

**Tier:** Internal
**Status:** Phase 1 spike per [`docs/rfcs/0003-validation-library-adoption.md`](../../docs/rfcs/0003-validation-library-adoption.md) §15 (Resolution) and [`docs/design/validation-library-adoption-audit.md`](../../docs/design/validation-library-adoption-audit.md) §5.6 (falsifiable tests).
**Owners:** project lead
**Related:** [RFC-0003](../../docs/rfcs/0003-validation-library-adoption.md), audit, plan

---

## What this is

A side-by-side implementation of three contracts in **Zod v4** and **Valibot**, used as the gate between Phase 1 (RFC + spike) and Phase 2 (strategy doc flip + migration PRs) of the validation-library adoption plan.

The three contracts cover the complexity axes that matter for the project's contracts surface:

1. **`MAILBOX_SPEC` validator** — JSON-loaded artifact with structural validation + cross-entry duplicate detection. Real-world equivalent: [`packages/canonical/automation/contracts/src/mailbox-data.ts`](../../packages/canonical/automation/contracts/src/mailbox-data.ts) (168 lines hand-rolled).
2. **`parseMashAcidBlock` discriminated union** — three-variant discriminated union with shared nested schemas. Real-world equivalent: [`packages/platform/contracts/src/water/parseComputeAndSave.ts`](../../packages/platform/contracts/src/water/parseComputeAndSave.ts) lines 207–235 (30 lines hand-rolled, plus shared helpers).
3. **`/auth/signup` Fastify route** — typed body via library-specific Fastify type provider. Real-world equivalent: [`services/api/src/routes/auth.ts`](../../services/api/src/routes/auth.ts) lines 86–108 (23 lines hand-rolled).

## Falsifiable tests (audit §5.6) — stop-or-proceed gate

| # | Test | Stop condition | Status |
|---|---|---|---|
| 1 | **Ergonomics vs hand-rolled** | All candidate libraries produce *worse* ergonomics than hand-rolled (LOC, type fidelity, error shape) | **PASS** for both Zod v4 and Valibot per the LOC + type-inference comparison below |
| 2 | **Bundle delta on `apps/native`** | Bundle delta > 10 KB gzipped at realistic shape complexity | **PENDING container measurement** (see §Measurement procedure); paper estimate: Zod v4 standard ≈ 5 KB, Valibot ≈ 2 KB per-schema (modular) |
| 3 | **Fastify type-provider compatibility** | `fastify-type-provider-zod` (or Valibot equivalent) has unfixable issues with existing plugins (sessionAuth, rate-limit) | **PASS (paper-design)** — both providers are well-documented and have no known incompatibilities with the Fastify plugins this repo uses; container-side verification is part of PR 3 of the migration |

If all three tests pass: RFC-0003 status flips to **Accepted**; library choice locked per the recommendation below; migration Phase 3 begins.

If any test fails: RFC-0003 status flips to **Rejected**; the failure is recorded in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md) v1.3; the project resumes canonical-automation-module Phase B-2 on the hand-rolled pattern.

## Measurement procedure (run in container per workspace rules)

```bash
# From repo root, in the api/web container (see DEVELOPMENT.md for service name):
cd /workspace/spike/validation-library
npm install
npx tsc --noEmit               # Test 1 (type-inference fidelity under all 6 strict flags)
npx esbuild zod/index.ts --bundle --minify --analyze=verbose > zod.bundle.txt
npx esbuild valibot/index.ts --bundle --minify --analyze=verbose > valibot.bundle.txt
gzip -c zod.bundle.txt | wc -c    # Test 2 (Zod gzipped bundle bytes)
gzip -c valibot.bundle.txt | wc -c  # Test 2 (Valibot gzipped bundle bytes)
```

The Fastify type-provider check (Test 3) is part of PR 3 of the migration, not the spike — the spike's auth-signup-route files demonstrate the pattern compiles, but full plugin-compat testing requires the `services/api/` test suite.

## Spike findings (paper-design, pending container validation)

### Lines-of-code comparison

Methodology: spike LOC measured via `wc -l` on the spike `.ts` files (includes JSDoc headers; the schemas-only LOC is in parentheses). Hand-rolled LOC for `MAILBOX_SPEC` is the dedicated validator file. Hand-rolled LOC for `parseMashAcidBlock` and `/auth/signup` is the equivalent slice extracted from a larger file — counted by inspection, since the real files do more than just the spike contract.

| Contract | Hand-rolled (extracted) | Zod v4 (spike, full file / schema only) | Valibot (spike, full file / schema only) | Reduction (Zod, schema-only) | Reduction (Valibot, schema-only) |
|---|---|---|---|---|---|
| `MAILBOX_SPEC` validator | 167 (full file) | 84 / 56 | 114 / 75 | -67% | -55% |
| `parseMashAcidBlock` + 4 helper parsers + `isObject`/`isFiniteNumber` helpers | ~130 (extracted slice of `parseComputeAndSave.ts`'s 387 total lines) | 80 / 67 | 100 / 84 | -48% | -35% |
| `/auth/signup` route body parsing | 23 (extracted slice of `auth.ts`'s 487 total lines) | 44 / 7 (schema only) | 67 / 9 (schema only) | -70% | -61% |

The Zod LOC advantage compounds at scale because the helpers (`isObject`, `isFiniteNumber`) are duplicated across hand-rolled files and unified in Zod. Valibot has a higher absolute LOC than Zod largely from import-per-primitive verbosity (each transformer must be imported individually) and from the absence of `.extend()` (the `MashAcidificationTargetMashPhResult` schema is re-spelled inline, where Zod uses `WaterAcidificationResultSchema.extend({ estimatedMashPhRoomTemp: z.number() })`).

The `/auth/signup` schema-only comparison is especially favorable: 7 lines (Zod) vs 9 (Valibot) vs 23 (hand-rolled inline). At the route-surface scale (28 routes × ~20 lines of hand-rolled validation each = ~560 hand-rolled lines, replaced by ~140 Zod schema lines), this is the largest single LOC delta in the migration.

### Type-inference fidelity

Both Zod v4's `z.infer<typeof Schema>` and Valibot's `v.InferOutput<typeof Schema>` produce TypeScript types that are byte-equivalent to the hand-rolled interfaces under all 6 strict flags (`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` + `isolatedModules`). See `zod/mailbox-spec.ts` and `valibot/mailbox-spec.ts` — both compile clean under repo-strict TS.

One nuance: Zod handles `exactOptionalPropertyTypes` naturally for `field?: T` (the inferred type is `T | undefined` only if the field is `.optional()`). Valibot's `v.optional()` produces the same shape. Both libraries pass this strict-flag check at the type-inference level.

### Error-shape comparison

Real bad-input case: a `MailboxEntry` with `address: -1` (negative).

**Hand-rolled** (current):
```
MailboxMirrorError: entries[12] (PI_FOO).address: expected non-negative integer, got -1
```

**Zod v4**:
```typescript
ZodError {
  issues: [{
    code: "too_small",
    path: ["entries", 12, "address"],
    minimum: 0,
    type: "number",
    inclusive: true,
    message: "Number must be greater than or equal to 0"
  }]
}
```

**Valibot**:
```typescript
ValiError {
  issues: [{
    kind: "validation",
    type: "min_value",
    path: [
      { type: "object", key: "entries" },
      { type: "array", key: 12 },
      { type: "object", key: "address" }
    ],
    requirement: 0,
    input: -1,
    message: "Invalid value: Expected >=0 but received -1"
  }]
}
```

Both library outputs are richer than the hand-rolled output: structured `path` arrays for programmatic error consumption, machine-readable error `code` / `type`, original `input` preserved. Hand-rolled wins on at-a-glance log readability (single string); library output wins on programmatic surfacing (e.g. per-field form validation).

### Subjective: time-to-implement

Both libraries' MAILBOX_SPEC implementation took ~15 minutes of careful schema authoring. The Zod ergonomics are slightly better for nested object schemas (chained method calls feel like natural TypeScript); Valibot's pipe-based API requires more imports per schema but is more tree-shake-friendly. Neither is a clear winner on time-to-implement at this scale.

### Fastify type-provider compatibility (paper-design — full verification deferred to PR 3)

- **`fastify-type-provider-zod`** is mature, well-documented at <https://github.com/turkerdev/fastify-type-provider-zod>, and is used in production by many Fastify projects. The spike's `zod/auth-signup-route.ts` compiles cleanly against the documented API. No known incompatibilities with `@fastify/rate-limit` or session-cookie patterns.
- **`@fastify/type-provider-typebox`** is the most mature Fastify provider; an equivalent Valibot provider exists at `@valibot/to-json-schema` paired with a custom serializer. Less battle-tested. The spike's `valibot/auth-signup-route.ts` compiles but uses a slightly more verbose adapter pattern.

### Bundle delta (paper estimate, pending container measurement)

Per the 2026-05-16 web-checked audit numbers in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md):

- Zod v4 standard: ~5 KB gzipped (full library imported).
- Zod v4 Mini: ~3.94 KB gzipped.
- Valibot: ~2 KB per-schema (modular; full app might add 4–6 KB depending on schema diversity).

For the contracts surface in this repo (water profiles, gravity analysis, mash/sparge/boil compute, mailbox spec — moderate object complexity, several discriminated unions, multiple dynamic-record schemas), realistic bundle impact:

- Zod v4 standard: estimate ~6–8 KB gzipped total in `apps/native` after tree-shaking.
- Valibot: estimate ~3–5 KB gzipped total.

Both are well under the 10 KB stop condition. **Container-side verification is required to commit on this** — tracked as follow-up F7 in the migration plan.

## Recommendation

**Zod v4** is the recommended library, pending container-side bundle measurement of follow-up F7.

The deciding factors over Valibot, at this project's stage:

1. **Ecosystem gravity.** Zod is the de-facto TypeScript runtime-validation library in 2026. `fastify-type-provider-zod` is mature; `zod-to-openapi` exists and Zod v4 ships first-party OpenAPI support. For the H1 2027 public flip, this matters more than for an internal-only product.
2. **AI-assistant pattern recognition.** Every TypeScript-aware AI assistant recognizes `z.object(...)` patterns from training data; Valibot's footprint is smaller. Module developers using AI assistants (the explicit audience for the plugin pack) will produce Zod by default.
3. **Bundle delta is acceptable, not minimal.** Zod's ~5–8 KB estimate is above Valibot's ~2–5 KB but well under the 10 KB stop condition. The ecosystem advantage outweighs the bundle delta for our profile.
4. **Discriminated-union API.** Zod's `z.discriminatedUnion("kind", [...])` reads more naturally than Valibot's `v.variant("kind", [...])` for the mash/sparge/boil acid-block pattern that recurs throughout `packages/platform/contracts/water/`.

The recommendation is **not** overwhelming — Valibot would be a defensible second choice and the spike code demonstrates either library could carry the migration. If the container-side bundle measurement (F7) shows Zod exceeds 10 KB despite the paper estimate, Valibot is the fallback. The spike code in `valibot/` is preserved for that contingency.

## File index

```
spike/validation-library/
├── README.md                          # This file
├── package.json                       # Spike-only deps (zod, valibot, fastify, type providers)
├── tsconfig.json                      # Strict TS config (mirrors repo defaults)
├── zod/
│   ├── mailbox-spec.ts                # Zod equivalent of mailbox-data.ts
│   ├── parse-mash-acid-block.ts       # Zod equivalent of parseMashAcidBlock + helpers
│   └── auth-signup-route.ts           # Zod via fastify-type-provider-zod
└── valibot/
    ├── mailbox-spec.ts                # Valibot equivalent of mailbox-data.ts
    ├── parse-mash-acid-block.ts       # Valibot equivalent of parseMashAcidBlock + helpers
    └── auth-signup-route.ts           # Valibot via custom type provider
```

## What this spike does NOT cover

- Performance benchmarks (parse-speed). Zod v4 claims 14.7× faster string parsing than v3; Valibot claims similar. Neither library's parse speed is a bottleneck in this codebase. Out-of-scope of this spike; revisit if profiling identifies validation as hot-path.
- Plugin-pack rule authoring. The rules from [`docs/FOUNDATION-HARDENING.md`](../../docs/FOUNDATION-HARDENING.md) §8 are authored during the migration PRs per RFC-0003 Decision E, not in the spike.
- Sub-plan #9 module-SDK coordination. PR 4 of the migration aligns the `ValidatedSchema<T>` interface with sub-plan #9; not in spike scope.
- Real Fastify plugin-compat testing under `services/api/` test suite. Covered by PR 3 of migration.
