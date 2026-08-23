"use client";

import { useCallback, useReducer, useRef } from "react";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

type ChatStatus = "idle" | "thinking" | "streaming" | "error" | "capped";

interface ChatState {
  messages: ChatTurn[];
  status: ChatStatus;
  error: string | null;
}

const MAX_USER_TURNS = 15;
const CAP_MESSAGE =
  "We've covered a lot of ground! Feel free to explore the rest of the portfolio -- reload the page if you'd like to start a fresh conversation.";
const RATE_LIMIT_MESSAGE = "I'm getting a lot of questions right now -- try again in a bit!";

type ChatAction =
  | { type: "send"; text: string }
  | { type: "assistantDelta"; text: string }
  | { type: "assistantDone" }
  | { type: "capped" }
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
    case "capped":
      return { ...state, status: "capped", error: CAP_MESSAGE };
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
  const lastAttemptedTextRef = useRef<string>("");

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userTurnCount = state.messages.filter((m) => m.role === "user").length;
      if (userTurnCount >= MAX_USER_TURNS) {
        dispatch({ type: "capped" });
        return;
      }

      lastAttemptedTextRef.current = trimmed;
      const nextMessages: ChatTurn[] = [...state.messages, { role: "user", content: trimmed }];
      dispatch({ type: "send", text: trimmed });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (response.status === 429) {
          dispatch({ type: "error", message: RATE_LIMIT_MESSAGE });
          return;
        }
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

  const retryLastMessage = useCallback(() => {
    if (lastAttemptedTextRef.current) {
      void sendMessage(lastAttemptedTextRef.current);
    }
  }, [sendMessage]);

  return {
    messages: state.messages,
    status: state.status,
    error: state.error,
    sendMessage,
    retryLastMessage,
  };
}
