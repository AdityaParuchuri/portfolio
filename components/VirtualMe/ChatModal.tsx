"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, Send, Square, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useVirtualMeChat } from "./useVirtualMeChat";
import AudioReactiveAvatar from "./AudioReactiveAvatar";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const {
    messages,
    status,
    error,
    micError,
    isSpeaking,
    analyserRef,
    sendMessage,
    retryLastMessage,
    startRecording,
    stopRecording,
  } = useVirtualMeChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 60;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isNearBottomRef.current) return;
    // Instant, not smooth: a smooth scroll fires onScroll events mid-animation,
    // which handleScroll reads as the user having scrolled away, incorrectly
    // suppressing the next auto-scroll during rapid token-by-token streaming.
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const isRecording = status === "recording";
  const isCapped = status === "capped";
  const isBusy =
    status === "thinking" || status === "streaming" || status === "transcribing" || isCapped;
  const avatarState = isSpeaking
    ? "speaking"
    : status === "thinking" || status === "transcribing"
      ? "thinking"
      : "idle";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBusy || isRecording) return;
    sendMessage(input);
    setInput("");
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isBusy) {
      startRecording();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="glass w-full max-w-md rounded-2xl border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                <span className="gradient-text">Ask Aditya</span>
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AudioReactiveAvatar state={avatarState} analyserRef={analyserRef} />

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1"
            >
              {messages.length === 0 && status !== "thinking" && (
                <p className="text-sm text-gray-400">
                  Ask me anything about my background, projects, or experience.
                </p>
              )}

              {messages.map((turn, i) => (
                <div key={i} className={turn.role === "user" ? "text-right" : "text-left"}>
                  <p
                    className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[85%] text-left ${
                      turn.role === "user"
                        ? "glass"
                        : "accent-gradient-soft accent-text"
                    }`}
                  >
                    {turn.content}
                  </p>
                </div>
              ))}

              {status === "transcribing" && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transcribing...</span>
                </div>
              )}

              {status === "thinking" && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <span>{error}</span>
                  <button
                    onClick={retryLastMessage}
                    className="underline hover:text-red-300 transition-colors duration-200 shrink-0"
                  >
                    Try again
                  </button>
                </div>
              )}

              {isCapped && (
                <p className="text-sm text-gray-400">{error}</p>
              )}
            </div>

            {micError && (
              <p className="text-xs text-red-400 mb-2">{micError}</p>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isRecording ? "Listening..." : isCapped ? "Session complete" : "Ask a question..."
                }
                disabled={isRecording || isCapped}
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 accent-focus focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isBusy && !isRecording}
                className={`rounded-lg px-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "glass hover:bg-white/10"
                }`}
                aria-label={isRecording ? "Stop recording" : "Record a question"}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={isBusy || isRecording}
                className="btn-accent-solid rounded-lg px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
