import { describe, expect, it } from "vitest";
import { parseWorkersAiSseLine } from "../lib/aiStream";

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
