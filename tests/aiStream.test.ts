import { describe, expect, it } from "vitest";
import { parseWorkersAiSseLine, toNdjsonStream } from "../lib/aiStream";

function fakeSseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${chunk}\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n"));
      controller.close();
    },
  });
}

async function drain(stream: ReadableStream<Uint8Array>): Promise<void> {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
}

describe("parseWorkersAiSseLine", () => {
  it("extracts delta text from a normal content chunk", () => {
    const line =
      'data: {"choices":[{"delta":{"content":"That"},"finish_reason":null,"index":0}],"response":"That"}';
    expect(parseWorkersAiSseLine(line)).toEqual({ type: "delta", text: "That" });
  });

  it("recognizes the [DONE] sentinel", () => {
    expect(parseWorkersAiSseLine("data: [DONE]")).toEqual({ type: "done" });
  });

  it("ignores blank lines", () => {
    expect(parseWorkersAiSseLine("")).toBeNull();
  });

  it("ignores lines that don't start with 'data: '", () => {
    expect(parseWorkersAiSseLine("event: ping")).toBeNull();
  });

  it("ignores the empty-choices summary chunk", () => {
    const line = 'data: {"choices":[],"usage":{"total_tokens":0}}';
    expect(parseWorkersAiSseLine(line)).toBeNull();
  });

  it("ignores the final response-only chunk with no choices field", () => {
    const line = 'data: {"response":"","usage":{"total_tokens":804}}';
    expect(parseWorkersAiSseLine(line)).toBeNull();
  });

  it("ignores the initial empty-content chunk", () => {
    const line = 'data: {"choices":[{"delta":{"content":"","role":"assistant"},"finish_reason":null}]}';
    expect(parseWorkersAiSseLine(line)).toBeNull();
  });

  it("returns null for malformed JSON instead of throwing", () => {
    expect(parseWorkersAiSseLine("data: {not valid json")).toBeNull();
  });

  it("handles a content chunk that also carries finish_reason: stop", () => {
    const line =
      'data: {"choices":[{"delta":{"content":" you."},"finish_reason":"stop","index":0}],"response":" you."}';
    expect(parseWorkersAiSseLine(line)).toEqual({ type: "delta", text: " you." });
  });
});

describe("toNdjsonStream onComplete", () => {
  it("fires once with the full accumulated text", async () => {
    const chunks = [
      '{"choices":[{"delta":{"content":"Hello"}}]}',
      '{"choices":[{"delta":{"content":", world"}}]}',
      '{"choices":[{"delta":{"content":"!"}}]}',
    ];

    const calls: string[] = [];
    const stream = toNdjsonStream(fakeSseStream(chunks), (fullText) => {
      calls.push(fullText);
    });

    await drain(stream);

    expect(calls).toEqual(["Hello, world!"]);
  });

  it("does not fire if no delta content was ever streamed", async () => {
    const calls: string[] = [];
    const stream = toNdjsonStream(fakeSseStream([]), (fullText) => {
      calls.push(fullText);
    });

    await drain(stream);

    expect(calls).toEqual([""]);
  });
});
