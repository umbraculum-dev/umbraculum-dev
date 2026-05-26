# SEO / Public demo surface (notes)

Goal: we may want some pages to be **public + indexable**, while keeping the main app **private**.

## What to make indexable (recommended scope)

- **Public demo routes** (example):
  - A “Water calculator demo” page
  - Optionally a “Recipe builder demo” page
- These should be **content-first** pages with useful SSR HTML (headings + explanatory text), with interactivity layered on top.

## Avoid (high complexity, low return)

- Making internal app pages public by “guest auth” just to get them indexed.
  - Google can render JS, but indexing becomes less deterministic and you’ll fight auth/hydration/blank-page failure modes.
  - “Create recipe” pages also tend to be thin/duplicate, which can perform poorly for SEO.

## Risks to address if we expose a public demo

- **Abuse / load**: any public calculator endpoints can be hammered.
  - Add rate limiting, input bounds, and clear error handling.
  - Avoid unbounded DB writes; prefer read-only or ephemeral state.
- **Index quality**:
  - Provide real explanatory content (not just UI controls).
  - Control duplicates (avoid lots of near-identical URLs; use canonical/noindex where needed).
- **Persistence strategy**:
  - If “guest can create”, use ephemeral storage (or a separate isolated storage strategy) to avoid polluting the main DB.

## Pragmatic approach

- Start with **one** public demo route (water calculator) + **SSR metadata** and meaningful HTML content.
- Keep the rest of the app private; revisit additional public pages once you see traction.

