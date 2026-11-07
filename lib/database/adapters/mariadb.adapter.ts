
import mariadb from "mariadb";

import type { MariaDBConfig, ConnectionTestResult } from "@/lib/database/types";

export const testMariaDBConnection = async (
  config: MariaDBConfig
): Promise<ConnectionTestResult> => {
  const startedAt = Date.now();

  const connection = await mariadb.createConnection({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database,
    connectTimeout: 8000,
    ssl: config.ssl
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
  });

  try {
    const rows = await connection.query<{ version: string }[]>(
      "SELECT VERSION() AS version"
    );

    return {
      success: true,
      message: "MariaDB connection successful.",
      latency: Date.now() - startedAt,
      serverVersion: rows[0]?.version ?? "MariaDB",
      testedAt: new Date().toISOString(),
    };
  } finally {
    await connection.end();
  }
};
