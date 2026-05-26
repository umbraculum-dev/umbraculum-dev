# RFC-0005 execution plan — composer-agent handoff for docs-site v1

**Tier:** Public
**Status:** v1.0 — P1–P4 implemented 2026-05-25; P5–P7 remain out of scope/open (see §6)
**Audience:** the controller (parent agent) coordinating composer-agent passes against [RFC-0005](../rfcs/0005-docs-site.md); the maintainer authorising each handback; composer agents executing the passes; future maintainers reviewing what was committed by whom.
**Owners:** maintainers
**Related:** [`docs/rfcs/0005-docs-site.md`](../rfcs/0005-docs-site.md) (the authoritative governance commit; this plan is operational guidance, **not** an amendment to the RFC), [`docs/ROADMAP.md`](../ROADMAP.md) Week 2 (calendar wrapper: 2026-05-27 → 2026-06-02), [Docusaurus 3.10 release notes](https://docusaurus.io/blog/releases/3.10) (verified 2026-05-20 — the v4 future-flag inventory in §4.4 below is pulled from this source).

> [!NOTE]
> This document converts [RFC-0005 §14](../rfcs/0005-docs-site.md) (operational guidance) into composer-executable form: per-pass file inventories, acceptance criteria, prompt templates, handback gates, and abort conditions. It is **not** part of the RFC's commitment surface — the RFC's decisions in §3–§11 remain authoritative; if this plan and the RFC ever disagree, the RFC wins.

> [!IMPORTANT]
> **Execution closure (2026-05-25).** P1 (scaffold), P2 (Reference), P3 (theme/placeholder branding), and P4 (CI build gate) have landed on `master`; GitHub CI was confirmed green by the maintainer after the follow-up fixes for the docs-site CI workspace install path and the Reference plugin root overlap. P5 (DocSearch), P6 (contracts-versioning runbook), and P7 (public launch / deployment coordination) remain deliberately open and are not closed by this plan.

---

## 1. Purpose

[RFC-0005](../rfcs/0005-docs-site.md) §14 is sufficient for a human developer to execute. Composer-agent execution drifts (over- or under-interpretation) when acceptance criteria are implicit and file inventories are not enumerated. This plan closes that gap for the **Week 2** execution window (2026-05-27 → 2026-06-02) by specifying, per composer pass:

1. The exact file inventory composer is authorised to create or modify.
2. The pinned dependency versions composer must use.
3. The acceptance criteria composer must verify before declaring done.
4. The handback shape composer reports to the controller.
5. The abort conditions that require composer to stop and hand back unresolved.

The plan covers **P1–P4 only**. P5 (DocSearch application), P6 (versioning runbook), and P7 (public-launch coordination) are out-of-scope per §6.

---

## 2. Scope

| Phase | In scope of this plan? | Composer model | Why |
|---|---|---|---|
| **P1 — Scaffold** | ✅ Pass 1 | composer-2.5-fast | Load-bearing structural decisions; benefits from speed + iteration. |
| **P2 — Reference section** | ✅ Pass 2 | gpt-5.3-codex | Mechanical wiring of 16 READMEs into the sidebar. |
| **P3 — Theme + branding** | ✅ Pass 2 | gpt-5.3-codex | Mechanical config-file work (no architectural decisions). |
| **P4 — CI gate** | ✅ Pass 2 | gpt-5.3-codex | Mechanical workflow-file authoring matching existing `.github/workflows/docs-readmes.yml` pattern. |
| **P5 — DocSearch application** | ❌ Out of scope | (no composer) | Form submission via [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply); maintainer task. |
| **P6 — Contracts versioning runbook** | ❌ Out of scope | (no composer) | DEVELOPMENT.md addendum; written when the first post-launch contracts release is cut. |
| **P7 — Public launch coordination** | ❌ Out of scope | (no composer) | Gated by Week 3 cutover prep and July public-alpha readiness; coordinated with the org-transfer / public-flip work. |

---

## 3. Pre-execution prerequisites

Verify before Pass 1 is initiated. Controller responsibility.

1. **RFC-0005 is in `Accepted` state.** Check `docs/rfcs/0005-docs-site.md` Status header reads `Accepted YYYY-MM-DD` — not `WIP draft`. ✅ verified at commit `66d5c9b`.
2. **Monorepo `master` is clean.** No in-flight feature work that would conflict with the new `docs-site/` workspace. `git status --short` returns empty (or only intentionally-floating work).
3. **Node version aligns with monorepo.** Composer respects the root `.nvmrc` / `package.json#engines.node` constraint. Docusaurus 3.10.x requires Node ≥ 18.0; the monorepo currently runs Node 20 in containers per the umbraculum-node-react-cursor-assistant `node-npm-container-only` policy — composer must respect that.
4. **Container discipline reminder for composer.** All `npm install` / `npm run build` invocations happen **inside** the project's Node container, not on host. See the `node-npm-container-only` rule.
5. **No previous `docs-site/` directory exists.** `ls docs-site/ 2>/dev/null` returns nothing — composer creates this directory from scratch.

---

## 4. Pass 1 — P1 Scaffold (composer-2.5-fast)

### 4.1 Goal & success definition

**Goal:** stand up `docs-site/` as a new top-level monorepo workspace running Docusaurus 3.10.x with every available v4 future flag enabled, rendering every `Tier: Public` doc currently in `docs/` (including the new `docs/REPOSITORY-STRUCTURE.md` Mermaid diagram, and all five accepted RFCs) without errors or broken internal links.

**Success definition:** the seven acceptance criteria in §4.5 all pass.

### 4.2 File inventory (composer is authorised to create exactly these files)

| Path | Role | Notes |
|---|---|---|
| `docs-site/package.json` | Workspace manifest | `"private": true`; pins versions per §4.3. |
| `docs-site/tsconfig.json` | TypeScript config | Extends monorepo's base tsconfig where one exists; otherwise minimal config with `"strict": true`. |
| `docs-site/docusaurus.config.ts` | Site configuration | All v4 future flags enabled per §4.4; Mermaid + search plugins configured. |
| `docs-site/sidebars.ts` | Sidebar config | Mirrors the categories of [`docs/README.md`](../README.md): Start here → Repository structure → Vision & strategy → Modules ecosystem → AI consultant → Stack & dependencies → Governance (RFCs) → Design → Product → Architecture (platform-wide / auth & security / data & infrastructure / billing) → Domain (brewery vertical) → Engineering (development) → Integrations → Reference (per-workspace READMEs are wired in Pass 2). |
| `docs-site/src/css/custom.css` | Theme CSS placeholder | Minimal placeholder; brand theming lands in P3 (Pass 2). |
| `docs-site/V4-UPGRADE.md` | v4 future-flag tracker | One entry per enabled flag (see §4.4): flag name, v3 behaviour, v4 behaviour, date enabled. Becomes the v4-bump checklist when Docusaurus v4 ships. |
| `docs-site/README.md` | Workspace README | Must pass `scripts/docs/check-readmes.py`. Tier: Public; follows [`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md) template. |
| `docs-site/.gitignore` | Build-artefact ignores | `node_modules/`, `build/`, `.docusaurus/`. |
| `package.json` (repo root) | Workspaces array | Add `"docs-site"` to the existing `workspaces` array. **This is the only root-level file composer is authorised to modify.** |

**Composer is NOT authorised to:**

- Modify any file under `docs/`, `apps/`, `services/`, or `packages/` (except the root `package.json` per the table above).
- Modify any file under `internal/` (excluded by policy).
- Modify `scripts/docs/check-readmes.py` or any existing CI workflow.
- Move or rename any existing file.
- Create symlinks.

### 4.3 Pinned dependency versions

```jsonc
{
  "dependencies": {
    "@docusaurus/core":              "^3.10.1",
    "@docusaurus/preset-classic":    "^3.10.1",
    "@docusaurus/theme-mermaid":     "^3.10.1",
    "@docusaurus/theme-common":      "^3.10.1",
    "@mdx-js/react":                 "^3.0.0",
    "clsx":                          "^2.0.0",
    "prism-react-renderer":          "^2.3.0",
    "react":                         "^19.0.0",
    "react-dom":                     "^19.0.0"
  },
  "devDependencies": {
    "@docusaurus/module-type-aliases": "^3.10.1",
    "@docusaurus/tsconfig":            "^3.10.1",
    "@docusaurus/types":               "^3.10.1",
    "typescript":                      "<aligned with monorepo root>"
  }
}
```

**Notes for composer:**
- Docusaurus 3.10 monorepo runs on **React 19**; pin React 19 (not React 18). v4 will drop React 18 support.
- TypeScript version: read from the monorepo root `package.json` to align — do not introduce a divergent TS version. If the monorepo is on TS 5.4, pin TS 5.4 here too.
- `@easyops-cn/docusaurus-search-local` and the Algolia search theme are **not** in Pass 1 — search lands in Pass 2 (theme via P3 if applicable) or post-Pass-2 (DocSearch is P5). Composer should NOT pre-install search packages in Pass 1.

### 4.4 v4 future-flag inventory (verified against Docusaurus 3.10 release notes, 2026-05-20)

All five flags listed below are enabled in `docs-site/docusaurus.config.ts`. The single shortcut `future.v4: true` enables the three v4 breaking-change flags at once; the two infrastructure flags (`faster`, `experimental_vcs`) are set separately.

```ts
const config = {
  future: {
    v4: true,
    // expands to:
    //   v4.siteStorageNamespacing: true       (localStorage keys auto-namespaced)
    //   v4.fasterByDefault: true              (Docusaurus Faster on by default)
    //   v4.mdx1CompatDisabledByDefault: true  (strict MDX, no proprietary syntax)
    faster: true,                              // stable in 3.10; was experimental_faster
    experimental_vcs: 'default-v2',            // upcoming v4 default; eager Git read
  },
  storage: {
    type: 'localStorage',
    namespace: true,
  },
  // ... rest of config
};
```

Each enabled flag gets a row in `docs-site/V4-UPGRADE.md`:

| Flag | v3 behaviour | v4 behaviour | Enabled |
|---|---|---|---|
| `future.v4.siteStorageNamespacing` | localStorage keys unprefixed | Auto-namespaced (e.g. `theme` → `theme-<siteId>`) | 2026-MM-DD |
| `future.v4.fasterByDefault` | Faster opt-in via `faster: true` | Faster on by default | 2026-MM-DD |
| `future.v4.mdx1CompatDisabledByDefault` | MDX v1 compat options ON | Strict MDX (no `<!-- -->`, no `{#id}`, etc.) | 2026-MM-DD |
| `future.faster` (stable in 3.10) | n/a | n/a — already enabled | 2026-MM-DD |
| `future.experimental_vcs: 'default-v2'` | `git-ad-hoc` per-file calls in prod | `git-eager` whole-repo single call (faster builds) | 2026-MM-DD |

**Composer note on strict MDX implications.** Because `future.v4.mdx1CompatDisabledByDefault: true` is enabled, any `.md` or `.mdx` file using proprietary Docusaurus syntax will break the build. None of our existing `docs/*.md` files use such syntax (verified — no `:::warning Title` patterns, no HTML comments inside admonitions, no `{#my-id}` heading IDs). If the build surfaces any such case, composer hands back rather than disabling the flag.

### 4.5 Acceptance criteria (composer must verify all seven before declaring done)

1. **Local dev server starts cleanly.** `cd docs-site && npm install && npm run start` boots without errors; the served site is reachable at `http://localhost:3000`.
2. **Production build succeeds.** `cd docs-site && npm run build` exits 0 with no errors. Generated output lands in `docs-site/build/`.
3. **No broken internal links.** The build's internal link checker reports zero broken links across the published surface.
4. **Mermaid renders.** The diagram in [`docs/REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) §5 renders as an SVG in the built site (not as raw code-fenced text).
5. **All five RFCs render** under the Governance sidebar section with their cross-links resolving (RFC-0001 → RFC-0002 → RFC-0003 → RFC-0004 → RFC-0005 all reachable and intra-link).
6. **All v4 future flags enabled** per §4.4 and documented in `docs-site/V4-UPGRADE.md`.
7. **`docs-site/README.md` passes the structural checker.** `python3 scripts/docs/check-readmes.py` reports 17/17 OK (was 16/16 before; +1 for the new workspace README). 0 failures.

### 4.6 Composer prompt template (the prompt the controller hands to composer-2.5-fast)

```
You are executing Pass 1 of RFC-0005's implementation plan. Authoritative
source: docs/rfcs/0005-docs-site.md. Operational spec: docs/design/
rfc-0005-execution-plan.md (this file) §4.

Your task: stand up docs-site/ as a new top-level monorepo workspace
running Docusaurus 3.10.x with all v4 future flags enabled per §4.4 of
the execution plan, rendering every Tier: Public doc in docs/ (including
the Mermaid diagram in docs/REPOSITORY-STRUCTURE.md §5 and all five
accepted RFCs).

HARD CONSTRAINTS:
- Create only the files in §4.2's file inventory. Modify only the root
  package.json (to add docs-site to workspaces). Do not touch any other
  existing file.
- Pin dependency versions per §4.3.
- All npm install / npm run commands run inside the project's Node
  container (per the node-npm-container-only policy in the umbraculum-
  node-react-cursor-assistant rule pack).
- If the build surfaces a strict-MDX violation in any existing docs/*.md
  file, STOP and hand back — do not disable the v4 future flag and do
  not modify the docs file.
- Stop on any acceptance-criterion failure you cannot resolve within 3
  iterations.

DECLARE DONE BY HANDING BACK:
- The list of files you created and the one file you modified.
- Confirmation that all seven acceptance criteria in §4.5 pass, with the
  exact command output for criteria 1, 2, 3, and 7.
- Any open questions or concerns surfaced during the work.
- The contents of docs-site/V4-UPGRADE.md.

DO NOT:
- Commit or push. The controller commits after review.
- Begin Pass 2 work (P2 Reference / P3 Theme / P4 CI). Pass 2 is a
  separate composer engagement after the controller authorises it.
- Modify RFC-0005 or this execution plan. If you believe either is
  wrong, surface the concern in your handback rather than editing.
```

### 4.7 Handback gate (controller verifies before authorising Pass 2)

Controller (parent agent) runs against the composer's working tree:

1. **Read the file diff.** Verify only the files in §4.2 were touched.
2. **Re-run all seven §4.5 acceptance criteria** independently. Composer's "it passed" is necessary but not sufficient.
3. **Visual smoke check.** `cd docs-site && npm run start`, open `http://localhost:3000`, navigate to: home → REPOSITORY-STRUCTURE → MODULES → RFC-0001 → RFC-0005. Confirm rendering matches reasonable expectations.
4. **V4-UPGRADE.md sanity check.** Confirm the five flags listed match §4.4 verbatim, with the enabled-date filled in.
5. **`node-npm-container-only` discipline check.** Confirm composer did not run `npm install` on host (audit shell history or composer's command log).
6. **Hand back to maintainer for visual sign-off.** Brief summary of what landed + a screenshot of the home page rendered.

**Maintainer sign-off** ("ok proceed to Pass 2") is required before Pass 2 is initiated.

### 4.8 Abort conditions (composer stops and hands back)

| Condition | Composer action |
|---|---|
| Strict-MDX violation surfaces in an existing `docs/*.md` file | Stop. Hand back the violating file path + line + the v4-future-flag breakage. Do **not** disable the flag; do **not** edit the docs file. |
| Mermaid diagram fails to render | Stop. Hand back the build log. |
| Any pinned dependency version cannot resolve | Stop. Hand back the npm error; do not unpin the version. |
| Three iterations on the same acceptance criterion fail | Stop. Hand back with the current state + the analysis of what's failing. |
| File outside §4.2 inventory needs to be touched | Stop. Hand back with the reason; controller decides whether to amend the inventory or unblock differently. |

---

## 5. Pass 2 — P2 Reference + P3 Theme + P4 CI (gpt-5.3-codex)

### 5.1 Goal & success definition

**Goal:** add the Reference section (P2) wiring all 16 per-workspace READMEs into the sidebar, apply brand theming (P3), and land the CI build gate (P4) — all in one composer engagement, building on Pass 1's scaffold.

**Success definition:** the six acceptance criteria in §5.5 all pass; composer hands back a single working state covering all three phases.

### 5.2 File inventory (Pass 2)

| Path | Created or modified? | Phase | Role |
|---|---|---|---|
| `docs-site/docusaurus.config.ts` | Modified | P2 + P3 | Add `@docusaurus/plugin-content-docs` instances for the Reference section; add navbar / footer / theme color config. |
| `docs-site/sidebars.ts` | Modified | P2 | Add Reference section linking the 16 per-workspace READMEs. |
| `docs-site/src/css/custom.css` | Modified | P3 | Brand color tokens, fonts, footer styling. |
| `docs-site/static/img/logo.svg` | Created | P3 | Placeholder logo (final logo lands in a later maintainer-driven PR; composer uses a minimal text-based SVG marked clearly as placeholder). |
| `docs-site/static/img/favicon.ico` | Created | P3 | Placeholder favicon. |
| `.github/workflows/docs-site-build.yml` | Created | P4 | Build job triggering on PRs touching `docs/**`, `docs-site/**`, or `**/README.md`. |

**Composer is NOT authorised to:**

- Modify any file under `docs/`, `apps/`, `services/`, `packages/`, or `internal/`.
- Touch any other existing `.github/workflows/*.yml` file (especially `docs-readmes.yml` — that stays as-is).
- Modify the v4 future-flag configuration committed in Pass 1.
- Change pinned dependency versions in `docs-site/package.json`. New dependencies (if any) follow §5.3.

### 5.3 New dependencies (if any)

Pass 2 introduces no new runtime dependencies beyond what Pass 1 pinned. If a brand-token or styling requirement surfaces that benefits from a small utility (e.g. a CSS preprocessor), composer surfaces the proposal in the handback rather than adding it unilaterally.

### 5.4 CI workflow shape (P4)

Composer mirrors the existing `.github/workflows/docs-readmes.yml` shape and naming convention. Key requirements:

```yaml
name: docs-site-build

on:
  pull_request:
    paths:
      - 'docs/**'
      - 'docs-site/**'
      - '**/README.md'
      - '.github/workflows/docs-site-build.yml'
  push:
    branches: [master]
    paths:
      - 'docs/**'
      - 'docs-site/**'
      - '**/README.md'
      - '.github/workflows/docs-site-build.yml'

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@<pin>
      - uses: actions/setup-node@<pin>
        with:
          node-version: '20'
      - run: cd docs-site && npm ci
      - run: cd docs-site && npm run build
```

Action pin versions: composer uses whatever the existing `.github/workflows/docs-readmes.yml` uses for `actions/checkout` and `actions/setup-node` — do not introduce a different pinned version, do not use unpinned `@main` references.

### 5.5 Acceptance criteria (composer must verify all six before declaring done)

1. **All 16 per-workspace READMEs reachable from the Reference sidebar.** The 16 are: `apps/web/README.md`, `apps/web/e2e/README.md`, `apps/native/README.md`, `services/api/README.md`, `services/api/src/seed/README.md`, and the 11 `packages/*/README.md` files.
2. **Build still succeeds** (no regression from Pass 1's clean build).
3. **No broken internal links** introduced by the new Reference section.
4. **Brand theming applied.** Brand color tokens are in `custom.css`; navbar + footer render with the brand register; logo + favicon visible.
5. **CI workflow lints clean.** `actionlint` against the new workflow file reports no errors. (Composer runs this locally if `actionlint` is in the dev container; otherwise relies on a smoke check.)
6. **Build still passes after the CI workflow is added.** The workflow file itself must not break the build (e.g. circular self-trigger).

### 5.6 Composer prompt template (the prompt the controller hands to gpt-5.3-codex)

```
You are executing Pass 2 of RFC-0005's implementation plan. Authoritative
source: docs/rfcs/0005-docs-site.md. Operational spec: docs/design/
rfc-0005-execution-plan.md (this file) §5.

Pass 1 has landed: docs-site/ is scaffolded and producing a clean build.
Your task is to add three things in one engagement:
  - P2: Reference section wiring all 16 per-workspace READMEs into the
    sidebar (full list in §5.5 criterion 1).
  - P3: Brand theming (logo, favicon, color tokens, navbar + footer
    config). Use clean-technical register matching MANIFESTO.md tone.
    Use a placeholder logo clearly marked as such — the final logo
    lands in a maintainer-driven follow-up PR.
  - P4: .github/workflows/docs-site-build.yml mirroring the shape of
    .github/workflows/docs-readmes.yml.

HARD CONSTRAINTS:
- Modify and create only the files in §5.2's file inventory. Do not
  touch any file under docs/, apps/, services/, packages/, internal/.
- Do not change v4 future-flag configuration committed in Pass 1.
- Do not add new runtime dependencies; surface any proposal in the
  handback instead.
- Pin GitHub Actions versions to whatever .github/workflows/docs-
  readmes.yml uses; do not introduce unpinned @main references.
- npm commands run inside the project's Node container.
- Stop on any acceptance-criterion failure you cannot resolve within
  3 iterations.

DECLARE DONE BY HANDING BACK:
- The list of files you created and modified.
- Confirmation that all six acceptance criteria in §5.5 pass.
- A screenshot of the home page + the Reference section + one README
  rendered in the Reference section.
- The contents of .github/workflows/docs-site-build.yml.
- Any proposals for new dependencies that you held back from adding.

DO NOT:
- Commit or push. The controller commits after review.
- Begin P5/P6/P7 work — out of scope for this engagement.
- Modify Pass 1's scaffold beyond the §5.2 inventory.
```

### 5.7 Handback gate (controller verifies before closing the composer engagement)

1. **File diff review.** Only §5.2 inventory touched.
2. **Re-run all six §5.5 acceptance criteria** independently.
3. **Visual smoke check.** Navigate to: Reference → packages/ui → packages/automation-contracts → services/api. Confirm rendering + cross-link resolution.
4. **CI workflow dry-run.** Open a no-op PR in a feature branch touching `docs/REPOSITORY-STRUCTURE.md` (whitespace edit). Confirm the workflow triggers, builds, passes, and posts a check.
5. **`docs-readmes.yml` regression check.** Confirm the existing structural checker workflow still passes — composer must not have broken it.
6. **Hand back to maintainer for visual sign-off.** Brief summary + the screenshot from composer + the workflow-trigger evidence.

**Maintainer sign-off** ("ok close engagement") is required before the composer engagement is closed and the work is committed.

### 5.8 Abort conditions (composer stops and hands back)

Same shape as §4.8, with one addition: if the Reference section wiring breaks a previously-resolving internal link (regression from Pass 1), composer stops and hands back the breaking link path + the change that introduced it.

---

## 6. Out-of-scope (P5, P6, P7)

| Phase | What it is | Why out of scope | Owner |
|---|---|---|---|
| **P5 — DocSearch application** | Submit the [DocSearch form](https://docsearch.algolia.com/apply); verify domain ownership within 7 days. | Application is a web form, not a code change. Algolia takes 1–2 business days to approve. No composer value. | Maintainer. |
| **P6 — Contracts versioning runbook** | Add a `docs/DEVELOPMENT.md` addendum documenting the `docusaurus docs:version` workflow for `@umbraculum/*-contracts` releases. | Written against a real first release; doing it now is speculative. Bundle with the first post-launch contracts release. | Controller + maintainer when the trigger fires. |
| **P7 — Public launch coordination** | Site goes live indexed (currently `noindex`/`robots.txt` policy per RFC-0005 §14 P7); SEO indexing flips when the July 2026 public alpha is declared. | Gated by [`docs/ROADMAP.md`](../ROADMAP.md) Week 3 cutover prep plus the July public-alpha closure checks. Cannot be sequenced inside Week 2. | Maintainer + controller when Week 3 begins. |

---

## 7. Review-cadence discipline

The handback model is **per-pass review** — controller reviews after each composer engagement, maintainer signs off before the next engagement starts. The discipline:

```
                       ┌─── controller initiates Pass 1 (composer-2.5-fast)
                       │
Pass 1 (P1 Scaffold) ──┤
                       │
                       └─── composer hands back → controller verifies §4.7
                                                  → maintainer signs off
                                                       │
                                                       │ "ok proceed to Pass 2"
                                                       ▼
                       ┌─── controller initiates Pass 2 (gpt-5.3-codex)
                       │
Pass 2 (P2+P3+P4) ─────┤
                       │
                       └─── composer hands back → controller verifies §5.7
                                                  → maintainer signs off
                                                       │
                                                       │ "ok close engagement"
                                                       ▼
                                                   Commit + push
                                                       │
                                                       ▼
                                                Build-log addendum (§8)
```

**Maintainer pauses are explicit, not implicit.** Each gate is a deliberate "yes proceed" or "no, here's what to change" — never a tacit approval. If maintainer is asynchronous and not available within the Week 2 envelope, the work pauses; it does not auto-proceed.

**Controller responsibilities at each gate:**

- Read the file diff with intent (no rubber-stamp).
- Re-run acceptance criteria independently (do not trust composer's report alone).
- Surface any drift, any out-of-inventory file touches, any dependency-version changes for maintainer decision.
- Translate any technical issues into plain-language for the maintainer.

**What controller does NOT do:**

- Authorise the next pass without maintainer sign-off, even if the work looks clean.
- Modify composer's output to "fix it" before showing maintainer — surface the issue first, decide with maintainer whether to ask composer to redo or to fix in-place.
- Skip the visual smoke check, even when the build passes.

---

## 8. Build-log addendum protocol (post-execution)

After Pass 2 closes and the work is committed, this execution-plan document is **archived in place** (not deleted) and a build-log addendum is added recording what was actually built vs what was planned:

- New file: `docs/design/rfc-0005-build-log.md` (Tier: Public; landed after the docs-site v1 launch).
- Records: per-pass actual file inventory delta vs §4.2 / §5.2; any acceptance-criterion failures and resolutions; any composer drift surfaced and corrected; any post-launch issues discovered + the fix commit.
- Mirrors the pattern of [`docs/design/canonical-pim-build-log.md`](canonical-pim-build-log.md) (the existing per-build log for the canonical-PIM landing).
- Replaces this execution plan as the active operational document for any follow-on work; this plan becomes a historical artefact useful only for "what did we ask composer to do".

This plan is **superseded but not deleted** once the build log lands — the audit trail (plan as written → build log as executed) is more valuable than either alone.
