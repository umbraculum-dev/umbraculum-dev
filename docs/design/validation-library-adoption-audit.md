# Validation-library adoption audit (pre-RFC-0003)

> [!NOTE]
> **Status: Superseded by [RFC-0003](../rfcs/0003-validation-library-adoption.md) (Accepted 2026-05-19).**
> Preserved verbatim as the **reasoning trail that produced RFC-0003 §B Decision** (Zod v4). The body of this document was the evidence base; the seven Decisions A–G in RFC-0003 are the operational commitment.
>
> **For the live decision** see [`docs/rfcs/0003-validation-library-adoption.md`](../rfcs/0003-validation-library-adoption.md).
> **For the live strategy + F1–F9 follow-up tracker** see [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) v2.0.
> **For the slice-level summary** see [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) §4.5 (validation slice).
>
> Do not edit the body to update facts or add new audit rounds — the skeptical-test framework in §5 is the reusable methodology, captured separately at [`docs/design/architectural-audit-template.md`](./architectural-audit-template.md). Future audits (F2 next-cadence, F3 Zod v5 tracker, or any new schema-library rethink) should copy that template into a NEW audit doc at `docs/design/<topic>-audit.md`, walk the framework against fresh evidence, and conclude in a successor RFC — not in amendments here. See §10 "How to use this document going forward" below.

**Tier:** Internal
**Status:** Superseded by RFC-0003 (Accepted 2026-05-19). Preserved as historical evidence-of-reasoning.
**Audience:** future-self performing the next architectural audit (use §5 as the methodology template via the extracted template doc); historians asking "why did we pick Zod over Valibot in 2026-05?"; reviewers of RFC-0003 who want to inspect the verdict chain.
**Owners:** project lead
**Related:** [`docs/rfcs/0003-validation-library-adoption.md`](../rfcs/0003-validation-library-adoption.md) (the canonical commitment artifact, Accepted 2026-05-19), [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) v2.0 (live strategy + F1–F9 follow-up tracker), [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) §4.5 (validation slice deep-dive) + §8.6 (plugin-pack mapping for the Zod v4 standard), [`docs/design/architectural-audit-template.md`](./architectural-audit-template.md) (the reusable §5 skeptical-test framework, extracted from this doc for use in future audits), [`docs/rfcs/0002-canonical-module-physical-layout.md`](../rfcs/0002-canonical-module-physical-layout.md) (β layout + `@umbraculum/<code>-contracts` packages × 5 — one of the two premise-shifts that triggered this audit), [`docs/design/canonical-automation-module-surface.md`](./canonical-automation-module-surface.md) §12 (`packages/automation-contracts/` Phase A done 2026-05-19 — the other premise-shift).

---

## 1. Why this audit exists

The chat exchange on 2026-05-19 (~03:00 UTC-7) raised, then risked dropping, a high-consequence question: **should we adopt a runtime-validation schema library (Zod / Valibot / TypeBox) now, before the toolset hardens, or stay on hand-rolled per the existing strategy doc?**

The project lead's framing was explicit: the goal of the entire foundation-hardening pass was to *kick off with the right tools under the project's belt for any developer, regardless of what they're building*. Late additions of cross-cutting tooling are disproportionately expensive and corrode adoption. If we are going to need a schema library later, we should adopt it now, once, and update the plugin pack to match — or we should commit to hand-rolled and bake that commitment into the plugin pack.

The lead's second concern is the more important one for this audit: **avoid refactoring "in something new just because it seems better."** This pattern is a known failure mode for engineering teams; it converts real productivity into perpetual motion. Before opening RFC-0003, we owe ourselves a skeptical pass that tests the recommendation against the same standard we'd apply to anyone else's proposal to introduce a cross-cutting library dependency.

The audit's job is binary: **sound → open RFC-0003; not sound → tighten the trigger criteria in `CONTRACTS-VALIDATION-STRATEGY.md` and return to Phase B-2.**

---

## 2. What we have today (the work that would be replaced or preserved)

### 2.1 Hand-rolled parser surface in `packages/contracts/`

8 parsers across 5 files, 38 unit tests. Pattern is uniform: take `unknown`, validate field-by-field with shared type-guard helpers (`isObject`, `isFiniteNumber`), return the typed shape, throw `Error("Invalid <Type>.<field>")` on failure. Each parser is hand-tuned for its specific shape — including dynamic record maps (`derivations: Record<string, WaterCalcDerivation>`), discriminated unions (mash/sparge/boil acid blocks), and nested deeply-typed payloads.

Representative excerpt — the discriminated-union parser for mash acid blocks:

```207:235:packages/contracts/src/water/parseComputeAndSave.ts
function parseMashAcidBlock(v: unknown, label: string): MashAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v['kind'];
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification_target_mash_ph") {
    return {
      kind,
      mode: "targetPh",
      result: parseMashTargetMashPhResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
```

The full `parseComputeAndSave.ts` is **388 lines**: 12 helper-parser functions + 3 exported parse functions. The hand-rolled shared helpers (`isObject`, `isFiniteNumber`) are duplicated across files because each contracts module is self-contained.

### 2.2 Hand-rolled mailbox validator in `packages/automation-contracts/`

The newest contracts package (Phase A step 5, landed 2026-05-19). 168-line `mailbox-data.ts` file: imports the `data/mailbox.json` artifact (356 entries from the OpenPLC sister repo), runs a structural validator at module-load, exports `MAILBOX_SPEC` typed as `MailboxSpec`. Includes duplicate-detection logic (same checks the sister-repo emitter performs, re-validated here to catch mirror drift).

Representative excerpt — the per-entry validator:

```53:107:packages/automation-contracts/src/mailbox-data.ts
function assertEntry(raw: unknown, idx: number): MailboxEntry {
  if (!isPlainObject(raw)) {
    throw new MailboxMirrorError(
      `entries[${idx}]: expected object, got ${typeof raw}`,
    );
  }
  const name = raw["name"];
  if (typeof name !== "string" || !name.startsWith("PI_")) {
    throw new MailboxMirrorError(
      `entries[${idx}].name: expected string starting with "PI_", got ${JSON.stringify(name)}`,
    );
  }
  const address = raw["address"];
  if (typeof address !== "number" || !Number.isInteger(address) || address < 0) {
    throw new MailboxMirrorError(
      `entries[${idx}] (${name}).address: expected non-negative integer, got ${JSON.stringify(address)}`,
    );
  }
  // ... 5 more field validations + optional-field handling ...
  const entry: MailboxEntry = {
    name,
    address,
    kind: kind as ModbusEntryKind,
    scalar: scalar as ScalarType,
    writable,
    description,
    ...(typeof raw["scale"] === "number" ? { scale: raw["scale"] } : {}),
    ...(typeof raw["unit"] === "string" ? { unit: raw["unit"] } : {}),
  };
  return entry;
}
```

This is the **template** that all future canonical-module contracts packages (`packages/wms-contracts/`, `packages/mrp-contracts/`, ≥3 more) will copy from. Its shape is the de-facto SDK pattern for module authors.

### 2.3 Hand-rolled inline route validation in `services/api/src/routes/`

28 routes; ~5–25 lines of inline body-parsing per route. Pattern is uniform: cast `req.body` to a loose-shape, walk each field, throw `BadRequestError(code, message)` with a project-specific error-code vocabulary. Representative excerpt — the signup body parsing:

```86:108:services/api/src/routes/auth.ts
  app.post(
    "/auth/signup",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = (req.body ?? {}) as {
        email?: unknown;
        password?: unknown;
        preferredLocale?: unknown;
        workspaceName?: unknown;
        accountName?: unknown;
      };
      const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
      const password = typeof body.password === "string" ? body.password : "";
      const preferredLocale = assertLocale(body.preferredLocale);
      const workspaceNameRaw =
        typeof body.workspaceName === "string"
          ? body.workspaceName
          : typeof body.accountName === "string"
            ? body.accountName
            : "";
      const workspaceName = workspaceNameRaw.trim();

      if (!email || !email.includes("@")) throw new BadRequestError("invalid_email", "Email is required");
      if (password.length < 8) throw new BadRequestError("weak_password", "Password must be at least 8 characters");
```

Plus hand-rolled `assert*` helpers in the same file: `assertSafeNextPath`, `assertLocale`, `assertUiTheme`, `assertUiFontScale`, `assertUiDensity`. These are not parsers in the contracts sense — they are *route-local* validators. There are ~30 of these across the 28 routes.

### 2.4 Test surface pointing at hand-rolled APIs

- 38 unit tests in `packages/contracts/src/**/*.test.ts` (5 files). Assertions test parser outputs against fixtures + error-message strings on bad inputs.
- 28 unit tests in `packages/automation-contracts/src/mailbox-data.test.ts` (loads the mirror, asserts shape, checks specific `PI_*` entries).
- ~80–100 route-level integration tests across `services/api/src/tests/` that exercise the inline `BadRequestError` validation paths (the Tests slice Phase 4b work).

**Total surface in scope of any migration:** 8 parsers + 1 mailbox validator + 28 routes + ~146 tests. ~63 KB source in `packages/contracts/`, ~168 lines in `packages/automation-contracts/src/mailbox-data.ts`, ~28 routes × ~10–25 lines each ≈ 400 lines of inline route validation, ~30 `assert*` helpers in routes.

---

## 3. What Zod adoption looks like in practice (three worked examples)

The examples below are *paper-design* — they show the shape of the migration without exercising it in a real branch. The numbers are illustrative; the spike (RFC-0003 step 1) is what produces real measurements.

### 3.1 Example A — mailbox validator (the freshest contract; the template)

**Today** — `packages/automation-contracts/src/mailbox.ts` declares the types as the source of truth (45 lines); `mailbox-data.ts` validates the JSON against them (168 lines). Total: **213 lines** for type + validator, with manually-maintained drift between the type declaration and the validator implementation.

**With Zod**, the schema becomes the source of truth and the type is inferred:

```typescript
import { z } from "zod";
import mailboxData from "../data/mailbox.json";

const ModbusEntryKindSchema = z.enum([
  "coil",
  "discrete_input",
  "input_register",
  "holding_register",
]);

const ScalarTypeSchema = z.enum([
  "bool",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "float",
]);

const MailboxEntrySchema = z.object({
  name: z.string().regex(/^PI_/, "expected PI_* name"),
  address: z.number().int().nonnegative(),
  kind: ModbusEntryKindSchema,
  scalar: ScalarTypeSchema,
  scale: z.number().optional(),
  unit: z.string().optional(),
  writable: z.boolean(),
  description: z.string(),
}).readonly();

const MailboxSpecSchema = z.object({
  contractVersion: z.string().min(1),
  schemaMarker: z.string().optional(),
  plcVersion: z.string().optional(),
  integratedReleaseTag: z.string().optional(),
  entries: z.array(MailboxEntrySchema),
}).superRefine((spec, ctx) => {
  const seenNames = new Set<string>();
  const seenAddresses = new Map<string, string>();
  for (let i = 0; i < spec.entries.length; i++) {
    const e = spec.entries[i]!;
    if (seenNames.has(e.name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entries", i, "name"],
        message: `duplicate PI_* name: ${e.name}`,
      });
    }
    seenNames.add(e.name);
    const addrKey = `${e.kind}:${e.address}`;
    const prior = seenAddresses.get(addrKey);
    if (prior !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entries", i, "address"],
        message: `duplicate ${e.kind} address ${e.address}: ${prior} vs ${e.name}`,
      });
    }
    seenAddresses.set(addrKey, e.name);
  }
});

export type MailboxEntry = z.infer<typeof MailboxEntrySchema>;
export type MailboxSpec = z.infer<typeof MailboxSpecSchema>;

export const MAILBOX_SPEC: MailboxSpec = Object.freeze(
  MailboxSpecSchema.parse(mailboxData),
);
```

**~55 lines.** Replaces ~213 lines of `mailbox.ts` + `mailbox-data.ts` (the type-export still lives in `mailbox.ts` today; with Zod the type becomes `z.infer<typeof Schema>` and the file collapses).

**Drift-detection guarantees preserved:** the `superRefine` performs the same duplicate-detection the hand-rolled validator does, with structured error paths (`["entries", 12, "name"]`) instead of string-concatenated paths (`entries[12].name`).

**Error-message shape changes.** Today: `MailboxMirrorError("entries[12].name: expected string starting with 'PI_', got ...")`. With Zod: `ZodError` with `issues: [{ path: ["entries", 12, "name"], code: "invalid_string", message: "expected PI_* name" }]`. Both surface the bad-entry location; the Zod form is structured, the hand-rolled form is human-readable.

### 3.2 Example B — discriminated-union parser (`parseMashAcidBlock`)

**Today** — 30 lines:

```207:235:packages/contracts/src/water/parseComputeAndSave.ts
function parseMashAcidBlock(v: unknown, label: string): MashAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v['kind'];
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  // ... 2 more branches ...
  throw new Error(`Invalid ${label}.kind`);
}
```

**With Zod** — ~12 lines using `discriminatedUnion`:

```typescript
const MashAcidBlockSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mash_acidification_manual"),
    mode: z.literal("manual"),
    result: AcidificationManualResultSchema,
    derivation: DerivationSchema,
  }),
  z.object({
    kind: z.literal("mash_acidification_target_mash_ph"),
    mode: z.literal("targetPh"),
    result: MashTargetMashPhResultSchema,
    derivation: DerivationSchema,
  }),
  z.object({
    kind: z.literal("mash_acidification"),
    mode: z.literal("targetPh"),
    result: AcidificationResultSchema,
    derivation: DerivationSchema,
  }),
]);
```

Both produce identical TypeScript types when consumed (`z.infer<typeof MashAcidBlockSchema>` yields the same `MashAcidComputeBlock` union). The Zod form gets discriminated-union narrowing for free; the hand-rolled form gets it via the explicit `if (kind === "...")` ladder.

**Scaling property:** `parseComputeAndSave.ts` has THREE such discriminated-union parsers (mash, sparge, boil) + 3 export functions + 12 helper parsers + the duplicated `isObject` / `isFiniteNumber` / `parseDerivation` helpers. Aggregate file: **388 lines**. A Zod equivalent (with shared schemas instead of duplicated helpers) is realistically **~150 lines** — a 60% reduction with stronger structural guarantees.

### 3.3 Example C — Fastify route body validation

**Today** — 23 lines of inline parsing in the `/auth/signup` handler:

```86:108:services/api/src/routes/auth.ts
  app.post(
    "/auth/signup",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = (req.body ?? {}) as {
        email?: unknown;
        password?: unknown;
        preferredLocale?: unknown;
        workspaceName?: unknown;
        accountName?: unknown;
      };
      const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
      const password = typeof body.password === "string" ? body.password : "";
      const preferredLocale = assertLocale(body.preferredLocale);
      const workspaceNameRaw =
        typeof body.workspaceName === "string"
          ? body.workspaceName
          : typeof body.accountName === "string"
            ? body.accountName
            : "";
      const workspaceName = workspaceNameRaw.trim();

      if (!email || !email.includes("@")) throw new BadRequestError("invalid_email", "Email is required");
      if (password.length < 8) throw new BadRequestError("weak_password", "Password must be at least 8 characters");
```

**With `fastify-type-provider-zod`** — schema declared once, `req.body` is typed:

```typescript
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const SignupBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  preferredLocale: z.enum(["en", "it"]).default("en"),
  workspaceName: z.string().trim().min(1).optional(),
  accountName: z.string().trim().min(1).optional(),
});

app.withTypeProvider<ZodTypeProvider>().post(
  "/auth/signup",
  {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    schema: { body: SignupBodySchema },
  },
  async (req, reply) => {
    const { email, password, preferredLocale } = req.body;
    const workspaceName = (req.body.workspaceName ?? req.body.accountName ?? "").trim();
    if (!workspaceName) {
      throw new BadRequestError("workspace_name_required", "Workspace name is required");
    }
    // ... existing business logic unchanged ...
  },
);
```

**~15 lines for schema + handler signature.** The framework rejects malformed bodies *before* the handler runs.

**Subtle behavior change (important — flagged for the spike):** the existing code accepts any string containing `@` as a valid email (`email.includes("@")`); Zod's `.email()` validator is RFC-5322. This is a **latent bug fix** disguised as a migration: emails like `"@"` or `"a@"` would be accepted today and rejected after migration. Migration PRs MUST audit each route for behavior deltas of this kind, and the route-level integration tests (~80–100 tests) need to be re-run with explicit attention to error-shape compatibility for clients (web + native) that catch `BadRequestError("invalid_email", ...)` codes.

---

## 4. What is genuinely LOST (honest inventory)

The migration is not free. Here is what we lose, not minimized:

### 4.1 Code that is replaced (not just edited)

| Item | Lines / count | Status after migration |
|---|---|---|
| 8 hand-rolled parsers in `packages/contracts/src/**/*.ts` | ~600 lines | Replaced by Zod schemas; ~250 lines |
| Shared validator helpers (`isObject`, `isFiniteNumber`) duplicated across contracts files | ~15 lines × 5 files | Replaced by Zod primitives; 0 lines |
| `MailboxMirrorError` class + per-field `assertX` functions in `mailbox-data.ts` | ~120 lines | Replaced by `ZodError`; ~10 lines surface |
| Inline route validation in 28 route files | ~400 lines | Replaced by `schema: { body: ... }` declarations; ~150 lines |
| Route-local `assert*` helpers (`assertSafeNextPath`, `assertLocale`, `assertUiTheme`, etc.) | ~30 helpers, ~150 lines | Mostly replaced by Zod schemas; some retained as business-rule validators |

### 4.2 Test surface that needs rework

- ~38 unit tests in `packages/contracts/` that assert error messages of the form `/Invalid GravityAnalysisResponseV1.result/` need to be rewritten to assert `ZodError` shape (`err.issues[0].path` and `err.issues[0].code`).
- ~28 unit tests in `packages/automation-contracts/` for the mailbox validator — same rework.
- ~80–100 route-level integration tests in `services/api/src/tests/` that expect specific `BadRequestError("invalid_email", "Email is required")` errors need a bridge: either (a) update the tests to expect the new error shape, or (b) keep a bridge layer that maps `ZodError` → `BadRequestError(code, message)` and leave tests unchanged. **Option (b) is the safer migration but introduces a permanent translation layer.**

Test fixtures (the `validResponse()` helpers like in `parseGravityAnalysis.test.ts`) do NOT need rework — those are happy-path data shapes, not assertions about the parser's internal behavior.

### 4.3 Properties of the current pattern that go away

- **Zero runtime dependencies.** `packages/contracts/` has 0 dependencies today. Migration adds `zod` (≈ 5 KB gzipped) as a runtime dep across all consumers — including `apps/native` (Expo / React Native), where bundle size has measurable user-visible cost.
- **Zero supply-chain risk on the validation library.** A future CVE in Zod becomes a CVE in this repo. Hand-rolled has no upstream.
- **The path-tagged error-message format.** Strings like `"Invalid MashComputeAndSaveResponseV1.acid.result.targetAmount"` are human-debuggable at a glance. `ZodError` is structured (better for programmatic handling, slightly worse for at-a-glance log reading).
- **The `BadRequestError(code, message)` error vocabulary** as the wire format. With Fastify type providers, the framework returns its own 400 envelope by default; bridging back to the existing wire format is required if web/native clients depend on the code values (they do — search any `BadRequestError("invalid_email", ...)` usage).
- **Per-file self-contained parsers.** Today each contracts file is independently auditable (you can read `parseComputeAndSave.ts` and understand all its validation in 388 lines). With shared Zod schemas across files, you trace through 2–3 files to see the full picture. This is the normal cost of DRY — flagged because it's a real ergonomic shift.
- **Hand-tuned dynamic-record handling.** `parseGravityAnalysis.ts` lines 133–153 swallow individual bad entries in the dynamic `derivations` and `formatHints` records (`try { ... } catch { /* ignore */ }`). This *partial-validation* pattern — accept the response, drop the bad entries — is unusual; Zod's default is strict. We can replicate it with `.catch(...)` per-entry or with `.transform(...)`, but it requires explicit thought per dynamic-record contract.

### 4.4 Strategic posture that flips

- **The `CONTRACTS-VALIDATION-STRATEGY.md` v1.2 decision** ("stay on hand-rolled, re-confirmed twice") becomes historical. We do not delete the doc — we add a v2.0 decision-log row recording the flip and the rationale. The 2026-05-15 / -16 / -18 audit history stays as evidence the decision was deliberated.
- **The plugin-pack rule `22-typescript-contracts-runtime-validation.mdc`** in its current form ("boundary payloads must be parsed not cast; do NOT introduce Zod / Valibot / TypeBox just because a parser is being edited") gets rewritten to enforce the new pattern.
- **The Foundation-hardening synthesis** ([`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md)) currently lists validation as an *orthogonal axis*, not a slice. Post-migration it becomes a fifth landed slice ("validation") with its own CI gate (lint rule + test coverage) and its own plugin-pack discipline.

### 4.5 What does NOT go away

This matters because it tests whether the migration is "discarding foundation work" or "extending it":

- **All 6 strict TypeScript flags** stay on. Zod schemas + `z.infer<typeof Schema>` are subject to and benefit from `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc. The types-slice work is fully preserved.
- **The boundary discipline ("parse, don't cast")** is preserved and *strengthened* — Zod literally enforces it.
- **The contracts API surface** as an external boundary — `parseFoo(unknown): Foo` becomes `FooSchema.parse(unknown): Foo` (same call site shape). Consumers across `apps/web` + `apps/native` change ~25 import lines; the API surface remains "boundary validation lives in `packages/<code>-contracts/`."
- **The CI gates** from lint / types / tests / docs slices — unchanged.
- **The mailbox.json data, the version handshake rails, the CONTRACT_VERSION constant** — pure runtime data, library-agnostic.
- **The Fastify framework choice, the Prisma schema, the route shape (RFC-0001/0002 module surface)** — entirely orthogonal to validation library.
- **The test infrastructure** (vitest, file layout, fixture functions) — unchanged.
- **The decision-log + audit-cadence pattern in `CONTRACTS-VALIDATION-STRATEGY.md`** — the meta-discipline of "decisions get re-audited at milestones" survives the flip; only the recorded decision changes.
- **All sub-plans that are not validation-related** (sub-plan #7 canonical-automation, #9 `@brewery/*` rename, future module SDK design) — only the contract-validation chapter of each changes; the rest is intact.

The honest read: **the migration replaces a specific implementation pattern; it does not invalidate the foundation work.** The foundation work was about installing the discipline of "every slice has a CI floor + a plugin-pack pre-violation layer." That discipline survives. Validation just adds a fifth slice.

---

## 5. Skeptical audit — six tests

Each test asks one question that, if answered "no," would weaken or invalidate the recommendation. The tests are designed to be honest about uncertainty, not to rubber-stamp.

### 5.1 Test A — Is this novelty bias?

**Question:** Are we recommending Zod because it is *newer* / *trendier* than hand-rolled?

**Evidence against novelty bias:**
- Zod is not new. v3 stable since 2020. v4 since 2025. The trendiness gradient is flat.
- Hand-rolled validators are arguably the *newer* pattern in this codebase — they were authored deliberately in 2025 / early 2026 as the explicit decision (recorded in `CONTRACTS-VALIDATION-STRATEGY.md` 2026-05-15).
- The recommendation cites three specific upcoming consumers that did not exist when the original decision was made:
  - 5+ `@umbraculum/<code>-contracts/` packages by H1 2027 (RFC-0002 Decision A).
  - `@umbraculum/module-sdk` API surface (RFC-0002 Decision C, "with or before second canonical module").
  - Third-party module developers post-public-flip H1 2027.
- None of these were *as concrete* on 2026-05-15. The canonical-automation-module surface was accepted on 2026-05-19 — 4 days after the validation decision was re-confirmed.

**Evidence for caution:**
- "We will need it later" is a forecast, not a fact. The H1 2027 public flip might slip. The third-party module audience might stay small.
- Plugin-pack ecosystem rules of thumb often pattern-match to "what's popular" without engaging the concrete need. I should be honest that part of my prior for Zod is "everyone uses it" — that's not zero evidence (ecosystem effects are real) but it's weaker than "we have a concrete upcoming need."

**Verdict:** Not novelty bias *primarily*. The recommendation is grounded in specific upcoming work. But the "everyone uses Zod" effect contributes ~20% of my prior; that should be acknowledged.

### 5.2 Test B — Is the cost estimate honest?

**Question:** Is "60–100 hours focused" credible, or am I optimistically lowballing?

**Honest reconstruction:**
- Strategy doc estimate: 40–80 hours (con #2 in `CONTRACTS-VALIDATION-STRATEGY.md`).
- My prior message estimate: 60–100 hours focused, 12–18 working days.
- The strategy doc's 40–80 hour estimate was written in May 2026 against the 8 parsers + 28 routes. It did not include:
  - `packages/automation-contracts/` migration (added since).
  - Plugin-pack rewrite (separate effort).
  - Module-SDK alignment.
- Adjusted estimate including those: **80–140 hours** for the complete migration including plugin-pack + module-SDK alignment.

**Honest worst case:**
- Hidden complexity: error-shape compatibility for web + native clients consuming specific `BadRequestError` codes. If 80% of clients need updates, that's +30 hours. If 100%, +50 hours.
- Hidden complexity: Fastify type provider compatibility with our existing plugins (sessionAuth, rate-limit, etc.). Untested until spike.
- Hidden complexity: native bundle-size regression beyond acceptable threshold (would require switching to Valibot mid-migration; +40 hours rework).
- **Realistic worst case: ~200 hours / 25 working days / ~5 calendar weeks** if everything that can go subtly wrong does.

**Comparison with deferred-migration cost:**
- At H1 2027 (likely natural trigger window): 5 contracts packages instead of 2; 50+ routes instead of 28; module-SDK already designed and possibly third-party-modules pinned against it; plugin-pack already authored on hand-rolled and needs rewrite; migration window collides with public-flip launch prep.
- Deferred-migration realistic estimate: **300–500 hours**, plus reputational / adoption risk that is unquantifiable.

**Verdict:** The estimate range 80–200 hours now (vs 300–500 hours later) is honest. Even at the worst-case "now" cost, the migration-later cost is higher with substantially more risk concentration.

### 5.3 Test C — Have we considered intermediate options?

The discussion has so far framed the choice as binary: "adopt Zod / Valibot / TypeBox repo-wide" vs "stay on hand-rolled." Let me enumerate the middle ground honestly.

| # | Option | Honest assessment |
|---|---|---|
| (i) | **"Light Zod"** — `packages/*-contracts/` adopt Zod; routes stay hand-rolled. | Worst-of-both-worlds (strategy doc con #3). Every route still does hand-rolled body parsing AND Zod parsing on outputs. Dual-pattern. Rejected. |
| (ii) | **"Side-by-side"** — old code stays hand-rolled; new code uses Zod from now on. | Same anti-pattern. Two validation languages in the same repo, indefinitely. Rejected. |
| (iii) | **Library-agnostic interface in module-SDK; internal codebase picks one library.** Define `interface ValidatedSchema<T> { parse(input: unknown): T }` in `@umbraculum/module-sdk`. Third parties implement against the interface with any library they want. Internal codebase still picks one (Zod). | **Worth including in RFC-0003 scope.** Cost: ~50 extra lines in module-SDK + one small adapter per library third parties might use. Benefit: third parties are not forced to pin to Zod; if a future better library appears, third parties can switch independently. This is the "have your cake and eat it" option I underweighted in the prior message. |
| (iv) | **Tighten the trigger criteria; defer migration to second canonical module.** Keep hand-rolled, but commit that the second canonical module is the natural trigger; author second-module contracts in the chosen library; migrate the rest in the same window. | Defensible. Cost: ~40 hours of additional hand-rolled contract authoring in the interim. Loses the toolset-coherence argument: the plugin-pack work for §8 of FOUNDATION-HARDENING gets authored on a pattern that will change, then rewritten. Estimated rewrite cost: ~30 hours. Net deferral cost: ~70 hours, plus a brief window of pattern-drift in the codebase. |
| (v) | **Wait for OpenAPI requirement to firm up before deciding.** | Defers decision but the firming-up is itself ~6–12 months away and we'd need to have done design work by then. Pushes the same decision to a worse moment. Weak. |

**Verdict:** Option (iii) is the genuine intermediate. Options (i), (ii), (v) are weak. Option (iv) is the only serious counter-recommendation — "wait 6 months for natural trigger" — and its main cost is the toolset-coherence loss.

**Action:** RFC-0003 should EXPLICITLY include option (iii) as a sub-decision: "internal codebase = Zod; third-party SDK = library-agnostic interface that Zod schemas satisfy by construction." This is meaningfully better than what I proposed in the prior message.

### 5.4 Test D — Is the timing argument sound? Why NOW vs natural trigger?

**Question:** What changes between "now (May 2026)" and "Q3–Q4 2026 (second canonical module ships)" that justifies acting now?

**Things that DON'T change in that window:**
- Library candidate landscape (Zod v4 was the right answer 6 months ago and will be 6 months from now).
- Bundle-size budget on `apps/native` (no new constraints expected).
- The OpenAPI / SDK ecosystem fit argument.
- The general architecture decisions in RFC-0001 / RFC-0002.

**Things that DO change in that window:**
- 1 more `@umbraculum/<code>-contracts/` package gets authored (probably `packages/wms-contracts/`).
- ~5–15 new routes get authored on the hand-rolled pattern.
- The module-SDK gets designed and ships (RFC-0002 Decision C says "with or before second canonical module"). **This is the highest-cost item.** Once the module-SDK API surface is shipped, every third-party developer pin against it. Changing it later requires a major-version bump and migration assistance.
- The plugin-pack proposals from FOUNDATION-HARDENING §8 — currently unbuilt — might get built on the hand-rolled pattern in the interim.

**The crucial item:** the module-SDK. RFC-0002 Decision C says it lands with or before the second canonical module. If we author the module-SDK *with* the second module (Q3–Q4 2026), and that module is on hand-rolled, then the SDK API surface bakes in hand-rolled patterns. Third-party developers pin to that surface. Migrating later requires SDK major-version bump.

**If we adopt now:** SDK ships on the new pattern from PR #1. Third parties pin to a surface that won't change.

**Honest counter:** the module-SDK API surface CAN be library-agnostic (option (iii) above). If we commit to option (iii), the timing argument weakens significantly — the SDK doesn't lock in a library choice either way.

**Verdict:** Timing argument is **strong** under "internal codebase + SDK both pick Zod" framing, **moderate** under option (iii) framing. The deciding factor is whether we adopt option (iii) — and that's exactly the right thing for RFC-0003 to settle.

### 5.5 Test E — Cost of being wrong (both directions)

| Scenario | Direct cost | Indirect cost | Recovery |
|---|---|---|---|
| **Wrong-toward-Zod-now** (migrate, then later regret) | 80–140 hours migration | ~5 KB gzipped native bundle; supply-chain dep added | Standard pattern: migrate to next library in 2–3 years if needed. Cost ~30 hours. Total over 5 years: ~110–170 hours. |
| **Wrong-toward-hand-rolled-now** (defer, then later regret) | ~70 hours of work that needs redoing (additional hand-rolled contracts + plugin-pack rewrite) | Module-SDK API surface locked or broken; third-party adoption damage at public flip | Migration during H1 2027 with moving target. Cost ~300–500 hours plus reputational risk. Total over 5 years: ~370–570 hours. |
| **Right-toward-Zod-now** | Same 80–140 hours | None of the deferred risk | n/a |
| **Right-toward-hand-rolled-now** | 0 hours new work | None | n/a |

**Asymmetry:** wrong-toward-Zod costs ~3× less than wrong-toward-hand-rolled, AND the wrong-toward-Zod failure mode is less catastrophic (no public-flip reputational risk).

**Verdict:** Under uncertainty, the asymmetry favors acting now. This is robust to even substantial probability of being wrong about future need.

### 5.6 Test F — Falsifiable test

**What observations during the RFC-0003 spike (1–2 days) would cause the recommendation to be wrong?**

The recommendation FAILS if any of these are observed:

1. **All candidate libraries (Zod v4, Valibot, TypeBox) produce *worse* ergonomics than hand-rolled** for the `MAILBOX_SPEC` and `parseMashAcidBlock` paper designs. (Practically: schema is longer, type inference is weaker, or duplicate-detection cannot be expressed cleanly.)
2. **Bundle impact on `apps/native` exceeds 10 KB gzipped** in the realistic shape complexity of our contracts. (Would force a switch to Valibot or reconsideration; might tip the decision toward option (iv) wait-for-trigger if even Valibot is too heavy.)
3. **`fastify-type-provider-zod` has unfixable issues** with the existing error-shape contract that web/native clients depend on. (Would require either a permanent translation layer — which itself adds complexity — or a client-side migration that exceeds the migration's net cost.)
4. **The H1 2027 roadmap changes substantially** in the next 1 month and the public flip is deferred to H2 2028 or indefinitely. (Would weaken the "third-party developer audience" argument by ~12 months; might tip toward option (iv).)
5. **The project lead explicitly descopes the third-party-module-developer audience** from the product strategy. (Would weaken the entire "ecosystem fit" argument; tips toward option (iv) or "hand-rolled forever, just tighten the audit cadence.")

**If none of those fire**, the recommendation stands. The spike is specifically designed to test (1), (2), and (3); the lead's input is required for (4) and (5).

**Verdict:** The recommendation is falsifiable. The spike has a clear stop-condition.

---

## 6. Verdict

**Status: SOUND with one structural caveat.**

The recommendation to migrate to a runtime-validation schema library now (before the second canonical module ships) is grounded in specific upcoming work, has an honest cost estimate that beats the deferred-migration cost under any realistic scenario, has a clear falsifiable test, and is not driven by novelty bias.

The one structural caveat: **RFC-0003 should explicitly include option (iii)** — the library-agnostic interface in the module-SDK. This decouples the internal-codebase library choice (where one pattern is correct) from the third-party-developer library choice (where flexibility has long-term value). I underweighted this option in the prior chat message; the audit corrected for it.

This is NOT "refactoring to something new just because it seems better." The pattern that triggers that failure mode looks like:
- *No specific upcoming need* — the change is motivated by general "Zod is popular" sentiment.
- *No cost estimate* or unrealistically optimistic ones.
- *No falsifiable test* — the recommendation is restated regardless of evidence.
- *No honest loss inventory* — the existing work is implicitly devalued.

This recommendation has all four counterweights present. It is *changing because the project's trajectory has shifted into territory the original decision did not anticipate* — specifically, the acceleration into 5+ contracts packages + a public-facing module-SDK + a near-term public flip with third-party developers as a first-class audience.

---

## 7. Open questions for the lead before opening RFC-0003

1. **Option (iii) library-agnostic SDK interface — include in RFC-0003 scope?** Recommended: yes. Adds ~50 lines to module-SDK; preserves third-party flexibility; costs nothing to the internal-codebase decision.
2. **Spike target — `MAILBOX_SPEC` + `parseMashAcidBlock` as proposed in §3.1 and §3.2?** Or a different pair? (Worth picking two contracts that exercise *different* complexity axes: drift-detection + dynamic arrays for one, discriminated-union for the other. The proposed pair does this.)
3. **Error-shape compatibility plan — bridge layer or client migration?** Today's `BadRequestError(code, message)` is the wire-format contract web + native depend on. Options:
   - (a) Permanent translation layer: `ZodError` → `BadRequestError(code, message)` in a Fastify error hook. Web/native clients see no change. Cost: ~50 extra lines, permanent ongoing maintenance.
   - (b) Migrate clients in the same PR window. Cost: ~30 client-side files to update; cleaner end-state.
   - Recommended: (a) for migration safety, then optionally simplify to (b) post-migration once stable.
4. **Decision authority — who signs off on RFC-0003?** Lead alone (matches RFC-0002 sign-off pattern), or wider review (e.g. ask any contributors for input)?
5. **Sequencing with canonical-automation-module Phase B-2** — confirm: Phase B-2 stays paused until RFC-0003 spike resolves library choice, then B-2 ships directly on the new pattern. Estimated B-2 delay: 2–3 days for spike + RFC-0003 acceptance, then B-2 resumes with ~5–10 extra hours for schema-driven contract shape vs hand-rolled.

---

## 8. Recommended next actions

**If the verdict is sound (the lead agrees with §6):**

1. Open `docs/rfcs/0003-validation-library-adoption.md` as **Draft** (mirrors RFC-0002 structure: Summary / Motivation / Decisions / Alternatives / Impact / Migration plan / Resolution).
2. Conduct the 1–2 day spike: implement `MAILBOX_SPEC` + `parseMashAcidBlock` in Zod v4 AND Valibot side-by-side; measure bundle, ergonomics, error-shape compatibility against the falsifiable tests in §5.6.
3. RFC-0003 records the spike output as the evidence base; lead approves; status flips to **Accepted**.
4. Update `docs/CONTRACTS-VALIDATION-STRATEGY.md` with v2.0 decision-log row (flip recorded; rationale = "canonical-module trajectory acceleration; criteria 1+2 will fire within 6 months; toolset-coherence argument from the project lead").
5. Update `docs/FOUNDATION-HARDENING.md`: move "validation" from §6 (orthogonal axis) to §2 (landed slices) once the migration completes; add §4.5 (validation slice deep-dive); add §8.6 plugin-pack mapping.
6. Migration PRs per §8 of the prior chat message (PR 1 = `packages/contracts`; PR 2 = `packages/automation-contracts`; PR 3 = Fastify route migration + bridge layer; plugin-pack rules co-land with each migration PR).

**If the verdict is NOT sound (the lead disagrees with §6):**

1. Record the disagreement in §9 of this doc (sign-off section).
2. Tighten the trigger criteria in `docs/CONTRACTS-VALIDATION-STRATEGY.md` to commit "second canonical module ships" as the explicit trigger (currently "new complex contract added" is vaguer).
3. Commit that the plugin-pack work from FOUNDATION-HARDENING §8 stays paused until the trigger fires, to avoid the rewrite-cost scenario.
4. Return to canonical-automation-module Phase B-2 unchanged.

**If the verdict requires broader analysis:**

1. Identify the specific gap (e.g. "we don't know enough about the third-party-module audience to justify the timing argument").
2. Pause both RFC-0003 and Phase B-2 until the gap is closed.
3. Schedule a follow-on audit with the new evidence.

---

## 9. Sign-off

| Date | Reviewer | Verdict | Notes |
|---|---|---|---|
| 2026-05-19 | Project lead | **SOUND** | Verdict accepted; [RFC-0003](../rfcs/0003-validation-library-adoption.md) opened the same day with Decisions A–G mirroring §6 of this audit plus the structural caveat from §6 (library-agnostic SDK interface). RFC-0003 was Accepted same day after the Phase 1 spike (`spike/validation-library/`) returned PASS on falsifiable tests F1–F6 (F7 container-side bundle measurement deferred as a named follow-up). |

This row is closed. Do **not** append additional rows for re-litigation of the same decision — the change procedure is in RFC-0003 §15 (successor RFC). Future re-audits (per F2 next-cadence, F3 Zod v5 tracker, or any unrelated schema-library question) live in new audit docs at `docs/design/<topic>-audit.md`, each with their own §9 sign-off and their own successor RFC.

---

## 10. How to use this document going forward

After RFC-0003 was Accepted on 2026-05-19, this audit doc has three legitimate uses. All three are read-only; the body is the historical record.

### 10.1 Historical archaeology

Reading this doc answers "why did we pick Zod v4 over Valibot / TypeBox / hand-rolled in May 2026?" without forcing a re-derivation from the verdict. The §3 worked examples + §4 honest-loss inventory + §5 skeptical-test pass + §6 verdict are the chain.

When a future contributor asks "why is Zod the standard?", point them here, then to RFC-0003 for the operational commitment.

### 10.2 Template for the next architectural audit

§5 walks six skeptical tests — novelty bias, cost honesty, intermediate-option exhaustion, timing, cost of being wrong, falsifiable spike conditions — that generalize across any cross-cutting-tooling adoption question. That framework is extracted as a reusable template at [`docs/design/architectural-audit-template.md`](./architectural-audit-template.md). When **F2** (next validation-slice audit cadence) or **F3** (Zod v5 tracker) fires, OR when an unrelated cross-cutting question arises (next: OpenAPI generator choice, AI-tool-runtime adapter library, etc.), copy the template into a new audit doc at `docs/design/<topic>-audit.md`, walk the framework against fresh evidence, conclude in a successor RFC. This doc stays as the worked-example precedent.

### 10.3 Structural-caveat ledger

§6 verdict carries one structural caveat: **library-agnostic SDK boundary**. The caveat is now operationalized as RFC-0003 Decision C + [`packages/module-sdk/src/validatedSchema.ts`](../../packages/module-sdk/src/validatedSchema.ts) (`ValidatedSchema<T>` interface + `fromParser` adapter). If a future re-audit tightens or relaxes that caveat, the new audit's verdict section should cite §6 here as the prior posture.

### 10.4 What this document is NOT

- Not the live decision (that's RFC-0003).
- Not the live strategy (that's `docs/CONTRACTS-VALIDATION-STRATEGY.md` v2.0).
- Not the live tracker (that's `CONTRACTS-VALIDATION-STRATEGY.md` §"Follow-ups (F1–F9)").
- Not a re-audit log — re-audits go in new docs, not this one.
- Not a living document — its body is frozen at the 2026-05-19 verdict.

---

*Internal audit, frozen 2026-05-19. RFC-0003 is the canonical commitment artifact; this doc is the evidence base that produced the RFC.*
