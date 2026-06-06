import type {
  DocumentTemplate,
  RenderKind,
  RenderLogger,
  RenderOutput,
} from "@umbraculum/module-sdk";

import type { RenderingJobServiceDeps } from "./renderingJobService.js";

export interface RenderArtifactBytes {
  readonly kind: RenderKind;
  readonly contentType: string;
  readonly filenameExtension: string;
  readonly body: Uint8Array<ArrayBuffer>;
}

export async function renderTemplate<TData>(
  deps: RenderingJobServiceDeps,
  template: DocumentTemplate<TData>,
  data: TData,
  ctx: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly locale: string;
  },
): Promise<RenderArtifactBytes> {
  const output = await template.render(data, {
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    locale: ctx.locale,
    logger: renderLogger(deps),
  });
  const body = await renderOutputToBytes(output);
  const format = renderFormatForKind(template.kind);

  return {
    kind: template.kind,
    contentType: format.contentType,
    filenameExtension: format.filenameExtension,
    body,
  };
}

export function filenameForTemplate(
  template: Pick<DocumentTemplate<unknown>, "ref">,
  filenameExtension: string,
): string {
  const safeRef = template.ref
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
  return `${safeRef || "render"}.${filenameExtension}`;
}

function renderLogger(deps: RenderingJobServiceDeps): RenderLogger {
  return {
    debug: (message, fields) => deps.options.logger.debug(fields ?? {}, message),
    info: (message, fields) => deps.options.logger.info(fields ?? {}, message),
    warn: (message, fields) => deps.options.logger.warn(fields ?? {}, message),
    error: (message, fields) => deps.options.logger.error(fields ?? {}, message),
  };
}

async function renderOutputToBytes(output: RenderOutput): Promise<Uint8Array<ArrayBuffer>> {
  if (output instanceof Uint8Array) return copyToArrayBufferBytes(output);

  const reader = output.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    total += result.value.byteLength;
  }

  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

function copyToArrayBufferBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copied = new Uint8Array(bytes.byteLength);
  copied.set(bytes);
  return copied;
}

function renderFormatForKind(kind: RenderKind): {
  readonly contentType: string;
  readonly filenameExtension: string;
} {
  switch (kind) {
    case "pdf":
      return { contentType: "application/pdf", filenameExtension: "pdf" };
    case "xlsx":
      return {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filenameExtension: "xlsx",
      };
    case "csv":
      return { contentType: "text/csv; charset=utf-8", filenameExtension: "csv" };
    case "docx":
      return {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filenameExtension: "docx",
      };
    case "odt":
      return { contentType: "application/vnd.oasis.opendocument.text", filenameExtension: "odt" };
    case "html":
      return { contentType: "text/html; charset=utf-8", filenameExtension: "html" };
    case "xml":
      return { contentType: "application/xml; charset=utf-8", filenameExtension: "xml" };
    case "barcode":
    case "qr":
      return { contentType: "image/png", filenameExtension: "png" };
    case "json":
      return { contentType: "application/json; charset=utf-8", filenameExtension: "json" };
  }
}
