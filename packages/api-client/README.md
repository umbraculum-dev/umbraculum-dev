# @brewery/api-client

Typed API client with pluggable auth strategies.

## Exports

- `createApiClient(baseUrl, auth, options?)`
  - `options.fetch` (optional): inject a cross-platform `fetch` implementation
- `cookieAuth()` (web)
- `bearerTokenAuth(getToken)` (native + Node)

## Auth direction (current)

- **Web**: cookie-based sessions (`sid` httpOnly cookie). Use `cookieAuth()`.
- **Native**: **bearer-only**. Use `bearerTokenAuth(getToken)` and send `Authorization: Bearer <token>`.
- **Node**: if used, treat it as **bearer-only** (do not rely on cookies).

## Webview caveat (“already logged in”)

If we later want **opening a whitelisted web page in a native webview** to be **already authenticated** *without* additional token-handling, we must implement a bridging mechanism (e.g. cookie/session handoff or a token → webview session mechanism). This is **not** automatic with bearer-only native auth.

## Build output (native-ready)

This package ships runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

When you change `packages/api-client/src/**`, rebuild the package outputs (from repo root):

- `npm run build:packages`

