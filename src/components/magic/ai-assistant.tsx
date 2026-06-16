"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, X, Send, Sparkles } from "lucide-react";

// UI shell for the AI shopping assistant. Wiring to the AIGateway lands in M3;
// for now it shows the experience and explains it's coming.
export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hi! I'm the ASPORTS ZONE assistant. Ask me to find cricket gear, bats, shoes, or combos — where the trust builds!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const userText = input.trim();
    if (!userText || loading) return;
    const next = [...messages, { role: "user" as const, text: userText }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send conversation history (skip the seeded greeting).
        body: JSON.stringify({
          messages: next.slice(1).map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? data.error ?? "Sorry, something went wrong." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="fixed bottom-24 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#06070d] shadow-[0_10px_40px_-8px_var(--accent)] transition-transform hover:scale-110 md:bottom-6"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="glass fixed bottom-24 right-4 z-40 flex h-[min(28rem,calc(100dvh-9rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl md:bottom-6"
            role="dialog"
            aria-label="AI shopping assistant"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" /> ASPORTS ZONE AI
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close assistant" className="text-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`w-fit max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-[var(--accent)]/15 text-foreground"
                      : "mr-auto bg-[var(--surface-2)] text-muted"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="w-fit rounded-2xl bg-[var(--surface-2)] px-3 py-2 text-sm text-muted">
                  ASPORTS ZONE AI is thinking…
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-[var(--border)] p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask ASPORTS ZONE AI…"
                className="h-10 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                onClick={send}
                disabled={loading}
                aria-label="Send message"
                className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[#06070d] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
