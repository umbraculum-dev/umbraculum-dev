// src/manifest.generated.ts
var mediaManifest = {
  "yeast/dilution-1-100.png": { publicPath: "/media/yeast/dilution-1-100.d697cdbaee75.png", sha256: "d697cdbaee752b09137c0c5a51810b0fc6aec869124281d31b46d2c7fbf6595a", bytes: 6522 },
  "yeast/hemocytometer-5-squares.png": { publicPath: "/media/yeast/hemocytometer-5-squares.fe085a0d2bf9.png", sha256: "fe085a0d2bf9d595d1b4c95aa277f549b4e58b1fedfc1711d36901b9eba2993c", bytes: 10417 }
};

// src/manifest.ts
function isMediaAssetKey(value) {
  return Object.prototype.hasOwnProperty.call(mediaManifest, value);
}
function getMediaPublicPath(key) {
  return mediaManifest[key].publicPath;
}
function getMediaUrl(key, options) {
  const base = options.baseUrl.replace(/\/+$/, "");
  const path = getMediaPublicPath(key);
  return `${base}${path}`;
}

export {
  mediaManifest,
  isMediaAssetKey,
  getMediaPublicPath,
  getMediaUrl
};
