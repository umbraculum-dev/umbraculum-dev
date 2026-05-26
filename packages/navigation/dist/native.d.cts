import { RouteRef } from './index.cjs';

/**
 * Framework-agnostic native navigation target.
 * React Navigation (or any other navigator) should map `screen` strings to actual screens in `apps/native`.
 */
interface NativeRouteTarget {
    /**
     * Stable screen identifier (owned by the native app).
     */
    screen: string;
    /**
     * Native screen params (serializable).
     */
    params: Record<string, unknown>;
}
/**
 * Map a shared route ref into a native navigation target.
 *
 * Note: This function intentionally avoids importing React Navigation types so `@umbraculum/navigation` stays framework-agnostic.
 */
declare function routeToNativeTarget(ref: RouteRef): NativeRouteTarget;
/**
 * Convert a shared route ref into a deep-link path usable by native linking configuration.
 *
 * - Returns a non-locale-prefixed path (same as `routeToPath()`).
 * - The native app should prepend its own scheme/host and handle locale separately.
 */
declare function nativeLinkingPath(ref: RouteRef): string;

export { type NativeRouteTarget, nativeLinkingPath, routeToNativeTarget };
