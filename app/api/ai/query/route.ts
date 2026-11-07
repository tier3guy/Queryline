
import { NextResponse } from "next/server";

import { databaseQuerySchema } from "@/features/ai/schemas/query.schema";
import { createDatabaseAgent } from "@/features/ai/services/database-agent";
import { getEnvironmentDatabaseConfig } from "@/lib/database/env";
import { createDatabaseQueryAdapter } from "@/lib/database/query-adapters";

function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (
        typeof item === "object" &&
        item !== null &&
        "text" in item &&
        typeof item.text === "string"
      ) {
        return item.text;
      }

      return "";
    })
    .join("");
}

function createErrorEvent(error: unknown) {
  const details = error as {
    statusCode?: number;
    message?: string;
    metadata?: {
      headers?: Record<string, string>;
    };
    headers?: Record<string, string>;
  };

  const isRateLimited =
    details.statusCode === 429 ||
    details.message?.toLowerCase().includes("rate limit exceeded");

  if (isRateLimited) {
    const resetTimestamp = Number(
      details.metadata?.headers?.["X-RateLimit-Reset"] ??
        details.headers?.["x-ratelimit-reset"],
    );

    return {
      type: "error",
      error: {
        code: "RATE_LIMITED",
        title: "AI request limit reached",
        message:
          "The free AI model has reached its daily request limit. You can wait for the quota to reset or add credits to your OpenRouter account.",
        retryAt:
          Number.isFinite(resetTimestamp) && resetTimestamp > 0
            ? new Date(resetTimestamp).toISOString()
            : undefined,
        action:
          "Add credits in OpenRouter to increase your available requests.",
      },
    };
  }

  return {
    type: "error",
    error: {
      code: "AI_ERROR",
      title: "Unable to complete your request",
      message:
        "Queryline couldn't get a response from the AI service. Please try again.",
    },
  };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validation = databaseQuerySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request.",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { message } = validation.data;

    const connection = getEnvironmentDatabaseConfig();
    const adapter = createDatabaseQueryAdapter(connection);
    const agent = createDatabaseAgent(adapter, connection.type);

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: Record<string, unknown>) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        };

        try {
          const stream = await agent.stream(
            {
              messages: [
                {
                  role: "user",
                  content: message,
                },
              ],
            },
            {
              streamMode: ["messages", "updates"],
            },
          );

          for await (const [mode, chunk] of stream as AsyncIterable<
            [string, unknown]
          >) {
            if (request.signal.aborted) {
              break;
            }

            if (mode === "messages") {
              const [token] = chunk as [
                { content?: unknown; type?: string },
                { langgraph_node?: string },
              ];

              // Never forward tool outputs to the frontend.
              if (token.type !== "ai") {
                continue;
              }

              const content = extractText(token.content);

              if (content) {
                sendEvent({
                  type: "token",
                  content,
                });
              }
            }

            if (mode === "updates") {
              const updates = chunk as Record<string, unknown>;

              for (const step of Object.keys(updates)) {
                sendEvent({
                  type: "status",
                  step,
                });
              }
            }
          }

          if (!request.signal.aborted) {
            sendEvent({
              type: "done",
            });
          }
        } catch (error) {
          console.error("Queryline AI streaming error:", error);

          if (!request.signal.aborted) {
            sendEvent(createErrorEvent(error));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Queryline AI request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to initialize the database query request.",
      },
      { status: 500 },
    );
  }
};
