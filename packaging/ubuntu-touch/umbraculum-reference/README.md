# Umbraculum operator — Ubuntu Touch reference Click webapp

**Tier:** Public  
**Status:** Reference template (v0.1.0) — not published to OpenStore by default  
**Audience:** developers packaging Umbraculum for Lomiri / OpenStore

This directory is a **primitive implementation** of [`docs/design/ubuntu-touch-shell-strategy.md`](../../../docs/design/ubuntu-touch-shell-strategy.md): a Click package that wraps the existing **`apps/web`** deployment in Morph's Qt WebEngine webview. **No Tamagui, API, or contracts code lives here** — only manifest, AppArmor, launcher, and icon.

## What you get

- Lomiri app icon opening your Umbraculum **web** origin (cookie session auth — same as browser)
- URL containment via `webapp-container --webappUrlPatterns=…`
- Session cookie persistence via `--store-session-cookies` (survives webapp restarts when online)
- **Online-only** — no offline SQLite, no Expo push, no native slice

Default start URL targets the **demo host** when live: `https://demo.umbraculum.dev/en/dashboard` ([`docs/design/demo-host-runbook.md`](../../../docs/design/demo-host-runbook.md)). Point at your self-hosted origin by re-rendering the desktop file (below).

## Prerequisites (on a UT build machine)

- [Clickable](https://docs.ubports.com/en/latest/appdev/clickable.html) and the Ubuntu Touch SDK / cross-compiler toolchain
- `click` CLI (from Clickable or UBports SDK)
- Network access to your Umbraculum HTTPS origin (API + web on one host, as in demo nginx layout)

## Configure origin

Environment variables for [`scripts/render-desktop.sh`](scripts/render-desktop.sh):

| Variable | Default | Meaning |
|---|---|---|
| `UMBRACULUM_WEB_ORIGIN` | `https://demo.umbraculum.dev` | HTTPS origin (no trailing slash) |
| `UMBRACULUM_WEB_START_PATH` | `/en/dashboard` | Locale-prefixed path on that origin |
| `UMBRACULUM_WEB_URL_PATTERNS` | `{ORIGIN}/*` | Comma-separated patterns passed to `--webappUrlPatterns` |

Examples:

```bash
# Demo host (default)
./scripts/render-desktop.sh

# Local dev stack exposed via LAN (you must serve HTTPS or use a dev tunnel)
export UMBRACULUM_WEB_ORIGIN=https://192.168.1.50
export UMBRACULUM_WEB_START_PATH=/en/login
./scripts/render-desktop.sh

# Self-hosted production
export UMBRACULUM_WEB_ORIGIN=https://ops.example.com
export UMBRACULUM_WEB_START_PATH=/en/dashboard
./scripts/render-desktop.sh
```

The script writes [`umbraculum.desktop`](umbraculum.desktop) from [`umbraculum.desktop.in`](umbraculum.desktop.in). Re-run whenever the origin changes, then rebuild the `.click` file.

## Build and install

From this directory (`packaging/ubuntu-touch/umbraculum-reference/`):

```bash
./scripts/render-desktop.sh
clickable
# or: click build .
#     click install umbraculum-operator_0.1.0_all.click
```

On device: install the generated `.click` (OpenStore submission is a separate UBports process).

## Verify on device

Checklist from strategy doc §10:

1. App opens to your configured start URL inside Morph webview.
2. Login completes (cookie `sid` — standard web flow).
3. Navigate to at least one **canonical** route (e.g. `/en/vessels`, `/en/products`) and one **vertical** route (e.g. `/en/recipes`) while online.
4. Confirm you are **not** expecting brew-day offline logging on UT (native iOS/Android only).

## Forking for tier-3 / self-host

1. Copy this folder (or only `manifest.json`, `.apparmor.json`, `.desktop.in`, `assets/`).
2. Change `manifest.json` `name`, `title`, and `maintainer` if you ship under your OpenStore identity.
3. Set `UMBRACULUM_WEB_ORIGIN` to your instance; widen `UMBRACULUM_WEB_URL_PATTERNS` only if you intentionally split web and API hosts (not recommended — breaks cookie same-site assumptions).

## Related docs

- [`docs/design/ubuntu-touch-shell-strategy.md`](../../../docs/design/ubuntu-touch-shell-strategy.md) — full discourse and trade-offs
- [`docs/CROSS-PLATFORM-BOUNDARIES.md`](../../../docs/CROSS-PLATFORM-BOUNDARIES.md) §9 — UT shell summary
- [`docs/design/demo-host-runbook.md`](../../../docs/design/demo-host-runbook.md) — demo accounts and nginx layout
- [UBports webapp guide](https://docs.ubports.com/en/latest/appdev/webapp/guide.html) — upstream `webapp-container` reference
