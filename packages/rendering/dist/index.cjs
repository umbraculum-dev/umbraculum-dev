"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ExcelJS: () => import_exceljs.default,
  GotenbergRequestError: () => GotenbergRequestError,
  RENDER_CONTENT_TYPES: () => RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS: () => RENDER_FILE_EXTENSIONS,
  RenderingAdapterError: () => RenderingAdapterError,
  TemplateRenderError: () => TemplateRenderError,
  UnsupportedRenderKindError: () => UnsupportedRenderKindError,
  createGotenbergClient: () => createGotenbergClient,
  renderBarcode: () => renderBarcode,
  renderCsv: () => renderCsv,
  renderEtaHtmlArtifact: () => renderEtaHtmlArtifact,
  renderEtaTemplate: () => renderEtaTemplate,
  renderMjmlHtmlArtifact: () => renderMjmlHtmlArtifact,
  renderMjmlToHtml: () => renderMjmlToHtml,
  renderQr: () => renderQr,
  renderXlsxWorkbook: () => renderXlsxWorkbook,
  renderXml: () => renderXml
});
module.exports = __toCommonJS(index_exports);

// src/adapterTypes.ts
var RENDER_CONTENT_TYPES = {
  csv: "text/csv; charset=utf-8",
  html: "text/html; charset=utf-8",
  pdf: "application/pdf",
  png: "image/png",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml; charset=utf-8"
};
var RENDER_FILE_EXTENSIONS = {
  csv: "csv",
  html: "html",
  pdf: "pdf",
  png: "png",
  xlsx: "xlsx",
  xml: "xml"
};

// src/errors.ts
var RenderingAdapterError = class extends Error {
  code;
  constructor(message, options = {}) {
    super(message);
    this.name = "RenderingAdapterError";
    this.code = options.code ?? "RENDERING_ADAPTER_ERROR";
    if (options.cause !== void 0) {
      this.cause = options.cause;
    }
  }
};
var TemplateRenderError = class extends RenderingAdapterError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code ?? "TEMPLATE_RENDER_ERROR",
      ...options.cause !== void 0 ? { cause: options.cause } : {}
    });
    this.name = "TemplateRenderError";
  }
};
var GotenbergRequestError = class extends RenderingAdapterError {
  statusCode;
  bodyExcerpt;
  constructor(statusCode, bodyExcerpt) {
    super(`Gotenberg request failed with HTTP ${statusCode}`, {
      code: "GOTENBERG_REQUEST_ERROR"
    });
    this.name = "GotenbergRequestError";
    this.statusCode = statusCode;
    this.bodyExcerpt = bodyExcerpt;
  }
};
var UnsupportedRenderKindError = class extends RenderingAdapterError {
  kind;
  constructor(kind) {
    super(`Unsupported render kind "${kind}"`, {
      code: "UNSUPPORTED_RENDER_KIND"
    });
    this.name = "UnsupportedRenderKindError";
    this.kind = kind;
  }
};

// src/templates/eta.ts
var import_eta = require("eta");

// src/utils/bytes.ts
var textEncoder = new TextEncoder();
function stringToUtf8Bytes(value) {
  return textEncoder.encode(value);
}
function arrayBufferToUint8Array(value) {
  return new Uint8Array(value);
}
function nodeBufferToUint8Array(value) {
  return new Uint8Array(value);
}
function uint8ArrayToArrayBuffer(value) {
  const copy = new Uint8Array(value);
  return copy.buffer;
}
function unknownChunkToUint8Array(chunk) {
  if (typeof chunk === "string") {
    return stringToUtf8Bytes(chunk);
  }
  if (chunk instanceof Uint8Array) {
    return nodeBufferToUint8Array(chunk);
  }
  if (chunk instanceof ArrayBuffer) {
    return arrayBufferToUint8Array(chunk);
  }
  throw new TypeError("Expected string, Uint8Array, or ArrayBuffer chunk");
}
function concatUint8Arrays(chunks) {
  const byteLength = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

// src/templates/eta.ts
function renderEtaTemplate(template, data, options = {}) {
  try {
    const eta = new import_eta.Eta({
      autoEscape: options.autoEscape ?? true
    });
    const rendered = eta.renderString(template, data);
    return String(rendered);
  } catch (error) {
    throw new TemplateRenderError("Eta template render failed", {
      code: "ETA_TEMPLATE_RENDER_ERROR",
      cause: error
    });
  }
}
function renderEtaHtmlArtifact(template, data, options = {}) {
  return {
    kind: "html",
    contentType: RENDER_CONTENT_TYPES.html,
    filenameExtension: RENDER_FILE_EXTENSIONS.html,
    body: stringToUtf8Bytes(renderEtaTemplate(template, data, options))
  };
}

// src/templates/mjml.ts
var import_mjml = __toESM(require("mjml"), 1);
function normalizeMjmlError(error) {
  return {
    ...error.line !== void 0 ? { line: error.line } : {},
    message: error.message ?? "MJML validation error",
    ...error.tagName !== void 0 ? { tagName: error.tagName } : {},
    ...error.formattedMessage !== void 0 ? { formattedMessage: error.formattedMessage } : {}
  };
}
async function renderMjmlToHtml(mjml, options = {}) {
  try {
    const result = await (0, import_mjml.default)(mjml, {
      validationLevel: options.validationLevel ?? "soft",
      minify: options.minify ?? false
    });
    const errors = (result.errors ?? []).map(
      (error) => normalizeMjmlError(error)
    );
    return {
      html: result.html,
      errors
    };
  } catch (error) {
    throw new TemplateRenderError("MJML render failed", {
      code: "MJML_TEMPLATE_RENDER_ERROR",
      cause: error
    });
  }
}
async function renderMjmlHtmlArtifact(mjml, options = {}) {
  const result = await renderMjmlToHtml(mjml, options);
  return {
    kind: "html",
    contentType: RENDER_CONTENT_TYPES.html,
    filenameExtension: RENDER_FILE_EXTENSIONS.html,
    body: stringToUtf8Bytes(result.html)
  };
}

// src/data/csv.ts
var import_format = require("@fast-csv/format");
async function renderCsv(rows, options = {}) {
  const headers = options.headers !== void 0 ? [...options.headers] : void 0;
  const chunks = [];
  try {
    const csvStream = headers !== void 0 ? (0, import_format.format)({ headers }) : (0, import_format.format)(options.inferHeaders === true ? { headers: true } : {});
    const done = new Promise((resolve, reject) => {
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
      cause: error
    });
  }
  return {
    kind: "csv",
    contentType: RENDER_CONTENT_TYPES.csv,
    filenameExtension: RENDER_FILE_EXTENSIONS.csv,
    body: concatUint8Arrays(chunks)
  };
}

// src/data/xlsx.ts
var import_exceljs = __toESM(require("exceljs"), 1);
async function renderXlsxWorkbook(build, options = {}) {
  try {
    const workbook = new import_exceljs.default.Workbook();
    if (options.creator !== void 0) {
      workbook.creator = options.creator;
    }
    await build(workbook);
    const output = await workbook.xlsx.writeBuffer();
    return {
      kind: "xlsx",
      contentType: RENDER_CONTENT_TYPES.xlsx,
      filenameExtension: RENDER_FILE_EXTENSIONS.xlsx,
      body: unknownChunkToUint8Array(output)
    };
  } catch (error) {
    throw new RenderingAdapterError("XLSX render failed", {
      code: "XLSX_RENDER_ERROR",
      cause: error
    });
  }
}

// src/data/xml.ts
var import_xmlbuilder2 = require("xmlbuilder2");
function renderXml(input, options = {}) {
  try {
    const xml = (0, import_xmlbuilder2.create)({}, input).end({
      prettyPrint: options.prettyPrint ?? false,
      headless: options.headless ?? false
    });
    return {
      kind: "xml",
      contentType: RENDER_CONTENT_TYPES.xml,
      filenameExtension: RENDER_FILE_EXTENSIONS.xml,
      body: stringToUtf8Bytes(xml)
    };
  } catch (error) {
    throw new RenderingAdapterError("XML render failed", {
      code: "XML_RENDER_ERROR",
      cause: error
    });
  }
}

// src/barcode/bwip.ts
var import_bwip_js = __toESM(require("bwip-js"), 1);
async function renderBarcode(options) {
  try {
    const png = await import_bwip_js.default.toBuffer({
      bcid: options.bcid,
      text: options.text,
      scale: options.scale ?? 3,
      height: options.height ?? 10,
      includetext: options.includeText ?? false
    });
    return {
      kind: "barcode",
      contentType: RENDER_CONTENT_TYPES.png,
      filenameExtension: RENDER_FILE_EXTENSIONS.png,
      body: unknownChunkToUint8Array(png)
    };
  } catch (error) {
    throw new RenderingAdapterError("Barcode render failed", {
      code: "BARCODE_RENDER_ERROR",
      cause: error
    });
  }
}
async function renderQr(text, options = {}) {
  try {
    const png = await import_bwip_js.default.toBuffer({
      bcid: "qrcode",
      text,
      scale: options.scale ?? 3
    });
    return {
      kind: "qr",
      contentType: RENDER_CONTENT_TYPES.png,
      filenameExtension: RENDER_FILE_EXTENSIONS.png,
      body: unknownChunkToUint8Array(png)
    };
  } catch (error) {
    throw new RenderingAdapterError("QR render failed", {
      code: "QR_RENDER_ERROR",
      cause: error
    });
  }
}

// src/gotenberg/client.ts
var CHROMIUM_HTML_PATH = "/forms/chromium/convert/html";
var LIBREOFFICE_PATH = "/forms/libreoffice/convert";
var ERROR_EXCERPT_LIMIT = 500;
function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}
function gotenbergUrl(baseUrl, path) {
  return new URL(path.replace(/^\//, ""), normalizeBaseUrl(baseUrl)).toString();
}
async function responseToPdfArtifact(response) {
  if (!response.ok) {
    const text = await response.text();
    throw new GotenbergRequestError(
      response.status,
      text.slice(0, ERROR_EXCERPT_LIMIT)
    );
  }
  return {
    kind: "pdf",
    contentType: RENDER_CONTENT_TYPES.pdf,
    filenameExtension: RENDER_FILE_EXTENSIONS.pdf,
    body: arrayBufferToUint8Array(await response.arrayBuffer())
  };
}
function createGotenbergClient(options) {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (fetchImpl === void 0) {
    throw new RenderingAdapterError("Gotenberg client requires a fetch implementation", {
      code: "GOTENBERG_FETCH_MISSING"
    });
  }
  return {
    async renderHtmlToPdf(input) {
      const form = new FormData();
      form.append(
        "files",
        new Blob([input.html], { type: RENDER_CONTENT_TYPES.html }),
        input.filename ?? "index.html"
      );
      const response = await fetchImpl(gotenbergUrl(options.baseUrl, CHROMIUM_HTML_PATH), {
        method: "POST",
        body: form
      });
      return responseToPdfArtifact(response);
    },
    async convertOfficeToPdf(input) {
      const form = new FormData();
      form.append(
        "files",
        new Blob([uint8ArrayToArrayBuffer(input.body)], {
          type: input.contentType ?? "application/octet-stream"
        }),
        input.filename
      );
      const response = await fetchImpl(gotenbergUrl(options.baseUrl, LIBREOFFICE_PATH), {
        method: "POST",
        body: form
      });
      return responseToPdfArtifact(response);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExcelJS,
  GotenbergRequestError,
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  RenderingAdapterError,
  TemplateRenderError,
  UnsupportedRenderKindError,
  createGotenbergClient,
  renderBarcode,
  renderCsv,
  renderEtaHtmlArtifact,
  renderEtaTemplate,
  renderMjmlHtmlArtifact,
  renderMjmlToHtml,
  renderQr,
  renderXlsxWorkbook,
  renderXml
});
