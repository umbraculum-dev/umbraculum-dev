# Docusaurus v4 future-flag tracker

**Tier:** Public

This workspace enables every v4 future flag available in Docusaurus 3.10.x so the v3 → v4 bump is primarily flag removal, not behavioural migration. Source: [`docs/design/rfc-0005-execution-plan.md`](../docs/design/rfc-0005-execution-plan.md) §4.4.

| Flag | v3 behaviour | v4 behaviour | Enabled |
|---|---|---|---|
| `future.v4.siteStorageNamespacing` | localStorage keys unprefixed | Auto-namespaced (e.g. `theme` → `theme-<siteId>`) | 2026-05-25 |
| `future.v4.fasterByDefault` | Faster opt-in via `faster: true` | Faster on by default | 2026-05-25 |
| `future.v4.mdx1CompatDisabledByDefault` | MDX v1 compat options ON | Strict MDX (no `<!-- -->`, no `{#id}`, etc.) | 2026-05-25 |
| `future.faster` (stable in 3.10) | n/a | n/a — already enabled | 2026-05-25 |
| `future.experimental_vcs: 'default-v2'` | `git-ad-hoc` per-file calls in prod | `git-eager` whole-repo single call (faster builds) | 2026-05-25 |

## Config shorthand

`future.v4: true` in `docusaurus.config.ts` expands to the three `future.v4.*` rows above. `future.faster: true` and `future.experimental_vcs: 'default-v2'` are set separately. `storage: { type: 'localStorage', namespace: true }` pairs with site storage namespacing.

## v4 bump checklist (when Docusaurus v4 ships)

1. Upgrade `@docusaurus/*` packages to v4.x per release notes.
2. Remove `future.v4`, `future.faster`, and `future.experimental_vcs` once they become defaults or are removed upstream.
3. Re-run `npm run build` in this workspace and confirm zero broken links.
4. Re-verify Mermaid rendering on [`docs/REPOSITORY-STRUCTURE.md`](../docs/REPOSITORY-STRUCTURE.md) §5.
