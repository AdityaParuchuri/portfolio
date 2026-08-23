import { getCloudflareContext } from "@opennextjs/cloudflare";

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

export async function POST() {
  const { env } = await getCloudflareContext();

  const result = await env.AI.run(CHAT_MODEL, {
    messages: [{ role: "user", content: "Say hello in exactly five words." }],
  });

  return Response.json(result);
}
