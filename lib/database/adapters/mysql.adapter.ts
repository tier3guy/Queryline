
import type { RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";

import type { ConnectionTestResult } from "@/lib/database/types";
import type { MySQLConfig } from "@/lib/database/types";

export async function testMySQLConnection(
  config: MySQLConfig
): Promise<ConnectionTestResult> {
  const startedAt = Date.now();

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl
      ? { rejectUnauthorized: true }
      : undefined,
    connectTimeout: 8000,
    multipleStatements: false,
  });

  try {
    const [rows] = await connection.query<
      (RowDataPacket & { version: string })[]
    >("SELECT VERSION() AS version");

    return {
      success: true,
      message: "MySQL connection successful.",
      latency: Date.now() - startedAt,
      serverVersion: rows[0]?.version ?? "MySQL",
      testedAt: new Date().toISOString(),
    };
  } finally {
    await connection.end().catch(() => undefined);
  }
};
