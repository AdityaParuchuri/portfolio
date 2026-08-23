import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { sampleSpeechBase64 } from "./fixtures/sampleSpeech";

// WebM/Opus (Chrome/Firefox/Edge's real MediaRecorder output) couldn't be
// produced locally -- no working ffmpeg or native Opus encoder on this
// machine -- and remains unverified until it's tested through a real browser
// recording in Phase 3. This fixture proves the Safari (AAC/MP4) path works.
const sampleAudio = Buffer.from(sampleSpeechBase64, "base64");

describe("/api/transcribe", () => {
  it("transcribes a real AAC/M4A audio clip via Whisper", async () => {
    const response = await exports.default.fetch("http://example.com/api/transcribe", {
      method: "POST",
      body: sampleAudio,
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as { text?: string };
    const text = data.text!.toLowerCase();
    expect(text).toContain("software engineer");
    expect(text).toContain("plaid");
  }, 30000);
});
