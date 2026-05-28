export {
  RESERVED_CANONICAL_MODULE_CODES,
  isCanonicalModuleCode,
  type CanonicalModuleCode,
} from "./reservedCodes.js";

export type {
  BillingTierSlug,
  ModuleAiPrompts,
  ModuleRouteRegistrar,
  RegisteredModulePromptSnapshot,
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
  AI_PROMPT_KNOWLEDGE_MAX_LENGTH,
  AI_PROMPT_MODULE_MAX_LENGTH,
  AI_PROMPT_ROUTE_MAX_LENGTH,
  AiPromptRouteKeyAlreadyRegisteredError,
  assertModuleCodeAvailable,
  assertValidModuleCode,
  collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts,
  collectRegisteredModulePromptOverlays,
  DocumentTemplateRefAlreadyRegisteredError,
  getRegisteredDocumentTemplate,
  clearModuleRegistryForTests,
  InvalidAiPromptOverlayError,
  InvalidDocumentTemplateRefError,
  InvalidModuleCodeError,
  listRegisteredDocumentTemplates,
  listRegisteredModules,
  ModuleCodeAlreadyRegisteredError,
  recordModuleRegistration,
  registerRegisteredModuleAiTools,
  resolveRoutePromptOverlay,
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

export {
  BUILTIN_WEB_MODULE_REGISTRATIONS,
  PLATFORM_WEB_SHELL_NAV_ENTRIES,
  registerBuiltinWebModulesIfAbsent,
} from "./builtinWebModules.js";

export {
  composeWebShellNavItems,
  type WebShellNavItem,
} from "./composeWebShellNav.js";

export type { ModuleNavLabelKey } from "@umbraculum/i18n-keys";
