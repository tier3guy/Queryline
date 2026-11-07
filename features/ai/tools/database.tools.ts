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
        "Retrieve the actual tables, collections, columns, data types and primary keys of the currently connected database. Always use this before generating a query when schema information is needed.",
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
        "Execute one read-only query against the currently connected database. For SQL databases, provide a single SELECT or WITH query. For MongoDB, provide JSON with collection, operation (find or count), filter, projection, sort and limit. Never use this tool for writes or schema changes.",
      schema: z.object({
        query: z.string().min(1).max(12000),
      }),
    },
  );

  return [getSchemaTool, executeQueryTool];
};
