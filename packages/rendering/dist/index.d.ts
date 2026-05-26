import { RenderKind, RenderOutput } from '@umbraculum/module-sdk';
export { DocumentTemplate, RenderContext, RenderDelivery, RenderError, RenderJob, RenderKind, RenderLogger, RenderOutput, RenderResult, RenderRetryPolicy, RenderStatus, RenderVisibility } from '@umbraculum/module-sdk';
import ExcelJS from 'exceljs';
export { default as ExcelJS } from 'exceljs';

declare const RENDER_CONTENT_TYPES: {
    readonly csv: "text/csv; charset=utf-8";
    readonly html: "text/html; charset=utf-8";
    readonly pdf: "application/pdf";
    readonly png: "image/png";
    readonly xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    readonly xml: "application/xml; charset=utf-8";
};
declare const RENDER_FILE_EXTENSIONS: {
    readonly csv: "csv";
    readonly html: "html";
    readonly pdf: "pdf";
    readonly png: "png";
    readonly xlsx: "xlsx";
    readonly xml: "xml";
};
interface RenderedArtifact {
    readonly kind: RenderKind;
    readonly contentType: string;
    readonly filenameExtension: string;
    readonly body: RenderOutput;
}

interface RenderingAdapterErrorOptions {
    readonly code?: string;
    readonly cause?: unknown;
}
declare class RenderingAdapterError extends Error {
    readonly code: string;
    constructor(message: string, options?: RenderingAdapterErrorOptions);
}
declare class TemplateRenderError extends RenderingAdapterError {
    constructor(message: string, options?: RenderingAdapterErrorOptions);
}
declare class GotenbergRequestError extends RenderingAdapterError {
    readonly statusCode: number;
    readonly bodyExcerpt: string;
    constructor(statusCode: number, bodyExcerpt: string);
}
declare class UnsupportedRenderKindError extends RenderingAdapterError {
    readonly kind: string;
    constructor(kind: string);
}

interface RenderEtaTemplateOptions {
    readonly autoEscape?: boolean;
}
declare function renderEtaTemplate(template: string, data: Readonly<Record<string, unknown>>, options?: RenderEtaTemplateOptions): string;
declare function renderEtaHtmlArtifact(template: string, data: Readonly<Record<string, unknown>>, options?: RenderEtaTemplateOptions): RenderedArtifact;

type MjmlValidationLevel = "strict" | "soft" | "skip";
interface RenderMjmlOptions {
    readonly validationLevel?: MjmlValidationLevel;
    readonly minify?: boolean;
}
interface MjmlValidationMessage {
    readonly line?: number;
    readonly message: string;
    readonly tagName?: string;
    readonly formattedMessage?: string;
}
interface RenderMjmlResult {
    readonly html: string;
    readonly errors: readonly MjmlValidationMessage[];
}
declare function renderMjmlToHtml(mjml: string, options?: RenderMjmlOptions): Promise<RenderMjmlResult>;
declare function renderMjmlHtmlArtifact(mjml: string, options?: RenderMjmlOptions): Promise<RenderedArtifact>;

interface RenderCsvOptions {
    readonly headers?: readonly string[];
    readonly inferHeaders?: boolean;
}
declare function renderCsv(rows: readonly Readonly<Record<string, unknown>>[], options?: RenderCsvOptions): Promise<RenderedArtifact>;

type XlsxWorkbookBuilder = (workbook: ExcelJS.Workbook) => void | Promise<void>;
interface RenderXlsxOptions {
    readonly creator?: string;
}
declare function renderXlsxWorkbook(build: XlsxWorkbookBuilder, options?: RenderXlsxOptions): Promise<RenderedArtifact>;

type XmlScalar = string | number | boolean | null;
type XmlDocumentInput = string | {
    readonly [key: string]: XmlScalar | readonly XmlScalar[] | XmlDocumentInput;
};
interface RenderXmlOptions {
    readonly prettyPrint?: boolean;
    readonly headless?: boolean;
}
declare function renderXml(input: XmlDocumentInput, options?: RenderXmlOptions): RenderedArtifact;

interface RenderBarcodeOptions {
    readonly bcid: string;
    readonly text: string;
    readonly scale?: number;
    readonly height?: number;
    readonly includeText?: boolean;
}
interface RenderQrOptions {
    readonly scale?: number;
}
declare function renderBarcode(options: RenderBarcodeOptions): Promise<RenderedArtifact>;
declare function renderQr(text: string, options?: RenderQrOptions): Promise<RenderedArtifact>;

type GotenbergFetch = (url: string, init: RequestInit) => Promise<Response>;
interface GotenbergClientOptions {
    readonly baseUrl: string;
    readonly fetch?: GotenbergFetch;
}
interface HtmlToPdfInput {
    readonly html: string;
    readonly filename?: string;
}
interface OfficeToPdfInput {
    readonly body: Uint8Array;
    readonly filename: string;
    readonly contentType?: string;
}
interface GotenbergClient {
    renderHtmlToPdf(input: HtmlToPdfInput): Promise<RenderedArtifact>;
    convertOfficeToPdf(input: OfficeToPdfInput): Promise<RenderedArtifact>;
}
declare function createGotenbergClient(options: GotenbergClientOptions): GotenbergClient;

export { type GotenbergClient, type GotenbergClientOptions, type GotenbergFetch, GotenbergRequestError, type HtmlToPdfInput, type MjmlValidationLevel, type MjmlValidationMessage, type OfficeToPdfInput, RENDER_CONTENT_TYPES, RENDER_FILE_EXTENSIONS, type RenderBarcodeOptions, type RenderCsvOptions, type RenderEtaTemplateOptions, type RenderMjmlOptions, type RenderMjmlResult, type RenderQrOptions, type RenderXlsxOptions, type RenderXmlOptions, type RenderedArtifact, RenderingAdapterError, TemplateRenderError, UnsupportedRenderKindError, type XlsxWorkbookBuilder, type XmlDocumentInput, createGotenbergClient, renderBarcode, renderCsv, renderEtaHtmlArtifact, renderEtaTemplate, renderMjmlHtmlArtifact, renderMjmlToHtml, renderQr, renderXlsxWorkbook, renderXml };
