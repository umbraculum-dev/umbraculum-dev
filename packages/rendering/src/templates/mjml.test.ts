import { describe, expect, it } from "vitest";
import { TemplateRenderError } from "../errors.js";
import { utf8BytesToString } from "../utils/bytes.js";
import { renderMjmlHtmlArtifact, renderMjmlToHtml } from "./mjml.js";

const VALID_MJML = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>Hello Umbraculum</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

describe("MJML adapter", () => {
  it("compiles MJML v5 markup to email-compatible HTML", async () => {
    const result = await renderMjmlToHtml(VALID_MJML);

    expect(result.errors).toEqual([]);
    expect(result.html.toLowerCase()).toContain("<!doctype html");
    expect(result.html).toContain("Hello Umbraculum");
  });

  it("returns HTML artifacts backed by UTF-8 bytes", async () => {
    const artifact = await renderMjmlHtmlArtifact(VALID_MJML);

    expect(artifact.kind).toBe("html");
    expect(artifact.contentType).toBe("text/html; charset=utf-8");
    expect(artifact.filenameExtension).toBe("html");
    expect(utf8BytesToString(artifact.body as Uint8Array)).toContain(
      "Hello Umbraculum",
    );
  });

  it("preserves validation warnings in soft mode", async () => {
    const result = await renderMjmlToHtml(
      "<mjml><mj-body><mj-unknown /></mj-body></mjml>",
    );

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.message).toContain("mj-unknown");
  });

  it("wraps fatal MJML validation failures in a stable adapter error", async () => {
    await expect(
      renderMjmlToHtml("<mjml><mj-body><mj-unknown /></mj-body></mjml>", {
        validationLevel: "strict",
      }),
    ).rejects.toThrow(TemplateRenderError);
    await expect(
      renderMjmlToHtml("<mjml><mj-body><mj-unknown /></mj-body></mjml>", {
        validationLevel: "strict",
      }),
    ).rejects.toMatchObject({ code: "MJML_TEMPLATE_RENDER_ERROR" });
  });
});
