import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { dedupeKey, hashVisitor, logVisit, type VisitDb, type VisitKvStore } from "../lib/visitLog";

function createFakeKv(initial: Record<string, string> = {}): VisitKvStore {
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

interface FakeRow {
  visited_at: string;
  path: string;
  country: string | null;
  city: string | null;
  region: string | null;
  visitor_hash: string;
  referrer: string | null;
}

function createFakeDb(rows: FakeRow[] = []) {
  const db: VisitDb = {
    prepare(query: string) {
      return {
        bind(...values: unknown[]) {
          return {
            async run() {
              if (query.startsWith("INSERT")) {
                const [visited_at, path, country, city, region, visitor_hash, referrer] = values as [
                  string,
                  string,
                  string | null,
                  string | null,
                  string | null,
                  string,
                  string | null
                ];
                rows.push({ visited_at, path, country, city, region, visitor_hash, referrer });
              } else if (query.startsWith("DELETE")) {
                const [cutoff] = values as [string];
                for (let i = rows.length - 1; i >= 0; i--) {
                  if (rows[i].visited_at < cutoff) rows.splice(i, 1);
                }
              }
            },
          };
        },
      };
    },
  };
  return { db, rows };
}

describe("hashVisitor", () => {
  it("produces the same hash for the same ip and salt", async () => {
    const a = await hashVisitor("1.2.3.4", "salt");
    const b = await hashVisitor("1.2.3.4", "salt");
    expect(a).toBe(b);
  });

  it("produces different hashes for different ips", async () => {
    const a = await hashVisitor("1.2.3.4", "salt");
    const b = await hashVisitor("5.6.7.8", "salt");
    expect(a).not.toBe(b);
  });

  it("produces different hashes for different salts", async () => {
    const a = await hashVisitor("1.2.3.4", "salt-a");
    const b = await hashVisitor("1.2.3.4", "salt-b");
    expect(a).not.toBe(b);
  });
});

describe("dedupeKey", () => {
  it("buckets by visitor hash and date", () => {
    const now = new Date("2026-08-24T18:44:47.123Z");
    expect(dedupeKey("abc123", now)).toBe("visitseen:abc123:2026-08-24");
  });
});

describe("logVisit (fake kv/db)", () => {
  const now = new Date("2026-08-24T12:00:00.000Z");

  it("inserts a row on the first visit of the day", async () => {
    const kv = createFakeKv();
    const { db, rows } = createFakeDb();

    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", geo: { country: "US", city: "Boston", region: "MA" }, now });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ path: "/", country: "US", city: "Boston", region: "MA" });
  });

  it("records the referrer when one is provided", async () => {
    const kv = createFakeKv();
    const { db, rows } = createFakeDb();

    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", referrer: "https://google.com/search", now });

    expect(rows[0].referrer).toBe("https://google.com/search");
  });

  it("stores a null referrer when none is provided", async () => {
    const kv = createFakeKv();
    const { db, rows } = createFakeDb();

    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", now });

    expect(rows[0].referrer).toBeNull();
  });

  it("skips a second visit from the same ip on the same day", async () => {
    const kv = createFakeKv();
    const { db, rows } = createFakeDb();

    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", now });
    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", now: new Date(now.getTime() + 60_000) });

    expect(rows).toHaveLength(1);
  });

  it("logs distinct ips independently on the same day", async () => {
    const kv = createFakeKv();
    const { db, rows } = createFakeDb();

    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", now });
    await logVisit({ db, kv, ip: "5.6.7.8", salt: "salt", path: "/", now });

    expect(rows).toHaveLength(2);
  });

  it("logs again once the day rolls over", async () => {
    const kv = createFakeKv();
    const { db, rows } = createFakeDb();

    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", now });
    const nextDay = new Date("2026-08-25T12:00:00.000Z");
    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", now: nextDay });

    expect(rows).toHaveLength(2);
  });

  it("prunes rows older than the retention window", async () => {
    const kv = createFakeKv();
    const staleDate = new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000).toISOString();
    const { db, rows } = createFakeDb([
      { visited_at: staleDate, path: "/", country: null, city: null, region: null, visitor_hash: "old", referrer: null },
    ]);

    await logVisit({ db, kv, ip: "1.2.3.4", salt: "salt", path: "/", now });

    expect(rows.find((row) => row.visitor_hash === "old")).toBeUndefined();
  });
});

describe("logVisit (real Cloudflare bindings)", () => {
  it("round-trips through the actual VISITS_DB and RATE_LIMIT_KV bindings", async () => {
    const ip = `test-${crypto.randomUUID()}`;
    const now = new Date();

    await logVisit({
      db: env.VISITS_DB,
      kv: env.RATE_LIMIT_KV,
      ip,
      salt: "test-salt",
      path: "/",
      geo: { country: "US", city: "Boston", region: "MA" },
      referrer: "https://google.com/search",
      now,
    });

    const expectedHash = await hashVisitor(ip, "test-salt");
    const { results } = await env.VISITS_DB.prepare(
      "SELECT * FROM visits WHERE visitor_hash = ?"
    )
      .bind(expectedHash)
      .all();

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      path: "/",
      country: "US",
      city: "Boston",
      region: "MA",
      referrer: "https://google.com/search",
    });
  });
});
