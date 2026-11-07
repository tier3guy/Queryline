"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function DatabaseChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Failed to get AI response.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">Queryline AI</h2>
          <p className="text-xs text-muted-foreground">
            Ask questions about your database
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium">PostgreSQL</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted">
              <span className="text-xl">✦</span>
            </div>

            <h3 className="text-lg font-semibold">
              What would you like to know?
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Ask Queryline AI to explore your database, generate SQL queries,
              and explain your data.
            </p>

            <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {[
                "Show me all available tables",
                "Describe the database schema",
                "Count the total number of records in each table",
                "Show me the latest 10 records",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="rounded-lg border px-3 py-3 text-left text-sm transition-colors hover:bg-muted"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
              Queryline is thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something about your database..."
              rows={1}
              disabled={loading}
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              ↑
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Enter to send · Shift + Enter for a new line
          </p>
        </form>
      </div>
    </div>
  );
};
