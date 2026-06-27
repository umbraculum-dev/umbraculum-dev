# Production hosting — repos and local layout

**Tier:** Public  
**Status:** v1 — Phase 0 (forum + demo on separate VPSes)  
**Audience:** maintainers and student volunteers — which repo to clone for which VM

---

## Production status (2026-06-26)

These hosts are **live in production** before the GitHub visibility flip (Stage 2 **2c**). Brochure and docs remain on pre-flip `noindex` until flip; forum, demo, and `/support` donation URLs are reachable now.

| Host | URL | Operator runbook | Notes |
|------|-----|------------------|-------|
| Brochure | [umbraculum.dev](https://umbraculum.dev/) | [umbraculum-brochure](https://github.com/umbraculum-dev/umbraculum-brochure) | Cloudflare Worker |
| Support / sponsorship | [umbraculum.dev/support/](https://umbraculum.dev/support/) | [`donation-channels.md`](donation-channels.md) | **Liberapay** + **Buy Me a Coffee** live (**2d ✅ 2026-06-26**) |
| Docs | [docs.umbraculum.dev](https://docs.umbraculum.dev/) | [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) | Pre-flip `noindex` until **2c** |
| Community forum | [forum.umbraculum.dev](https://forum.umbraculum.dev/) | [`community-forum-runbook.md`](community-forum-runbook.md) | Discourse — live 2026-06-08 |
| Public demo | [demo.umbraculum.dev](https://demo.umbraculum.dev/) | [`demo-host-runbook.md`](demo-host-runbook.md) | Brewery reference vertical — live 2026-06-03 |

---

## GitHub repositories (all public)

| Repo | Hostname | Clone on |
|------|----------|----------|
| [umbraculum-hosting-common](https://github.com/umbraculum-dev/umbraculum-hosting-common) | (dependency only) | Embedded as `common/` submodule — do not clone alone on VPS |
| [umbraculum-hosting-forum](https://github.com/umbraculum-dev/umbraculum-hosting-forum) | `forum.umbraculum.dev` | **Forum VPS only** |
| [umbraculum-hosting-demo](https://github.com/umbraculum-dev/umbraculum-hosting-demo) | `demo.umbraculum.dev` | **Demo VPS only** |
| [umbraculum-brochure](https://github.com/umbraculum-dev/umbraculum-brochure) | `umbraculum.dev` | **Brochure only** — static marketing site + announcement SoT |

**This repo (umbraculum-dev)** holds application code, governance runbooks (forum §6–§7), flip-day, and product docs — not VPS shell scripts.

---

## Local laptop layout (maintainer convention)

Parent folder is **not** a git repository — only organizes sibling clones. Use environment variables (see [`DEVELOPMENT.md`](../DEVELOPMENT.md) `$REPO_ROOT` convention) — do not commit machine-specific absolute paths.

Example layout:

```text
$HOSTING_ROOT/
  umbraculum-hosting-common/
  umbraculum-hosting-forum/
  umbraculum-hosting-demo/
  umbraculum-brochure/           # static umbraculum.dev (optional sibling)
$REPO_ROOT/                    # this repo (umbraculum-dev)
```

```bash
export HOSTING_ROOT="${HOSTING_ROOT:-$REPO_ROOT/../umbraculum-hosting}"
mkdir -p "$HOSTING_ROOT"
cd "$HOSTING_ROOT"
git clone git@github.com:umbraculum-dev/umbraculum-hosting-common.git
git clone git@github.com:umbraculum-dev/umbraculum-hosting-forum.git
git clone git@github.com:umbraculum-dev/umbraculum-hosting-demo.git
```

Forum and demo clones include `common/` after `git clone --recurse-submodules` (or `bin/pull` on the VPS).

### Fresh VPS (forum or demo)

On the server, **git is not preinstalled**. Maintainers run once as root:

1. `apt-get update && apt-get install -y git`
2. `git clone --recurse-submodules` the hosting-forum or hosting-demo repo to `/opt/…`
3. `bin/bootstrap` (Docker CE, Compose plugin, UFW, fail2ban — see hosting-common README)

Host-specific steps (Discourse, demo compose) follow each repo’s `docs/OPERATOR.md`.

---

## Volunteer routing

| I maintain… | Clone | Read first |
|-------------|-------|------------|
| Forum VM | hosting-forum (+ submodule) | hosting-forum `README.md` → `docs/OPERATOR.md` |
| Demo VM | hosting-demo + umbraculum-dev on same host | hosting-demo `README.md`; product steps in `demo-host-runbook.md` |
| Governance / pins / proposals | Often umbraculum-dev only | `community-forum-runbook.md` §6–§7 |

---

## VPS paths (recommended)

| VM | Operator repo | Application / Discourse |
|----|---------------|-------------------------|
| Forum | `/opt/umbraculum-hosting-forum` | `/var/discourse` (upstream discourse_docker) |
| Demo | `/opt/umbraculum-hosting-demo` | `/opt/umbraculum-dev` (build + verify scripts) |

---

## Submodule discipline

`hosting-forum` and `hosting-demo` pin `common/` to a commit in **hosting-common**. On the VPS use **`bin/pull`** (`git pull --recurse-submodules`). Fresh or recreated VPS: **`bin/bootstrap`**. Security-only re-run: **`bin/harden`**. When scripts change, see [hosting-common SYNC.md](https://github.com/umbraculum-dev/umbraculum-hosting-common/blob/main/SYNC.md).

---

## Legacy path in this repo

`infra/community-forum/` is **deprecated** — see stub README there. Canonical forum ops: **umbraculum-hosting-forum**.

---

## Related docs

| Topic | Document |
|-------|----------|
| Forum governance | [`community-forum-runbook.md`](community-forum-runbook.md) |
| Forum SSL ADR | [`community-forum-ssl-strategy.md`](community-forum-ssl-strategy.md) |
| Demo product | [`demo-host-runbook.md`](demo-host-runbook.md) |
| Community policy | [`CORE-DEVELOPMENT-AND-COMMUNITY.md`](../CORE-DEVELOPMENT-AND-COMMUNITY.md) §4.6 |
| Master plan | Cursor plan `production-hosting-repos` |
