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
  composeModuleTierLimitSlices,
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
  PLATFORM_RESERVED_ADDON_CODE_PREFIX,
  AddonCodeAlreadyRegisteredError,
  InvalidAddonCodeError,
  clearAddonCodeRegistryForTests,
  listRegisteredAddonCodes,
  snapshotAddonCodeOwnership,
} from "./addonCodes.js";

export {
  PLATFORM_RESERVED_TIER_LIMIT_KEYS,
  ReservedTierLimitKeyError,
  TierLimitKeyCollisionError,
  InvalidTierLimitKeyError,
  InvalidTierLimitValueError,
  listRegisteredTierLimitKeys,
} from "./tierLimits.js";

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
  BUILTIN_MODULE_CODES,
  InvalidModuleProfileError,
  isModuleEnabled,
  isVerticalInstalled,
  loadInstallationProfileManifest,
  resolveEnabledModuleCodes,
  resolveInstallManifestPath,
  resolveModuleProfile,
  resolveNativeAppCodes,
  resolvePrimaryNativeAppCode,
  resolveRepoRoot,
  type BuiltinModuleCode,
  type InstallationProfileId,
  type InstallationProfileManifest,
  type ModuleProfile,
} from "./enabledModules.js";

export {
  BUILTIN_WEB_MODULE_REGISTRATIONS,
  PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES,
  registerBuiltinWebModulesIfAbsent,
} from "./builtinWebModules.js";

export {
  composeWebSharedLayoutNavItems,
  type WebSharedLayoutNavItem,
} from "./composeWebSharedLayoutNav.js";

export {
  WEB_SHARED_LAYOUT_NOTICE_IDS,
  resolveWebSharedLayoutNotice,
  type WebSharedLayoutNoticeConfig,
  type WebSharedLayoutNoticeId,
  type WebSharedLayoutNoticeVariant,
} from "./resolveWebSharedLayoutNotice.js";

export type { ModuleNavLabelKey } from "@umbraculum/i18n-keys";
