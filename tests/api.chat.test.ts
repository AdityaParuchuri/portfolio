import { env, exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { rateLimitKey } from "../lib/rateLimit";

function postChat(
  messages: { role: "user" | "assistant"; content: string }[],
  headers: Record<string, string> = {}
) {
  return exports.default.fetch("http://example.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ messages }),
  });
}

async function collectNdjson(response: Response): Promise<{ deltas: string[]; done: { done: true; fullText: string } }> {
  const text = await response.text();
  const lines = text.split("\n").filter(Boolean);
  const deltas: string[] = [];
  let doneEvent: { done: true; fullText: string } | undefined;

  for (const line of lines) {
    const event = JSON.parse(line);
    if (event.done) {
      doneEvent = event;
    } else {
      deltas.push(event.delta);
    }
  }

  if (!doneEvent) throw new Error("stream never emitted a done event");
  return { deltas, done: doneEvent };
}

describe("/api/chat", () => {
  it("streams NDJSON deltas that reassemble into the full response", async () => {
    const response = await postChat([{ role: "user", content: "Say hello in exactly five words." }]);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/x-ndjson");

    const { deltas, done } = await collectNdjson(response);
    expect(deltas.length).toBeGreaterThan(0);
    expect(done.fullText).toBe(deltas.join(""));
    expect(done.fullText.length).toBeGreaterThan(0);
  }, 30000);

  // Asserts on real LLM output content, so it's inherently probabilistic --
  // occasional flakiness here means the model phrased around naming the
  // company rather than a real regression. Rerun before assuming a break.
  it("answers using persona facts injected via the system prompt", async () => {
    const response = await postChat([
      { role: "user", content: "In one sentence, which company do you currently work at?" },
    ]);
    expect(response.status).toBe(200);

    const { done } = await collectNdjson(response);
    expect(done.fullText.toLowerCase()).toContain("plaid");
  }, 30000);

  it("returns 429 without calling AI once the per-IP hourly limit is reached", async () => {
    const testIp = `test-limit-${crypto.randomUUID()}`;
    const key = rateLimitKey(testIp, new Date());
    await env.RATE_LIMIT_KV.put(key, "20", { expirationTtl: 3600 });

    const response = await postChat(
      [{ role: "user", content: "hi" }],
      { "cf-connecting-ip": testIp }
    );

    expect(response.status).toBe(429);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("rate_limited");
  });
});
