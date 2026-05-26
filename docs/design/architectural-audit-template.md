# Architectural-audit template — six skeptical tests for cross-cutting-tooling decisions

**Tier:** Internal
**Status:** Reusable template, extracted 2026-05-19 from [`docs/design/validation-library-adoption-audit.md`](./validation-library-adoption-audit.md) §5 (the audit that produced [RFC-0003](../rfcs/0003-validation-library-adoption.md)).
**Audience:** project lead + future-self running any architectural audit that asks "should we adopt cross-cutting tooling X now / instead / later?"
**Owners:** project lead
**Related:** [`docs/design/validation-library-adoption-audit.md`](./validation-library-adoption-audit.md) (worked-example precedent — the template was extracted from this doc; read it alongside the template the first time you use it), [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) §"Follow-ups (F1–F9)" (the live tracker for future audits in the validation slice — F2 next-cadence, F3 Zod v5), [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) (the foundation-hardening narrative this kind of audit feeds into).

---

## 1. When to use this template

Use this template when you need to decide whether to adopt, swap, or defer a **cross-cutting library / tool / pattern** that will touch many files and / or impose a discipline on future code. Examples that fit:

- "Should we adopt a runtime-validation library (Zod / Valibot / TypeBox)?" — the audit that produced this template.
- "Should we switch from Fastify to <other framework>?" — same shape: cross-cutting, many sites, plugin-pack impact.
- "Should we adopt an OpenAPI generator now or wait?" — F1 follow-up in the validation slice.
- "Should we adopt React Server Components in `apps/web` end-to-end?" — UI architecture parallel.
- "Should we switch our test runner / linter / type-checker?" — toolset-coherence parallel.

Do **NOT** use this template for:

- One-file refactors (use a regular code review).
- Single-feature design (use an RFC directly — RFC-0001/0002/0003 are the model).
- "Should I rename this function?" or other local questions.
- Anything that won't take >40 hours of work or won't affect plugin-pack tooling — the template's overhead isn't justified.

The trigger threshold is roughly: **>40 hours of focused work, OR >5 files touched, OR a change to the plugin-pack's enforcing rules**. Below that, just do the work.

---

## 2. The output: SOUND / NOT SOUND / NEEDS BROADER ANALYSIS

The audit's job is binary in spirit, with a third "stop" option:

- **SOUND** → open / amend the corresponding RFC, proceed to spike + implementation.
- **NOT SOUND** → record the verdict, leave the current state alone, tighten any trigger criteria so the next audit fires at the right moment instead of re-litigating immediately.
- **NEEDS BROADER ANALYSIS** → identify the specific missing piece (a stakeholder, a measurement, an open RFC dependency), capture it as a concrete action, re-run the audit when that piece resolves.

The verdict is a recommendation; the actual commitment lands in the successor RFC. This template never carries the commitment.

---

## 3. Required sections for any audit doc that uses this template

Copy this template into `docs/design/<topic>-audit.md` and fill in:

1. **Why this audit exists** — what triggered it (a stakeholder question, a planned RFC, a near-term decision deadline, a trigger criterion firing in a strategy doc). Cite the trigger explicitly.
2. **What we have today** — the work that would be replaced / preserved if the verdict is SOUND. Honest LOC counts, file lists, code excerpts where useful. The reader should be able to estimate the diff without re-deriving it.
3. **What the proposed change looks like in practice** — 2–3 worked examples that span the diversity of the affected surface (e.g. one simple case, one complex case like a discriminated union or a stateful interaction, one framework-integration case). Side-by-side "before" and "after" code.
4. **What is genuinely LOST** — honest inventory of code-that-goes-away, test-surface-that-needs-rework, properties-of-the-current-pattern-that-go-away (zero-dep, no-supply-chain-risk, etc.), strategic posture that flips. Be more skeptical here than in §3.
5. **The six skeptical tests (§4 of this template)** — walk every test, even the ones that seem obviously favorable. The audit is robust because every test is run, not because every test passes.
6. **Verdict** — SOUND / NOT SOUND / NEEDS BROADER ANALYSIS plus a one-paragraph rationale. State any structural caveats (something the verdict depends on that should land in the RFC).
7. **Open questions for the lead before opening / Accepting the RFC** — anything that requires explicit stakeholder input.
8. **Recommended next actions** — concrete: which RFC to open / amend, which spike to run, which plugin-pack rule needs rewriting, etc.
9. **Sign-off** — date, reviewer, verdict, link to the successor RFC if one is opened. After sign-off, the audit body is frozen.

---

## 4. The six skeptical tests (the core of the template)

Each test asks one question that, if answered "no," would weaken or invalidate the recommendation. The tests are designed to be honest about uncertainty, not to rubber-stamp.

For each test, the audit doc should include:

- **Question** — the literal question being asked.
- **Evidence against / for** — concrete observations (not vibes).
- **Verdict** — a one-line summary of where the test lands (passes / partially passes / fails / unable to determine without spike).

The template's six tests:

### 4.1 Test A — Novelty bias

**Question:** Are we recommending the new option because it is *newer* / *trendier* than what we have?

**What to look for:**

- The new option's age + maturity (a 6-year-old library is not "trendy" even if it has hype cycles).
- The current code's age — sometimes "the new pattern" is actually the older pattern in the codebase, and "the hand-rolled approach" was a deliberate younger choice.
- Whether the recommendation cites *specific upcoming work* the new option addresses, or whether it cites only ecosystem-popularity arguments.
- Honest acknowledgement of the ecosystem-pattern-recognition component of your own prior. "Everyone uses X" is not zero evidence (ecosystem effects compound) but it's weaker than "we have a concrete need Y that X addresses."

**Failure mode the test catches:** adopting tooling because it's the current dominant industry pattern, without engaging the project's specific needs.

### 4.2 Test B — Cost-estimate honesty

**Question:** Is the cost estimate credible, or am I optimistically lowballing?

**What to look for:**

- Compare any prior cost estimates (from earlier strategy docs, RFCs, follow-up trackers) to the current one. If they diverge, explain why.
- Enumerate what the estimate covers AND what it omits — e.g. plugin-pack rewrite, downstream SDK alignment, integration tests, client-side adapter work, lockfile + CI cascade.
- Estimate a realistic *worst case*: hidden complexity, unfixable upstream issues, rework if the spike's primary candidate fails (and you fall back to the secondary).
- Compare with the cost of NOT acting (deferred migration, retrofit at a worse moment, opportunity cost of plugin-pack churn).

**Failure mode the test catches:** under-counting the true scope of a cross-cutting migration.

### 4.3 Test C — Intermediate options

**Question:** Have we considered the middle ground between "full adoption" and "no adoption?"

**What to look for:** enumerate at least 4–5 named intermediate options, including:

- "Light adoption" (one slice / one package adopts the new pattern; rest stays).
- "Side-by-side" (old code stays as-is, new code uses the new pattern).
- "Library-agnostic interface" (publish an interface a consumer can satisfy with any library, then pick one for internal use). **This is the option that most often gets underweighted.**
- "Tighten trigger criteria, defer to next natural milestone."
- "Wait for a prerequisite decision to firm up."

For each option, give an honest assessment: what does it cost, what does it preserve, what does it lose, what's the failure mode?

**Failure mode the test catches:** binary thinking that misses a better middle-ground option.

### 4.4 Test D — Timing soundness (why NOW vs natural trigger?)

**Question:** What changes between "now" and the next natural trigger window that justifies acting now?

**What to look for:**

- Things that DON'T change in the window — landscape of candidates, bundle budgets, framework choices, broad architecture. These are not arguments for or against timing.
- Things that DO change in the window — new packages get authored on the current pattern, plugin-pack rules get built on the current pattern, public-facing artifacts get locked in. Each of these is a future migration cost if the decision flips later.
- The single highest-cost item that will lock in during the window — often a public-facing API surface (SDK, REST contract, third-party-developer-pinning surface). If that item lands on the wrong pattern, fixing it later requires a major-version bump.
- The "library-agnostic interface" intermediate (Test C option) often softens timing arguments substantially. Walk through how the timing argument changes under each intermediate option.

**Failure mode the test catches:** "we need to act now" panic without distinguishing what actually locks in during the window.

### 4.5 Test E — Cost of being wrong (both directions)

**Question:** What's the cost if we act and turn out to be wrong, vs the cost if we defer and turn out to be wrong?

**What to look for:** build a 4-row cost table:

| Scenario | Direct cost | Indirect cost | Recovery |
|---|---|---|---|
| Wrong-toward-act-now | … | … | … |
| Wrong-toward-defer | … | … | … |
| Right-toward-act-now | … | … | … |
| Right-toward-defer | … | … | … |

For "indirect cost": think about reputational risk, ecosystem-pinning damage, plugin-pack churn, contributor disorientation, future-migration cost. For "recovery": think about whether the wrong-toward-X failure mode is recoverable, how long it takes, and whether it has a self-limiting blast radius.

**Failure mode the test catches:** focusing on one direction's cost (usually the direct cost of the proposed change) without comparing it to the cost of the opposite mistake. Asymmetric failure modes often dictate the right answer.

### 4.6 Test F — Falsifiability

**Question:** What observations during a 1–2 day spike would cause the recommendation to be **wrong**?

**What to look for:** enumerate 3–6 specific, observable conditions under which the recommendation FAILS. Each should be:

- **Concrete** (a measurement, a build outcome, a stakeholder statement).
- **Bounded** (resolvable in 1–2 days of spike work, not 1–2 months).
- **Independent** (no two conditions are the same observation in different words).

Examples of well-formed falsifiable conditions:

- "All candidate libraries produce worse LOC ergonomics than hand-rolled on the worked-example schemas."
- "Bundle delta on `apps/native` exceeds N KB gzipped on a realistic-shape spike."
- "Framework integration plugin has unfixable issues with the existing error-shape contract."
- "Stakeholder X explicitly descopes the audience this recommendation is designed to serve."

Examples of poorly-formed conditions (do NOT use these patterns):

- "The library turns out to be bad" — too vague.
- "The team doesn't like it" — not observable in a 1–2 day spike.
- "Performance is worse" — not specific enough to be measurable.

If you cannot enumerate concrete falsifiable conditions, the recommendation is likely **NEEDS BROADER ANALYSIS** rather than SOUND.

**Failure mode the test catches:** recommendations that are restated regardless of evidence (the bad pattern that produces "refactor in something new just because it seems better").

---

## 5. Anti-patterns the template defends against

A recommendation has a strong claim to **SOUND** when all six tests pass with explicit evidence. A recommendation that pattern-matches to "refactor in something new because it seems better" usually exhibits all four of these:

1. **No specific upcoming need** — the change is motivated by general ecosystem sentiment.
2. **No honest cost estimate** OR unrealistically optimistic ones — Test B fails.
3. **No falsifiable test** — Test F fails or is not even attempted.
4. **No honest loss inventory** — §4 of the audit doc is missing or shallow.

If your audit shows any of those, the template is doing its job. Either stop, sharpen the case, or accept that the answer is **NOT SOUND** or **NEEDS BROADER ANALYSIS**.

---

## 6. Worked example

The first audit run through this template is the validation-library adoption audit at [`docs/design/validation-library-adoption-audit.md`](./validation-library-adoption-audit.md). Read its §3–§6 alongside this template the first time you author a new audit — the worked example shows the level of evidence + honest-inventory style each section calls for.

The audit's verdict (SOUND with one structural caveat = library-agnostic SDK boundary) became [RFC-0003](../rfcs/0003-validation-library-adoption.md), which is now the canonical commitment artifact. The audit's body is frozen; the RFC is the live decision; [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) v2.0 is the live strategy + follow-up tracker. That separation — audit (deliberation) → RFC (commitment) → strategy doc (live tracker) — is the pattern this template assumes.

---

*Internal template, frozen 2026-05-19. Update only when the framework itself needs to evolve based on a worked-example audit that exposed a missing test or a redundant one — not to capture the substance of any individual audit.*
