import { assertValidModuleCode } from "./moduleRegistry.js";

/**
 * Route IDs a module exposes on native. Must be valid `@umbraculum/navigation` RouteIds.
 * Declared as strings here to avoid a hard dependency from module-sdk on navigation.
 */
export type NativeRouteId = string;

export interface RegisterNativeModuleOptions {
  /** Module or vertical code (matches API `registerModule` code). */
  code: string;
  /**
   * RouteIds with real native screens for this module.
   * Aggregated into the native shell via `configureNativeRoutePolicy`.
   */
  availableRouteIds: readonly NativeRouteId[];
  /**
   * Optional tab label key (i18n) when this module contributes a primary tab.
   */
  tabEntry?: {
    labelKey: string;
    order?: number;
  };
}

export interface RegisteredNativeModuleSnapshot {
  code: string;
  availableRouteIds: readonly NativeRouteId[];
  tabEntry?: {
    labelKey: string;
    order?: number;
  };
}

const nativeModulesByCode = new Map<string, RegisteredNativeModuleSnapshot>();

/**
 * Parallel native-side registry (RFC-0002 §5). Records which RouteIds each
 * installed module promotes to `available` on native.
 */
export function registerNativeModule(
  options: RegisterNativeModuleOptions,
): RegisteredNativeModuleSnapshot {
  assertValidModuleCode(options.code);
  if (nativeModulesByCode.has(options.code)) {
    throw new Error(`registerNativeModule: module code "${options.code}" is already registered`);
  }

  const snapshot: RegisteredNativeModuleSnapshot = {
    code: options.code,
    availableRouteIds: [...options.availableRouteIds],
    ...(options.tabEntry !== undefined
      ? {
          tabEntry: {
            labelKey: options.tabEntry.labelKey,
            ...(options.tabEntry.order !== undefined ? { order: options.tabEntry.order } : {}),
          },
        }
      : {}),
  };

  nativeModulesByCode.set(options.code, snapshot);
  return snapshot;
}

export function listRegisteredNativeModules(): RegisteredNativeModuleSnapshot[] {
  return Array.from(nativeModulesByCode.keys())
    .sort()
    .map((code) => {
      const snapshot = nativeModulesByCode.get(code);
      if (snapshot === undefined) {
        throw new Error(`listRegisteredNativeModules: registry inconsistency for code "${code}"`);
      }
      return snapshot;
    });
}

/** Union of all `availableRouteIds` from registered native modules. */
export function aggregateNativeAvailableRouteIds(): readonly NativeRouteId[] {
  const ids = new Set<NativeRouteId>();
  for (const mod of nativeModulesByCode.values()) {
    for (const id of mod.availableRouteIds) {
      ids.add(id);
    }
  }
  return Array.from(ids).sort();
}

/** Test-only reset. */
export function clearNativeModuleRegistryForTests(): void {
  nativeModulesByCode.clear();
}
