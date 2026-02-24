/**
 * Minimal DOM-value shim for libraries that reference `HTMLElement` as a value.
 *
 * We intentionally do NOT include the full DOM lib in `apps/native/tsconfig.json`
 * to keep native code honest (no `window`/`document` by default).
 */
declare const HTMLElement: any;

