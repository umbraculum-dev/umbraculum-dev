# Tamagui: type-system situation + our adaptation strategy

**Tier:** Public
**Status:** v1.2 — descriptive (not prescriptive). Living document. Updated 2026-05-21 — shorthand-prop tsc count refreshed post-web-route-shape audit (590 → 1086; the documented >1000 trigger has been crossed — see "When to revisit this doc" below). v1.1 (2026-05-16) revised the "Tamagui wall" framing post-HIGH-full landing (see triage block #3 below).
**Audience:** maintainers, contributors authoring web/native UI code, anyone debugging Tamagui-related lint/TS noise.
**Owners:** maintainers
**Related:** `docs/LINTING.md` (the lint phase log, including the post-mortem revision of the Tamagui-wall framing), `packages/ui/README.md`, the `eslint.config.mjs` `no-restricted-imports` carve-out.

---

## TL;DR

We use [Tamagui](https://tamagui.dev/) as our cross-platform UI library — same components compile to React DOM on web and React Native on native. **This is the right choice for the project** (one source of truth for design, one a11y surface, one set of primitives).

However, Tamagui's TypeScript story is **incomplete** in ways that are intrinsic to its design (theme-token-driven prop types, shorthand prop generation, cross-platform prop union). We accept this cost because the alternative — building two parallel UI libraries and keeping them in sync — would cost an order of magnitude more.

This document:

1. Names the specific Tamagui type-system gaps we hit,
2. Describes how we work around each one,
3. Tells future maintainers when *not* to spend time fixing what is upstream.

Concrete numbers (refreshed 2026-05-21):

| Where | TS errors (`tsc --noEmit`) | Notes |
|---|---|---|
| `packages/ui` | 25 | Mostly `TS2322` (shorthand prop incompatibility) + `TS2590` (union too complex) — last measured 2026-05-16 |
| `apps/web` | 1086 (760 `TS2322` shorthand/token) | Refreshed 2026-05-21 (up from 590 on 2026-05-16). Top offenders by property: `mt` 311, `bg` 184, `minW` 163, `w` 125, `ai` 69, `as` 58, `items` 57, `mb` 54. Spread across 56 files. **Crosses the >1000 trigger documented in "When to revisit this doc" below**; status quo retained pending Tamagui v2 stable / intermediate RC bump (see that section for the deliberation). |
| `apps/native` | 0 | Native side typically doesn't hit the web-DOM-shorthand collision — last measured 2026-05-16 |
| `packages/recipes-ui` | 0 | Uses a curated subset of Tamagui surface — last measured 2026-05-16 |

---

## Why we use Tamagui (decision context)

When you build a cross-platform app, you have ~4 options:

| Option | Pros | Cons |
|---|---|---|
| **Two parallel libs** (e.g. MUI for web + RN Paper for native) | Each library is excellent in its native environment | Two designs, two a11y stories, two release schedules; logic drifts |
| **React Native everywhere** (`react-native-web`) | Single source | Bad web styling story; web-specific UX patterns hard to express |
| **Web-first** (e.g. plain CSS / Tailwind) | Excellent web | No native path |
| **Tamagui** (our choice) | One component tree, real native primitives on RN, real DOM on web, **strong theme token system**, good a11y story | Type ecosystem is the weakest part; some shorthand props can't be statically verified |

The fundamental insight: **Tamagui's type incompleteness is a small recurring cost; building everything twice would be a permanent enormous cost.** We pay the small cost.

---

## Specific type-system caveats

### Caveat 1: Token strings vs CSS strings (TS2322)

Tamagui uses theme tokens like `"$background"`, `"$2"`, `"$borderColor"`. Internally these resolve to CSS variables (`var(--color-background)`, etc.) at runtime.

```tsx
// Works at runtime, TS-OK:
<View bg="$background" p="$3" />

// Works at runtime, but TS errors with TS2322 because
// `bg` is typed as "$background" | "$foreground" | ... (the theme token union),
// NOT as `string`:
<View bg="var(--surface)" p="$3" />
```

The second pattern is used in some legacy components for direct CSS-variable interop. TypeScript's prop type union doesn't include the CSS-variable string format, so it errors.

**Our strategy:**

- New code: always use theme tokens (`"$background"` etc.). Add the underlying CSS variable as a theme token if it's missing.
- Legacy code: leave the `TS2322` alone until refactor; add a `// @ts-expect-error -- Tamagui token vs CSS-var; see docs/TAMAGUI.md` if it's needed for a green build.
- Don't try to "fix" Tamagui's type union — it's a library-level concern.

### Caveat 2: Shorthand props (`p`, `bg`, `rounded`, `m`, etc.) (TS2322)

Tamagui supports shorthand prop names (`p` for `padding`, `bg` for `background`, `m` for `margin`, etc.). These are configured in `tamagui.config.ts` via the `shorthands` map. Tamagui generates types for these at build time.

In practice, the generated types are sometimes **missing some shorthands** that work fine at runtime, leading to `TS2322` errors like:

```
Property 'padding' does not exist on type 'IntrinsicAttributes & Omit<RNTamaguiViewNonStyleProps, …> & WithThemeValues<…> & WithShorthands<…> & …'.
```

**Our strategy:**

- Prefer shorthand props consistently (`p`, `bg`, `m`) — they're idiomatic Tamagui and most likely to be in the generated types.
- If a component is `TS2322` only for shorthand reasons, leave the error; it does not affect runtime behavior.
- Do not chase these errors with manual `as any` casts. They will resolve themselves either via Tamagui upstream fixes or via a project-wide shorthand audit (currently unscheduled; not part of the landed HIGH-full ESLint phases — `tsc` shorthand-prop errors are a separate `tsc` baseline issue).

### Caveat 3: Component-as-element-tag (`as="aside"`) (TS2322)

Tamagui's `Card`, `View`, `YStack`, etc., support an `as="<html-tag>"` prop on web at runtime, but **the prop is not in the type definitions** for those components.

This is a real value proposition (semantic HTML elements via `<Card as="aside">`) but invisible to TypeScript.

**Our strategy:**

- Use a localized `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Tamagui Card supports \`as="..."\` at runtime; see docs/TAMAGUI.md` comment.
- Spread the props via an `as any` cast on the web branch only:
  ```tsx
  <Card {...(isWeb ? ({ as: "aside", "aria-label": label } as any) : { accessibilityLabel: label })} />
  ```
- This is exactly the pattern in `packages/ui/src/primitives/AdSlotCard.tsx`.

### Caveat 4: `accessibilityLabel` vs `aria-label` (the original bug class)

React Native uses `accessibilityLabel`. React DOM uses `aria-label`. Tamagui *does* unify the prop name on each platform, but **only inside Tamagui's own component types** — if you import a raw Tamagui primitive (`Button`, `Input`, `Checkbox`) on web, the `accessibilityLabel` prop is forwarded to the DOM, where React emits a console warning:

```
React does not recognize the `accessibilityLabel` prop on a DOM element…
```

This is the bug class our `no-restricted-imports` guardrail enforces against. See `eslint.config.mjs` and `docs/LINTING.md`.

**Our strategy:**

- All cross-platform components (`packages/ui/src/{ai,charts}/**`) MUST import wrappers from `packages/ui/src/primitives/*`.
- The primitives implement the platform fork explicitly: `Button.web.tsx` maps `accessibilityLabel` → `aria-label`; `Button.native.tsx` keeps it as `accessibilityLabel`.
- New primitives that wrap Tamagui surface MUST follow the same pattern.

### Caveat 5: Empty interface extension for module augmentation (no-empty-object-type)

Tamagui's standard pattern for typed custom configurations is:

```ts
declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
```

This is the documented Tamagui pattern, but `@typescript-eslint/no-empty-object-type` flags it as "this is just a type alias". We can't replace the interface with `type` because TypeScript's declaration merging requires `interface`.

**Our strategy:**

- Configured `no-empty-object-type` with `allowInterfaces: "with-single-extends"` in `eslint.config.mjs` to allow this exact pattern.
- Truly empty `interface X {}` (with no `extends`) is still flagged — that's a real bug class (it matches any non-null value).

### Caveat 6: `TS2590: Expression produces a union type that is too complex to represent`

Tamagui's auto-generated types occasionally produce a union union union that TypeScript declines to fully infer. Example: `packages/ui/src/primitives/Spinner.tsx`. This is rare and tends to surface in deeply-nested Tamagui inheritance chains.

**Our strategy:**

- Add a localized `// @ts-expect-error -- Tamagui union depth; see docs/TAMAGUI.md` comment.
- Sometimes a `tsconfig` option (`disableSourceOfProjectReferenceRedirect`, etc.) can reduce the explosion, but tuning this is project-wide and not worth it for one isolated case.

---

## How to triage Tamagui-related issues (decision tree)

When you encounter a TS or lint warning that looks Tamagui-related, ask:

1. **Is this a `TS2322` on a Tamagui prop?**
   - Yes, on a token or shorthand → it's caveats 1 or 2 → leave it (or add `@ts-expect-error` with link to this doc).
   - Yes, on a custom prop pattern (`as=`, `accessibilityRole` on raw Tamagui) → it's caveats 3 or 4 → migrate to a wrapper primitive or use the localized cast pattern.

2. **Is this a `no-explicit-any` from a Tamagui interop cast?**
   - Yes → caveat 3 pattern. Add the canonical `// eslint-disable-next-line ... -- Tamagui ... ; see docs/TAMAGUI.md` comment.

3. **Is this from a HIGH-full type-aware rule (`no-unsafe-*`)?**
   - HIGH-full landed 2026-05-16 — see [`docs/LINTING.md`](LINTING.md) for the full phase log. The post-mortem materially changes the picture this doc previously painted:
     - **The "Tamagui wall" was a phantom.** The original 2026-05-16 measurement reported `apps/web` had 266 `no-unsafe-*` warnings and predicted Tamagui prop leakage as the root cause. Reality (post-investigation, Phase 4b commit `4d9ec1e`): of the actual 304 raw warnings in `apps/web`, **290 traced to a single stale rename** — `WaterProfilesResponse.account` was renamed to `.workspace` in commit `87876d0`, but four UI consumers (`apps/web/app/recipes/[id]/water/{mash,sparge,boil}/page.tsx` + `apps/web/app/[locale]/water-profiles/page.tsx`) kept reading `profiles?.account`, which evaluated to `undefined`, propagating "error typed" through every downstream `.find`, `.map`, and spread. Tamagui-related leakage was responsible for **~6 warnings, not 266** — well within the per-line `eslint-disable-next-line` budget rather than warranting an adapter project. Fixing the four consumers also restored a long-broken UI feature (workspace water profiles silently never appeared in dropdowns).
     - **`apps/native` was effectively clean.** The measurement reported only 3 `no-unsafe-*` warnings, all clustered on a single inline `<RootStack.Screen>` render-prop in `apps/native/src/navigation/AppNavigator.tsx` line 113. Phase 5g (2026-05-16) extended the rules to `apps/native/**` and the fix was a single import + a single annotation (`NativeStackScreenProps<RootStackParamList, "SelectWorkspace">`).
     - **`services/api` was real but Tamagui-irrelevant.** 665 `no-unsafe-*` warnings traced to Prisma raw queries, Fastify request bodies, AI tool I/O, and BeerJSON normalisation — all `unknown → typed` boundary discipline (Phase 3, commits `5a42572`–`83844e7`). No Tamagui involvement.
   - **Lesson for future "Tamagui-adjacent surface looks scary" measurements:** before scoping a Tamagui adapter project, do a 30-min triage of the top warning files. The 95th-percentile warning is usually a stale rename, a missing parser narrowing, or a single mis-typed render-prop — not Tamagui-the-library. Tamagui itself ranks much lower on real "type leakage" cost than the original framing suggested.

4. **Is this something Tamagui upstream is actively fixing?**
   - Check the open issues at https://github.com/tamagui/tamagui (search for the specific error number and `types`).
   - If yes, leave a `// TODO(tamagui-upstream): tracked at <link>` comment and don't fix locally.

5. **None of the above** → it's probably a real bug. Fix normally.

---

## What we explicitly will NOT do

- **Do not fork Tamagui** to fix types. The cost of maintaining a fork is higher than the cost of these warnings.
- **Do not abandon Tamagui** for an alternative cross-platform library. We evaluated alternatives during initial selection; none had a better cost profile.
- **Do not introduce a parallel "tightly-typed" wrapper for every Tamagui component**. We've already done this for the leak-prone primitives (`Button`, `Input`, `BrewCheckbox`) — that surface should not grow further unless a new leak class appears.
- **Do not "fix" Tamagui type warnings as part of unrelated PRs**. Tamagui type triage is its own work; mixing it into feature PRs creates unreviewable diffs and obscures real changes.

---

## When to revisit this doc

- A new Tamagui major version is released and changes the type ecosystem materially.
- A new bug class appears that needs another wrapper primitive.
- The `no-explicit-any` count concentrated in Tamagui-adjacent code crosses a threshold where the cost/benefit of a more aggressive wrapper layer changes. Original framing (2026-05-16): "~590 in apps/web alone; if it grows to >1000 in a single app, reconsider." **Update 2026-05-21:** crossed — `apps/web` is at 1086 (760 `TS2322` shorthand). The "reconsider" trigger has fired and was deliberated; status-quo retained because (a) the project is already on Tamagui v2 RC (`^2.0.0-rc.11`) and `tamagui@latest` on npm is `2.0.0-rc.42` as of 2026-05-21 — 31 RC releases of shorthand-type fixes are available without a major-version jump, and (b) Tamagui v2 stable has not shipped yet, which means the canonical "shorthand audit vs upstream fix" fork in Caveat 2 still has a credible upstream-fix path on the same major version. The cheaper next step is an intra-RC bump (`rc.11 → rc.42`) measured against the same `tsc --noEmit` baseline before any wrapper-layer work is scoped. A roadmap commitment to track Tamagui v2 stable when it ships is captured in `docs/ROADMAP.md`.
- HIGH-full lint upgrade landed 2026-05-16 — see [`docs/LINTING.md`](LINTING.md) for the full phase log. Tamagui-adjacent type leakage turned out to be ~6 warnings, not the 266 originally predicted (95% of the apps/web `no-unsafe-*` surface was a stale `account → workspace` rename, not Tamagui — see triage block #3 above). The trigger to re-open the "should we build a Tamagui adapter wrapper layer?" question: a *new* surge of Tamagui-attributed `no-unsafe-*` errors in CI specifically (>50 in a single PR cycle, or >100 cumulative across two cycles) — that would suggest Tamagui upstream's typings have regressed and the cost/benefit of a project-local adapter has shifted. Until then, per-line `eslint-disable-next-line ... -- Tamagui ... ; see docs/TAMAGUI.md` is the right granularity.

---

## UI stack choice — product vs public surfaces

**Tamagui is the go-to for product UI.** Operational surfaces in `apps/web`, `apps/native`, and shared packages (`@umbraculum/ui`, domain UI packages) use Tamagui so one component tree ships to **real DOM on web and real React Native on device** ([`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §1.1, §3.5). Do **not** introduce a parallel product UI stack (MUI, Chakra, Tailwind-only app chrome, a second component library for the same screens) without an RFC and an explicit abandonment of the cross-platform commitment.

**Docs site (`docs-site/`)** uses Docusaurus — documentation layout, search, and MDX are a different job. That is not a precedent for replacing Tamagui in the product apps.

**Brochure (`apps/website/`)** is intentionally **static HTML + CSS** today ([`design/brochure-site-design-policy.md`](design/brochure-site-design-policy.md)): a small, web-only orientation surface at `umbraculum.dev`, not operational UI. Staying static is **not** a rejection of Tamagui; it reflects that Tamagui’s main payoff (web + native from one source) does not apply to a two-page pre-alpha brochure, and that a zero-dependency build keeps Cloudflare deploy and the “less ego, more facts” posture simple.

### When to reconsider migrating the brochure to Tamagui

Re-open this decision (RFC or roadmap note + maintainer sign-off) only when **at least one** of the following is true:

1. **Brochure scope outgrows static HTML** — roughly **10+ pages** with shared nav, locale variants, or frequent copy/layout churn where component reuse clearly beats duplicated HTML.
2. **Live product UI on marketing** — the brochure must embed real `@umbraculum/ui` (or module) components: interactive demos, “screenshots as code”, AI consultant teasers wired to the same primitives as the app.
3. **Shared shell with product** — announcement, header, or auth-adjacent chrome must stay **pixel-identical** with Tamagui-rendered product surfaces, and maintaining parallel CSS is measurably failing (regressions every flip).
4. **Token drift is recurring pain** — brochure and product visual identity diverge despite policy; a **shared token source** (JSON → CSS + `tamagui.config`) was tried and still does not keep parity.

Until a trigger fires, prefer:

- [`apps/website/announcement.config.json`](../apps/website/announcement.config.json) + shared announcement mapping for Docusaurus (already in tree).
- New brochure pages as static HTML following [`apps/website/README.md`](../apps/website/README.md).
- Optional **design-token export** from the Tamagui theme to brochure CSS — lighter than a full React + Tamagui brochure app.

If migration proceeds later, the likely shape is **Vite (or similar) + React SSG + Tamagui web config only**, with a dedicated **`packages/marketing-shell`** (or equivalent) — **not** folding marketing layout into `@umbraculum/ui`, which stays operational primitives.

Recorded on the roadmap under standing principles: [`ROADMAP.md`](ROADMAP.md) §“Standing principles”.

---

## Related

- `docs/LINTING.md` — the lint roadmap and full phase log; HIGH-full landed 2026-05-16 with the Tamagui-wall framing materially revised (see `docs/LINTING.md` "Realised output of HIGH-full" + the Phase 4b post-mortem for the stale-rename root-cause analysis).
- `packages/ui/README.md` — `@umbraculum/ui` package overview, especially the platform-forking primitives in `src/primitives/*`.
- `eslint.config.mjs` — the `no-restricted-imports` block for `packages/ui/src/{ai,charts}/**` that enforces "never import raw Tamagui Button/Input/Checkbox in cross-platform components".
- `packages/ui/src/primitives/AdSlotCard.tsx` — canonical example of the caveat-3 (`as="aside"`) pattern.
- `packages/ui/src/primitives/Button.web.tsx` / `Button.native.tsx` — canonical example of the caveat-4 (a11y prop fork) pattern.
