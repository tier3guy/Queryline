import { testMySQLConnection } from "@/lib/database/adapters/mysql.adapter";
import { testSQLiteConnection } from "@/lib/database/adapters/sqlite.adapter";
import { testMariaDBConnection } from "@/lib/database/adapters/mariadb.adapter";
import { testMongoDBConnection } from "@/lib/database/adapters/mongodb.adapter";
import { testPostgresConnection } from "@/lib/database/adapters/postgres.adapter";
import { testSQLServerConnection } from "@/lib/database/adapters/sqlserver.adapter";
import type { ConnectionTestResult, DatabaseConnectionConfig } from "@/lib/database/types";

export const testDatabaseConnection = async (
  config: DatabaseConnectionConfig
): Promise<ConnectionTestResult> => {
  switch (config.type) {
    case "postgresql":
      return testPostgresConnection(config);

    case "mysql":
      return testMySQLConnection(config);

    case "mariadb":
      return testMariaDBConnection(config);

    case "mongodb":
      return testMongoDBConnection(config);

    case "sqlite":
      return testSQLiteConnection(config);

    case "sqlserver":
      return testSQLServerConnection(config);

    default: {
      const unsupportedDatabase: never = config;
      throw new Error(
        `Unsupported database type: ${JSON.stringify(unsupportedDatabase)}`
      );
    }
  }
};
