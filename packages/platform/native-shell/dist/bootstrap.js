import {
  __require
} from "./chunk-3RG5ZIWI.js";

// src/bootstrap.ts
var hasZeego = false;
try {
  __require("zeego/dropdown-menu");
  hasZeego = true;
} catch {
  hasZeego = false;
}
if (hasZeego) {
  __require("@tamagui/native/setup-zeego");
}
try {
  const originalDefineProperty = Object.defineProperty.bind(Object);
  Object.defineProperty = ((obj, prop, descriptor) => {
    if (obj === globalThis && prop === "__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__") {
      try {
        if (descriptor && "value" in descriptor) {
          globalThis["__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__"] = descriptor.value;
        }
      } catch {
      }
      return obj;
    }
    return originalDefineProperty(obj, prop, descriptor);
  });
} catch {
}
try {
  const ErrorUtilsMaybe = globalThis.ErrorUtils;
  if (ErrorUtilsMaybe && typeof ErrorUtilsMaybe.setGlobalHandler === "function") {
    const previous = typeof ErrorUtilsMaybe.getGlobalHandler === "function" ? ErrorUtilsMaybe.getGlobalHandler() : null;
    ErrorUtilsMaybe.setGlobalHandler((error, isFatal) => {
      const e = error;
      console.error("[GlobalErrorHandler]", { isFatal, message: e?.message, stack: e?.stack });
      if (previous) previous(error, isFatal);
    });
  }
} catch {
}
