# Build log — Option C: project-owned pgpool + db-guard (no Bitnami)

**Branch:** `infra/pgpool-non-bitnami`  
**Date:** 2026-11-02  
**Author:** umbraculum-dev (+ Cursor co-author on agent commits)

## Why

Bitnami removed community images from Docker Hub / ECR Public (2026-06-10). Compose `public.ecr.aws/bitnami/pgpool:4.6.3` no longer pulls. Local retag workarounds were rejected — the stack needs a reproducible, project-owned image.

## Approach

- `infra/pgpool/Dockerfile` — `debian:bookworm-slim` + pinned `pgpool2=4.3.5-1+deb12u1`
- Full project `pgpool.conf` + `pool_hba.conf` (Bitnami env-var overlay retired; `pgpool-extra.conf` deprecated stub)
- Entrypoint builds AES `pool_passwd` via `pg_enc` (SCRAM backends) and PCP `pcp.conf`
- `infra/db-guard/Dockerfile` — same Debian packages; `db-guard.sh` uses `PCPPASSFILE` (libpcp ignores `$HOME`)
- Compose `build:` → `umbraculum/pgpool:bookworm-4.3.5` / `umbraculum/db-guard:bookworm-4.3.5`
- Port `5434` and app `DATABASE_URL` / `DATABASE_URL_DIRECT` unchanged

## Verification (T1–T12)

Canonical script: `scripts/verify-pgpool-stack.sh`

| ID | Result |
|----|--------|
| T1–T7, T10 | PASS (health, recovery, streaming+sync, slot, WAL, pool_nodes, smoke:stack, session) |
| T8 | PASS (stop replica → sync off, standby detached, `/en/login` 200) |
| T9 | PASS (start replica → `streaming,sync` + standby `up`) |
| T11 | Host TCP `127.0.0.1:5434` `show pool_nodes` OK (pgAdmin uses same endpoint; desktop install already present) |
| T12 | PASS (compose image not Bitnami/ECR) |

## Pitfalls fixed during bring-up

1. **SCRAM + md5 pool_passwd** → use `pg_enc` AES + `.pgpoolkey`
2. **backend_flag** values → `ALWAYS_PRIMARY` / `ALLOW_TO_FAILOVER` (not Bitnami-era composites)
3. **PCP from db-guard as root** → set `PCPPASSFILE`; libpcp resolves `.pcppass` via `getpwuid()->pw_dir`, not `$HOME`

## Post-merge handoff (T13)

After this lands on `master`: switch to `wip/pim-channel-scoping-web-ui`, merge `origin/master`, rebuild/restart pgpool/db-guard/api, re-run `npm run smoke:stack`. Record outcome below when done.

- [ ] WIP merged onto post-pgpool master; smoke green
