import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";

import type { MySQLConfig } from "@/lib/database/types";

export async function testMySQLConnection(
  config: MySQLConfig
): Promise<string> {
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
    >( "SELECT VERSION() AS version");

    return rows[0]?.version ?? "MySQL";
  } finally {
    await connection.end().catch(() => undefined);
  }
};
