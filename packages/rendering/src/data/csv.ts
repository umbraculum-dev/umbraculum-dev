import { format } from "@fast-csv/format";
import {
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  type RenderedArtifact,
} from "../adapterTypes.js";
import { RenderingAdapterError } from "../errors.js";
import { concatUint8Arrays, unknownChunkToUint8Array } from "../utils/bytes.js";

export interface RenderCsvOptions {
  readonly headers?: readonly string[];
  readonly inferHeaders?: boolean;
}

export async function renderCsv(
  rows: readonly Readonly<Record<string, unknown>>[],
  options: RenderCsvOptions = {},
): Promise<RenderedArtifact> {
  const headers = options.headers !== undefined ? [...options.headers] : undefined;
  const chunks: Uint8Array[] = [];

  try {
    const csvStream =
      headers !== undefined
        ? format({ headers })
        : format(options.inferHeaders === true ? { headers: true } : {});
    const done = new Promise<void>((resolve, reject) => {
      csvStream.on("data", (chunk) => {
        chunks.push(unknownChunkToUint8Array(chunk));
      });
      csvStream.on("error", (error) => {
        reject(error);
      });
      csvStream.on("end", () => {
        resolve();
      });
    });

    for (const row of rows) {
      csvStream.write(row);
    }
    csvStream.end();
    await done;
  } catch (error) {
    throw new RenderingAdapterError("CSV render failed", {
      code: "CSV_RENDER_ERROR",
      cause: error,
    });
  }

  return {
    kind: "csv",
    contentType: RENDER_CONTENT_TYPES.csv,
    filenameExtension: RENDER_FILE_EXTENSIONS.csv,
    body: concatUint8Arrays(chunks),
  };
}
