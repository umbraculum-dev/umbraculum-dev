import { describe, expect, it } from "vitest";

import { classifyContractVersionSkew, parseSemVer } from "./version.js";

describe("CRP contract version helpers", () => {
  it("parses semantic versions with prerelease labels", () => {
    expect(parseSemVer("0.1.0-alpha.1")).toEqual({
      major: 0,
      minor: 1,
      patch: 0,
      prerelease: "alpha.1",
    });
  });

  it("classifies major, minor, patch, match, and unparseable skews", () => {
    expect(classifyContractVersionSkew("0.1.0-alpha.1")).toBe("match");
    expect(classifyContractVersionSkew("0.1.1")).toBe("patch");
    expect(classifyContractVersionSkew("0.2.0")).toBe("minor");
    expect(classifyContractVersionSkew("1.0.0")).toBe("major");
    expect(classifyContractVersionSkew("bad")).toBe("unparseable");
  });
});
