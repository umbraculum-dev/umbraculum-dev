import mjml2html from "mjml";
import {
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  type RenderedArtifact,
} from "../adapterTypes.js";
import { TemplateRenderError } from "../errors.js";
import { stringToUtf8Bytes } from "../utils/bytes.js";

export type MjmlValidationLevel = "strict" | "soft" | "skip";

export interface RenderMjmlOptions {
  readonly validationLevel?: MjmlValidationLevel;
  readonly minify?: boolean;
}

export interface MjmlValidationMessage {
  readonly line?: number;
  readonly message: string;
  readonly tagName?: string;
  readonly formattedMessage?: string;
}

export interface RenderMjmlResult {
  readonly html: string;
  readonly errors: readonly MjmlValidationMessage[];
}

interface MjmlRawError {
  readonly line?: number;
  readonly message?: string;
  readonly tagName?: string;
  readonly formattedMessage?: string;
}

function normalizeMjmlError(error: MjmlRawError): MjmlValidationMessage {
  return {
    ...(error.line !== undefined ? { line: error.line } : {}),
    message: error.message ?? "MJML validation error",
    ...(error.tagName !== undefined ? { tagName: error.tagName } : {}),
    ...(error.formattedMessage !== undefined
      ? { formattedMessage: error.formattedMessage }
      : {}),
  };
}

export async function renderMjmlToHtml(
  mjml: string,
  options: RenderMjmlOptions = {},
): Promise<RenderMjmlResult> {
  try {
    const result = await mjml2html(mjml, {
      validationLevel: options.validationLevel ?? "soft",
      minify: options.minify ?? false,
    });
    const errors = (result.errors ?? []).map((error: MjmlRawError) =>
      normalizeMjmlError(error),
    );
    return {
      html: result.html,
      errors,
    };
  } catch (error) {
    throw new TemplateRenderError("MJML render failed", {
      code: "MJML_TEMPLATE_RENDER_ERROR",
      cause: error,
    });
  }
}

export async function renderMjmlHtmlArtifact(
  mjml: string,
  options: RenderMjmlOptions = {},
): Promise<RenderedArtifact> {
  const result = await renderMjmlToHtml(mjml, options);
  return {
    kind: "html",
    contentType: RENDER_CONTENT_TYPES.html,
    filenameExtension: RENDER_FILE_EXTENSIONS.html,
    body: stringToUtf8Bytes(result.html),
  };
}
