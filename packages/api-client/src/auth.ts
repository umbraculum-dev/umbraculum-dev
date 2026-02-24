/**
 * Auth strategies for API client.
 * - Cookie: browser sends session cookie automatically (credentials: same-origin).
 * - Bearer: native apps send Authorization: Bearer <token>.
 */

export interface AuthStrategy {
  getHeaders?: () => Record<string, string>;
  credentials?: RequestCredentials;
}

/**
 * Cookie-based auth for web. Browser sends sid cookie automatically.
 */
export function cookieAuth(): AuthStrategy {
  return {
    credentials: "same-origin",
  };
}

/**
 * Bearer token auth for native apps.
 * @param getToken - Returns the current token (e.g. from secure storage).
 */
export function bearerTokenAuth(getToken: () => string | null): AuthStrategy {
  return {
    getHeaders: (): Record<string, string> => {
      const token = getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    credentials: "omit",
  };
}
