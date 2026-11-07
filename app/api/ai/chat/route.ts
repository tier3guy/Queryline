import { z } from "zod";
import { NextResponse } from "next/server";

import { createDatabaseAgent } from "@/features/ai/services/database-agent";
import { createDatabaseQueryAdapter } from "@/lib/database/query-adapters";
import type { PostgreSQLConfig } from "@/lib/database/types";

export const maxDuration = 60;

const chatSchema = z.object({
  message: z.string().trim().min(1).max(10000),
});

function getDatabaseConfig(): PostgreSQLConfig {
  const requiredVariables = [
    "QUERYLINE_DB_HOST",
    "QUERYLINE_DB_NAME",
    "QUERYLINE_DB_USER",
    "QUERYLINE_DB_PASSWORD",
  ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      throw new Error(`${variable} is not configured.`);
    }
  }

  return {
    name: "Queryline Test Database",
    type: "postgresql",
    host: process.env.QUERYLINE_DB_HOST!,
    port: Number(process.env.QUERYLINE_DB_PORT ?? 5432),
    database: process.env.QUERYLINE_DB_NAME!,
    username: process.env.QUERYLINE_DB_USER!,
    password: process.env.QUERYLINE_DB_PASSWORD!,
    ssl: process.env.QUERYLINE_DB_SSL === "true",
  };
}

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

  console.log(process.env.OPENROUTER_API_KEY, "OPENROUTER_API_KEY");

  try {
    const body: unknown = await request.json();
    const validation = chatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid chat message." },
        { status: 400 },
      );
    }

    const config = getDatabaseConfig();
    const adapter = createDatabaseQueryAdapter(config);
    const agent = createDatabaseAgent(adapter, config.type);

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: validation.data.message,
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
    console.error("Queryline AI Chat Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while processing your request.",
      },
      { status: 500 },
    );
  }
}
