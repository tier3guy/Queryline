
import Database from "better-sqlite3";

import type { SQLiteConfig, ConnectionTestResult } from "@/lib/database/types";

export const testSQLiteConnection = async (
  config: SQLiteConfig
): Promise<ConnectionTestResult> => {
  const startedAt = Date.now();

  let database: Database.Database | null = null;

  try {
    database = new Database(config.database, {
      readonly: true,
      fileMustExist: true,
      timeout: 8000,
    });

    const result = database
      .prepare("SELECT sqlite_version() AS version")
      .get() as { version: string };

    return {
      success: true,
      message: "SQLite connection successful.",
      latency: Date.now() - startedAt,
      serverVersion: result.version,
      testedAt: new Date().toISOString(),
    };
  } finally {
    database?.close();
  }
};
