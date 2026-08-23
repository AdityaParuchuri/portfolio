import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

function postChat(messages: { role: "user" | "assistant"; content: string }[]) {
  return exports.default.fetch("http://example.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
}

describe("/api/chat", () => {
  it("returns a real completion from Workers AI", async () => {
    const response = await postChat([{ role: "user", content: "Say hello in exactly five words." }]);
    expect(response.status).toBe(200);

    const data = (await response.json()) as { response?: string };
    expect(typeof data.response).toBe("string");
    expect(data.response!.length).toBeGreaterThan(0);
  }, 30000);

  // Asserts on real LLM output content, so it's inherently probabilistic --
  // occasional flakiness here means the model phrased around naming the
  // company rather than a real regression. Rerun before assuming a break.
  it("answers using persona facts injected via the system prompt", async () => {
    const response = await postChat([
      { role: "user", content: "In one sentence, which company do you currently work at?" },
    ]);
    expect(response.status).toBe(200);

    const data = (await response.json()) as { response?: string };
    expect(data.response!.toLowerCase()).toContain("plaid");
  }, 30000);
});
