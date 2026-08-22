import { describe, expect, it } from "vitest";
import { bio, timelineItems, projects, buildSystemPrompt } from "../lib/persona";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("includes the full bio", () => {
    expect(prompt).toContain(bio);
  });

  it("includes every timeline entry's title and organization", () => {
    for (const item of timelineItems) {
      expect(prompt).toContain(item.title);
      expect(prompt).toContain(item.organization);
    }
  });

  it("includes every project's title", () => {
    for (const project of projects) {
      expect(prompt).toContain(project.title);
    }
  });

  it("instructs the model to answer in first person as Aditya", () => {
    expect(prompt).toMatch(/first person/i);
    expect(prompt).toContain("Aditya");
  });

  it("instructs the model to keep answers short, since they're spoken aloud", () => {
    expect(prompt).toMatch(/concise|short|brief/i);
  });

  it("instructs the model to decline off-topic questions gracefully", () => {
    expect(prompt).toMatch(/off-topic|redirect|decline/i);
  });

  it("instructs the model not to invent facts outside the supplied content", () => {
    expect(prompt).toMatch(/don't|do not|never/i);
    expect(prompt).toMatch(/invent|fabricat|make up/i);
  });

  it("stays within a reasonable token budget (~1500 tokens, roughly 4 chars/token)", () => {
    expect(prompt.length).toBeLessThan(6000);
  });

  it("is deterministic across calls", () => {
    expect(buildSystemPrompt()).toBe(prompt);
  });
});
