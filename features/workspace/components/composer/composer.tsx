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
    <div className="mx-auto w-full max-w-3xl px-5 pb-4 pt-3 sm:px-8">
      <div className="border border-neutral-200 bg-white transition-colors focus-within:border-[#f36b3f]">
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
          className="max-h-40 min-h-20 w-full resize-none bg-transparent px-4 py-4 text-[12px] leading-6 text-neutral-800 outline-none placeholder:text-neutral-400 disabled:opacity-50 sm:text-[13px]"
        />

        <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`size-1.5 shrink-0 ${
                disabled ? "animate-pulse bg-[#f36b3f]" : "bg-neutral-300"
              }`}
            />

            <p className="truncate text-[10px] text-neutral-400">
              {disabled
                ? "Queryline is thinking..."
                : "Enter to send · Shift + Enter for a new line"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className="flex size-8 shrink-0 items-center justify-center bg-neutral-950 text-white transition-colors hover:bg-[#f36b3f] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            aria-label="Send message"
            title="Send message"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="size-4"
              aria-hidden="true"
            >
              <path
                d="M10 15V5M5.5 9.5L10 5L14.5 9.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] leading-5 text-neutral-400">
        Queryline can make mistakes. Verify important database operations.
      </p>
    </div>
  );
};
