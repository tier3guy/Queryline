import { tool } from "langchain";
import { z } from "zod";

import type { DatabaseQueryAdapter, QueryPermission } from "@/lib/database/query-types";
import { isWriteQuery } from "@/lib/database/query-validator";

export class PendingApprovalError extends Error {
  public readonly query: string;
  public readonly databaseType: string;

  constructor(query: string, databaseType: string) {
    super("Pending approval required for write query");
    this.name = "PendingApprovalError";
    this.query = query;
    this.databaseType = databaseType;
  }
}

export function createDatabaseTools(adapter: DatabaseQueryAdapter, permission: QueryPermission = "read-only") {
  const getSchemaTool = tool(
    async () => {
      const schema = await adapter.getSchema();

      return JSON.stringify(schema);
    },
    {
      name: "get_database_schema",
      description:
        "Retrieve the actual database schema, including tables, collections, columns, data types and primary keys. Use this tool before generating queries. Never assume schema information.",
      schema: z.object({}),
    },
  );

  const executeQueryTool = tool(
    async ({ query }) => {
      const result = await adapter.executeReadQuery(query);

      return JSON.stringify(result);
    },
    {
      name: "execute_read_query",
      description:
        "Execute exactly one read-only query against the connected database. SQL databases accept a single SELECT or WITH query. MongoDB accepts JSON containing collection, operation, filter, projection, sort and limit. The result contains columns, rows, rowCount and executionTime. Never execute write operations or schema changes.",
      schema: z.object({
        query: z.string().trim().min(1).max(12000),
      }),
    },
  );

  const executeWriteQueryTool = tool(
    async ({ query }) => {
      if (permission === "ask-before-write" && isWriteQuery(query)) {
        throw new PendingApprovalError(query, adapter.type);
      }

      const result = await adapter.executeWriteQuery(query);

      return JSON.stringify(result);
    },
    {
      name: "execute_write_query",
      description:
        "Execute exactly one write query (INSERT, UPDATE, DELETE) against the connected database. Only use this when the user has explicitly granted write permission. SQL databases accept a single INSERT/UPDATE/DELETE query. MongoDB accepts JSON containing collection, operation, filter, document/update. Never execute destructive operations like DROP, ALTER, CREATE, TRUNCATE.",
      schema: z.object({
        query: z.string().trim().min(1).max(12000),
      }),
    },
  );

  if (permission === "read-only") {
    return [getSchemaTool, executeQueryTool];
  }

  return [getSchemaTool, executeQueryTool, executeWriteQueryTool];
};
