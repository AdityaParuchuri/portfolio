import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildSystemPrompt } from "@/lib/persona";
import { toNdjsonStream } from "@/lib/aiStream";
import { checkRateLimit } from "@/lib/rateLimit";
import { logChatTurn } from "@/lib/chatLog";

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const { env, ctx } = await getCloudflareContext();

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, ip);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  const { messages } = (await request.json()) as { messages: ChatMessage[] };

  try {
    const aiStream = await env.AI.run(CHAT_MODEL, {
      messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
      stream: true,
    });

    const userMessage = messages[messages.length - 1]?.content ?? "";

    return new Response(
      toNdjsonStream(aiStream, (fullText) => {
        if (!userMessage || !fullText) return;
        ctx.waitUntil(
          logChatTurn({
            db: env.VISITS_DB,
            ip,
            salt: env.VISITOR_HASH_SALT,
            userMessage,
            assistantResponse: fullText,
          })
        );
      }),
      { headers: { "content-type": "application/x-ndjson" } }
    );
  } catch (error) {
    // Workers AI's free tier caps out at 10,000 neurons/day account-wide; once
    // hit, env.AI.run throws rather than returning a normal response. Surface
    // this distinctly so the client can show a friendly message instead of a
    // generic "Request failed: 500".
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("neurons")) {
      return Response.json({ error: "quota_exhausted" }, { status: 503 });
    }
    console.error(error);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
