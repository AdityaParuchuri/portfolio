import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { checkRateLimit, rateLimitKey, type RateLimitStore } from "../lib/rateLimit";

function createFakeStore(initial: Record<string, string> = {}): RateLimitStore {
  const data = new Map(Object.entries(initial));
  return {
    async get(key) {
      return data.get(key) ?? null;
    },
    async put(key, value) {
      data.set(key, value);
    },
  };
}

describe("rateLimitKey", () => {
  it("buckets by IP and hour", () => {
    const now = new Date("2026-08-22T18:44:47.123Z");
    expect(rateLimitKey("1.2.3.4", now)).toBe("ratelimit:1.2.3.4:2026-08-22-18");
  });

  it("produces different keys for different hours", () => {
    const hourA = new Date("2026-08-22T18:59:59.000Z");
    const hourB = new Date("2026-08-22T19:00:01.000Z");
    expect(rateLimitKey("1.2.3.4", hourA)).not.toBe(rateLimitKey("1.2.3.4", hourB));
  });

  it("produces different keys for different IPs in the same hour", () => {
    const now = new Date("2026-08-22T18:00:00.000Z");
    expect(rateLimitKey("1.2.3.4", now)).not.toBe(rateLimitKey("5.6.7.8", now));
  });
});

describe("checkRateLimit (fake store)", () => {
  const now = new Date("2026-08-22T18:00:00.000Z");

  it("allows the first request", async () => {
    const store = createFakeStore();
    const result = await checkRateLimit(store, "1.2.3.4", now);
    expect(result.allowed).toBe(true);
  });

  it("decrements remaining as requests are made", async () => {
    const store = createFakeStore();
    const first = await checkRateLimit(store, "1.2.3.4", now);
    const second = await checkRateLimit(store, "1.2.3.4", now);
    expect(second.remaining).toBe(first.remaining - 1);
  });

  it("denies once the limit is reached", async () => {
    const store = createFakeStore();
    let last;
    for (let i = 0; i < 25; i++) {
      last = await checkRateLimit(store, "1.2.3.4", now);
    }
    expect(last!.allowed).toBe(false);
    expect(last!.remaining).toBe(0);
  });

  it("tracks separate IPs independently", async () => {
    const store = createFakeStore();
    for (let i = 0; i < 25; i++) {
      await checkRateLimit(store, "1.2.3.4", now);
    }
    const otherIp = await checkRateLimit(store, "9.9.9.9", now);
    expect(otherIp.allowed).toBe(true);
  });

  it("resets once the hour bucket changes", async () => {
    const store = createFakeStore();
    for (let i = 0; i < 25; i++) {
      await checkRateLimit(store, "1.2.3.4", now);
    }
    const nextHour = new Date("2026-08-22T19:00:00.000Z");
    const result = await checkRateLimit(store, "1.2.3.4", nextHour);
    expect(result.allowed).toBe(true);
  });

  it("writes with a 1-hour TTL", async () => {
    let capturedTtl: number | undefined;
    const store: RateLimitStore = {
      async get() {
        return null;
      },
      async put(_key, _value, options) {
        capturedTtl = options?.expirationTtl;
      },
    };
    await checkRateLimit(store, "1.2.3.4", now);
    expect(capturedTtl).toBe(3600);
  });
});

describe("checkRateLimit (real Cloudflare KV binding)", () => {
  it("round-trips through the actual RATE_LIMIT_KV namespace", async () => {
    const ip = `test-${crypto.randomUUID()}`;
    const now = new Date();

    const first = await checkRateLimit(env.RATE_LIMIT_KV, ip, now);
    expect(first.allowed).toBe(true);

    const second = await checkRateLimit(env.RATE_LIMIT_KV, ip, now);
    expect(second.remaining).toBe(first.remaining - 1);
  });
});
