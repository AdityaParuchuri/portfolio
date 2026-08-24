import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { logChatTurn } from "../lib/chatLog";
import { hashVisitor, type VisitDb } from "../lib/visitLog";

interface FakeRow {
  created_at: string;
  visitor_hash: string;
  user_message: string;
  assistant_response: string;
}

function createFakeDb(rows: FakeRow[] = []) {
  const db: VisitDb = {
    prepare(query: string) {
      return {
        bind(...values: unknown[]) {
          return {
            async run() {
              if (query.startsWith("INSERT")) {
                const [created_at, visitor_hash, user_message, assistant_response] = values as [
                  string,
                  string,
                  string,
                  string
                ];
                rows.push({ created_at, visitor_hash, user_message, assistant_response });
              } else if (query.startsWith("DELETE")) {
                const [cutoff] = values as [string];
                for (let i = rows.length - 1; i >= 0; i--) {
                  if (rows[i].created_at < cutoff) rows.splice(i, 1);
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

describe("logChatTurn (fake db)", () => {
  const now = new Date("2026-08-24T12:00:00.000Z");

  it("inserts a row with the hashed visitor id", async () => {
    const { db, rows } = createFakeDb();

    await logChatTurn({
      db,
      ip: "1.2.3.4",
      salt: "salt",
      userMessage: "What do you work on?",
      assistantResponse: "I work on backend infra at Plaid.",
      now,
    });

    const expectedHash = await hashVisitor("1.2.3.4", "salt");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      visitor_hash: expectedHash,
      user_message: "What do you work on?",
      assistant_response: "I work on backend infra at Plaid.",
    });
  });

  it("logs every turn independently, unlike visit dedupe", async () => {
    const { db, rows } = createFakeDb();

    await logChatTurn({ db, ip: "1.2.3.4", salt: "salt", userMessage: "hi", assistantResponse: "hello", now });
    await logChatTurn({ db, ip: "1.2.3.4", salt: "salt", userMessage: "how are you", assistantResponse: "great", now });

    expect(rows).toHaveLength(2);
  });

  it("prunes rows older than the 30-day retention window", async () => {
    const staleDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const { db, rows } = createFakeDb([
      { created_at: staleDate, visitor_hash: "old", user_message: "old q", assistant_response: "old a" },
    ]);

    await logChatTurn({ db, ip: "1.2.3.4", salt: "salt", userMessage: "hi", assistantResponse: "hello", now });

    expect(rows.find((row) => row.visitor_hash === "old")).toBeUndefined();
  });

  it("keeps rows within the retention window", async () => {
    const recentDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { db, rows } = createFakeDb([
      { created_at: recentDate, visitor_hash: "recent", user_message: "q", assistant_response: "a" },
    ]);

    await logChatTurn({ db, ip: "1.2.3.4", salt: "salt", userMessage: "hi", assistantResponse: "hello", now });

    expect(rows.find((row) => row.visitor_hash === "recent")).toBeDefined();
  });
});

describe("logChatTurn (real Cloudflare bindings)", () => {
  it("round-trips through the actual VISITS_DB binding", async () => {
    const ip = `test-${crypto.randomUUID()}`;
    const now = new Date();

    await logChatTurn({
      db: env.VISITS_DB,
      ip,
      salt: "test-salt",
      userMessage: "Where do you work?",
      assistantResponse: "Plaid.",
      now,
    });

    const expectedHash = await hashVisitor(ip, "test-salt");
    const { results } = await env.VISITS_DB.prepare(
      "SELECT * FROM chat_messages WHERE visitor_hash = ?"
    )
      .bind(expectedHash)
      .all();

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      user_message: "Where do you work?",
      assistant_response: "Plaid.",
    });
  });
});
