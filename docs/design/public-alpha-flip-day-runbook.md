# Public alpha — flip-day runbook (Stage 2 / ROADMAP 2c)

**Tier:** Public  
**Status:** v1 maintainer checklist — execute only after Stage 1 sign-off  
**Audience:** maintainer performing the atomic July 2026 public-alpha flip  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md), [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md), [`community-forum-runbook.md`](community-forum-runbook.md), [`donation-channels.md`](donation-channels.md), [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md), [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1

> [!IMPORTANT]
> **Atomic moment:** `umbraculum-dev` and `umbraculum-toolset` visibility → **public** in the **same** maintenance window, with marketplace submission started the same day. See [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) marketplace closure criterion.

---

## 0. Before you start

**Automated prep status (2026-05-30):** Stage 0 org transfer ✅; brochure + docs-site in-repo ✅; CI workflows green ✅; MIT npm SDK batch published ✅; hygiene automated checks ✅; live `security@` / `conduct@` mailboxes ✅; toolset `CODE_OF_CONDUCT.md` + `SECURITY.md` ✅; Cloudflare Workers (`umbraculum-dev-website`, `umbraculum-dev-docs-docusaurus`) ✅. **Remaining before §1:** donation channel accounts (2d).

| Gate | Doc |
|------|-----|
| Stage 1 hygiene signed off | [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) §7 |
| **Donation channel accounts live** | [`donation-channels.md`](donation-channels.md) §3 + §8 — **roadmap Phase 2 `2d`** (before removing `noindex`) |
| Contact mailboxes live | `security@`, `conduct@`, `finance@` on `umbraculum.dev` — ✅ 2026-05-30 ([`SECURITY.md`](../../SECURITY.md), [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md), [`donation-channels.md`](donation-channels.md) §3.0) |
| Toolset parity | [`toolset-preflip-hygiene-audit-2026-05-27.md`](toolset-preflip-hygiene-audit-2026-05-27.md) — ✅ CoC + SECURITY (2026-05-30) |
| Cloudflare projects created (can be pre-flip while repos still private — use preview URLs first) | [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) — ✅ Workers Builds (2026-05-30) |
| Community forum ready (or scheduled same week as flip) | [`community-forum-runbook.md`](community-forum-runbook.md) |

---

## 1. Repositories → public (same session)

| Repo | Action |
|------|--------|
| `github.com/umbraculum-dev/umbraculum-dev` | Settings → Change visibility → **Public** |
| `github.com/umbraculum-dev/umbraculum-toolset` | Settings → Change visibility → **Public** |

Verify clone URLs work anonymously:

```bash
git ls-remote git@github.com:umbraculum-dev/umbraculum-dev.git HEAD
git ls-remote git@github.com:umbraculum-dev/umbraculum-toolset.git HEAD
```

---

## 2. Release tag (monorepo)

Per [`DEVELOPMENT.md`](../../DEVELOPMENT.md) release notation — Git tag **`v0.0.1-alpha`** (leading `v`); `package.json` versions stay **`0.0.1`** (no `v` prefix).

```bash
cd $REPO_ROOT
git tag -a v0.0.1-alpha -m "Public alpha release"
git push origin v0.0.1-alpha
```

Draft GitHub Release notes from [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md).

---

## 3. Remove pre-flip SEO gates (commit on `master`, then deploy)

### 3.1 Brochure (`apps/website`)

| File | Change |
|------|--------|
| `apps/website/public/robots.txt` | Replace `Disallow: /` with allow-all, e.g. `User-agent: *\nAllow: /` |
| `apps/website/public/index.html` | Remove `<meta name="robots" content="noindex, nofollow" />` |
| `apps/website/public/support/index.html` | Same meta removal |
| Footer “Pre-release … noindex” lines | Remove or reword |

Rebuild: `npm run build -w @umbraculum/website` → redeploy Cloudflare brochure project.

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
| `https://umbraculum.dev/support/` | Support page |
| `https://docs.umbraculum.dev/` | Docs home |
| `https://docs.umbraculum.dev/GETTING-STARTED` | Renders |

---

## 5. Cursor marketplace (toolset)

Submit four plugins per [`docs/CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md) — source must resolve publicly on flip day.

**Closure criterion:** public-alpha procedure complete only when all four listings are **live** ([`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1). Approval may trail flip by days/weeks.

---

## 6. npm MIT SDK batch

**Pre-completed 2026-05-29** (before Stage 2 repo visibility flip). All seven MIT SDK packages are on the public registry; OIDC trusted publishing is configured for future bumps via `publish-sdk-batch.yml`. First versions were published from a maintainer laptop; do **not** push `sdk-batch-v0.1.0` (versions already exist). Details: [`npm-sdk-publish-execution-plan.md`](npm-sdk-publish-execution-plan.md) SP-3, [`LICENSING.md`](../LICENSING.md) §6.2.1.

---

## 7. DocSearch (can trail flip)

Submit using [`docsearch-application-draft.md`](docsearch-application-draft.md) after `docs.umbraculum.dev` is live.

---

## 8. Launch comms (2e)

| Channel | Action |
|---------|--------|
| GitHub Release | Publish `v0.0.1-alpha` body from announcement draft |
| [Community forum](https://forum.umbraculum.dev) | Cross-post announcement; confirm **Proposals** category + §7 hardening + pinned **How we communicate** (§6 item 5 / §6.1) per [`community-forum-runbook.md`](community-forum-runbook.md) |
| Brochure / social | Optional short post linking docs + clone URL |
| Support page | Confirm Liberapay + Buy Me a Coffee links (completed in **2d** before flip) |

---

## 9. Post-flip smoke (15 min)

- [ ] `GETTING-STARTED` clone + `docker compose up` path (or document known gaps)
- [ ] `https://forum.umbraculum.dev/` live (or tracked in [`community-forum-runbook.md`](community-forum-runbook.md) §12 sign-off)
- [ ] Pinned **How we communicate** topic in **Community policy** (§6.1 — runbook §6 item 5, §7.5)
- [ ] `docs-readmes` + `docs-site-build` + `website-build` green on `master`
- [ ] [`AGENTS.md`](../../AGENTS.md) apparatus path: marketplace-first install documented
- [ ] Update [`ROADMAP.md`](../ROADMAP.md) Week 3 / Phase 2 rows with flip date

---

## 10. Sign-off log

| Date | Maintainer | Notes |
|------|------------|-------|
| 2026-05-29 | Agent prep | Automated Stage 2 prep complete — npm SDK on registry, brochure/docs-site/workflows in repo. **Flip not executed** — maintainer runs §1–§9 when manual gates close. |
| — | — | Flip-day execution pending |
