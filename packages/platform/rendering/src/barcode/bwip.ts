import bwipjs from "bwip-js";
import {
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  type RenderedArtifact,
} from "../adapterTypes.js";
import { RenderingAdapterError } from "../errors.js";
import { unknownChunkToUint8Array } from "../utils/bytes.js";

export interface RenderBarcodeOptions {
  readonly bcid: string;
  readonly text: string;
  readonly scale?: number;
  readonly height?: number;
  readonly includeText?: boolean;
}

export interface RenderQrOptions {
  readonly scale?: number;
}

export async function renderBarcode(
  options: RenderBarcodeOptions,
): Promise<RenderedArtifact> {
  try {
    const png = await bwipjs.toBuffer({
      bcid: options.bcid,
      text: options.text,
      scale: options.scale ?? 3,
      height: options.height ?? 10,
      includetext: options.includeText ?? false,
    });

    return {
      kind: "barcode",
      contentType: RENDER_CONTENT_TYPES.png,
      filenameExtension: RENDER_FILE_EXTENSIONS.png,
      body: unknownChunkToUint8Array(png),
    };
  } catch (error) {
    throw new RenderingAdapterError("Barcode render failed", {
      code: "BARCODE_RENDER_ERROR",
      cause: error,
    });
  }
}

export async function renderQr(
  text: string,
  options: RenderQrOptions = {},
): Promise<RenderedArtifact> {
  try {
    const png = await bwipjs.toBuffer({
      bcid: "qrcode",
      text,
      scale: options.scale ?? 3,
    });

    return {
      kind: "qr",
      contentType: RENDER_CONTENT_TYPES.png,
      filenameExtension: RENDER_FILE_EXTENSIONS.png,
      body: unknownChunkToUint8Array(png),
    };
  } catch (error) {
    throw new RenderingAdapterError("QR render failed", {
      code: "QR_RENDER_ERROR",
      cause: error,
    });
  }
}
