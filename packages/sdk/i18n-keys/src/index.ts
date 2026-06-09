export {
  RESERVED_PLATFORM_MESSAGE_ROOTS,
  composeModuleMessageKey,
  defaultModuleNavLabelKey,
  InvalidMessageSubkeySegmentError,
  InvalidModuleMessageRootError,
  isModuleNavLabelKey,
  isReservedPlatformMessageRoot,
  isValidModuleMessageRoot,
  MESSAGE_SUBKEY_SEGMENT_PATTERN,
  MODULE_MESSAGE_ROOT_PATTERN,
  moduleMessageRoot,
  NAV_MESSAGE_PREFIX,
  ReservedPlatformMessageRootError,
  assertValidModuleMessageRoot,
} from "./messageKeys.js";

export type {
  ModuleNavLabelKey,
  ModuleScopedMessageKey,
  PlatformMessageRoot,
} from "./messageKeys.js";
