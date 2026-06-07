declare const mediaManifest: {};

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
