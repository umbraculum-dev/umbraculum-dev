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

// src/manifest.ts
var manifest_exports = {};
__export(manifest_exports, {
  getMediaPublicPath: () => getMediaPublicPath,
  getMediaUrl: () => getMediaUrl,
  isMediaAssetKey: () => isMediaAssetKey,
  mediaManifest: () => mediaManifest
});
module.exports = __toCommonJS(manifest_exports);

// src/manifest.generated.ts
var mediaManifest = {
  "yeast/dilution-1-100.png": { publicPath: "/media/yeast/dilution-1-100.d697cdbaee75.png", sha256: "d697cdbaee752b09137c0c5a51810b0fc6aec869124281d31b46d2c7fbf6595a", bytes: 6522 },
  "yeast/hemocytometer-5-squares.png": { publicPath: "/media/yeast/hemocytometer-5-squares.fe085a0d2bf9.png", sha256: "fe085a0d2bf9d595d1b4c95aa277f549b4e58b1fedfc1711d36901b9eba2993c", bytes: 10417 }
};

// src/manifest.ts
var manifestByKey = mediaManifest;
function isMediaAssetKey(value) {
  return Object.prototype.hasOwnProperty.call(mediaManifest, value);
}
function getMediaPublicPath(key) {
  const entry = manifestByKey[key];
  if (!entry) {
    throw new Error(`Unknown media asset key: ${String(key)}`);
  }
  return entry.publicPath;
}
function getMediaUrl(key, options) {
  const base = options.baseUrl.replace(/\/+$/, "");
  const path = getMediaPublicPath(key);
  return `${base}${path}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMediaPublicPath,
  getMediaUrl,
  isMediaAssetKey,
  mediaManifest
});
