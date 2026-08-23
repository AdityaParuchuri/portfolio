import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("/api/chat", () => {
  it("returns a real completion from Workers AI", async () => {
    const response = await exports.default.fetch("http://example.com/api/chat", {
      method: "POST",
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as { response?: string };
    expect(typeof data.response).toBe("string");
    expect(data.response!.length).toBeGreaterThan(0);
  }, 30000);
});
