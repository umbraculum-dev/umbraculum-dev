import type { RenderKind, RenderOutput } from "@umbraculum/module-sdk";

export const RENDER_CONTENT_TYPES = {
  csv: "text/csv; charset=utf-8",
  html: "text/html; charset=utf-8",
  pdf: "application/pdf",
  png: "image/png",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml; charset=utf-8",
} as const;

export const RENDER_FILE_EXTENSIONS = {
  csv: "csv",
  html: "html",
  pdf: "pdf",
  png: "png",
  xlsx: "xlsx",
  xml: "xml",
} as const;

export interface RenderedArtifact {
  readonly kind: RenderKind;
  readonly contentType: string;
  readonly filenameExtension: string;
  readonly body: RenderOutput;
}
