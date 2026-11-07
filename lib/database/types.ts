export type DatabaseType =
  | "postgresql"
  | "mysql"
  | "mariadb"
  | "mongodb"
  | "sqlite"
  | "sqlserver";

export interface BaseConnectionConfig {
  name: string;
  type: DatabaseType;
};

export interface NetworkConnectionConfig extends BaseConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
};

export interface PostgreSQLConfig extends NetworkConnectionConfig {
  type: "postgresql";
};

export interface MySQLConfig extends NetworkConnectionConfig {
  type: "mysql";
};

export interface MariaDBConfig extends NetworkConnectionConfig {
  type: "mariadb";
}

export interface MongoDBConfig extends NetworkConnectionConfig {
  type: "mongodb";
}

export interface SQLServerConfig extends NetworkConnectionConfig {
  type: "sqlserver";
}

export interface SQLiteConfig extends BaseConnectionConfig {
  type: "sqlite";
  database: string;
}

export type DatabaseConnectionConfig =
  | PostgreSQLConfig
  | MySQLConfig
  | MariaDBConfig
  | MongoDBConfig
  | SQLServerConfig
  | SQLiteConfig;

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  serverVersion?: string;
  testedAt: string;
};