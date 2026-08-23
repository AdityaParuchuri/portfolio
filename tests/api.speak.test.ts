import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("/api/speak", () => {
  it("returns real MP3 audio bytes from Workers AI", async () => {
    const response = await exports.default.fetch("http://example.com/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello, I am Aditya, a software engineer at Plaid." }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/mpeg");

    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(bytes.length).toBeGreaterThan(1000);

    // MP3 frames start with a sync word: 11 set bits (0xFF followed by
    // 0xE0-0xFF), optionally preceded by an ID3 tag ("ID3" in ASCII).
    const isId3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const isMpegSync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
    expect(isId3 || isMpegSync).toBe(true);
  }, 30000);
});
