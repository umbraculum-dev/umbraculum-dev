import ExcelJS from "exceljs";
import {
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  type RenderedArtifact,
} from "../adapterTypes.js";
import { RenderingAdapterError } from "../errors.js";
import { unknownChunkToUint8Array } from "../utils/bytes.js";

export type XlsxWorkbookBuilder = (
  workbook: ExcelJS.Workbook,
) => void | Promise<void>;

export interface RenderXlsxOptions {
  readonly creator?: string;
}

export async function renderXlsxWorkbook(
  build: XlsxWorkbookBuilder,
  options: RenderXlsxOptions = {},
): Promise<RenderedArtifact> {
  try {
    const workbook = new ExcelJS.Workbook();
    if (options.creator !== undefined) {
      workbook.creator = options.creator;
    }
    await build(workbook);
    const output = await workbook.xlsx.writeBuffer();

    return {
      kind: "xlsx",
      contentType: RENDER_CONTENT_TYPES.xlsx,
      filenameExtension: RENDER_FILE_EXTENSIONS.xlsx,
      body: unknownChunkToUint8Array(output),
    };
  } catch (error) {
    throw new RenderingAdapterError("XLSX render failed", {
      code: "XLSX_RENDER_ERROR",
      cause: error,
    });
  }
}

export { ExcelJS };
