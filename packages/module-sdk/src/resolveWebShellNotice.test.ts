import { describe, expect, it } from "vitest";

import { resolveWebShellNotice } from "./resolveWebShellNotice.js";

describe("resolveWebShellNotice", () => {
  it("returns null when env unset", () => {
    expect(resolveWebShellNotice({})).toBeNull();
    expect(resolveWebShellNotice({ NEXT_PUBLIC_WEB_SHELL_NOTICE_ID: "" })).toBeNull();
  });

  it("returns demo config when id is demo", () => {
    expect(
      resolveWebShellNotice({ NEXT_PUBLIC_WEB_SHELL_NOTICE_ID: "demo" }),
    ).toEqual({
      id: "demo",
      variant: "notice",
      dismissible: false,
    });
  });

  it("returns null for unknown ids", () => {
    expect(
      resolveWebShellNotice({ NEXT_PUBLIC_WEB_SHELL_NOTICE_ID: "staging-outage" }),
    ).toBeNull();
  });
});
