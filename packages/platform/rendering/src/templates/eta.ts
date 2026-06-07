import { Eta } from "eta";
import {
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  type RenderedArtifact,
} from "../adapterTypes.js";
import { TemplateRenderError } from "../errors.js";
import { stringToUtf8Bytes } from "../utils/bytes.js";

export interface RenderEtaTemplateOptions {
  readonly autoEscape?: boolean;
}

export function renderEtaTemplate(
  template: string,
  data: Readonly<Record<string, unknown>>,
  options: RenderEtaTemplateOptions = {},
): string {
  try {
    const eta = new Eta({
      autoEscape: options.autoEscape ?? true,
    });
    const rendered = eta.renderString(template, data);
    return String(rendered);
  } catch (error) {
    throw new TemplateRenderError("Eta template render failed", {
      code: "ETA_TEMPLATE_RENDER_ERROR",
      cause: error,
    });
  }
}

export function renderEtaHtmlArtifact(
  template: string,
  data: Readonly<Record<string, unknown>>,
  options: RenderEtaTemplateOptions = {},
): RenderedArtifact {
  return {
    kind: "html",
    contentType: RENDER_CONTENT_TYPES.html,
    filenameExtension: RENDER_FILE_EXTENSIONS.html,
    body: stringToUtf8Bytes(renderEtaTemplate(template, data, options)),
  };
}
