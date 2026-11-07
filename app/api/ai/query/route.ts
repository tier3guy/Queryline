import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { databaseQuerySchema } from "@/features/ai/schemas/query.schema";
import { createDatabaseAgent } from "@/features/ai/services/database-agent";
import { createDatabaseQueryAdapter } from "@/lib/database/query-adapters";

export const runtime = "nodejs";
export const maxDuration = 60;

function extractMessageContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
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
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

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

    const { connection, message } = validation.data;

    const adapter = createDatabaseQueryAdapter(connection);
    const agent = createDatabaseAgent(adapter, connection.type);

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const lastMessage = result.messages.at(-1);
    const answer = extractMessageContent(lastMessage?.content);

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Queryline AI error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected AI query error occurred.",
      },
      { status: 500 },
    );
  }
};
