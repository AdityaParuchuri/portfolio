import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildSystemPrompt } from "@/lib/persona";

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const { messages } = (await request.json()) as { messages: ChatMessage[] };

  const result = await env.AI.run(CHAT_MODEL, {
    messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
  });

  return Response.json(result);
}
