import {
  RENDER_CONTENT_TYPES,
  RENDER_FILE_EXTENSIONS,
  type RenderedArtifact,
} from "../adapterTypes.js";
import { GotenbergRequestError, RenderingAdapterError } from "../errors.js";
import {
  arrayBufferToUint8Array,
  uint8ArrayToArrayBuffer,
} from "../utils/bytes.js";

export type GotenbergFetch = (
  url: string,
  init: RequestInit,
) => Promise<Response>;

export interface GotenbergClientOptions {
  readonly baseUrl: string;
  readonly fetch?: GotenbergFetch;
}

export interface HtmlToPdfInput {
  readonly html: string;
  readonly filename?: string;
}

export interface OfficeToPdfInput {
  readonly body: Uint8Array;
  readonly filename: string;
  readonly contentType?: string;
}

export interface GotenbergClient {
  renderHtmlToPdf(input: HtmlToPdfInput): Promise<RenderedArtifact>;
  convertOfficeToPdf(input: OfficeToPdfInput): Promise<RenderedArtifact>;
}

const CHROMIUM_HTML_PATH = "/forms/chromium/convert/html";
const LIBREOFFICE_PATH = "/forms/libreoffice/convert";
const ERROR_EXCERPT_LIMIT = 500;

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function gotenbergUrl(baseUrl: string, path: string): string {
  return new URL(path.replace(/^\//, ""), normalizeBaseUrl(baseUrl)).toString();
}

async function responseToPdfArtifact(response: Response): Promise<RenderedArtifact> {
  if (!response.ok) {
    const text = await response.text();
    throw new GotenbergRequestError(
      response.status,
      text.slice(0, ERROR_EXCERPT_LIMIT),
    );
  }

  return {
    kind: "pdf",
    contentType: RENDER_CONTENT_TYPES.pdf,
    filenameExtension: RENDER_FILE_EXTENSIONS.pdf,
    body: arrayBufferToUint8Array(await response.arrayBuffer()),
  };
}

export function createGotenbergClient(
  options: GotenbergClientOptions,
): GotenbergClient {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (fetchImpl === undefined) {
    throw new RenderingAdapterError("Gotenberg client requires a fetch implementation", {
      code: "GOTENBERG_FETCH_MISSING",
    });
  }

  return {
    async renderHtmlToPdf(input) {
      const form = new FormData();
      form.append(
        "files",
        new Blob([input.html], { type: RENDER_CONTENT_TYPES.html }),
        input.filename ?? "index.html",
      );

      const response = await fetchImpl(gotenbergUrl(options.baseUrl, CHROMIUM_HTML_PATH), {
        method: "POST",
        body: form,
      });
      return responseToPdfArtifact(response);
    },

    async convertOfficeToPdf(input) {
      const form = new FormData();
      form.append(
        "files",
        new Blob([uint8ArrayToArrayBuffer(input.body)], {
          type: input.contentType ?? "application/octet-stream",
        }),
        input.filename,
      );

      const response = await fetchImpl(gotenbergUrl(options.baseUrl, LIBREOFFICE_PATH), {
        method: "POST",
        body: form,
      });
      return responseToPdfArtifact(response);
    },
  };
}
