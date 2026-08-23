"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useVirtualMeChat } from "./useVirtualMeChat";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { messages, status, sendMessage } = useVirtualMeChat();
  const [input, setInput] = useState("");

  const isBusy = status === "thinking" || status === "streaming";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    sendMessage(input);
    setInput("");
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

            <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
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

              {status === "thinking" && (
                <p className="text-sm text-gray-400">Thinking...</p>
              )}

              {status === "error" && (
                <p className="text-sm text-red-400">
                  Something went wrong. Try again?
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 accent-focus focus:outline-none"
              />
              <button
                type="submit"
                disabled={isBusy}
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
