import { describe, expect, it } from "vitest";
import { GotenbergRequestError } from "../errors.js";
import { createGotenbergClient, type GotenbergFetch } from "./client.js";

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

interface FetchCall {
  readonly url: string;
  readonly init: RequestInit;
}

function successfulFetch(calls: FetchCall[]): GotenbergFetch {
  return (url, init) => {
    calls.push({ url, init });
    return Promise.resolve(
      new Response(PDF_BYTES, {
        status: 200,
        headers: { "content-type": "application/pdf" },
      }),
    );
  };
}

function expectFormDataBody(init: RequestInit): FormData {
  expect(init.method).toBe("POST");
  expect(init.body).toBeInstanceOf(FormData);
  return init.body as FormData;
}

describe("Gotenberg client", () => {
  it("constructs Chromium HTML-to-PDF requests", async () => {
    const calls: FetchCall[] = [];
    const client = createGotenbergClient({
      baseUrl: "http://gotenberg:3000",
      fetch: successfulFetch(calls),
    });

    const artifact = await client.renderHtmlToPdf({ html: "<h1>Hello</h1>" });

    expect(artifact.kind).toBe("pdf");
    expect(artifact.contentType).toBe("application/pdf");
    expect(artifact.filenameExtension).toBe("pdf");
    expect(artifact.body).toEqual(PDF_BYTES);
    expect(calls[0]?.url).toBe(
      "http://gotenberg:3000/forms/chromium/convert/html",
    );
    const form = expectFormDataBody(calls[0]?.init ?? {});
    const files = form.getAll("files");
    expect(files).toHaveLength(1);
    expect(files[0]).toBeInstanceOf(Blob);
  });

  it("constructs LibreOffice office-to-PDF requests", async () => {
    const calls: FetchCall[] = [];
    const client = createGotenbergClient({
      baseUrl: "http://gotenberg:3000/",
      fetch: successfulFetch(calls),
    });

    const artifact = await client.convertOfficeToPdf({
      body: new Uint8Array([1, 2, 3]),
      filename: "template.docx",
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    expect(artifact.body).toEqual(PDF_BYTES);
    expect(calls[0]?.url).toBe("http://gotenberg:3000/forms/libreoffice/convert");
    const form = expectFormDataBody(calls[0]?.init ?? {});
    expect(form.getAll("files")).toHaveLength(1);
  });

  it("maps non-2xx responses to stable request errors", async () => {
    const client = createGotenbergClient({
      baseUrl: "http://gotenberg:3000",
      fetch: () =>
        Promise.resolve(
          new Response("conversion failed because input was invalid", {
            status: 422,
          }),
        ),
    });

    await expect(client.renderHtmlToPdf({ html: "<h1>Hello</h1>" })).rejects.toThrow(
      GotenbergRequestError,
    );
    await expect(client.renderHtmlToPdf({ html: "<h1>Hello</h1>" })).rejects.toMatchObject(
      {
        code: "GOTENBERG_REQUEST_ERROR",
        statusCode: 422,
        bodyExcerpt: "conversion failed because input was invalid",
      },
    );
  });
});
