# CI Parity Platform — execution plan

**Status:** In progress (see checklist below)  
**Governing design:** [`docs/CI-PARITY.md`](../CI-PARITY.md)  
**Plan source:** Cursor plan `ci_parity_platform` (not checked into this repo)

## Sub-plan checklist

| Sub-plan | Repo | Scope | Status |
|----------|------|-------|--------|
| SP-1 | umbraculum-toolset | `@umbraculum/ci-parity` package + toolset CI | Done |
| SP-2 | umbraculum-toolset | npm publish `1.0.0` + reusable GHA | Done — `1.0.0` on npm, tag `ci-parity-v1.0.0` |
| SP-3 | umbraculum-dev | Manifest + `docs/CI-PARITY.md` + thin wrapper | In commit |
| SP-4 | umbraculum-dev | Migrate 3 workflows + validate job | In commit |
| SP-5 | umbraculum-toolset | Plugin rule/skill/README updates | Done |
| SP-6 | umbraculum-dev | AGENTS.md, DEVELOPMENT.md, cross-refs | Done |

## Verification matrix

| Check | Command / gate |
|-------|----------------|
| Package unit tests | `npm test -w @umbraculum/ci-parity` in toolset |
| Package types | `npm run typecheck -w @umbraculum/ci-parity` |
| Manifest validate | `npx @umbraculum/ci-parity validate --strict` |
| Local parity | `npx @umbraculum/ci-parity` (~2 min) |
| GHA typecheck / lint / docs-readmes | PR triggers migrated workflows |
| Validate strict in CI | `.github/workflows/ci-parity-validate.yml` |

## Canonical paths

- umbraculum-dev: `REPO_ROOT/umbraculum-dev`
- umbraculum-toolset: `REPO_ROOT/umbraculum-toolset`
