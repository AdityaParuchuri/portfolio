import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit } from "@/lib/rateLimit";

const WHISPER_MODEL = "@cf/openai/whisper-large-v3-turbo";

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, ip);
  if (!rateLimit.allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const arrayBuffer = await request.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");

  const result = await env.AI.run(WHISPER_MODEL, {
    audio: base64Audio,
  });

  return Response.json(result);
}
