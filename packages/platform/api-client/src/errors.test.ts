import { describe, expect, it } from "vitest";

import type { ApiResponse } from "./client.js";
import { ApiClientError, messageFromApiResponse } from "./errors.js";

function res(partial: Pick<ApiResponse, "status" | "data">): ApiResponse {
  return {
    ok: false,
    ...partial,
  };
}

describe("messageFromApiResponse", () => {
  it("strips nginx HTML 502 bodies (no MSIE padding comments in message)", () => {
    const html = `<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.30.6</center>
</body>
</html>
<!-- a padding to disable MSIE and Chrome friendly error page -->
<!-- a padding to disable MSIE and Chrome friendly error page -->
`;
    const msg = messageFromApiResponse(res({ status: 502, data: html }));
    expect(msg).toBe("API unavailable (502): 502 Bad Gateway");
    expect(msg).not.toContain("padding");
    expect(msg).not.toContain("<html");
  });

  it("keeps JSON API error message fields", () => {
    expect(
      messageFromApiResponse(res({ status: 400, data: { message: "bad input", error: "Bad Request" } })),
    ).toBe("bad input");
  });

  it("ApiClientError uses the sanitized message", () => {
    const err = new ApiClientError(
      res({
        status: 502,
        data: "<html><head><title>502 Bad Gateway</title></head><body></body></html>",
      }),
    );
    expect(err.message).toBe("API unavailable (502): 502 Bad Gateway");
    expect(String(err)).toContain("API unavailable (502)");
    expect(String(err)).not.toContain("padding");
  });
});
