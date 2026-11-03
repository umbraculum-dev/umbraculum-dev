import { ModuleNavLabelKey } from '@umbraculum/i18n-keys';

/**
 * Route IDs a module exposes on native. Must be valid `@umbraculum/navigation` RouteIds.
 * Declared as strings here to avoid a hard dependency from module-sdk on navigation.
 */
type NativeRouteId = string;
interface RegisterNativeModuleOptions {
    /** Module or vertical code (matches API `registerModule` code). */
    code: string;
    /**
     * RouteIds with real native screens for this module.
     * Aggregated into the native shell via `configureNativeRoutePolicy`.
     */
    availableRouteIds: readonly NativeRouteId[];
    /**
     * Optional tab label key (`nav.*` in locale bundles) when this module
     * contributes a primary tab. See `@umbraculum/i18n-keys`.
     */
    tabEntry?: {
        labelKey: ModuleNavLabelKey;
        order?: number;
    };
}
interface RegisteredNativeModuleSnapshot {
    code: string;
    availableRouteIds: readonly NativeRouteId[];
    tabEntry?: {
        labelKey: ModuleNavLabelKey;
        order?: number;
    };
}
/**
 * Parallel native-side registry (RFC-0002 §5). Records which RouteIds each
 * installed module promotes to `available` on native.
 */
declare function registerNativeModule(options: RegisterNativeModuleOptions): RegisteredNativeModuleSnapshot;
declare function listRegisteredNativeModules(): RegisteredNativeModuleSnapshot[];
/** Union of all `availableRouteIds` from registered native modules. */
declare function aggregateNativeAvailableRouteIds(): readonly NativeRouteId[];
/** Test-only reset. */
declare function clearNativeModuleRegistryForTests(): void;

export { type NativeRouteId, type RegisterNativeModuleOptions, type RegisteredNativeModuleSnapshot, aggregateNativeAvailableRouteIds, clearNativeModuleRegistryForTests, listRegisteredNativeModules, registerNativeModule };
