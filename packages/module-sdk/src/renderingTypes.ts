import type { ValidatedSchema } from "./validatedSchema.js";

export type RenderKind =
  | "pdf"
  | "xlsx"
  | "csv"
  | "docx"
  | "odt"
  | "html"
  | "json"
  | "xml"
  | "barcode"
  | "qr";

export type RenderVisibility = "workspace" | "public";

export type RenderDelivery =
  | { readonly mode: "stream-response" }
  | { readonly mode: "persist-to-media"; readonly visibility: RenderVisibility }
  | { readonly mode: "email"; readonly to: readonly string[]; readonly subject: string };

export type RenderStatus = "queued" | "running" | "succeeded" | "failed";

export interface RenderError {
  readonly code: string;
  readonly message: string;
}

export interface RenderResult {
  readonly jobId: string;
  readonly status: RenderStatus;
  readonly mediaAssetId?: string;
  readonly signedUrl?: string;
  readonly expiresAt?: string;
  readonly error?: RenderError;
}

export interface RenderJob<TData> {
  readonly kind: RenderKind;
  readonly templateRef: string;
  readonly data: TData;
  readonly locale?: string;
  readonly delivery: RenderDelivery;
}

export interface RenderRetryPolicy {
  readonly maxAttempts?: number;
  readonly backoffMs?: number;
  readonly maxBackoffMs?: number;
}

export interface RenderLogger {
  debug(message: string, fields?: Readonly<Record<string, unknown>>): void;
  info(message: string, fields?: Readonly<Record<string, unknown>>): void;
  warn(message: string, fields?: Readonly<Record<string, unknown>>): void;
  error(message: string, fields?: Readonly<Record<string, unknown>>): void;
}

export type RenderOutput = Uint8Array | ReadableStream<Uint8Array>;

export interface RenderContext {
  readonly workspaceId: string;
  readonly userId: string;
  readonly locale: string;
  readonly logger: RenderLogger;
}

export interface DocumentTemplate<TData> {
  readonly kind: RenderKind;
  readonly ref: string;
  readonly schema: ValidatedSchema<TData>;
  readonly maxSyncBytes?: number;
  readonly retryPolicy?: RenderRetryPolicy;
  render(data: TData, ctx: RenderContext): Promise<RenderOutput>;
}

export interface RegisteredDocumentTemplateSnapshot {
  readonly moduleCode: string;
  readonly ref: string;
  readonly kind: RenderKind;
}
