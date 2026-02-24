"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/tamagui/config.native.ts
var config_native_exports = {};
__export(config_native_exports, {
  config: () => config,
  default: () => config_native_default
});
module.exports = __toCommonJS(config_native_exports);
var import_animations_react_native = require("@tamagui/animations-react-native");
var import_v5 = require("@tamagui/config/v5");
var import_tamagui = require("tamagui");
var config = (0, import_tamagui.createTamagui)({
  ...import_v5.defaultConfig,
  animations: (0, import_animations_react_native.createAnimations)({
    quick: {
      damping: 20,
      mass: 1.2,
      stiffness: 250
    },
    medium: {
      damping: 18,
      stiffness: 80
    },
    slow: {
      damping: 22,
      stiffness: 50
    }
  }),
  media: {
    ...import_v5.defaultConfig.media,
    narrow: { maxWidth: 880 },
    gtNarrow: { minWidth: 881 },
    mobile: { maxWidth: 520 },
    touch: { pointer: "coarse" }
  }
});
var config_native_default = config;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  config
});
