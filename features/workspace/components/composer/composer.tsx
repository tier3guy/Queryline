"use client";

import { useState } from "react";

interface ComposerProps {
  onSend: (message: string) => void | Promise<void>;
  disabled?: boolean;
};

export default function Composer({
  onSend,
  disabled = false,
}: ComposerProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || disabled) {
      return;
    }

    void onSend(trimmedMessage);
    setMessage("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 sm:px-5">
      <div className="rounded-2xl border border-border bg-background shadow-sm transition-shadow focus-within:border-foreground/20 focus-within:shadow-md">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask anything about your database..."
          rows={2}
          disabled={disabled}
          className="max-h-40 min-h-20 w-full resize-none bg-transparent px-4 py-3.5 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        <div className="flex items-center justify-between px-3 pb-3">
          <p className="text-[11px] text-muted-foreground">
            {disabled
              ? "Queryline is thinking..."
              : "Enter to send · Shift + Enter for a new line"}
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background transition-all hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send message"
          >
            <span className="text-lg">↑</span>
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        Queryline can make mistakes. Verify important database operations.
      </p>
    </div>
  );
};
