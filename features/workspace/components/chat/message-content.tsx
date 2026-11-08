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
    if (!isStreaming && visibleContent.length >= content.length) {
      return;
    }

    const interval = window.setInterval(() => {
      setVisibleContent((current) => {
        const target = targetRef.current;

        if (current.length >= target.length) {
          return current;
        }

        return target.slice(0, current.length + 2);
      });
    }, 12);

    return () => {
      window.clearInterval(interval);
    };
  }, [content, isStreaming, visibleContent.length]);

  const isTyping = visibleContent.length < content.length;

  return (
    <div className="min-w-0 text-[12px] leading-7 text-neutral-700 sm:text-[13px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-7 text-xl font-semibold leading-tight tracking-tight text-neutral-950 first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 border-b border-neutral-200 pb-2 text-base font-semibold tracking-tight text-neutral-900 first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-sm font-semibold text-neutral-900">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mb-2 mt-4 text-[13px] font-semibold text-neutral-900">
              {children}
            </h4>
          ),

          p: ({ children }) => (
            <p className="mb-4 last:mb-0">{children}</p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-950">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="text-neutral-600">{children}</em>
          ),

          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#d95b34] underline decoration-[#f36b3f]/40 underline-offset-4 transition-colors hover:text-[#f36b3f]"
            >
              {children}
            </a>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1.5 marker:text-[#f36b3f]">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1.5 marker:font-medium marker:text-neutral-400">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1 leading-6">{children}</li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-2 border-[#f36b3f] bg-neutral-50 py-3 pl-4 pr-3 text-neutral-500">
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div className="my-5 w-full overflow-x-auto border border-neutral-200">
              <table className="w-full border-collapse text-left text-[11px]">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-neutral-100">{children}</thead>
          ),

          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-100">
              {children}
            </tbody>
          ),

          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-neutral-50">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="whitespace-nowrap border-b border-r border-neutral-200 px-4 py-3 font-semibold text-neutral-700 last:border-r-0">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-r border-neutral-100 px-4 py-3 text-neutral-600 last:border-r-0">
              {children}
            </td>
          ),

          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto border border-neutral-200 bg-neutral-50 p-4 font-mono text-[11px] leading-6 text-neutral-700">
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
              <code className="border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-800">
                {children}
              </code>
            );
          },

          hr: () => (
            <hr className="my-6 border-0 border-t border-neutral-200" />
          ),
        }}
      >
        {visibleContent}
      </ReactMarkdown>

      {(isStreaming || isTyping) && (
        <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-[#f36b3f] align-middle" />
      )}
    </div>
  );
};
