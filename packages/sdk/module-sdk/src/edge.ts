/**
 * Edge / React Native–safe entry — no Node filesystem APIs.
 * Use from Next middleware, RSC, and Metro-bundled clients.
 */

export {
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  getBuiltinSegmentOwnerEdge,
  isModuleOwnedPathDenied,
  resolveEnabledModuleCodesEdge,
  type ModuleOwnedPathGateInput,
} from "./edgeEnabledModules.js";
