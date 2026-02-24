# @brewery/api-client

Typed API client with pluggable auth strategies.

## Exports

- `createApiClient(baseUrl, auth)`
- `cookieAuth()` (web)
- `bearerTokenAuth(getToken)` (native)

## Build output (native-ready)

This package ships runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

When you change `packages/api-client/src/**`, rebuild the package outputs (from repo root):

- `npm run build:packages`

