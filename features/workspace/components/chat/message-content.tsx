
"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
};

export default function MessageContent({
  content,
  isStreaming = false,
}: MessageContentProps) {
  const [visibleContent, setVisibleContent] = useState(
    isStreaming ? "" : content,
  );

  const targetRef = useRef(content);

  useEffect(() => {
    targetRef.current = content;
  }, [content]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleContent((current) => {
        if (current.length >= targetRef.current.length) {
          return current;
        }

        return targetRef.current.slice(0, current.length + 2);
      });
    }, 12);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const isTyping = visibleContent.length < content.length;

  return (
    <div className="min-w-0 text-sm leading-7 text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-xl font-semibold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-lg font-semibold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-base font-semibold">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-border pl-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/60">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-border px-4 py-3 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-4 py-3 last:border-b-0">
              {children}
            </td>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 text-xs leading-6">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);

            return isBlock ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            );
          },
          hr: () => <hr className="my-5 border-border" />,
        }}
      >
        {visibleContent}
      </ReactMarkdown>

      {(isStreaming || isTyping) && (
        <span className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-full bg-foreground align-middle" />
      )}
    </div>
  );
};
