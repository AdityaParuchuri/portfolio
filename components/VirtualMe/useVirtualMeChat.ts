"use client";

import { useCallback, useReducer, useRef, useState } from "react";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

type ChatStatus = "idle" | "recording" | "transcribing" | "thinking" | "streaming" | "error";

interface ChatState {
  messages: ChatTurn[];
  status: ChatStatus;
  error: string | null;
}

type ChatAction =
  | { type: "send"; text: string }
  | { type: "assistantDelta"; text: string }
  | { type: "assistantDone" }
  | { type: "recordingStart" }
  | { type: "transcribing" }
  | { type: "reset" }
  | { type: "error"; message: string };

function reducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "send":
      return {
        messages: [...state.messages, { role: "user", content: action.text }],
        status: "thinking",
        error: null,
      };
    case "assistantDelta": {
      const last = state.messages[state.messages.length - 1];
      const messages =
        last?.role === "assistant"
          ? [
              ...state.messages.slice(0, -1),
              { role: "assistant" as const, content: last.content + action.text },
            ]
          : [...state.messages, { role: "assistant" as const, content: action.text }];
      return { ...state, messages, status: "streaming" };
    }
    case "assistantDone":
      return { ...state, status: "idle" };
    case "recordingStart":
      return { ...state, status: "recording", error: null };
    case "transcribing":
      return { ...state, status: "transcribing" };
    case "reset":
      return { ...state, status: "idle" };
    case "error":
      return { ...state, status: "error", error: action.message };
  }
}

export function useVirtualMeChat() {
  const [state, dispatch] = useReducer(reducer, {
    messages: [],
    status: "idle",
    error: null,
  });
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const nextMessages: ChatTurn[] = [...state.messages, { role: "user", content: trimmed }];
      dispatch({ type: "send", text: trimmed });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line) continue;
            const event = JSON.parse(line) as { delta?: string; done?: true };
            if (event.delta) dispatch({ type: "assistantDelta", text: event.delta });
          }
        }

        dispatch({ type: "assistantDone" });
      } catch (err) {
        dispatch({
          type: "error",
          message: err instanceof Error ? err.message : "Something went wrong",
        });
      }
    },
    [state.messages]
  );

  const startRecording = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        dispatch({ type: "transcribing" });

        try {
          const response = await fetch("/api/transcribe", { method: "POST", body: blob });
          if (!response.ok) throw new Error(`Transcription failed: ${response.status}`);

          const data = (await response.json()) as { text?: string };
          const transcript = data.text?.trim();

          if (transcript) {
            await sendMessage(transcript);
          } else {
            setMicError("Couldn't make out what you said — try typing instead?");
            dispatch({ type: "reset" });
          }
        } catch (err) {
          setMicError(err instanceof Error ? err.message : "Transcription failed");
          dispatch({ type: "reset" });
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      dispatch({ type: "recordingStart" });
    } catch {
      setMicError("Microphone access denied — you can still type your question");
    }
  }, [sendMessage]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  return {
    messages: state.messages,
    status: state.status,
    error: state.error,
    micError,
    sendMessage,
    startRecording,
    stopRecording,
  };
}
