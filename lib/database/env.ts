
import type { PostgreSQLConfig } from "@/lib/database/types";

export function getEnvironmentDatabaseConfig(): PostgreSQLConfig {
  const {
    QUERYLINE_DB_HOST,
    QUERYLINE_DB_PORT,
    QUERYLINE_DB_NAME,
    QUERYLINE_DB_USER,
    QUERYLINE_DB_PASSWORD,
    QUERYLINE_DB_SSL,
  } = process.env;

  const requiredVariables = {
    QUERYLINE_DB_HOST,
    QUERYLINE_DB_PORT,
    QUERYLINE_DB_NAME,
    QUERYLINE_DB_USER,
    QUERYLINE_DB_PASSWORD,
    QUERYLINE_DB_SSL,
  };

  const missingVariables = Object.entries(requiredVariables)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing database environment variables: ${missingVariables.join(", ")}`,
    );
  }

  const port = Number(QUERYLINE_DB_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("QUERYLINE_DB_PORT must be a valid port number.");
  }

  return {
    name: "Queryline Neon",
    type: "postgresql",
    host: QUERYLINE_DB_HOST!,
    port,
    database: QUERYLINE_DB_NAME!,
    username: QUERYLINE_DB_USER!,
    password: QUERYLINE_DB_PASSWORD!,
    ssl: QUERYLINE_DB_SSL!.toLowerCase() === "true",
  };
};
