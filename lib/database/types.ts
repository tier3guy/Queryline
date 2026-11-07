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

export interface NetworkConnectionConfig
  extends BaseConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
};

export interface PostgreSQLConfig
  extends NetworkConnectionConfig {
  type: "postgresql";
};

export interface MySQLConfig
  extends NetworkConnectionConfig {
  type: "mysql";
};

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  serverVersion?: string;
  testedAt: string;
};