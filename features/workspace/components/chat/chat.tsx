"use client";

import MessageContent from "./message-content";
import Logo from "@/components/shared/logo/logo";
import type { ChatMessage } from "@/features/workspace/types";

interface ChatProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  activeAssistantId?: string | null;
  onSuggestionClick: (suggestion: string) => void;
};

const suggestions = [
  {
    title: "Explore my database",
    description: "Show me all tables and their structure.",
    prompt:
      "Show me all the tables in my database and explain their structure.",
    number: "01",
  },
  {
    title: "Analyze my data",
    description: "Find useful insights from my data.",
    prompt: "Analyze my database and identify some interesting insights.",
    number: "02",
  },
  {
    title: "Find records",
    description: "Search for specific records.",
    prompt: "Show me the 10 most recently created records.",
    number: "03",
  },
  {
    title: "Understand relationships",
    description: "Explore connections between tables.",
    prompt: "Explain the relationships between the tables in my database.",
    number: "04",
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

function AssistantError({
  error,
}: {
  error: NonNullable<ChatMessage["error"]>;
}) {
  const retryDate = error.retryAt ? new Date(error.retryAt) : null;
  const isValidRetryDate =
    retryDate !== null && !Number.isNaN(retryDate.getTime());

  return (
    <div
      role="alert"
      className="overflow-hidden border border-red-200 bg-red-50/50"
    >
      <div className="flex gap-3 p-4 sm:p-5">
        <div className="flex size-7 shrink-0 items-center justify-center border border-red-200 bg-white text-xs font-semibold text-red-600">
          !
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[13px] font-semibold text-red-800">
            {error.title}
          </p>

          <p className="text-[12px] leading-6 text-red-700/80">
            {error.message}
          </p>

          {error.code === "RATE_LIMITED" && isValidRetryDate && (
            <div className="border border-red-200 bg-white p-3">
              <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                Free model quota resets at
              </p>

              <p className="mt-1 text-[12px] font-medium text-neutral-800">
                {retryDate.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          )}

          {error.action && (
            <p className="border-t border-red-200 pt-3 text-[11px] leading-5 text-red-700/80">
              {error.action}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function QueryExecution({
  execution,
}: {
  execution: NonNullable<ChatMessage["queryExecutions"]>[number];
}) {
  const isMongoQuery = execution.query.trimStart().startsWith("{");

  return (
    <div className="mt-5 overflow-hidden border border-neutral-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-neutral-800">
            {isMongoQuery ? "MongoDB Query" : "SQL Query"}
          </span>

          <span className="border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-neutral-400">
            Executed
          </span>
        </div>

        <span
          className={`flex items-center gap-1.5 text-[10px] font-medium ${
            execution.success ? "text-neutral-600" : "text-red-600"
          }`}
        >
          <span
            className={`size-1.5 ${
              execution.success ? "bg-[#f36b3f]" : "bg-red-500"
            }`}
          />

          {execution.success ? "Successful" : "Failed"}
        </span>
      </div>

      <div className="overflow-x-auto bg-white p-4">
        <pre className="min-w-0 whitespace-pre-wrap break-all font-mono text-[11px] leading-6 text-neutral-700">
          {execution.query}
        </pre>
      </div>

      {execution.success && execution.result && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-[11px] font-semibold text-neutral-800">
              Query Results
            </span>

            <div className="flex items-center gap-3 text-[10px] tabular-nums text-neutral-400">
              <span>{execution.result.rowCount} rows</span>
              <span>{execution.result.executionTime} ms</span>
            </div>
          </div>

          {execution.result.columns.length > 0 && (
            <div className="max-h-80 overflow-auto">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead className="sticky top-0 z-10 bg-neutral-100">
                  <tr>
                    {execution.result.columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap border-b border-r border-neutral-200 px-4 py-3 font-semibold text-neutral-600 last:border-r-0"
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
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                    >
                      {execution.result!.columns.map((column) => (
                        <td
                          key={column}
                          className="max-w-64 whitespace-nowrap border-r border-neutral-100 px-4 py-3 text-neutral-600 last:border-r-0"
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
            <p className="border-t border-neutral-100 px-4 py-8 text-center text-[11px] text-neutral-400">
              The query executed successfully but returned no rows.
            </p>
          )}
        </>
      )}

      {!execution.success && (
        <div className="border-t border-red-200 bg-red-50/50 px-4 py-3">
          <p className="text-[11px] leading-5 text-red-700">
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
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-2">
            <Logo small />

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Queryline AI
            </span>
          </div>

          <h1 className="max-w-xl text-3xl font-semibold leading-[1.15] tracking-tight text-neutral-950 sm:text-4xl">
            Ask your database
            <br />
            <span className="text-neutral-400">anything.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[13px] leading-6 text-neutral-500">
            Explore your schema, execute queries, and understand your data
            using natural language. No need to write SQL yourself.
          </p>
        </div>

        <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Get started
          </p>

          <span className="text-[10px] text-neutral-400">
            Suggested queries
          </span>
        </div>

        <div className="grid grid-cols-1 gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group flex min-h-28 flex-col justify-between bg-white p-4 text-left transition-colors hover:bg-neutral-50 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-medium tabular-nums text-neutral-300">
                  {suggestion.number}
                </span>

                <span className="text-sm text-neutral-300 transition-colors group-hover:text-[#f36b3f]">
                  ↗
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[12px] font-semibold text-neutral-800">
                  {suggestion.title}
                </p>

                <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                  {suggestion.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
      <div className="space-y-9">
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          const isActiveAssistant = message.id === activeAssistantId;

          const isThinking =
            isAssistant &&
            isActiveAssistant &&
            isLoading &&
            !message.content &&
            !message.error;

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
                <div className="max-w-[85%] border border-neutral-200 bg-neutral-50 px-4 py-3 sm:max-w-[75%]">
                  <p className="whitespace-pre-wrap text-[12px] leading-6 text-neutral-800">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="w-full min-w-0">
                  {message.error ? (
                    <>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center bg-neutral-950 text-[10px] font-semibold text-white">
                          q
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          Queryline
                        </span>
                      </div>

                      <AssistantError error={message.error} />
                    </>
                  ) : isThinking ? (
                    <div className="flex items-center gap-3 py-3">
                      <span className="flex size-6 items-center justify-center bg-neutral-950 text-[10px] font-semibold text-white">
                        q
                      </span>

                      <span className="text-[11px] text-neutral-400">
                        Queryline is thinking...
                      </span>

                      <span className="flex gap-1">
                        <span className="size-1 animate-bounce bg-[#f36b3f]" />

                        <span className="size-1 animate-bounce bg-[#f36b3f] [animation-delay:150ms]" />

                        <span className="size-1 animate-bounce bg-[#f36b3f] [animation-delay:300ms]" />
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center bg-neutral-950 text-[10px] font-semibold text-white">
                          q
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          Queryline
                        </span>

                        {isActiveAssistant && isLoading && (
                          <span className="size-1.5 animate-pulse bg-[#f36b3f]" />
                        )}
                      </div>

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
};
