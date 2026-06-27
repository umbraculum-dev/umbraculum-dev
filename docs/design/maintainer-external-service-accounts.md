# Maintainer external service accounts (Cursor + Algolia)

**Tier:** Internal maintainer reference (not contributor onboarding)  
**Status:** v1 — recorded 2026-06-27  
**Audience:** maintainer and agents handling **C2** (Cursor marketplace) or **C5** (Algolia DocSearch)  
**Related:** [`public-alpha-flip-day-runbook.md`](public-alpha-flip-day-runbook.md) §5–§7, §11 · [`CURSOR-PLUGINS.md`](../CURSOR-PLUGINS.md) · [`docsearch-application-draft.md`](docsearch-application-draft.md) · [`MARKETPLACE-C2-MANIFEST.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/MARKETPLACE-C2-MANIFEST.md)

> [!NOTE]
> **Do not hunt personal or ad-hoc accounts.** Cursor marketplace and Algolia DocSearch for Umbraculum both use the **same GitHub OAuth identity** below. Public listing contact is **`toolset@umbraculum.dev`** — that is not the login email.

---

## Account matrix

| Service | Sign-in method | GitHub identity | Login / account email | Public contact on forms | Flip item |
|---------|----------------|-----------------|----------------------|-------------------------|-----------|
| **Cursor** (marketplace publisher) | **GitHub OAuth** | [`github.com/umbraculum-dev`](https://github.com/umbraculum-dev) org context | **`umbraculum-dev@proton.me`** | **`toolset@umbraculum.dev`** (manifest `owner.email`, application notes) | **C2** — submitted 2026-06-27; await **`marketplace-publishing@cursor.com`** |
| **Algolia** (DocSearch) | **GitHub OAuth** | Same GitHub identity as Cursor | **`umbraculum-dev@proton.me`** | **`toolset@umbraculum.dev`** where the form asks for project contact | **C5** — [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply) |

---

## Rules (maintainer)

1. **Sign up / sign in with GitHub** for both services — do not create separate email-password logins under personal Gmail or one-off addresses.
2. The authorized GitHub user must be the maintainer identity tied to **`umbraculum-dev@proton.me`** and the **`umbraculum-dev`** GitHub organization (same account used for C2 marketplace publish).
3. **`toolset@umbraculum.dev`** is the **public** contact on manifests and application forms; **`umbraculum-dev@proton.me`** is the **operator login** (Proton inbox for OAuth and vendor follow-up).
4. If a dashboard shows a different email, check whether you signed in with the wrong GitHub user before opening a second account.

---

## Changelog

| Date | Notes |
|------|-------|
| 2026-06-27 | Initial record — Cursor C2 submitted via GitHub; Algolia C5 signup uses same GitHub + Proton pattern |
