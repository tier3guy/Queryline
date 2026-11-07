
"use client";

import type { ChatMessage } from "../../types";

interface ChatProps {
  messages: ChatMessage[];
  onSuggestionClick: (suggestion: string) => void;
};

const suggestions = [
  {
    title: "Explore my database",
    description: "Understand tables, relationships and schema.",
    prompt: "Give me an overview of my database schema.",
  },
  {
    title: "Analyze data",
    description: "Find trends and useful insights.",
    prompt: "Analyze the data and identify important trends.",
  },
  {
    title: "Find records",
    description: "Search and filter your database records.",
    prompt: "Show me the latest 10 records in my database.",
  },
  {
    title: "Write a query",
    description: "Generate queries using natural language.",
    prompt: "Help me write a query to find the top 10 customers.",
  },
];

export default function Chat({
  messages,
  onSuggestionClick,
}: ChatProps) {
  if (messages.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12">
        <div className="mb-8">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl font-semibold text-orange-500">
            q
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your data has answers.
            <br />
            <span className="font-serif font-normal italic text-muted-foreground">
              Just ask.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            Connect your database and start exploring it through natural
            language. Queryline helps you understand, analyze, and work
            with your data.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group rounded-xl border border-border p-4 text-left transition-all hover:border-foreground/20 hover:bg-muted/50"
            >
              <p className="text-sm font-medium transition-colors group-hover:text-orange-500">
                {suggestion.title}
              </p>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {suggestion.description}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Connect a database to start querying. AI-generated results may
          require verification.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-8">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-sm font-semibold text-orange-500">
              q
            </div>
          )}

          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "bg-muted text-foreground"
                : "text-foreground"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};
