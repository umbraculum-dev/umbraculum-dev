# Public alpha — flip-day runbook (Stage 2 / ROADMAP 2c)

**Tier:** Public  
**Status:** v1 maintainer checklist — execute only after Stage 1 sign-off  
**Audience:** maintainer performing the atomic July 2026 public-alpha flip  
**Related:** [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md), [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md), [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](../PUBLIC-ALPHA-ANNOUNCEMENT.md), [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1

> [!IMPORTANT]
> **Atomic moment:** `umbraculum-dev` and `umbraculum-toolset` visibility → **public** in the **same** maintenance window, with marketplace submission started the same day. See [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) marketplace closure criterion.

---

## 0. Before you start

| Gate | Doc |
|------|-----|
| Stage 1 hygiene signed off | [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md) §7 |
| Contact mailboxes live | `security@umbraculum.dev`, `conduct@umbraculum.dev` — update [`SECURITY.md`](../../SECURITY.md), [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md) |
| Toolset parity | [`toolset-preflip-hygiene-audit-2026-05-27.md`](toolset-preflip-hygiene-audit-2026-05-27.md) gaps closed |
| Cloudflare projects created (can be pre-flip while repos still private — use preview URLs first) | [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) |

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

## 6. npm MIT SDK batch (can trail flip by days)

Not required for repo visibility. When ready, execute [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md).

---

## 7. DocSearch (can trail flip)

Submit using [`docsearch-application-draft.md`](docsearch-application-draft.md) after `docs.umbraculum.dev` is live.

---

## 8. Launch comms (2d)

| Channel | Action |
|---------|--------|
| GitHub Release | Publish `v0.0.1-alpha` body from announcement draft |
| Brochure / social | Optional short post linking docs + clone URL |
| Support page | Add GitHub Sponsors / Open Collective links when chosen |

---

## 9. Post-flip smoke (15 min)

- [ ] `GETTING-STARTED` clone + `docker compose up` path (or document known gaps)
- [ ] `docs-readmes` + `docs-site-build` + `website-build` green on `master`
- [ ] [`AGENTS.md`](../../AGENTS.md) apparatus path: marketplace-first install documented
- [ ] Update [`ROADMAP.md`](../ROADMAP.md) Week 3 / Phase 2 rows with flip date

---

## 10. Sign-off log

| Date | Maintainer | Notes |
|------|------------|-------|
| — | — | Checklist not executed yet |
