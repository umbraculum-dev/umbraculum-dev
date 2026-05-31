/**
 * Recover from stale Docusaurus chunk references after a Cloudflare deploy.
 * Typical on mobile: cached HTML shell points at a removed /assets/js/*.js hash.
 * One guarded reload per tab session; see docs-site/static/_headers for cache policy.
 */
const CHUNK_ERROR_PATTERNS = [
  /Loading chunk \d+ failed/i,
  /Failed to fetch dynamically imported module/i,
  /Loading CSS chunk .* failed/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
];

const SESSION_KEY = 'umbraculum-docs-chunk-reload';

function isChunkLoadFailure(message: string): boolean {
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function reloadOnce(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (sessionStorage.getItem(SESSION_KEY)) {
    return;
  }
  sessionStorage.setItem(SESSION_KEY, '1');
  const url = new URL(window.location.href);
  url.searchParams.set('_r', String(Date.now()));
  window.location.replace(url.toString());
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const message = event.message ?? '';
    if (isChunkLoadFailure(message)) {
      reloadOnce();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      typeof reason === 'string'
        ? reason
        : reason instanceof Error
          ? reason.message
          : '';
    if (isChunkLoadFailure(message)) {
      reloadOnce();
    }
  });
}
