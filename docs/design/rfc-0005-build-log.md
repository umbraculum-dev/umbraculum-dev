# RFC-0005 docs-site build log

**Tier:** Public  
**Status:** Living — P1–P4 closed 2026-05-25; post-P4 additions through 2026-05-27  
**Audience:** maintainers reviewing docs-site delivery vs [`rfc-0005-execution-plan.md`](rfc-0005-execution-plan.md)  
**Related:** [`docs/rfcs/0005-docs-site.md`](../rfcs/0005-docs-site.md)

## Front-matter

```
Execution plan: rfc-0005-execution-plan.md (P1–P4 composer passes, 2026-05-25)
P1–P4 landed: 2026-05-25 (maintainer-verified CI green)
Post-P4 autonomous tranche: 2026-05-27 (Umbi branding, search, noindex, nav links)
P5–P7: open (DocSearch submit, contracts versioning runbook, public indexing flip)
```

## P1–P4 summary (from execution plan)

| Phase | Delivered | CI |
|-------|-----------|-----|
| P1 Scaffold | `docs-site/` workspace, v4 future flags, main `docs/` plugin | — |
| P2 Reference | Three reference doc plugins (apps / services / packages READMEs) | — |
| P3 Theme | Dark theme CSS, placeholder branding (superseded by Umbi 2026-05-27) | — |
| P4 CI gate | `.github/workflows/docs-site-build.yml` | Green on `master` |

## Post-P4 additions (2026-05-27)

| Item | Files | Notes |
|------|-------|-------|
| Umbi mascot | `scripts/copy-brand-assets.mjs`, `docusaurus.config.ts`, `docs/media/umbi.png` (SoT) | Build-time copy; `static/img/umbi.png` gitignored |
| Local search | `@easyops-cn/docusaurus-search-local`, multi `docsRouteBasePath` | Until Algolia DocSearch credentials |
| DocSearch draft | [`docsearch-application-draft.md`](docsearch-application-draft.md) | Maintainer submit in Phase 2 |
| Pre-flip SEO | `noIndex: true`, `static/robots.txt` | Remove at P7 / public α |
| Footer / nav | Open-source stack + support links | Support URL → `umbraculum.dev/support/` |

## Open (P5–P7)

| Phase | Owner | Entry |
|-------|-------|-------|
| P5 DocSearch | Maintainer | [`docsearch-application-draft.md`](docsearch-application-draft.md) |
| P6 Contracts versioning | Maintainer + controller | [`docs-site-contracts-versioning-runbook.md`](docs-site-contracts-versioning-runbook.md) (skeleton; execute on first release) |
| P7 Public indexing | Maintainer | Flip `noIndex`, robots.txt, brochure meta; [`public-alpha-cloudflare-pages-runbook.md`](public-alpha-cloudflare-pages-runbook.md) |

## Verification commands

```bash
npm run build -w @umbraculum/docs-site
npm run build -w @umbraculum/website
```
