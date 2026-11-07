
import sql from "mssql";

import type { SQLServerConfig, ConnectionTestResult } from "@/lib/database/types";

export const testSQLServerConnection = async (
  config: SQLServerConfig
): Promise<ConnectionTestResult> => {
  const startedAt = Date.now();

  const pool = new sql.ConnectionPool({
    server: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    connectionTimeout: 8000,
    requestTimeout: 8000,
    pool: {
      min: 0,
      max: 1,
      idleTimeoutMillis: 8000,
    },
    options: {
      encrypt: config.ssl,
      trustServerCertificate: false,
      connectTimeout: 8000,
    },
  });

  try {
    await pool.connect();

    const result = await pool
      .request()
      .query<{ version: string }>("SELECT @@VERSION AS version");

    return {
      success: true,
      message: "SQL Server connection successful.",
      latency: Date.now() - startedAt,
      serverVersion: result.recordset[0]?.version ?? "SQL Server",
      testedAt: new Date().toISOString(),
    };
  } finally {
    if (pool.connected) {
      await pool.close();
    }
  }
};
