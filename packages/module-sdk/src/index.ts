export {
  RESERVED_CANONICAL_MODULE_CODES,
  isCanonicalModuleCode,
  type CanonicalModuleCode,
} from "./reservedCodes.js";

export type {
  BillingTierSlug,
  ModuleRouteRegistrar,
  RegisteredModuleSnapshot,
  RegisterModuleOptions,
  TierLimitsContributor,
  TierLimitsSlice,
} from "./types.js";

export {
  assertModuleCodeAvailable,
  assertValidModuleCode,
  clearModuleRegistryForTests,
  InvalidModuleCodeError,
  listRegisteredModules,
  ModuleCodeAlreadyRegisteredError,
  recordModuleRegistration,
  snapshotModule,
} from "./moduleRegistry.js";

export { registerModule } from "./registerModule.js";
export { clearWebModuleRegistryForTests, registerWebModule, type RegisterWebModuleOptions } from "./registerWebModule.js";

export { fromParser, type ValidatedSchema } from "./validatedSchema.js";
