export interface RenderingAdapterErrorOptions {
  readonly code?: string;
  readonly cause?: unknown;
}

export class RenderingAdapterError extends Error {
  readonly code: string;

  constructor(message: string, options: RenderingAdapterErrorOptions = {}) {
    super(message);
    this.name = "RenderingAdapterError";
    this.code = options.code ?? "RENDERING_ADAPTER_ERROR";
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class TemplateRenderError extends RenderingAdapterError {
  constructor(message: string, options: RenderingAdapterErrorOptions = {}) {
    super(message, {
      code: options.code ?? "TEMPLATE_RENDER_ERROR",
      ...(options.cause !== undefined ? { cause: options.cause } : {}),
    });
    this.name = "TemplateRenderError";
  }
}

export class GotenbergRequestError extends RenderingAdapterError {
  readonly statusCode: number;
  readonly bodyExcerpt: string;

  constructor(statusCode: number, bodyExcerpt: string) {
    super(`Gotenberg request failed with HTTP ${statusCode}`, {
      code: "GOTENBERG_REQUEST_ERROR",
    });
    this.name = "GotenbergRequestError";
    this.statusCode = statusCode;
    this.bodyExcerpt = bodyExcerpt;
  }
}

export class UnsupportedRenderKindError extends RenderingAdapterError {
  readonly kind: string;

  constructor(kind: string) {
    super(`Unsupported render kind "${kind}"`, {
      code: "UNSUPPORTED_RENDER_KIND",
    });
    this.name = "UnsupportedRenderKindError";
    this.kind = kind;
  }
}
