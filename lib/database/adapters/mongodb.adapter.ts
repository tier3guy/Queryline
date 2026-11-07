
import { MongoClient } from "mongodb";

import type { MongoDBConfig, ConnectionTestResult } from "@/lib/database/types";

export const testMongoDBConnection = async (
  config: MongoDBConfig
): Promise<ConnectionTestResult> => {
  const startedAt = Date.now();

  const client = new MongoClient(`mongodb://${config.host}:${config.port}`, {
    auth: {
      username: config.username,
      password: config.password,
    },
    authSource: "admin",
    tls: config.ssl,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    await client.connect();

    await client.db(config.database).command({ ping: 1 });

    return {
      success: true,
      message: "MongoDB connection successful.",
      latency: Date.now() - startedAt,
      serverVersion: "MongoDB",
      testedAt: new Date().toISOString(),
    };
  } finally {
    await client.close();
  }
};
