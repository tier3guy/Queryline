import {
  testPostgresConnection,
} from "@/lib/database/adapters/postgres.adapter";

import {
  testMySQLConnection,
} from "@/lib/database/adapters/mysql.adapter";

import type {
  ConnectionTestInput,
} from "@/features/connections/schemas/connection.schema";

export async function testDatabaseConnection(
  config: ConnectionTestInput
): Promise<string> {
  switch (config.type) {
    case "postgresql":
      return testPostgresConnection(config);

    case "mysql":
      return testMySQLConnection(config);

    default:
      throw new Error("Unsupported database type");
  }
};
