export interface VisitKvStore {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

export interface VisitDb {
  prepare(query: string): {
    bind(...values: unknown[]): { run(): Promise<unknown> };
  };
}

export interface VisitGeo {
  country?: string;
  city?: string;
  region?: string;
}

export interface LogVisitParams {
  db: VisitDb;
  kv: VisitKvStore;
  ip: string;
  salt: string;
  path: string;
  geo?: VisitGeo;
  referrer?: string;
  now?: Date;
}

const DEDUPE_TTL_SECONDS = 60 * 60 * 24;
const RETENTION_DAYS = 90;

export async function hashVisitor(ip: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}:${ip}`)
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function dedupeKey(visitorHash: string, now: Date): string {
  const date = now.toISOString().slice(0, 10);
  return `visitseen:${visitorHash}:${date}`;
}

export async function logVisit({
  db,
  kv,
  ip,
  salt,
  path,
  geo,
  referrer,
  now = new Date(),
}: LogVisitParams): Promise<void> {
  const visitorHash = await hashVisitor(ip, salt);
  const key = dedupeKey(visitorHash, now);

  const alreadySeen = await kv.get(key);
  if (alreadySeen) return;

  await kv.put(key, "1", { expirationTtl: DEDUPE_TTL_SECONDS });

  await db
    .prepare(
      "INSERT INTO visits (visited_at, path, country, city, region, visitor_hash, referrer) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      now.toISOString(),
      path,
      geo?.country ?? null,
      geo?.city ?? null,
      geo?.region ?? null,
      visitorHash,
      referrer ?? null
    )
    .run();

  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db
    .prepare("DELETE FROM visits WHERE visited_at < ?")
    .bind(cutoff.toISOString())
    .run();
}
