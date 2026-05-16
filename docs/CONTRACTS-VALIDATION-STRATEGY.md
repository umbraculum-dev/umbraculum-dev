# Contracts validation strategy

**Tier:** Public
**Status:** v1.0 — descriptive (decision: stay on hand-rolled validators for now). Re-evaluate per the [trigger criteria](#when-to-revisit) below.
**Audience:** maintainers, future contributors, anyone considering a runtime-validation library migration
**Owners:** maintainers
**Related:** `docs/LINTING.md` (HIGH-staged Phase 7 references this doc), `docs/PLATFORM-ARCHITECTURE.md` §3.2 (cross-process boundaries), `packages/contracts/README.md` (if/when authored).

---

## TL;DR

`packages/contracts` exposes 57 cross-process types and 8 hand-rolled `unknown → typed` parser functions. We do **not** use Zod, Valibot, Arktype, or TypeBox. The decision after HIGH-staged Phase 1 (commit `4fa663b`) is:

- **Stay on hand-rolled validators** for now.
- **Track migration as a future architectural decision**, not a type-discipline gap.
- **Re-evaluate** when one of the trigger criteria below is met.

This document captures the analysis behind that decision so a future maintainer (or a future version of us) doesn't have to redo the reasoning.

---

## What we have today

Inside `packages/contracts/src`:

| Metric | Count |
|---|---|
| TS source files (excl. tests) | 18 |
| Exported `interface` / `type` declarations | 57 |
| Exported parser functions (`parseX(unknown): X`) | 8 across 5 files |
| Source bytes | ~63 KB |
| Runtime dependencies | 0 (pure TypeScript) |
| Bundle-time deps in consumers | 0 added by contracts |

The 8 parsers:

```
parseAuthMeResponse                   (auth/meResponse.ts)
parseGravityAnalysisResponseV1        (analysis/parseGravityAnalysis.ts)
parseMashComputeAndSaveResponse       (water/parseComputeAndSave.ts)
parseSpargeComputeAndSaveResponse     (water/parseComputeAndSave.ts)
parseBoilComputeAndSaveResponse       (water/parseComputeAndSave.ts)
parseWaterProfileItem                 (water/waterProfile.ts)
parseWaterProfilesResponse            (water/waterProfile.ts)
parseRecipeWaterHubSummaryResponse    (water/parseHubSummary.ts)
```

Each parser:

1. Takes `unknown`.
2. Validates field-by-field with shared type-guard helpers (`isString`, `isNumber`, `isFiniteNumber`, `isObject`).
3. Returns the typed shape, or throws an `Error` with a path-tagged message (e.g. `"Invalid GravityAnalysisResponseV1.result"`).

After HIGH-staged Phase 1, all 8 parsers are properly typed (zero `any`) and pass 38/38 unit tests.

The Fastify side mirrors this: **services/api uses zero Fastify schema validation** in all 28 routes. Validation is hand-rolled inline using `BadRequestError`, `UnauthorizedError`, etc. AJV appears in the dependency tree as a transitive Fastify dep but is not used by route code.

This means **"migrate contracts to Zod"** is really **"migrate the entire boundary-validation surface (contracts + routes + future-MCP-tools + native Expo bridge)"**. Phase 1 surfaced this — it's a much larger scope than the four files we just cleaned.

---

## The candidate libraries

| Library | Bundle size (gzipped) | Type inference | Fastify integration | Tree-shakeable |
|---|---|---|---|---|
| **Zod v3** | ~14 KB | Excellent | `fastify-type-provider-zod` | Partial |
| **Zod v4** (2025+) | ~5 KB (claimed) | Excellent | Same provider | Yes |
| **Valibot** | ~2 KB (per schema) | Excellent | `@valibot/to-json-schema` + provider | Yes (modular) |
| **Arktype** | ~13 KB | Excellent (string DSL) | Less mature | Partial |
| **TypeBox** | ~3 KB | Good (schema-first) | First-class (it's the recommended Fastify type provider) | Yes |
| **Hand-rolled** (today) | 0 KB | Manual `interface` + parser | None (manual `BadRequestError`) | n/a |

Numbers are approximate as of mid-2026 and should be re-verified at decision time. The relative ordering is more stable than the absolute numbers.

### Why Zod is the obvious mention

Zod is the de-facto TypeScript-runtime-validation library in 2026. When most people say "use a runtime validation library", they mean Zod. The other options are real and worth considering, but Zod is the gravitational center of the conversation.

---

## Pros of migrating

1. **Single source of truth for shape.** Today: an `interface WaterProfile` and a `parseWaterProfile(v: unknown): WaterProfile` are two separate things that must be kept in sync manually. With a schema library: `const WaterProfile = z.object({...}); type WaterProfile = z.infer<typeof WaterProfile>;`. They cannot drift.
2. **Better error messages.** Schema libraries produce structured error objects (`{ path, code, message }`) with the full failure path. Hand-rolled gets `Error("Invalid WaterProfile.workspaceId")` strings. Our error UX is fine for developer-debug; structured errors make programmatic error handling (e.g. surfacing field-level form validation messages) much cleaner.
3. **Composability.** Schemas extend, partial, pick, omit, transform, refine. Useful when input shapes evolve or when client/server share most of a shape with one variant.
4. **Schema-driven OpenAPI.** With Zod (or TypeBox) on Fastify routes, an OpenAPI spec falls out of the route definitions automatically. Useful for the public-flip H1 2027 milestone — third-party module developers get an auto-generated API reference.
5. **Industry-recognizable.** Public-flip readiness: contributors immediately recognize `z.object(...)`. The hand-rolled pattern works but reads as "this codebase predates Zod" — which is true and not necessarily a problem, but is a visible signal.
6. **Synergy with services/api.** Migrating contracts and routes together lets the same schema validate request input on the server AND parse response output on the client. Today these are two parallel hand-rolled validators that drift independently.

---

## Cons of migrating

1. **Bundle size in React Native (Expo / Metro).** `packages/contracts` is consumed by `apps/native`. Native bundle size translates directly to OTA update size and app launch latency. Adding ~14 KB (Zod v3) is not trivial when bundle size is already a focus area for native. (Mitigation: Zod v4 is much smaller, or Valibot is ~2 KB. But this needs verification at decision time.)
2. **Migration surface is larger than it looks.** Honest scope:
   - 8 parser functions in `packages/contracts` ✅ (small)
   - 57 type declarations (most don't have parsers — they're consumed-as-types only) — would these become Zod schemas too, or stay as plain `interface`? Inconsistency creates worse drift than uniform hand-rolled.
   - 28 Fastify routes with hand-rolled inline validation (`BadRequestError("invalid_email", ...)` style). Half the value of Zod is lost if route validation stays hand-rolled.
   - The Fastify migration in turn implies rewriting handler signatures (`request.body` becomes typed via `FastifyTypeProvider`), error-mapping (Zod errors → our `BadRequestError` shape), and re-running the full integration test suite to catch behavior regressions.
   - Native + web *consumers* of the parsers — they call `parseX(json).foo` today. With Zod they call `Schema.parse(json).foo`. Trivial in isolation but ~25 call sites across apps to update.
   - Tooling: the existing 38 unit tests use error-message strings (`"Invalid WaterProfile.id"`) which become Zod-shaped — every test assertion changes.
   - Realistic effort estimate: **40–80 hours focused work** for a coherent migration that doesn't leave half-and-half coexistence.
3. **Mixed adoption is worse than either alone.** If contracts uses Zod and routes don't, every route handler does a Zod parse on output and a hand-rolled parse on input. Dual-pattern. Worse than either pure approach.
4. **Doesn't fix any current bug.** The runtime validation already works. Phase 1 just made the *types* tight. The remaining quality gap is *aesthetic* (concise schemas vs hand-rolled validators), not *correctness*.
5. **Locks us into a library's evolution.** Zod v3 → v4 was a non-trivial migration. Tomorrow's Zod v5, or a new contender (effect/Schema, ts-pattern), might re-open the question. Hand-rolled validators have no upstream migration cost.
6. **Diminishing returns vs. other foundation work.** With ~960 `any` warnings still outstanding repo-wide (see `docs/LINTING.md`), 40–80 hours of Zod migration competes against 40–80 hours of HIGH-staged Phases 2–6 (which deliver more measurable improvement: warnings cleared, drift gates expanded). Phase work compounds; one big migration doesn't.

---

## What we already gain without migrating

After HIGH-staged Phase 1, the contracts package has:

- ✅ Properly typed parsers (zero `any`).
- ✅ Locked at `--max-warnings 0` in CI (no future drift possible).
- ✅ 38/38 unit tests passing.
- ✅ Path-tagged error messages (`"Invalid Foo.bar.baz"`) — adequate for developer debugging.
- ✅ Zero runtime dependencies (works in any TS environment, no version-lock concerns).
- ✅ Trivial bundle impact in apps/native (validators are mostly dead-code-eliminable in non-test paths if consumers want to skip them).

These are the properties that *would* have been the immediate wins of a Zod migration. We have them already.

---

## When to revisit

Concrete trigger criteria that should re-open this decision:

1. **Adding a new contract from scratch** that is significantly more complex than current ones (e.g. a deeply discriminated union, transform pipeline, or recursive shape). At that point, write the new contract in Zod (or whichever candidate looks best) as an experiment and assess: does the API feel meaningfully better, or is hand-rolled comparable?
2. **OpenAPI requirement.** If the public-flip plan (`docs/PLATFORM-ARCHITECTURE.md` §10.1) or the third-party-module SDK (`docs/PLATFORM-ARCHITECTURE.md` §4.4) specifies an auto-generated OpenAPI spec, a schema-first library becomes the path of least resistance. TypeBox or Zod-via-OpenAPI become attractive at that point.
3. **Form-validation parity.** If the web/native UI starts wanting per-field validation messages from the same shape that the API validates, a structured-error library starts paying for itself.
4. **Drift in practice.** If we hit 2+ bugs in production where the parser and the interface diverged silently, the cost of "two definitions of truth" is no longer hypothetical — migrate.
5. **Bundle-size shift.** If Zod v4 (or a successor) lands at ≤2 KB gzipped with full tree-shaking, the React Native objection mostly evaporates and the decision tilts toward migration.
6. **Independent route migration.** If `services/api` migrates to a schema-validated route framework (Fastify with TypeBox is the natural path) for reasons unrelated to contracts, the contracts side should follow to keep one schema language across both.

---

## Migration mechanics (if/when we decide to go)

Sketch only — not a commitment.

### Recommended approach: **gradual, contract-by-contract**

1. **Pick one new contract** as the experiment. Use Zod v4 (or whichever candidate). Land it in `packages/contracts/src/<area>/__zod__/`. Compare ergonomics.
2. **Pick the corresponding route** in `services/api`. Migrate to `fastify-type-provider-zod`. Compare ergonomics.
3. **Decide based on real evidence**, not speculation. If after 1 + 2 the team agrees Zod earns its keep, plan a phased migration of the existing 8 parsers + 28 routes.
4. **Do NOT do contract-only migration.** As noted in con #3, that produces the worst of both worlds.
5. **Migrate test fixtures last.** Test assertions that depend on hand-rolled error message strings will need updating; do this in the same commit as the parser they test.

### Anti-patterns to avoid

- ❌ Big-bang migration in one PR. Unreviewable. Mixes architectural change with type-system change.
- ❌ "Zod everywhere" expanded beyond `packages/contracts` and `services/api/src/routes`. The native side and web pages consume the parsers — they should not need to know about Zod.
- ❌ Adding Zod as a `peerDependency`. Native bundles are bundle-size-sensitive; the dependency graph should be explicit.
- ❌ Mixing libraries (Zod for new code, hand-rolled for legacy). Pick one. The migration is worth doing only if it's complete.

---

## Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-15 | Stay on hand-rolled. Track via this doc. | Phase 1 (commit `4fa663b`) showed the type-discipline gap was closeable without a library. The architectural question is real but separate. Public flip is not for ~12 months; the call can be made closer to that milestone with better data. |

When a new decision is recorded, append a row above (most recent first), not below.

---

## Related

- `docs/LINTING.md` — HIGH-staged roadmap; the Phase 7 (optional) bullet links here.
- `docs/PLATFORM-ARCHITECTURE.md` — public-flip readiness (§10.1) and module SDK (§4.4) are the milestones most likely to force this decision.
- `packages/contracts/src/water/parseComputeAndSave.ts` — canonical example of a hand-rolled parser after Phase 1 cleanup.
- Zod docs: <https://zod.dev/>
- Valibot docs: <https://valibot.dev/>
- TypeBox docs: <https://github.com/sinclairzx81/typebox>
- Fastify type providers: <https://fastify.dev/docs/latest/Reference/Type-Providers/>
