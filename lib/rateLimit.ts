export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

const LIMIT_PER_HOUR = 20;
const TTL_SECONDS = 3600;

export function rateLimitKey(ip: string, now: Date): string {
  const [datePart, timePart] = now.toISOString().split("T");
  const hour = timePart.slice(0, 2);
  return `ratelimit:${ip}:${datePart}-${hour}`;
}

export async function checkRateLimit(
  store: RateLimitStore,
  ip: string,
  now: Date = new Date()
): Promise<RateLimitResult> {
  const key = rateLimitKey(ip, now);
  const raw = await store.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= LIMIT_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  await store.put(key, String(count + 1), { expirationTtl: TTL_SECONDS });
  return { allowed: true, remaining: LIMIT_PER_HOUR - (count + 1) };
}
