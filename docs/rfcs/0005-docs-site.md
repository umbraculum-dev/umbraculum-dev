# RFC-0005 — Documentation site generator + canonical docs URL

**Tier:** Public
**Status:** Accepted 2026-05-20 (pre-public-flip solo-author + core-team approval recorded; this is a living RFC — see §16 Resolution for the change procedure). Scheduled for execution in Week 2 (2026-05-27 → 2026-06-02) of the late-H1 / July-2026 public-alpha tranche per [`docs/ROADMAP.md`](../ROADMAP.md), ahead of the brought-forward public-alpha release window in July 2026.
**Audience:** prospective contributors, third-party module developers, self-hosters, hosted-service customers, evaluators preparing to adopt Umbraculum as a long-term operational dependency, and anyone preparing the documentation handoff for the July 2026 public alpha.
**Document role:** canonical documentation-site generator and publication workflow decision.

> **Disclaimer.** This RFC commits the project's documentation publication shape — the static site generator, the canonical URL, the publication scope, and the operational dependencies (search, hosting, build CI). It is a public-readable artifact intended to outlive any single maintainer. The commitments here are durable but not unchangeable — the change procedure mirrors [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 and [`docs/LICENSING.md`](../LICENSING.md) §10.

---

## 1. Summary

This RFC commits to **nine decisions** and defers one cluster of follow-on work:

- **Decision A — Docusaurus 3.10.x as the documentation site generator.** React + MDX-based, MIT-licensed, with v4 future flags enabled from day 1 so the v3 → v4 bump becomes a near-zero-diff maintenance task.
- **Decision B — `docs.umbraculum.dev` as the canonical documentation URL.** Subdomain shape chosen to decouple from the not-yet-existing marketing site at `umbraculum.dev`; future flip to a `umbraculum.dev/docs` subpath remains open via permanent redirect.
- **Decision C — Repo placement: `docs-site/` as a new top-level workspace.** Generator config, theme overrides, and React components co-located with the Markdown they consume in `docs/`. Separate-repo alternative (`umbraculum-docs`) rejected because per-package READMEs need to render under the same site and they live in the monorepo.
- **Decision D — Initial publication scope:** every `Tier: Public` doc in `docs/` plus every per-workspace README under `apps/*/`, `services/*/`, and `packages/*/`. `internal/` is excluded.
- **Decision E — Versioning policy:** Docusaurus per-version snapshots are used **only for `packages/*-contracts/` reference docs**, not for architecture / RFCs / modules pages. Contracts are the only artifact third parties pin SemVer-wise.
- **Decision F — i18n posture:** Docusaurus i18n machinery enabled in config from day 1, but English-only at v1 launch. The structure is right; the translation work is a separable later phase.
- **Decision G — Search:** Algolia DocSearch (free OSS tier) applied for at v1 launch; local lunr.js fallback active until DocSearch approval.
- **Decision H — MDX usage policy:** plain Markdown by default; MDX permitted only where dynamism pays for itself (live UI examples, interactive walkthroughs). **Hard rule: RFCs remain pure `.md`** so they stay readable on GitHub.
- **Decision I — CI gate:** one new workflow (`.github/workflows/docs-site-build.yml`) building the site on PRs touching `docs/`, `docs-site/`, or any `**/README.md`. Deploy on merge to master via the host's GitHub integration; no GitHub Action needed for deploy itself.

The deferred cluster (§15) covers four items not committed by this RFC: full i18n translation work (en/it parity), Docusaurus v4 upgrade procedure detail, the in-house theme-package decision (whether to extract our customisations into `@umbraculum/docs-theme`), and the on-site-AI-search overlay (a possible future enhancement on top of DocSearch that ties into the platform's own AI consultant).

---

## 2. Motivation

The project carries a deliberate documentation discipline already — `docs/` is the canonical reference set ([`docs/README.md`](../README.md)), every workspace has a structured README enforced by [`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md) + `scripts/docs/check-readmes.py`, every architectural commitment is recorded in an RFC ([`docs/rfcs/README.md`](README.md)), and the new [`docs/REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) gives the spatial map. All of this renders on GitHub today.

Two failure modes motivate publishing this content as a rendered site, not just GitHub-Markdown:

**Evaluator friction.** A prospective module developer or self-hoster who arrives at `github.com/umbraculum-dev/umbraculum-dev` lands on the repo README and is immediately asked to navigate file paths in a code-hosting UI. The reading order encoded in [`docs/README.md`](../README.md) (Start here → Repository structure → Vision & strategy → Modules ecosystem → Governance RFCs → …) is not the order GitHub presents the files. Comparable projects an evaluator already knows (Prisma, Supabase, React Native, Next.js, Babel, Jest) all ship their reference docs under a docs subdomain — Umbraculum reading like a "small project" because we don't is a presentation gap, not a content gap.

**Versioning hand-off at the public alpha.** Per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1 and the brought-forward late-H1 / July-2026 public-alpha tranche in [`docs/ROADMAP.md`](../ROADMAP.md), the July 2026 public alpha is the moment third parties may begin pinning `@umbraculum/automation-contracts@<x.y.z>` and `@umbraculum/pim-contracts@<x.y.z>` in their own repos. Once that happens, contracts-package docs need per-version snapshots — an evaluator pinning v1.2.0 should see the v1.2.0 docs even after we ship v2.0.0. Doing this in raw GitHub Markdown means manual branches or tags; doing it in a docs generator with first-class versioning is a single CLI command per release.

**Why now, not at the public flip.** The site needs to exist *when* the repo flips public, not be scrambled into existence under launch pressure. A working site with a "documentation home" register and Algolia search is also material when evaluators arrive in the post-flip window — the alternative is them reading raw `.md` in the GitHub UI for the project's first 30 days of public visibility, which materially changes their impression of the project's maturity. The org-transfer / public-flip work in [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1 explicitly notes the docs site as a pre-flip prerequisite; this RFC ratifies that.

**Named precedents for the shape.** Docusaurus is the de-facto choice for technical documentation among projects in the same ecosystem register Umbraculum belongs to:

- **Prisma** (also a Postgres-adjacent open-source dev-tools project) — Docusaurus at `prisma.io/docs`.
- **React Native** (the framework Umbraculum's native app depends on) — Docusaurus at `reactnative.dev`.
- **Babel, Jest, Redux, Supabase, Algolia itself, Hermes, MetaMask, ESLint** — all Docusaurus.

Adopting the same generator puts Umbraculum in the visual / UX register evaluators already trust. That alignment is itself a [`docs/MANIFESTO.md`](../MANIFESTO.md) §2.2 "horizontal accessibility" win — it lowers the cognitive cost of evaluating Umbraculum against dependencies the reader already knows.

---

## 3. Decision A — Docusaurus 3.10.x as the documentation site generator (commit)

**The Umbraculum documentation site uses [Docusaurus](https://docusaurus.io/) at pinned major version 3.10.x.** Authors write Markdown (`.md`) or, where dynamism pays for itself, MDX (`.mdx` — see Decision H). The static-site build runs in the project's existing Node + npm container toolchain ([`docs/CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md) container policy applies); no Python toolchain is added.

**v4 future-flag discipline.** Docusaurus 3.10 is explicitly "the last release in the v3.x line"; v4 is on its way. To minimise the v3 → v4 migration cost when v4 lands, the project commits to three disciplines from day 1:

1. **All available v4 future flags are enabled** in `docs-site/docusaurus.config.ts`. Each future flag opts the site into a v4 behaviour while still running on v3 — the migration is then the *removal* of those flags, not a behavioural change.
2. **Where a v3 API has a documented v4-aligned alternative, the alternative is used** (sidebar config shape, plugin registration signature, MDX provider). A pre-commit doc lints for known-deprecated v3 patterns where the v4 alternative exists in 3.10.
3. **No use of v3-only features without documented justification.** If a third-party plugin requires a v3-only behaviour, that dependency is flagged in the v4-upgrade tracker so it can be replaced or upstream-fixed before the v4 bump.

Estimated v3 → v4 bump cost under this discipline: **0.5 day** when v4 lands. Without the discipline: ~2–4 days.

**Why Docusaurus over the alternatives.** See §13 Alternatives considered. The short form: Docusaurus is the only candidate that is simultaneously (a) React + TypeScript native, matching the project's stack, (b) MDX-capable for live cross-platform component examples, (c) Mermaid-built-in matching the diagram in [`docs/REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) §5, (d) first-class versioning for the contracts-package use case (Decision E), and (e) first-class i18n machinery for the future en/it work (Decision F).

**License posture.** Docusaurus is MIT-licensed (verified against the upstream `facebook/docusaurus` repo). Its runtime dependencies (React, MDX, Mermaid, the entire `@docusaurus/*` plugin family) are MIT. There is no AGPLv3-style copyleft flowing back into Umbraculum's own code from the docs site. See §12 Licensing audit for the per-dependency breakdown.

---

## 4. Decision B — `docs.umbraculum.dev` as the canonical documentation URL (commit)

**The Umbraculum documentation site is served from `https://docs.umbraculum.dev/` as its canonical URL.** All in-source `docs/` cross-links continue to use relative-path Markdown links; the docs generator resolves them to the published site URLs at build time.

**Why the subdomain shape, not a subpath.** Three constraints make `docs.umbraculum.dev` the right choice for v1:

1. **The marketing site does not exist.** `umbraculum.dev` is currently a parked apex. Deploying docs to a subpath of a site that doesn't exist is more operationally complex (TLS, root redirects, 404 handling) than deploying to a dedicated subdomain.
2. **DNS + hosting cost is one afternoon.** Cloudflare Pages (Decision in §3 of the implementation phases) gives us free hosting with automatic HTTPS, a custom-domain integration, and edge caching by pointing a single CNAME at the Pages project. Setup time: ~30 minutes.
3. **Subdomain → subpath flip stays open.** When a marketing site eventually ships at `umbraculum.dev`, the canonical can move to `umbraculum.dev/docs` by keeping `docs.umbraculum.dev` as a permanent 301 redirect. No links break; SEO migrates cleanly; evaluators who learned the subdomain are not stranded.

**Cross-link convention.** Authors write Markdown links using **repo-relative paths** (e.g. `[`MODULES.md`](../MODULES.md)`). Docusaurus rewrites them to the site's URL structure at build time. The same `.md` files therefore render correctly on GitHub (where readers see the repo-relative links) *and* on the rendered site (where readers see the rewritten URLs). No author has to remember two link styles.

**Recorded-in-public.** This URL decision was already named in [`docs/REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) §7 as the "canonical-for-now" working agreement. This RFC promotes it from a working agreement to a formal commit.

---

## 5. Decision C — Repo placement: `docs-site/` as a new top-level workspace (commit)

**Docusaurus configuration, theme overrides, and any MDX-only React components live in a new top-level monorepo workspace at `docs-site/`.** The workspace publishes nothing to npm; it is a build-only workspace whose output (static HTML + CSS + JS) is deployed to the host (Decision in §4 of the implementation phases). The workspace's `package.json` carries `"private": true` and is listed in the root `package.json` `workspaces` array.

**Layout.**

```
docs-site/
├── package.json                 # private: true, depends on @docusaurus/core, etc.
├── docusaurus.config.ts         # site config (sidebar, theme, plugins, future flags)
├── sidebars.ts                  # sidebar structure mirroring docs/README.md categories
├── src/
│   ├── css/                     # theme overrides (brand colors, fonts)
│   ├── components/              # MDX-only React components (rare; see Decision H)
│   └── theme/                   # swizzled Docusaurus theme components (rare)
├── static/                      # static assets (favicon, logo, images)
└── README.md                    # workspace README per DOCS-README-STANDARDS.md
```

**Content lives outside `docs-site/`.** The actual Markdown content stays in `docs/` (where it is today) plus every workspace README. Docusaurus is configured to pull content from those paths via `presets-classic`'s `docs.path` option. Authors edit Markdown in the same place they edit it today; the docs site is a renderer, not a content store.

**Why a workspace, not a sibling repo.** A sibling repo (`github.com/umbraculum-dev/umbraculum-docs`) was considered and rejected because:

1. **Per-workspace READMEs are content.** `packages/canonical/automation/contracts/README.md` is part of the docs surface — it needs to render under the same site, under a "Reference" section, with the same theme. A sibling repo would either require a content-sync step (brittle) or duplicate READMEs (drift-prone).
2. **The docs site builds against the current state of the monorepo.** When a contracts package's README changes, the docs site rebuild happens in the same PR. A sibling repo would split the change across two PRs in two repos, which the project's discipline ([`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md), the structural-check CI gate) explicitly avoids.
3. **No deployment-coupling concern.** `docs-site/` does not import from `apps/web`, `apps/native`, `services/api`, or any `packages/*`. It is build-isolated. The "co-located in monorepo" argument therefore has no cost on the runtime side.

**Out-of-scope.** This RFC does not require any change to existing `apps/*`, `services/*`, or `packages/*` layouts. `docs-site/` lands beside them, not inside them.

---

## 6. Decision D — Initial publication scope (commit)

**The v1 site publishes:**

1. **Every doc in `docs/`** that carries a `**Tier:** Public` marker on its first content line. This is the discipline already enforced informally by [`docs/README.md`](../README.md) §"Audience tier". Today every doc in `docs/` is Tier:Public; if a doc loses that marker later, it disappears from the site automatically.
2. **Every per-workspace README** under `apps/*/README.md`, `services/api/README.md`, `services/api/src/seed/README.md`, and `packages/*/README.md`. These are the 16 READMEs in scope for `scripts/docs/check-readmes.py`. They render under a "Reference" section of the sidebar.
3. **All accepted RFCs** plus the RFC index ([`docs/rfcs/README.md`](README.md)) — they render under a "Governance" section.

**The v1 site does NOT publish:**

- **`internal/`** — pre-flip internal scaffolding (sub-plan logs, working notes). Excluded from public flip per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1; this RFC enforces the same exclusion on the docs site.
- **`docs/archive/`** — superseded architecture revisions. Linked from the site as a "Historical reference" footer entry, but not given sidebar presence; readers who want the full archaeology can follow a single link.
- **`docs/help/`** content (when it lands) — held off the v1 site until the brewery-vertical UI matures enough that operator-facing help has stable content. See deferred §15 cluster.
- **Any file outside `docs/` that does not carry a `Tier: Public` marker.** The build fails loudly if a non-Tier-Public file is referenced by the sidebar config — the marker is load-bearing.

**The Tier marker becomes load-bearing.** Today the marker is informational ("written to be surfaceable when the repository flips public"). After this RFC, the marker is the **mechanical filter** that the docs-site build uses to decide what to publish. A `Tier: Partner-restricted` or `Tier: Customer-restricted` doc would be excluded automatically. This is a small upgrade to the existing discipline, not a new convention.

---

## 7. Decision E — Versioning policy (commit)

**Docusaurus per-version docs snapshots are used for `packages/*-contracts/` reference docs only.** Everything else — architecture, RFCs, modules ecosystem, repository structure, development guides, brewery-vertical content — is **single-version** and updated in place.

**Rationale: only contracts get pinned.** Per [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) Decision F + [RFC-0002](0002-canonical-module-physical-layout.md) Decision A, third parties consuming Umbraculum pin two things: the **module SDK** (`@umbraculum/module-sdk@<semver>`) and the **per-module contracts packages** (`@umbraculum/<code>-contracts@<semver>`). Everything else is internal-to-Umbraculum architecture that evolves continuously. An evaluator reading [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) wants the latest version; an integrator who pinned `@umbraculum/automation-contracts@1.2.0` wants the v1.2.0 reference docs.

**Versioning workflow.** When `@umbraculum/<code>-contracts` cuts a new minor or major release:

1. The release runbook ([`docs/DEVELOPMENT.md`](../../DEVELOPMENT.md) addendum at site-launch) runs `docusaurus docs:version <semver>` against the contracts-package docs path.
2. The snapshot is committed; the sidebar gains a version dropdown for that contracts package.
3. `latest` always points to current HEAD; pinned versions remain queryable.

**Why not version everything.** Versioning every doc has a real maintenance tax: every PR that updates a doc has to decide "does this go to all versions, or only latest?" For architecture and RFC content, the answer is always "latest" — historical RFC versions are tracked by git, not by docs versioning. Versioning everything would impose the decision cost on every PR without adding reader value.

**Brewery-vertical exception.** Brewery is currently flat (no β layout, no contracts package) per [RFC-0002](0002-canonical-module-physical-layout.md) Decision D. Brewery does not get versioned docs until brewery completes its β migration (now scheduled for Week 1 of the late-H1-2026 tranche per [`docs/ROADMAP.md`](../ROADMAP.md), via a successor RFC amending RFC-0002 Decision D — brought forward from the original H1 2027 slot) and gains a `@umbraculum/brewery-contracts` package. That migration is in scope of RFC-0002 (and its successor amendment), not this one.

---

## 8. Decision F — i18n posture: English-only v1 with machinery enabled (commit)

**The v1 docs site ships English-only.** The Docusaurus i18n machinery (`i18n` config block, `i18n/` content folder structure, locale-dropdown UI component) is **enabled in `docusaurus.config.ts` from day 1** with `defaultLocale: 'en'` and an empty `locales` list of additional translations. This costs nothing at runtime and means adding Italian (the project's secondary locale per `@umbraculum/i18n` ↔ `it.json`) later is a content-only PR — no structural change.

**Why English-only v1.** Two reasons:

1. **The translation effort is a separable, larger workstream.** Translating ~30 docs (current count) and growing into Italian is ~80–120 hours of careful technical translation. Bundling it with the docs-site launch would gate launch on translation completion; decoupling lets the site launch on English content the project's contributors already maintain.
2. **The technical audience reads English first.** All four currently-accepted RFCs are in English; all per-workspace READMEs are in English; the AGENTS.md / DEVELOPMENT.md repo discipline is English. The translation work has high reader value once it lands, but the docs site has reader value *now* in English alone.

**Italian (and any future locale) is a Phase 2.** When the translation work is sequenced, it's the addition of `it` to the `locales` array + Italian-translated content under `i18n/it/docusaurus-plugin-content-docs/current/*.md`. No site rebuild; no architectural change.

**Deferred work in this area** — see §15 cluster.

---

## 9. Decision G — Search: Algolia DocSearch + lunr.js fallback (commit)

**Search on the docs site is powered by [Algolia DocSearch](https://docsearch.algolia.com/) (free OSS tier).** Until DocSearch approval lands (1–2 business days for automated approval; up to a week for manual review), the site uses the open-source [@easyops-cn/docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local) lunr.js-based plugin as a fallback so the site is never search-less.

**DocSearch eligibility — confirmed.** Per [`docsearch.algolia.com/docs/who-can-apply`](https://docsearch.algolia.com/docs/who-can-apply) (verified 2026-05-20), eligibility is entirely **technical, not entity-based**:

- The docs site must be **production-ready** (we apply post-launch, not pre).
- The content must be **technical documentation or technical blog**.
- The site must be **public** (not behind login).
- The application validates **domain ownership**, not legal entity.

**No company / VAT / incorporation requirement.** A private maintainer applies under their own name and verifies domain ownership for `docs.umbraculum.dev`. The future org-transfer to an Umbraculum legal entity does not require re-application — DocSearch is keyed to the domain, not the maintainer.

**Operational dependency, not a code dependency.** DocSearch is a hosted service operated by Algolia (a French company). The docs-site build embeds a small JavaScript snippet (`@docusaurus/theme-search-algolia`, MIT) that queries Algolia's hosted index at search time. If Algolia ever discontinues the free tier or removes Umbraculum from the program, the site continues to function with the lunr.js fallback re-enabled — no docs content moves, no build breaks. Lock-in is zero.

**License posture for the search stack.** `@docusaurus/theme-search-algolia` is MIT. `@easyops-cn/docusaurus-search-local` is MIT. The Algolia hosted service itself is subject to Algolia's [DocSearch Plan Terms and Conditions](https://www.algolia.com/policies/docsearch-plan-specific-terms) — not a code-license question.

---

## 10. Decision H — MDX usage policy (commit)

**Plain Markdown (`.md`) is the default authoring format.** MDX (`.mdx`) is permitted in two scoped cases:

1. **Live UI examples** under the "Stack" section — e.g. demonstrating a `@umbraculum/ui` Tamagui primitive rendering inline so the reader sees the component, not just its description.
2. **Interactive walkthroughs** under the "Help" section when it lands — e.g. an embedded recipe-editor example showing real `@umbraculum/brewery-recipes-ui` behaviour with the live UI bundled into the docs page.

**Hard rule: RFCs stay pure `.md`.** Every file under `docs/rfcs/` remains plain Markdown forever. RFCs are the project's most durable artifact — they must remain readable in any tool that renders Markdown (GitHub UI, `cat`, an offline editor, a future docs-generator that isn't Docusaurus). MDX would introduce a Docusaurus-specific render dependency for content whose first reader is often someone evaluating the project *before* visiting the docs site.

**Hard rule: per-workspace READMEs stay pure `.md`.** Every file matching `apps/*/README.md`, `services/*/README.md`, or `packages/*/README.md` remains plain Markdown. These READMEs are gated by [`scripts/docs/check-readmes.py`](../../scripts/docs/check-readmes.py); a contributor reading them in their IDE without the docs-site build must see them render correctly.

**Soft rule: prefer `.md` everywhere else.** Default to `.md`. Reach for `.mdx` only when the dynamism it enables (live components, interactive demos) materially improves reader value — not because MDX *can* do something. A PR introducing a new `.mdx` file lists the reason in the PR description; reviewers verify the case meets the §10 standard.

**Why these constraints.** MDX is a Docusaurus-friendly format; it is also a Docusaurus-specific format in practice. The contribution bar must stay low for prose contributors, and the readability bar must stay high for evaluators reading from outside the docs site. The MDX carve-outs are deliberately narrow.

---

## 11. Decision I — CI gate (commit)

**One new GitHub Actions workflow lands: `.github/workflows/docs-site-build.yml`.** It runs on PRs touching `docs/**`, `docs-site/**`, or any `**/README.md`. The job:

1. Installs dependencies for `docs-site/` only (other workspaces are skipped).
2. Runs `npm run build` inside `docs-site/` (Docusaurus static build).
3. Fails the PR if the build fails — broken MDX, broken internal links (`docusaurus broken-link-checker` runs as part of build), Mermaid syntax errors, sidebar config pointing at non-existent files, or `Tier: Public` violations.

**No new gate for prose linting.** The structural checker [`scripts/docs/check-readmes.py`](../../scripts/docs/check-readmes.py) (gated by `.github/workflows/docs-readmes.yml`) already covers the per-workspace README structural discipline and stays as-is. The new gate catches build breakage, not prose quality.

**Deploy is not a GitHub Action.** Deployment to the host (Cloudflare Pages or equivalent — see §14 implementation phase P4) uses the host's native GitHub integration: the host watches the repo, runs its own build on merge to `master`, and deploys. No deploy credentials live in the repo; no deploy logic lives in CI. This minimises the security surface (no production-write secrets in CI) and avoids duplicating the build (the host runs it; CI runs it on PRs for gating).

**Build performance budget.** The site target is **< 90s cold build, < 30s warm build** at v1 scope (~30 docs + 16 READMEs + 5 RFCs). If the build exceeds these budgets, the v3.10 `experimental_faster` feature is enabled (it has been promoted to stable in 3.10; treating it as on-by-default after first measurement is acceptable per Decision A's v4-alignment discipline).

---

## 12. Licensing audit

This RFC's commitments introduce no AGPLv3-incompatible dependencies into Umbraculum's build. The per-dependency audit:

| Dependency | License | Code-or-service | Notes |
|---|---|---|---|
| `@docusaurus/core` 3.10.x and entire `@docusaurus/*` family | **MIT** | Code (build-time) | Verified against `facebook/docusaurus` repo. |
| `react` + `react-dom` | **MIT** | Code (runtime in browser) | Already present in `apps/web` and `apps/native` toolchains. |
| `@mdx-js/react` and the MDX runtime | **MIT** | Code (build + runtime) | |
| `mermaid` | **MIT** | Code (runtime in browser) | Same renderer as GitHub's, so diagrams render identically across both. |
| `@docusaurus/theme-mermaid` | **MIT** | Code | First-party Docusaurus plugin. |
| `@docusaurus/theme-search-algolia` | **MIT** | Code | The JavaScript glue between the site and Algolia's hosted index. |
| `@easyops-cn/docusaurus-search-local` (lunr.js fallback) | **MIT** | Code | |
| Algolia DocSearch hosted service | **DocSearch Plan T&Cs** (operated by Algolia SAS) | Service (runtime, hosted by Algolia) | Free for OSS technical documentation. No code dependency flows back into Umbraculum. See Decision G. |
| Cloudflare Pages hosted service | **Cloudflare Free Plan T&Cs** | Service (hosting) | Free tier covers our usage envelope. Static-output deployment means no Cloudflare-specific build features used; can be re-deployed to any static host in under an hour. |

**Conclusion.** Every code dependency is MIT. The two operational dependencies (Algolia DocSearch, Cloudflare Pages) are hosted services with no code coupling — replaceable in under a day if either becomes problematic. The site is fully MIT-compatible across the entire build stack, aligning with Umbraculum's own license posture (AGPLv3 core + MIT SDK + MIT-able contracts per [`docs/LICENSING.md`](../LICENSING.md) §6.2) without copyleft conflicts.

---

## 13. Alternatives considered

Four credible alternatives were evaluated before this RFC. Each is documented here for the audit trail.

**Alternative 1 — [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) (Python + Jinja).** The strongest serious alternative. Simpler to operate (no Node build chain needed for prose-only authors), excellent typography, and ships a polished defaults set out-of-the-box. **Rejected** because:

- It introduces a Python toolchain into a Node-and-TypeScript repo (the project's discipline is `node-npm-container-only` per the umbraculum-node-react-cursor-assistant rules). The marginal cost of one container is small; the marginal cost of one *language* in the toolchain is large.
- It has no MDX equivalent — live React-component examples are not possible. The Decision H scope ("live Tamagui examples inline") would not be available.
- Versioning (via the `mike` plugin) is workable but second-class compared to Docusaurus's first-party versioning.

**Alternative 2 — [VitePress](https://vitepress.dev/) (Vue + Vite).** Fast, modern, and the same "static site for technical docs" register as Docusaurus. **Rejected** because Vue is the wrong UI library ecosystem for a React + Tamagui + Next.js + Expo project. Any cross-link between the docs site and the runtime apps (e.g. a future "live component example") would require Vue ↔ React glue. The friction is small but permanent.

**Alternative 3 — [Nextra](https://nextra.site/) (Next.js + MDX).** Nominally an excellent fit because `apps/web` is Next.js. **Rejected** because:

- It couples the docs site to the `apps/web` build complexity (Next.js app, image optimisation, server components, etc.). The docs site should be a *separate* build artifact with its own constraints.
- The Nextra ecosystem is materially smaller than Docusaurus's. Most peer projects with our shape (Prisma, Supabase, RN, Babel) chose Docusaurus, and there is no compelling reason to swim against that current.

**Alternative 4 — Custom Next.js docs app.** Maximum control; minimum theming burden borrowed from a generator. **Rejected** as YAGNI — we are documenting a technical project, not building a CMS. Every hour spent on a custom docs renderer is an hour not spent on the project's actual differentiation. Docusaurus's defaults are good enough that the customisation surface (theme colors, sidebar config, a few swizzled components) covers what we need.

**Why not "no docs site at all, keep raw Markdown on GitHub forever".** This is the do-nothing alternative. It is rejected for the §2 Motivation reasons: evaluator friction at the public alpha and the versioning hand-off requirement for `packages/*-contracts/` docs. Both are project-blocking at the July 2026 public-alpha horizon per the brought-forward tranche in [`docs/ROADMAP.md`](../ROADMAP.md), not nice-to-haves.

---

## 14. Implementation phases

Sequencing for the work this RFC unblocks. **Non-binding** — these phases are operational guidance, not RFC commitments. The RFC commits to the decisions in §3–§11; the phases tell maintainers how to ship them.

| Phase | Scope | Approx effort | Output |
|---|---|---|---|
| **P1 — Scaffold** | `docs-site/` workspace, `docusaurus.config.ts` with all v4 future flags enabled, sidebar config mirroring [`docs/README.md`](../README.md) categories, Mermaid + MDX plugins enabled, `experimental_faster` enabled. Local `npm run start` renders. | ~1 day | Working local site rendering existing `docs/*.md` 1-to-1. |
| **P2 — Reference section** | Wire every `packages/*/README.md`, `apps/*/README.md`, `services/api/README.md`, and `services/api/src/seed/README.md` into a "Reference" sidebar. Validates the Decision C "READMEs as content" approach. | ~0.5 day | Reference section reachable; every workspace README rendered. |
| **P3 — Theme + branding** | Logo, brand color tokens, footer (license + current positioning), favicon. Visual register matches the [`MANIFESTO.md`](../../MANIFESTO.md) tone (clean, technical, no fluff). | ~0.5 day | Site looks like Umbraculum, not stock Docusaurus. |
| **P4 — Hosting + CI** | Cloudflare Pages project linked to repo; `docs.umbraculum.dev` DNS pointed at it; HTTPS via Cloudflare; the new `.github/workflows/docs-site-build.yml` lands and is required for PRs touching `docs/**`, `docs-site/**`, or `**/README.md`. | ~0.5 day | PRs build; merges deploy automatically. |
| **P5 — DocSearch application** | Submit the [DocSearch application form](https://docsearch.algolia.com/apply) using `docs.umbraculum.dev`; verify domain ownership; wait ~1–2 business days for automated approval (up to a week if manual review triggers). Local lunr.js search active in the interim. | ~0.5 day work + 1–7 days waiting | Production search powered by DocSearch. |
| **P6 — Contracts versioning workflow** | Run `docusaurus docs:version` against `@umbraculum/automation-contracts@<current>` and `@umbraculum/pim-contracts@<current>`; document the per-release snapshot workflow in a [`docs/DEVELOPMENT.md`](../../DEVELOPMENT.md) addendum so the next contracts-package release follows the discipline without re-reading this RFC. | ~0.5 day | Versioned contracts docs; release runbook updated. |
| **P7 — Public launch coordination** | Site go-live coordinated with the Week 3 org-transfer / public-alpha cutover prep per [`docs/ROADMAP.md`](../ROADMAP.md) late-H1 / July-2026 tranche. The site itself goes live in Week 2 under a `noindex` / `robots.txt` policy; SEO indexing flips when the July public-alpha release is declared. | Gated by the Week 3 cutover prep + July public-alpha readiness | Public docs at `docs.umbraculum.dev`. |

**Total active engineering effort: ~3 days** before P5 waiting and P7 timing gates. Highly parallelisable with normal feature work because `docs-site/` doesn't touch `apps/*`, `services/*`, or `packages/*` source.

**Future flag tracker.** Each enabled v4 future flag from Decision A is listed in `docs-site/V4-UPGRADE.md` (created in P1) with its v3 behaviour, its v4 behaviour, and the date enabled. When v4 lands, this file becomes the migration checklist.

---

## 15. Deferred clusters (not committed by this RFC)

Four follow-on items are explicitly out of scope:

**Deferred D1 — Full i18n translation work (en/it parity, beyond the machinery).** Decision F commits the i18n machinery; it does not commit the translation work itself. Translating ~30 docs into Italian is ~80–120 hours of careful technical translation. A future mini-RFC (or a dated [`docs/DEVELOPMENT.md`](../../DEVELOPMENT.md) addendum if the work is straightforward) sequences this once the docs site is operationally stable.

**Deferred D2 — Docusaurus v4 upgrade procedure detail.** Decision A commits the future-flag discipline that makes the v4 bump small. It does not commit the actual upgrade steps, which depend on v4's final release notes (not yet published as of 2026-05-20). The `docs-site/V4-UPGRADE.md` tracker (created in P1) captures the future-flag inventory; the upgrade PR itself is sequenced when v4 ships, not pre-committed.

**Deferred D3 — In-house theme-package decision.** If the theme overrides under `docs-site/src/css/` and `docs-site/src/theme/` grow beyond ~5 files, extracting them into a `@umbraculum/docs-theme` package (similar to how `@docusaurus/theme-classic` is structured) might be warranted. This is a follow-on decision triggered when the file count threshold is crossed, not pre-committed.

**Deferred D4 — On-site AI search overlay.** Algolia DocSearch (Decision G) covers keyword-and-near-keyword search. The project's own AI consultant (per [`docs/AI-CONSULTANT.md`](../AI-CONSULTANT.md) and [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0) could theoretically power a semantic-search overlay on the docs site that answers natural-language questions ("How do I register a third-party module?") with citations into the docs corpus. This is a possible future enhancement. It is **not** committed by this RFC — the v1 site ships with DocSearch only, and the AI-overlay decision waits until the AI consultant is stable enough to take on a public-facing role.

---

## 16. Resolution

This RFC follows the change procedure of [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 and [`docs/LICENSING.md`](../LICENSING.md) §10:

**Pre-public-flip (current state at acceptance time).** Solo-author drafts approved by the core team — the procedure under which this RFC was accepted on 2026-05-20.

**Post-public-alpha (now targeted for July 2026 per [`docs/ROADMAP.md`](../ROADMAP.md) late-H1 / July-2026 tranche, brought forward from the original H1 2027 horizon documented in [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1).** Material amendments to any decision in §3–§11 require a 30-day public-comment window via a PR against this file. Minor amendments (typo fixes, link updates, clarifying language that does not change a commit) may land via standard PR without the comment window.

**What counts as a material amendment.** Any change to:

- The generator choice (Decision A) — e.g. migrating off Docusaurus.
- The canonical URL (Decision B) — e.g. flipping from `docs.umbraculum.dev` to `umbraculum.dev/docs`.
- The publication scope (Decision D) — e.g. adding `internal/` or removing the Tier-marker discipline.
- The versioning policy (Decision E) — e.g. extending versioning beyond contracts packages.
- The MDX usage policy (Decision H) — e.g. lifting the "RFCs stay pure `.md`" hard rule.
- Adding or removing a load-bearing operational dependency from §12.

**What does not count as a material amendment.** Updating phase effort estimates in §14, swapping a deferred cluster (§15) into the committed set via a follow-on RFC, refining the v4-upgrade tracker, or adjusting the build-performance budget in §11.

**Supersession.** If a future RFC supersedes one or more decisions here, the superseding RFC must explicitly name this RFC and the §3–§11 decision(s) it changes. Silent supersession is not permitted.

---

## 17. Acknowledgements

This RFC was drafted post-conversation with the maintainer on 2026-05-20 covering the documentation strategy for the upcoming org transfer. The decision shape — adopt now with v4-future-flag discipline + canonical-for-now subdomain + scope-limited versioning + English-only v1 + DocSearch with lunr.js fallback — reflects choices made in that conversation, with the v3 → v4 timing question explicitly surfaced and resolved in favour of adopting now.

The named precedents in §2 (Prisma, React Native, Babel, Jest, Redux, Supabase, Algolia, ESLint, Hermes, MetaMask) are projects whose docs sites the project's maintainer cites as the visual / UX register Umbraculum is aiming for. They are not endorsements; they are existence proofs that Docusaurus serves projects in our shape well.
