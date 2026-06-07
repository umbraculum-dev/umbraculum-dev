import { describe, expect, it } from "vitest";
import { TemplateRenderError } from "../errors.js";
import { utf8BytesToString } from "../utils/bytes.js";
import { renderEtaHtmlArtifact, renderEtaTemplate } from "./eta.js";

describe("eta template adapter", () => {
  it("renders interpolated values with HTML escaping enabled by default", () => {
    const rendered = renderEtaTemplate("Hello <%= it.name %>", {
      name: "Ada & Bob",
    });

    expect(rendered).toBe("Hello Ada &amp; Bob");
  });

  it("can disable HTML escaping explicitly", () => {
    const rendered = renderEtaTemplate(
      "Hello <%= it.name %>",
      { name: "Ada & Bob" },
      { autoEscape: false },
    );

    expect(rendered).toBe("Hello Ada & Bob");
  });

  it("returns an HTML artifact with UTF-8 bytes", () => {
    const artifact = renderEtaHtmlArtifact("<h1><%= it.title %></h1>", {
      title: "Report",
    });

    expect(artifact.kind).toBe("html");
    expect(artifact.contentType).toBe("text/html; charset=utf-8");
    expect(artifact.filenameExtension).toBe("html");
    expect(utf8BytesToString(artifact.body as Uint8Array)).toBe("<h1>Report</h1>");
  });

  it("wraps eta failures in a stable adapter error", () => {
    expect(() => renderEtaTemplate("Hello <%= it.missing(", {})).toThrow(
      TemplateRenderError,
    );
    expect(() => renderEtaTemplate("Hello <%= it.missing(", {})).toThrow(
      expect.objectContaining({ code: "ETA_TEMPLATE_RENDER_ERROR" }),
    );
  });
});
