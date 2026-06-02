# Production hosting — repos and local layout

**Tier:** Public  
**Status:** v1 — Phase 0 (forum + demo on separate VPSes)  
**Audience:** maintainers and student volunteers — which repo to clone for which VM

---

## GitHub repositories (all public)

| Repo | Hostname | Clone on |
|------|----------|----------|
| [umbraculum-hosting-common](https://github.com/umbraculum-dev/umbraculum-hosting-common) | (dependency only) | Embedded as `common/` submodule — do not clone alone on VPS |
| [umbraculum-hosting-forum](https://github.com/umbraculum-dev/umbraculum-hosting-forum) | `forum.umbraculum.dev` | **Forum VPS only** |
| [umbraculum-hosting-demo](https://github.com/umbraculum-dev/umbraculum-hosting-demo) | `demo.umbraculum.dev` | **Demo VPS only** |

**This repo (umbraculum-dev)** holds application code, governance runbooks (forum §6–§7), flip-day, and product docs — not VPS shell scripts.

---

## Local laptop layout (maintainer convention)

Parent folder is **not** a git repository — only organizes sibling clones:

```text
/home/rf/dkprojects/rfapps/umbraculum-hosting/
  umbraculum-hosting-common/
  umbraculum-hosting-forum/
  umbraculum-hosting-demo/
/home/rf/dkprojects/rfapps/umbraculum-dev/
```

```bash
mkdir -p /home/rf/dkprojects/rfapps/umbraculum-hosting
cd /home/rf/dkprojects/rfapps/umbraculum-hosting
git clone git@github.com:umbraculum-dev/umbraculum-hosting-common.git
git clone git@github.com:umbraculum-dev/umbraculum-hosting-forum.git
git clone git@github.com:umbraculum-dev/umbraculum-hosting-demo.git
```

Forum and demo clones include `common/` after `git clone --recurse-submodules` (or `bin/pull` on the VPS).

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

`hosting-forum` and `hosting-demo` pin `common/` to a commit in **hosting-common**. On the VPS use **`bin/pull`** (`git pull --recurse-submodules`). When hardening changes, see [hosting-common SYNC.md](https://github.com/umbraculum-dev/umbraculum-hosting-common/blob/main/SYNC.md).

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
