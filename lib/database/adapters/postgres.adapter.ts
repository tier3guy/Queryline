
import { Client } from "pg";

import type { ConnectionTestResult } from "@/lib/database/types";
import type { PostgreSQLConfig } from "@/lib/database/types";

export async function testPostgresConnection(
  config: PostgreSQLConfig
): Promise<ConnectionTestResult> {
  const startedAt = Date.now();

  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl
      ? { rejectUnauthorized: true }
      : false,
    connectionTimeoutMillis: 8000,
    query_timeout: 8000,
    statement_timeout: 8000,
    application_name: "Queryline",
  });

  try {
    await client.connect();

    const result = await client.query<{
      version: string;
    }>("SELECT version() AS version");

    return {
      success: true,
      message: "PostgreSQL connection successful.",
      latency: Date.now() - startedAt,
      serverVersion: result.rows[0]?.version ?? "PostgreSQL",
      testedAt: new Date().toISOString(),
    };
  } finally {
    await client.end().catch(() => undefined);
  }
};
