"use client";

import { FormEvent, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const starterMessage: ChatMessage = {
  role: "assistant",
  content: "Hi! I can help with finding gear, placing a rental, or navigating GearUp support.",
};

const quickQuestions = [
  "How do I rent gear?",
  "How do I find the right gear?",
  "Where can I get booking help?",
];

export function SupportAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (message: string) => {
    const content = message.trim();
    if (!content || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          messages: nextMessages.slice(-10),
        }),
      });
      const result: { text?: string; error?: string; fallback?: boolean } = await response.json();
      if (!response.ok || !result.text) {
        throw new Error(result.error || "The assistant couldn't reply. Please try again.");
      }
      if (result.fallback) setUsingFallback(true);
      setMessages((current) => [...current, { role: "assistant", content: result.text! }]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The assistant couldn't reply. Please try again."
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="GearUp support assistant"
          className="mb-3 flex h-[min(70vh,34rem)] w-[min(92vw,24rem)] flex-col border border-line bg-paper shadow-xl"
        >
          <header className="flex items-center justify-between bg-forest px-4 py-3 text-paper">
            <div className="flex items-center gap-2">
              <Bot aria-hidden="true" className="h-5 w-5 text-signal" />
              <div>
                <h2 className="font-semibold">GearUp assistant</h2>
                <p className="text-xs text-paper/70">Gear rental and support guidance</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              className="rounded p-1 hover:bg-paper/10"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {usingFallback && (
              <p className="border border-line bg-canvas px-3 py-2 text-xs leading-5 text-ink-soft">
                AI is not configured yet. These are basic help answers; configure
                {" "}OPENAI_API_KEY to enable AI replies.
              </p>
            )}
            {messages.map((message, index) => (
              <p
                key={`${index}-${message.role}`}
                className={`max-w-[88%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-5 ${
                  message.role === "user"
                    ? "ml-auto bg-forest text-paper"
                    : "mr-auto border border-line bg-canvas text-ink"
                }`}
              >
                {message.content}
              </p>
            ))}

            {sending && (
              <p className="flex items-center gap-2 text-xs text-ink-soft">
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                Thinking…
              </p>
            )}
            {error && <p role="alert" className="text-sm text-rust-deep">{error}</p>}

            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void sendMessage(question)}
                    disabled={sending}
                    className="block w-full border border-line px-3 py-2 text-left text-xs text-forest transition-colors hover:border-rust hover:bg-canvas"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="px-4 pb-2 text-[11px] leading-4 text-ink-soft">
            Your messages are sent to OpenAI to generate replies. Don&apos;t share passwords,
            payment details, or private account information.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="assistant-message" className="sr-only">Message the GearUp assistant</label>
            <input
              ref={inputRef}
              id="assistant-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1200}
              placeholder="Ask a question…"
              className="min-w-0 flex-1 border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-rust"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Send message"
              className="inline-flex items-center justify-center bg-rust px-3 text-paper transition-colors hover:bg-rust-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close GearUp assistant" : "Chat with GearUp support"}
        className="ml-auto flex items-center gap-2 rounded-full bg-rust px-4 py-3 font-semibold text-paper shadow-lg transition-colors hover:bg-rust-deep"
      >
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <MessageCircle aria-hidden="true" className="h-5 w-5" />}
        <span className="text-sm">{open ? "Close" : "Ask GearUp"}</span>
      </button>
    </div>
  );
}
