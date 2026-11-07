"use client";

import { useState } from "react";
import { askDatabase } from "@/features/ai/services/query-api";
import type { DatabaseConnectionConfig } from "@/lib/database/types";

interface DatabaseChatProps {
  connection: DatabaseConnectionConfig;
};

export function DatabaseChat({ connection }: DatabaseChatProps) {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");

      const response = await askDatabase({
        connection,
        message: message.trim(),
      });

      setAnswer(response.answer ?? "No response was returned.");
      setMessage("");
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

  return (
    <section className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask your database anything..."
          disabled={loading}
          className="min-w-0 flex-1 rounded-md border px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

      {answer && (
        <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
          {answer}
        </div>
      )}
    </section>
  );
};
