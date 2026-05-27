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

export type {
  DocumentTemplate,
  RegisteredDocumentTemplateSnapshot,
  RenderContext,
  RenderDelivery,
  RenderError,
  RenderJob,
  RenderKind,
  RenderLogger,
  RenderOutput,
  RenderResult,
  RenderRetryPolicy,
  RenderStatus,
  RenderVisibility,
} from "./renderingTypes.js";

export {
  assertModuleCodeAvailable,
  assertValidModuleCode,
  DocumentTemplateRefAlreadyRegisteredError,
  getRegisteredDocumentTemplate,
  clearModuleRegistryForTests,
  InvalidModuleCodeError,
  InvalidDocumentTemplateRefError,
  listRegisteredDocumentTemplates,
  listRegisteredModules,
  ModuleCodeAlreadyRegisteredError,
  recordModuleRegistration,
  registerRegisteredModuleAiTools,
  snapshotModule,
} from "./moduleRegistry.js";

export { registerModule } from "./registerModule.js";
export {
  clearWebModuleRegistryForTests,
  getSegmentOwner,
  InvalidUrlSegmentError,
  listOwnedUrlSegments,
  listRegisteredWebModules,
  NavEntryPrimarySegmentNotOwnedError,
  registerWebModule,
  snapshotSegmentOwnership,
  UrlSegmentAlreadyOwnedError,
  type RegisteredWebModuleSnapshot,
  type RegisterWebModuleOptions,
} from "./registerWebModule.js";

export {
  aggregateNativeAvailableRouteIds,
  clearNativeModuleRegistryForTests,
  listRegisteredNativeModules,
  registerNativeModule,
  type NativeRouteId,
  type RegisteredNativeModuleSnapshot,
  type RegisterNativeModuleOptions,
} from "./registerNativeModule.js";

export { fromParser, type ValidatedSchema } from "./validatedSchema.js";

export type { ModuleNavLabelKey } from "@umbraculum/i18n-keys";
