// import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/database/connection-factory";
import { connectionTestSchema } from "@/features/connections/schemas/connection.schema";

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

function getSafeErrorMessage(error: unknown): string {
  const code = getErrorCode(error);

  switch (code) {
    case "ECONNREFUSED":
      return "Connection refused. Check your host and port.";

    case "ENOTFOUND":
      return "Database host could not be resolved.";

    case "ETIMEDOUT":
    case "ESOCKETTIMEDOUT":
      return "Connection timed out. Check your network.";

    case "28P01":
    case "ER_ACCESS_DENIED_ERROR":
      return "Authentication failed. Check your username and password.";

    case "3D000":
    case "ER_BAD_DB_ERROR":
      return "The specified database does not exist.";

    case "SELF_SIGNED_CERT_IN_CHAIN":
    case "CERT_HAS_EXPIRED":
    case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
      return "SSL certificate verification failed.";

    default:
      return "Unable to connect. Verify your database configuration.";
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require an authenticated user.
    // const { userId } = await auth();

    // if (!userId) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Unauthorized",
    //     },
    //     { status: 401 }
    //   );
    // }

    // Parse request body.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    // Validate input.
    const validation = connectionTestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid connection configuration.",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const config = validation.data;

    // Test connection.
    const startedAt = performance.now();

    try {
      const serverVersion =
        await testDatabaseConnection(
          config.type === "sqlite"
            ? {
                type: "sqlite",
                name: config.name,
                filePath: config.database,
              }
            : config
        );

      const latency = Math.round(
        performance.now() - startedAt
      );

      return NextResponse.json({
        success: true,
        message: "Database connection successful.",
        latency,
        serverVersion,
        testedAt: new Date().toISOString(),
      });
    } catch (error) {
      // Never log credentials or complete connection strings.
      console.error("Database connection test failed", {
        type: config.type,
        code: getErrorCode(error),
      });

      return NextResponse.json(
        {
          success: false,
          message: getSafeErrorMessage(error),
          testedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to process connection request.",
      },
      { status: 500 }
    );
  }
};
