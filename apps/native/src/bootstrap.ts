// Zeego uses native modules and does not work in Expo Go.
// Only enable it when the Zeego JS entrypoints can be resolved.
let hasZeego = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("zeego/dropdown-menu");
  hasZeego = true;
} catch {
  hasZeego = false;
}

if (hasZeego) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@tamagui/native/setup-zeego");
}

// Work around a React Native DevTools init crash seen in Expo Go / RN 0.81:
// `Object.defineProperty(global, '__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__', ...)` throwing
// "TypeError: property is not writable", which then cascades into a black screen.
// We only special-case this single property on `global` and otherwise preserve native behavior.
try {
  const originalDefineProperty = Object.defineProperty.bind(Object);
  Object.defineProperty = ((obj: object, prop: PropertyKey, descriptor: PropertyDescriptor) => {
    if (obj === globalThis && prop === "__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__") {
      // Avoid defineProperty entirely: in some Expo Go / RN 0.81 environments this throws and
      // prevents React Native from booting (black screen).
      try {
        if (descriptor && "value" in descriptor) {
          (globalThis as Record<string, unknown>).__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__ = descriptor.value;
        }
      } catch {
        // ignore
      }
      return obj;
    }
    return originalDefineProperty(obj, prop, descriptor);
  }) as typeof Object.defineProperty;
} catch {
  // ignore
}

// When the app crashes very early (black screen), RedBox may never render.
// This prints a real stack trace to Metro logs so we can pinpoint the failing module.
type GlobalErrorHandler = (error: unknown, isFatal: boolean) => void;
type ErrorUtilsLike = {
  setGlobalHandler?: (handler: GlobalErrorHandler) => void;
  getGlobalHandler?: () => GlobalErrorHandler | null | undefined;
};
try {
  const ErrorUtilsMaybe = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (ErrorUtilsMaybe && typeof ErrorUtilsMaybe.setGlobalHandler === "function") {
    const previous =
      typeof ErrorUtilsMaybe.getGlobalHandler === "function" ? ErrorUtilsMaybe.getGlobalHandler() : null;
    ErrorUtilsMaybe.setGlobalHandler((error: unknown, isFatal: boolean) => {
      const e = error as { message?: unknown; stack?: unknown } | null | undefined;
      console.error("[GlobalErrorHandler]", { isFatal, message: e?.message, stack: e?.stack });
      if (previous) previous(error, isFatal);
    });
  }
} catch {
  // ignore
}

