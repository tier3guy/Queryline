"use client";

import MessageContent from "./message-content";
import type { ChatMessage } from "@/features/workspace/types";

interface ChatProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  activeAssistantId?: string | null;
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    title: "Explore my database",
    description: "Show me all tables and their structure.",
    prompt:
      "Show me all the tables in my database and explain their structure.",
  },
  {
    title: "Analyze my data",
    description: "Find useful insights from my data.",
    prompt: "Analyze my database and identify some interesting insights.",
  },
  {
    title: "Find records",
    description: "Search for specific records.",
    prompt: "Show me the 10 most recently created records.",
  },
  {
    title: "Understand relationships",
    description: "Explore connections between tables.",
    prompt: "Explain the relationships between the tables in my database.",
  },
];

function formatCellValue(value: unknown): string {
  if (value === null) {
    return "NULL";
  }

  if (value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function QueryExecution({
  execution,
}: {
  execution: NonNullable<ChatMessage["queryExecutions"]>[number];
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">
            {execution.query.trimStart().startsWith("{")
              ? "MongoDB Query"
              : "SQL Query"}
          </span>

          <span className="text-[10px] text-muted-foreground">
            Executed automatically
          </span>
        </div>

        <span
          className={
            execution.success
              ? "text-[11px] font-medium text-emerald-600"
              : "text-[11px] font-medium text-destructive"
          }
        >
          {execution.success ? "Successful" : "Failed"}
        </span>
      </div>

      <div className="overflow-x-auto bg-muted/20 p-4">
        <pre className="min-w-0 whitespace-pre-wrap break-all font-mono text-xs leading-6">
          {execution.query}
        </pre>
      </div>

      {execution.success && execution.result && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
            <span className="text-xs font-medium">Query results</span>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>{execution.result.rowCount} rows</span>

              <span>{execution.result.executionTime} ms</span>
            </div>
          </div>

          {execution.result.columns.length > 0 && (
            <div className="max-h-80 overflow-auto border-t border-border">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    {execution.result.columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap border-b border-border px-4 py-3 font-medium"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {execution.result.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-border last:border-0 hover:bg-muted/40"
                    >
                      {execution.result!.columns.map((column) => (
                        <td
                          key={column}
                          className="max-w-64 whitespace-nowrap px-4 py-3 text-muted-foreground"
                        >
                          <span className="block truncate">
                            {formatCellValue(row[column])}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {execution.result.rows.length === 0 && (
            <p className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
              The query executed successfully but returned no rows.
            </p>
          )}
        </>
      )}

      {!execution.success && (
        <div className="border-t border-border bg-destructive/5 px-4 py-3">
          <p className="text-xs text-destructive">
            {execution.error ?? "Query execution failed."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Chat({
  messages,
  isLoading = false,
  activeAssistantId = null,
  onSuggestionClick,
}: ChatProps) {
  if (messages.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12 sm:px-5">
        <div className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Queryline AI
          </p>

          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Your database,
            <br />
            <span className="text-muted-foreground">understood.</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            Ask questions in natural language. Explore your schema, execute
            queries, and understand your data without writing SQL.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <p className="text-sm font-medium">{suggestion.title}</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {suggestion.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5">
      <div className="space-y-8">
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          const isActiveAssistant = message.id === activeAssistantId;
          const isThinking =
            isAssistant && isActiveAssistant && isLoading && !message.content;

          return (
            <article
              key={message.id}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              {message.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm leading-6">
                  {message.content}
                </div>
              ) : (
                <div className="w-full min-w-0">
                  {isThinking ? (
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                      </div>

                      <span className="text-xs text-muted-foreground">
                        Queryline is thinking...
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="mb-3 text-xs font-semibold tracking-wide">
                        QUERYLINE
                      </p>

                      <MessageContent
                        content={message.content}
                        isStreaming={isActiveAssistant && isLoading}
                      />

                      {message.queryExecutions?.map((execution, index) => (
                        <QueryExecution
                          key={`${message.id}-${index}`}
                          execution={execution}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
