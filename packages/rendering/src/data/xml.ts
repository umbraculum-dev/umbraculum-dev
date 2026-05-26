import { create } from "xmlbuilder2";
import {
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  type RenderedArtifact,
} from "../adapterTypes.js";
import { RenderingAdapterError } from "../errors.js";
import { stringToUtf8Bytes } from "../utils/bytes.js";

export type XmlScalar = string | number | boolean | null;
export type XmlDocumentInput =
  | string
  | {
      readonly [key: string]:
        | XmlScalar
        | readonly XmlScalar[]
        | XmlDocumentInput;
    };

export interface RenderXmlOptions {
  readonly prettyPrint?: boolean;
  readonly headless?: boolean;
}

export function renderXml(
  input: XmlDocumentInput,
  options: RenderXmlOptions = {},
): RenderedArtifact {
  try {
    const xml = create({}, input).end({
      prettyPrint: options.prettyPrint ?? false,
      headless: options.headless ?? false,
    });

    return {
      kind: "xml",
      contentType: RENDER_CONTENT_TYPES.xml,
      filenameExtension: RENDER_FILE_EXTENSIONS.xml,
      body: stringToUtf8Bytes(xml),
    };
  } catch (error) {
    throw new RenderingAdapterError("XML render failed", {
      code: "XML_RENDER_ERROR",
      cause: error,
    });
  }
}
