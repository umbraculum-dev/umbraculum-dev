# Public alpha — flip-day runbook (Stage 2 / ROADMAP 2c)

**Tier:** Public  
**Status:** v1 maintainer checklist — **Stage 2 / 2c executed 2026-06-27** (historical procedure + post-flip tail §11)  
**Audience:** maintainer performing the atomic July 2026 public-alpha flip  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md), [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md), [`community-forum-runbook.md`](community-forum-runbook.md), [`donation-channels.md`](donation-channels.md), [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md), [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1, [`maintainer-external-service-accounts.md`](maintainer-external-service-accounts.md) (Cursor + Algolia login identity)

> [!NOTE]
> **Flip executed 2026-06-27.** Sections §1–§8 record what was done. **Post-flip tail (C6–C9)** — see §11.

---

## 0. Before you start (historical — prep through 2026-06-26)

**Automated prep status (2026-06-26):** Stage 0 org transfer ✅; brochure + docs-site in-repo ✅; CI workflows green ✅; MIT npm SDK batch published ✅; hygiene automated checks ✅; live `security@` / `conduct@` / `finance@` mailboxes ✅; toolset `CODE_OF_CONDUCT.md` + `SECURITY.md` ✅; Cloudflare Workers (`umbraculum-brochure`, `umbraculum-dev-docs-docusaurus`) ✅. **Production surfaces before SEO flip:**

| Surface | URL | Status (pre-2026-06-27) |
|---------|-----|------------------------|
| Brochure + support | [umbraculum.dev](https://umbraculum.dev/) · [umbraculum.dev/support/](https://umbraculum.dev/support/) | ✅ Live — Liberapay + Buy Me a Coffee wired (**2d ✅ 2026-06-26**) |
| Docs | [docs.umbraculum.dev](https://docs.umbraculum.dev/) | ✅ Live — **`noindex` until 2c** → **indexed 2026-06-27** |
| Community forum | [forum.umbraculum.dev](https://forum.umbraculum.dev/) | ✅ Live — Discourse on Contabo VPS; §7.5 governance pins (2026-06-08) |
| Public demo | [demo.umbraculum.dev](https://demo.umbraculum.dev/) | ✅ Live since 2026-06-03 — [`demo-host-runbook.md`](demo-host-runbook.md) |

**§1–§3 executed 2026-06-27:** GitHub visibility **public** for three source repos; `noindex` removed; marketplace submission started same session.

| Gate | Doc |
|------|-----|
| Stage 1 hygiene signed off | [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) §7 |
| **Donation channel accounts live** | [`donation-channels.md`](donation-channels.md) §3 + §8 — **✅ 2026-06-26** — [umbraculum.dev/support/](https://umbraculum.dev/support/) (Liberapay + Buy Me a Coffee) |
| Contact mailboxes live | `security@`, `conduct@`, `finance@` on `umbraculum.dev` — ✅ 2026-05-30 ([`SECURITY.md`](../../SECURITY.md), [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md), [`donation-channels.md`](donation-channels.md) §3.0) |
| Toolset parity | [`toolset-preflip-hygiene-audit-2026-05-27.md`](toolset-preflip-hygiene-audit-2026-05-27.md) — ✅ CoC + SECURITY (2026-05-30) |
| Brochure parity | [`brochure-preflip-hygiene-audit-2026-06-26.md`](brochure-preflip-hygiene-audit-2026-06-26.md) — ✅ tracked content + gitleaks; author mailmap pushed before §1 |
| Cloudflare projects created (can be pre-flip while repos still private — use preview URLs first) | [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) — ✅ Workers Builds (2026-05-30) |
| Community forum live | [`community-forum-runbook.md`](community-forum-runbook.md) — **✅ [forum.umbraculum.dev](https://forum.umbraculum.dev/)** (§7.5 complete 2026-06-08) |
| Public demo host live | [`demo-host-runbook.md`](demo-host-runbook.md) — **✅ [demo.umbraculum.dev](https://demo.umbraculum.dev/)** (2026-06-03) |

---

## 1. Repositories → public (same session)

Flip **all three** in one maintenance window (order within the window does not matter; do not leave any private overnight):

| Repo | Role | Action |
|------|------|--------|
| `github.com/umbraculum-dev/umbraculum-dev` | Monorepo (API, web, docs-site, packages) | Settings → Change visibility → **Public** |
| `github.com/umbraculum-dev/umbraculum-toolset` | Cursor plugin pack source | Settings → Change visibility → **Public** |
| `github.com/umbraculum-dev/umbraculum-brochure` | Static `umbraculum.dev` + `/support` + announcement SoT | Settings → Change visibility → **Public** |

**Already public (no §1 action):** `umbraculum-hosting-common`, `umbraculum-hosting-forum`, `umbraculum-hosting-demo`, `umbraculum-integrator-sample`.

**Pre-flip on `umbraculum-brochure`:** confirm [`brochure-preflip-hygiene-audit-2026-06-26.md`](brochure-preflip-hygiene-audit-2026-06-26.md) — gitleaks clean, no secrets in tree, git author metadata uses project email (not personal Gmail).

Verify clone URLs work anonymously:

```bash
git ls-remote git@github.com:umbraculum-dev/umbraculum-dev.git HEAD
git ls-remote git@github.com:umbraculum-dev/umbraculum-toolset.git HEAD
git ls-remote git@github.com:umbraculum-dev/umbraculum-brochure.git HEAD
```

### 1.1 Refresh public consumers (same session)

After **all three** source repos are public, update clones and VPS trees that consume them — visibility alone does not refresh checkouts.

| Consumer | Location | Action |
|----------|----------|--------|
| **Maintainer laptop** | Sibling clones (`umbraculum-dev`, `umbraculum-toolset`, `umbraculum-brochure`) | `git pull` on each (brochure already public — pull if behind) |
| **Demo VPS — product** | `/opt/umbraculum-dev` | Revoke temporary GitHub PAT + drop stored credentials — [`demo-host-runbook.md`](demo-host-runbook.md) §3; then `git fetch origin && git pull` (HTTPS anonymous fetch must work) |
| **Demo VPS — operator** | `/opt/umbraculum-hosting-demo` | `bin/pull` when compose or submodule pins changed |
| **Docs announcement vendor** | Monorepo `docs-site/vendor/brochure/` | If brochure moved since last sync: pull `umbraculum-brochure` → [`scripts/sync-brochure-vendor.sh`](../../scripts/sync-brochure-vendor.sh) → redeploy docs worker |
| **Cloudflare Workers Builds** | `umbraculum-brochure`, `umbraculum-dev-docs-docusaurus` | No git pull on VPS — dashboard builds clone from GitHub on push; trigger or wait for first green build after visibility flip |
| **Forum** | Discourse pinned topics | GitHub doc links that 404’d while repos were private should resolve after flip (re-smoke one pinned link) |

**Not git consumers:** `umbraculum-integrator-sample` uses npm registry SDK pins, not monorepo clones.

**Pre-flip hygiene (dev + toolset):** re-run 2026-06-27 — gitleaks toolset **0 leaks**; dev **48 hits = beerjson i18n false positives** (same as [`public-alpha-preflip-hygiene-audit-2026-06-07.md`](public-alpha-preflip-hygiene-audit-2026-06-07.md)); both repos commit author email **`umbraculum-dev@proton.me` only**; dev `check-public-docs-no-personal-paths` **OK**.

---

## 2. Release tag (monorepo)

Per [`DEVELOPMENT.md`](../../DEVELOPMENT.md) release notation — Git tag **`v0.0.1-alpha`** (leading `v`); `package.json` versions stay **`0.0.1`** (no `v` prefix). The May 2026 history anchor is **`v0.0.1-baseline`** (renamed from misleading bare `v0.0.1` on 2026-06-27). Reserve bare **`v0.0.1`** for a future stable cut after alpha graduates.

```bash
cd $REPO_ROOT
git tag -a v0.0.1-alpha -m "Public alpha release"
git push origin v0.0.1-alpha
```

Draft GitHub Release notes from [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md).

**Status (2026-06-27):** GitHub Release **`v0.0.1-alpha`** published on `umbraculum-dev/umbraculum-dev` (tag points at flip commit; see §11 **C1**).

---

## 3. Remove pre-flip SEO gates (commit on `master`, then deploy)

### 3.1 Brochure (`umbraculum-brochure` sister repo)

| File | Change |
|------|--------|
| `public/robots.txt` | Replace `Disallow: /` with allow-all, e.g. `User-agent: *\nAllow: /` |
| `public/index.html` | Remove `<meta name="robots" content="noindex, nofollow" />` |
| `public/support/index.html` | Same meta removal |
| Footer “Pre-release … noindex” lines | Remove or reword |

Rebuild: `npm run build` in [`umbraculum-brochure`](https://github.com/umbraculum-dev/umbraculum-brochure) → Cloudflare redeploys brochure Worker (`umbraculum-brochure`).

### 3.2 Docs site (`docs-site`)

| File | Change |
|------|--------|
| `docs-site/docusaurus.config.ts` | Set `noIndex: false` (or remove the property) |
| `docs-site/static/robots.txt` | Allow crawling (mirror brochure pattern) |

Rebuild: `npm run build -w @umbraculum/docs-site` → redeploy Cloudflare docs project.

### 3.3 Verify

- `curl -sI https://umbraculum.dev/robots.txt`
- `curl -sI https://docs.umbraculum.dev/robots.txt`
- View page source — no `noindex` meta on home/support

---

## 4. Cloudflare Pages + DNS

Follow [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) §2–3:

1. Connect both Pages projects to **public** `umbraculum-dev/umbraculum-dev`.
2. Custom domains: `umbraculum.dev`, `www` → apex, `docs.umbraculum.dev`.
3. Wait for TLS active; smoke:

| URL | Expect |
|-----|--------|
| `https://umbraculum.dev/` | Brochure + Umbi |
| `https://umbraculum.dev/support/` | Support page — Liberapay + Buy Me a Coffee (already live pre-flip) |
| `https://docs.umbraculum.dev/` | Docs home |
| `https://docs.umbraculum.dev/GETTING-STARTED` | Renders |
| `https://forum.umbraculum.dev/` | Discourse forum (already live pre-flip) |
| `https://demo.umbraculum.dev/` | Brewery reference demo — sign-in banner + E2E fixture accounts (already live pre-flip) |

---

## 5. Cursor marketplace (toolset)

Submit the **three** umbraculum-dev apparatus plugins per [`docs/CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md) — source must resolve publicly on flip day. (`umbraculum-openplc-python-cursor-assistant` listing deferred until the OpenPLC sister repo is public.)

| Step | Detail |
|------|--------|
| Manifest SoT | [`umbraculum-toolset/.cursor-plugin/marketplace.json`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/.cursor-plugin/marketplace.json) — `pluginRoot: cursor-plugins`, **three** entries in `plugins[]` |
| Runbook | [`cursor-plugins/docs/MARKETPLACE-C2-MANIFEST.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/MARKETPLACE-C2-MANIFEST.md) — verify, submit, rollback |
| Submit URL | [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) — repo `https://github.com/umbraculum-dev/umbraculum-toolset` |
| **Publisher account** | **GitHub OAuth** — [`github.com/umbraculum-dev`](https://github.com/umbraculum-dev) · login email **`umbraculum-dev@proton.me`** ([`maintainer-external-service-accounts.md`](maintainer-external-service-accounts.md)) |
| OpenPLC | On disk under `cursor-plugins/` for hooks only — **not** in marketplace manifest |

**Closure criterion:** public-alpha procedure complete only when all **three** listings are **live** ([`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1). Approval may trail flip by days/weeks. **Submission started** satisfies flip-day “start marketplace” gate; live listings satisfy architectural closure.

### 5.1 Submission status and review policy (C2)

| When | Detail |
|------|--------|
| **Submitted** | **2026-06-27** — [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish); org `umbraculum-dev`; repo `https://github.com/umbraculum-dev/umbraculum-toolset` |
| **Await** | Cursor follow-up at **`marketplace-publishing@cursor.com`** (no published SLA) |
| **If approved** | Three listings go live; migrate per [`MARKETPLACE-C2-MANIFEST.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/MARKETPLACE-C2-MANIFEST.md) § Post-approval migration + [`CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md) |
| **If rejected or change-requested** | Apply Cursor feedback in **`umbraculum-toolset`** only (manifest, `plugin.json`, descriptions, logos, layout) — **do not** guess; change only what they specify; re-run manifest verification in the runbook; resubmit or reply on their thread |
| **Until live** | Keep **`workspaceOpen` hook** as canonical install for umbraculum-dev contributors |

---

## 6. npm MIT SDK batch

**Pre-completed 2026-05-29** (before Stage 2 repo visibility flip). All seven MIT SDK packages are on the public registry; OIDC trusted publishing is configured for future bumps via `publish-sdk-batch.yml`. First versions were published from a maintainer laptop; do **not** push `sdk-batch-v0.1.0` (versions already exist). Details: [`npm-sdk-publish-execution-plan.md`](npm-sdk-publish-execution-plan.md) SP-3, [`LICENSING.md`](../LICENSING.md) §6.2.1.

---

## 7. DocSearch / Algolia (C5 — do now)

**Post-flip gate:** submit the Algolia DocSearch application (**C5** in §11) as soon as **`noindex` is removed** and `https://docs.umbraculum.dev/` is indexable.

| Step | Detail |
|------|--------|
| Apply | [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply) |
| Draft answers | [`docsearch-application-draft.md`](docsearch-application-draft.md) |
| **Applicant account** | **GitHub OAuth** — same as Cursor C2: [`github.com/umbraculum-dev`](https://github.com/umbraculum-dev) · **`umbraculum-dev@proton.me`** ([`maintainer-external-service-accounts.md`](maintainer-external-service-accounts.md)) |
| Contact email (form) | **`toolset@umbraculum.dev`** (public toolset contact) |
| After approval | **`@docusaurus/theme-search-algolia`** when **`DOCSEARCH_*`** set at Cloudflare build — see draft §4 |
| **Cloudflare credentials** | **Settings → Build → Variables and secrets** on **`umbraculum-dev-docs-docusaurus`**: `DOCSEARCH_APP_ID`, `DOCSEARCH_API_KEY`, `DOCSEARCH_INDEX_NAME` = **`umbraculum-docs`** |
| **Index refresh** | **Not on every deploy** — Algolia crawler schedule **§7** (~monthly); use **Start Crawling** in dashboard for urgent re-index |

Approval and crawler setup may trail submission by weeks (same pattern as C2). **Search results on production lag doc merges** until the next crawl finishes — see [`docsearch-application-draft.md`](docsearch-application-draft.md) §7.

---

## 8. Launch comms (2e)

| Channel | Action |
|---------|--------|
| GitHub Release | **✅ Published `v0.0.1-alpha`** (2026-06-27) — body from announcement draft; **forum [topic/84](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84) linked in release body** (2026-06-28) |
| [Community forum](https://forum.umbraculum.dev) | Cross-post announcement; confirm **Proposals** category + §7 hardening | **✅ 2026-06-28** — [announcement topic](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84) pinned in **Community policy** (6 months) |
| Brochure / social | Optional short post linking docs + clone URL |
| Support page | Liberapay + Buy Me a Coffee — **✅ live** at [umbraculum.dev/support/](https://umbraculum.dev/support/) since **2d (2026-06-26)**; re-smoke after `noindex` removal |

---

## 9. Post-flip smoke (15 min)

- [ ] `GETTING-STARTED` clone + `docker compose up` path (or document known gaps)
- [x] `https://forum.umbraculum.dev/` live — pre-flip since 2026-06-08 ([`community-forum-runbook.md`](community-forum-runbook.md) §7.5); re-smoke at flip comms — GitHub doc link 200 (2026-06-27)
- [x] `https://demo.umbraculum.dev/` live — pre-flip since 2026-06-03 ([`demo-host-runbook.md`](demo-host-runbook.md)); re-smoke login banner + demo accounts — `demo-host-verify.sh` + native API smoke green (2026-06-27)
- [x] [umbraculum.dev/support/](https://umbraculum.dev/support/) donation links live — **2d ✅ 2026-06-26**
- [ ] Contabo **Auto Backup** enabled on forum VPS (kick-off — [`community-forum-runbook.md`](community-forum-runbook.md) §10; [`infra/community-forum/MAINTENANCE.md`](../../infra/community-forum/MAINTENANCE.md) §2)
- [ ] Pinned **How we communicate** topic in **Community policy** (§6.1 — runbook §6 item 5, §7.5)
- [ ] `docs-readmes` + `docs-site-build` + `website-build` green on `master`
- [ ] [`AGENTS.md`](../../AGENTS.md) apparatus path: marketplace-first install documented
- [ ] Update [`ROADMAP.md`](../ROADMAP.md) Week 3 / Phase 2 rows with flip date

---

## 10. Sign-off log

| Date | Maintainer | Notes |
|------|------------|-------|
| 2026-05-29 | Agent prep | Automated Stage 2 prep complete — npm SDK on registry, brochure/docs-site/workflows in repo. **Flip not executed** — maintainer runs §1–§9 when manual gates close. |
| 2026-06-26 | Agent docs | §1 aligned to **three-repo** atomic flip (`umbraculum-dev` + `umbraculum-toolset` + `umbraculum-brochure`); hosting repos documented as already public. **Flip not executed.** |
| 2026-06-28 | Maintainer | **C3 ✅** — public alpha announcement posted + pinned (6 months) in **Community policy**: [topic/84](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84). |
| 2026-06-27 | Maintainer + agent | **§1 ✅** three repos public. **§2 ✅** `v0.0.1-alpha` retagged to `d205445`; **GitHub Release published** (**C1 ✅**). **§3 ✅** brochure + docs `noindex` removed; Cloudflare deploy verified. Demo VPS maintenance page deployed; **C4 ✅** VPS PAT verify. Agent smokes: demo host, native API, forum GitHub link. **C2 ✅** marketplace submitted. **C5 ✅** DocSearch live. **C6–C9** — see §11. |

---

## 11. Post-2c maintainer queue (C items)

Track flip-day and immediate post-flip work here. **C2** and **C5** are independent async reviews (Cursor marketplace vs Algolia DocSearch).

| ID | Action | Where | Status |
|----|--------|-------|--------|
| **C1** | GitHub Release **`v0.0.1-alpha`** published | §2 · §8 · [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md) | ☑ **Published 2026-06-27** — [release](https://github.com/umbraculum-dev/umbraculum-dev/releases/tag/v0.0.1-alpha) links [forum topic/84](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84) (2026-06-28) |
| **C2** | **Cursor marketplace** application submitted | §5 · [`MARKETPLACE-C2-MANIFEST.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/MARKETPLACE-C2-MANIFEST.md) | ☑ **Submitted 2026-06-27** — await **`marketplace-publishing@cursor.com`**; if not published, change plugins/manifest **only per Cursor feedback** (§5.1) |
| **C3** | Forum cross-post (announcement) | §8 · [`forum-public-alpha-announcement-post.md`](forum-public-alpha-announcement-post.md) | ☑ **2026-06-28** — [topic/84](https://forum.umbraculum.dev/t/umbraculum-public-alpha-open-source-toolset-for-workspace-shaped-operational-applications/84) pinned **Community policy** 6 months |
| **C4** | Revoke demo VPS temporary GitHub PAT | §1.1 · [`demo-host-runbook.md`](demo-host-runbook.md) · [`scripts/demo-vps-pat-revoke-verify.sh`](../../scripts/demo-vps-pat-revoke-verify.sh) | ☑ **VPS verified 2026-06-27** — `demo-vps-pat-revoke-verify.sh` green; **confirm GitHub UI revoke** of classic PAT |
| **C5** | **Algolia DocSearch** on production | §7 · [`docsearch-application-draft.md`](docsearch-application-draft.md) | ☑ **2026-06-27** — deploy green; Algolia on `docs.umbraculum.dev` (navbar search smoke recommended) |
| **C6** | Three Cursor marketplace listings **live** (architectural closure) | [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1 | ☐ trails **C2** |
| **C7** | Post-flip smoke checklist complete | §9 | ☐ partial (2026-06-27) |
| **C8** | [`AGENTS.md`](../../AGENTS.md) marketplace-first install documented | §9 | ☐ after **C6** |
| **C9** | [`ROADMAP.md`](../ROADMAP.md) Week 3 / Phase 2 flip date recorded | §9 | ☐ |
