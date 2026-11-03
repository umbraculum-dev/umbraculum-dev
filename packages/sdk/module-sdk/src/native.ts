/**
 * React Native / Expo entry — registry helpers only.
 * Do not re-export install-profile / Node `fs` APIs from here; Metro cannot
 * bundle those for Expo Go (see apps/native brewery bootstrap).
 */

export {
  aggregateNativeAvailableRouteIds,
  clearNativeModuleRegistryForTests,
  listRegisteredNativeModules,
  registerNativeModule,
  type NativeRouteId,
  type RegisteredNativeModuleSnapshot,
  type RegisterNativeModuleOptions,
} from "./registerNativeModule.js";
