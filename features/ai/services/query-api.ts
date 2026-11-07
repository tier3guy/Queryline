import type { DatabaseQueryInput } from "@/features/ai/schemas/query.schema";

export interface DatabaseQueryResponse {
  success: boolean;
  answer?: string;
  message?: string;
};

export async function askDatabase(
  input: DatabaseQueryInput,
): Promise<DatabaseQueryResponse> {
  const response = await fetch("/api/ai/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = (await response.json()) as DatabaseQueryResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Failed to execute AI query.");
  }

  return result;
};
