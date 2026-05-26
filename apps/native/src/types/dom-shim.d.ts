/**
 * Minimal DOM-value shim for libraries that reference `HTMLElement` as a value.
 *
 * We intentionally do NOT include the full DOM lib in `apps/native/tsconfig.json`
 * to keep native code honest (no `window`/`document` by default).
 */
// Must be assignable to the `Function` interface so consumers like
// `@tamagui/element` can use `x instanceof HTMLElement` in their type
// checks. Plain `unknown` is rejected by TS as the RHS of `instanceof`.
declare const HTMLElement: new (...args: never[]) => unknown;

