import type {
  ConnectionTestResult,
} from "@/lib/database/types";

import type {
  ConnectionTestInput,
} from "@/features/connections/schemas/connection.schema";

export async function testConnection(
  config: ConnectionTestInput
): Promise<ConnectionTestResult> {
  const response = await fetch(
    "/api/connections/test",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ?? "Connection test failed."
    );
  }

  return result as ConnectionTestResult;
};
