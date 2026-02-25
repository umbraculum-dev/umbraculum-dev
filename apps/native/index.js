// Zeego uses native modules and does not work in Expo Go.
// Only enable it when the Zeego JS entrypoints can be resolved.
let hasZeego = false;
try {
  require("zeego/dropdown-menu");
  hasZeego = true;
} catch {
  hasZeego = false;
}

if (hasZeego) {
  require("@tamagui/native/setup-zeego");
}

// Work around a React Native DevTools init crash seen in Expo Go / RN 0.81:
// `Object.defineProperty(global, '__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__', ...)` throwing
// "TypeError: property is not writable", which then cascades into a black screen.
// We only special-case this single property on `global` and otherwise preserve native behavior.
try {
  const originalDefineProperty = Object.defineProperty.bind(Object);
  Object.defineProperty = (obj, prop, descriptor) => {
    if (obj === global && prop === "__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__") {
      // Avoid defineProperty entirely: in some Expo Go / RN 0.81 environments this throws and
      // prevents React Native from booting (black screen).
      try {
        if (descriptor && "value" in descriptor) {
          // eslint-disable-next-line no-underscore-dangle
          global.__FUSEBOX_REACT_DEVTOOLS_DISPATCHER__ = descriptor.value;
        }
      } catch {
        // ignore
      }
      return obj;
    }
    return originalDefineProperty(obj, prop, descriptor);
  };
} catch {
  // ignore
}

// When the app crashes very early (black screen), RedBox may never render.
// This prints a real stack trace to Metro logs so we can pinpoint the failing module.
try {
  const ErrorUtilsMaybe = global.ErrorUtils;
  if (ErrorUtilsMaybe && typeof ErrorUtilsMaybe.setGlobalHandler === "function") {
    const previous =
      typeof ErrorUtilsMaybe.getGlobalHandler === "function" ? ErrorUtilsMaybe.getGlobalHandler() : null;
    ErrorUtilsMaybe.setGlobalHandler((error, isFatal) => {
      // eslint-disable-next-line no-console
      console.error("[GlobalErrorHandler]", { isFatal, message: error?.message, stack: error?.stack });
      if (previous) previous(error, isFatal);
    });
  }
} catch {
  // ignore
}

// IMPORTANT: use require() (not import) so the workaround above runs
// before Expo/React Native initialization in this environment.
const registerRootComponentModule = require("expo/src/launch/registerRootComponent");
const registerRootComponent = registerRootComponentModule.default ?? registerRootComponentModule;
const App = require("./App").default;
registerRootComponent(App);

