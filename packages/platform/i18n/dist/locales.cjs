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

// src/locales.ts
var locales_exports = {};
__export(locales_exports, {
  defaultLocale: () => defaultLocale,
  isLocale: () => isLocale,
  locales: () => locales
});
module.exports = __toCommonJS(locales_exports);
var locales = ["en", "it"];
var defaultLocale = "en";
function isLocale(value) {
  return locales.includes(value);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultLocale,
  isLocale,
  locales
});
