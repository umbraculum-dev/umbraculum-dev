import { describe, expect, it } from "vitest";

import { resolveWebSharedLayoutNotice } from "./resolveWebSharedLayoutNotice.js";

describe("resolveWebSharedLayoutNotice", () => {
  it("returns null when env unset", () => {
    expect(resolveWebSharedLayoutNotice({})).toBeNull();
    expect(resolveWebSharedLayoutNotice({ NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID: "" })).toBeNull();
  });

  it("returns demo config when id is demo", () => {
    expect(
      resolveWebSharedLayoutNotice({ NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID: "demo" }),
    ).toEqual({
      id: "demo",
      variant: "notice",
      dismissible: false,
    });
  });

  it("returns null for unknown ids", () => {
    expect(
      resolveWebSharedLayoutNotice({ NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID: "staging-outage" }),
    ).toBeNull();
  });
});
