export type ParsedChunk = { type: "delta"; text: string } | { type: "done" };

const DATA_PREFIX = "data: ";

export function parseWorkersAiSseLine(line: string): ParsedChunk | null {
  if (!line.startsWith(DATA_PREFIX)) return null;

  const payload = line.slice(DATA_PREFIX.length).trim();
  if (!payload) return null;
  if (payload === "[DONE]") return { type: "done" };

  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return null;
  }

  const content = (json as { choices?: { delta?: { content?: unknown } }[] })
    ?.choices?.[0]?.delta?.content;

  if (typeof content === "string" && content.length > 0) {
    return { type: "delta", text: content };
  }
  return null;
}

/**
 * Re-frames Workers AI's raw SSE stream as newline-delimited JSON:
 * one `{"delta":"..."}` line per token, then a final
 * `{"done":true,"fullText":"..."}` line. Keeps the client off SSE parsing.
 */
export function toNdjsonStream(aiStream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let fullText = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = aiStream.getReader();

      const flushLine = (line: string) => {
        const parsed = parseWorkersAiSseLine(line);
        if (!parsed) return;

        if (parsed.type === "delta") {
          fullText += parsed.text;
          controller.enqueue(encoder.encode(JSON.stringify({ delta: parsed.text }) + "\n"));
        } else {
          controller.enqueue(
            encoder.encode(JSON.stringify({ done: true, fullText }) + "\n")
          );
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) flushLine(line);
        }
        if (buffer) flushLine(buffer);
      } finally {
        controller.close();
      }
    },
  });
}
