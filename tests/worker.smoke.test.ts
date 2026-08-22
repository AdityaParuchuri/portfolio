import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("worker smoke test", () => {
  it("serves the homepage through the Workers runtime", async () => {
    const response = await exports.default.fetch("http://example.com/");
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain("Aditya Paruchuri");
  });
});
