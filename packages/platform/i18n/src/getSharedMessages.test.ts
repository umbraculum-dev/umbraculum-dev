import { describe, expect, it } from "vitest";

import { getSharedMessages } from "./index.js";

describe("getSharedMessages brewery merge gate", () => {
  it("merges brewery namespaces for reference profile (UMBRACULUM_MODULE_PROFILE)", () => {
    const messages = getSharedMessages("en", {
      env: { UMBRACULUM_MODULE_PROFILE: "reference" },
    });
    expect(messages).toHaveProperty("recipes");
    expect(messages).toHaveProperty("pim");
  });

  it("merges brewery namespaces when only EXPO_PUBLIC_UMBRACULUM_MODULE_PROFILE is set", () => {
    const messages = getSharedMessages("en", {
      env: { EXPO_PUBLIC_UMBRACULUM_MODULE_PROFILE: "reference" },
    });
    expect(messages).toHaveProperty("recipes");
  });

  it("omits brewery namespaces for platform profile", () => {
    const messages = getSharedMessages("en", {
      env: { UMBRACULUM_MODULE_PROFILE: "platform" },
    });
    expect(messages).not.toHaveProperty("recipes");
    expect(messages).toHaveProperty("pim");
  });

  it("omits brewery namespaces when profile env is unset (edge default)", () => {
    const messages = getSharedMessages("en", { env: {} });
    expect(messages).not.toHaveProperty("recipes");
    expect(messages).toHaveProperty("pim");
  });
});
