declare const mediaManifest: {
    readonly "yeast/dilution-1-100.png": {
        readonly publicPath: "/media/yeast/dilution-1-100.d697cdbaee75.png";
        readonly sha256: "d697cdbaee752b09137c0c5a51810b0fc6aec869124281d31b46d2c7fbf6595a";
        readonly bytes: 6522;
    };
    readonly "yeast/hemocytometer-5-squares.png": {
        readonly publicPath: "/media/yeast/hemocytometer-5-squares.fe085a0d2bf9.png";
        readonly sha256: "fe085a0d2bf9d595d1b4c95aa277f549b4e58b1fedfc1711d36901b9eba2993c";
        readonly bytes: 10417;
    };
};

interface MediaAsset {
    /**
     * Stable key derived from the source path under `assets/**`.
     * Example: `yeast/dilution-1-100.png`.
     */
    key: string;
    /**
     * Public path under `/media/**` (hashed filename).
     * Example: `/media/yeast/dilution-1-100.<hash>.png`.
     */
    publicPath: string;
    /**
     * Hex-encoded SHA-256 of the file contents.
     */
    sha256: string;
    /**
     * File size in bytes.
     */
    bytes: number;
}
type MediaAssetKey = keyof typeof mediaManifest;
declare function isMediaAssetKey(value: string): value is MediaAssetKey;
declare function getMediaPublicPath(key: MediaAssetKey): string;
declare function getMediaUrl(key: MediaAssetKey, options: {
    baseUrl: string;
}): string;

export { type MediaAsset, type MediaAssetKey, getMediaPublicPath, getMediaUrl, isMediaAssetKey, mediaManifest };
