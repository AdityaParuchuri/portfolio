import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildSystemPrompt } from "@/lib/persona";
import { toNdjsonStream } from "@/lib/aiStream";
import { checkRateLimit } from "@/lib/rateLimit";

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, ip);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  const { messages } = (await request.json()) as { messages: ChatMessage[] };

  const aiStream = await env.AI.run(CHAT_MODEL, {
    messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
    stream: true,
  });

  return new Response(toNdjsonStream(aiStream), {
    headers: { "content-type": "application/x-ndjson" },
  });
}
