import { tool } from "langchain";
import { z } from "zod";

import type { DatabaseQueryAdapter } from "@/lib/database/query-types";

export function createDatabaseTools(adapter: DatabaseQueryAdapter) {
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

  return [getSchemaTool, executeQueryTool];
};
