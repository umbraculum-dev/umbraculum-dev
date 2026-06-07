import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { ExcelJS, renderXlsxWorkbook } from "./xlsx.js";

type ExcelJsLoadInput = Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0];

function toExcelJsLoadInput(bytes: Uint8Array): ExcelJsLoadInput {
  // exceljs' load() type is pinned to an older Buffer shape; runtime accepts this Buffer.
  return Buffer.from(bytes) as unknown as ExcelJsLoadInput;
}

describe("XLSX adapter", () => {
  it("renders a workbook that exceljs can read back", async () => {
    const artifact = await renderXlsxWorkbook((workbook) => {
      const sheet = workbook.addWorksheet("Inventory");
      sheet.addRow(["sku", "quantity"]);
      sheet.addRow(["ABC-1", 42]);
    });

    expect(artifact.kind).toBe("xlsx");
    expect(artifact.contentType).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(artifact.filenameExtension).toBe("xlsx");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toExcelJsLoadInput(artifact.body as Uint8Array));
    const sheet = workbook.getWorksheet("Inventory");

    expect(sheet?.getCell("A2").value).toBe("ABC-1");
    expect(sheet?.getCell("B2").value).toBe(42);
  });
});
