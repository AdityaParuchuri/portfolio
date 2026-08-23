import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit } from "@/lib/rateLimit";

const TTS_MODEL = "@cf/deepgram/aura-2-en";

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, ip);
  if (!rateLimit.allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const { text } = (await request.json()) as { text: string };

  // The type declares this as `string`, but the real runtime output is a
  // ReadableStream of MP3 bytes -- confirmed live, not assumed from types.
  const result = (await env.AI.run(TTS_MODEL, { text })) as unknown as ReadableStream;

  return new Response(result, {
    headers: { "content-type": "audio/mpeg" },
  });
}
