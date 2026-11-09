import mssql from "mssql";
import { Client } from "pg";
import mysql from "mysql2/promise";
import Database from "better-sqlite3";
import { MongoClient } from "mongodb";
import { validateReadOnlySQL, validateWriteSQL } from "@/lib/database/query-validator";
import {
  MAX_QUERY_ROWS,
  QUERY_TIMEOUT_MS,
} from "@/lib/database/query-constants";
import type {
  DatabaseConnectionConfig,
  DatabaseType,
} from "@/lib/database/types";
import type {
  DatabaseColumn,
  DatabaseQueryAdapter,
  DatabaseSchema,
  DatabaseTable,
  QueryExecutionResult,
} from "@/lib/database/query-types";

function createSchema(
  databaseType: DatabaseType,
  tables: DatabaseTable[],
  columns: Record<string, DatabaseColumn[]>,
): DatabaseSchema {
  return {
    databaseType,
    tables,
    columns,
    relationships: [],
  };
}

function toRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as Record<string, unknown>[];
}

function createExecutionResult(
  rows: Record<string, unknown>[],
  startedAt: number,
): QueryExecutionResult {
  return {
    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    rows: rows.slice(0, MAX_QUERY_ROWS),
    rowCount: Math.min(rows.length, MAX_QUERY_ROWS),
    executionTime: Date.now() - startedAt,
  };
}

function addSQLLimit(query: string, type: DatabaseType): string {
  const normalizedQuery = validateReadOnlySQL(query);

  if (
    /\blimit\s+\d+\b|\bfetch\s+first\s+\d+\b|\btop\s*\(/i.test(normalizedQuery)
  ) {
    return normalizedQuery;
  }

  if (type === "sqlserver") {
    return normalizedQuery.replace(/^(select|with)\b/i, (match) =>
      match.toLowerCase() === "select" ? "SELECT TOP (100)" : match,
    );
  }

  return `${normalizedQuery} LIMIT ${MAX_QUERY_ROWS}`;
}

class PostgreSQLQueryAdapter implements DatabaseQueryAdapter {
  readonly type = "postgresql" as const;
  private readonly config: Extract<
    DatabaseConnectionConfig,
    { type: "postgresql" }
  >;

  constructor(
    config: Extract<DatabaseConnectionConfig, { type: "postgresql" }>,
  ) {
    this.config = config;
  }

  private createClient(): Client {
    return new Client({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl ? { rejectUnauthorized: true } : false,
      connectionTimeoutMillis: QUERY_TIMEOUT_MS,
      query_timeout: QUERY_TIMEOUT_MS,
      statement_timeout: QUERY_TIMEOUT_MS,
      application_name: "Queryline",
    });
  }

  async getSchema(): Promise<DatabaseSchema> {
    const client = this.createClient();

    try {
      await client.connect();

      const tableResult = await client.query(`
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
      `);

      const columnResult = await client.query(`
        SELECT
          c.table_schema,
          c.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS is_primary
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT
            kcu.table_schema,
            kcu.table_name,
            kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
            AND tc.table_name = kcu.table_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk
          ON pk.table_schema = c.table_schema
          AND pk.table_name = c.table_name
          AND pk.column_name = c.column_name
        WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY c.table_schema, c.table_name, c.ordinal_position;
      `);

      const tables: DatabaseTable[] = tableResult.rows.map((row) => ({
        name: row.table_name,
        schema: row.table_schema,
        type: row.table_type === "VIEW" ? "view" : "table",
      }));

      const columns: Record<string, DatabaseColumn[]> = {};

      for (const row of columnResult.rows) {
        const key = `${row.table_schema}.${row.table_name}`;

        columns[key] ??= [];
        columns[key].push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === "YES",
          primaryKey: row.is_primary,
        });
      }

      return createSchema(this.type, tables, columns);
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  async executeReadQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const client = this.createClient();

    try {
      await client.connect();

      const result = await client.query(addSQLLimit(query, this.type));

      return createExecutionResult(toRows(result.rows), startedAt);
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  async executeWriteQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const client = this.createClient();

    try {
      await client.connect();

      const normalizedQuery = validateWriteSQL(query);
      const result = await client.query(normalizedQuery);

      return createExecutionResult(toRows(result.rows), startedAt);
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}

class MySQLQueryAdapter implements DatabaseQueryAdapter {
  readonly type = "mysql" as const;
  private readonly config: Extract<DatabaseConnectionConfig, { type: "mysql" }>;

  constructor(config: Extract<DatabaseConnectionConfig, { type: "mysql" }>) {
    this.config = config;
  }

  private createConnection() {
    return mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl ? { rejectUnauthorized: true } : undefined,
      connectTimeout: QUERY_TIMEOUT_MS,
      multipleStatements: false,
    });
  }

  async getSchema(): Promise<DatabaseSchema> {
    const connection = await this.createConnection();

    try {
      const [tableRows] = await connection.query(
        `SELECT TABLE_NAME, TABLE_TYPE
         FROM information_schema.tables
         WHERE TABLE_SCHEMA = DATABASE()
         ORDER BY TABLE_NAME`,
      );

      const [columnRows] = await connection.query(
        `SELECT
           TABLE_NAME,
           COLUMN_NAME,
           COLUMN_TYPE,
           IS_NULLABLE,
           COLUMN_KEY
         FROM information_schema.columns
         WHERE TABLE_SCHEMA = DATABASE()
         ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      );

      const tables: DatabaseTable[] = toRows(tableRows).map((row) => ({
        name: String(row.TABLE_NAME),
        type: row.TABLE_TYPE === "VIEW" ? "view" : "table",
      }));

      const columns: Record<string, DatabaseColumn[]> = {};

      for (const row of toRows(columnRows)) {
        const key = String(row.TABLE_NAME);

        columns[key] ??= [];
        columns[key].push({
          name: String(row.COLUMN_NAME),
          type: String(row.COLUMN_TYPE),
          nullable: row.IS_NULLABLE === "YES",
          primaryKey: row.COLUMN_KEY === "PRI",
        });
      }

      return createSchema(this.type, tables, columns);
    } finally {
      await connection.end();
    }
  }

  async executeReadQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const connection = await this.createConnection();

    try {
      const [rows] = await connection.query({
        sql: addSQLLimit(query, this.type),
        timeout: QUERY_TIMEOUT_MS,
      });

      return createExecutionResult(toRows(rows), startedAt);
    } finally {
      await connection.end();
    }
  }

  async executeWriteQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const connection = await this.createConnection();

    try {
      const normalizedQuery = validateWriteSQL(query);
      const [result] = await connection.query({
        sql: normalizedQuery,
        timeout: QUERY_TIMEOUT_MS,
      });

      return createExecutionResult(toRows(result), startedAt);
    } finally {
      await connection.end();
    }
  }
}

class MariaDBQueryAdapter implements DatabaseQueryAdapter {
  readonly type = "mariadb" as const;
  private readonly config: Extract<
    DatabaseConnectionConfig,
    { type: "mariadb" }
  >;

  constructor(config: Extract<DatabaseConnectionConfig, { type: "mariadb" }>) {
    this.config = config;
  }

  private createConnection() {
    return mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl ? { rejectUnauthorized: true } : undefined,
      connectTimeout: QUERY_TIMEOUT_MS,
      multipleStatements: false,
    });
  }

  async getSchema(): Promise<DatabaseSchema> {
    const connection = await this.createConnection();

    try {
      const [tableRows] = await connection.query(
        `SELECT TABLE_NAME, TABLE_TYPE
         FROM information_schema.tables
         WHERE TABLE_SCHEMA = DATABASE()
         ORDER BY TABLE_NAME`,
      );

      const [columnRows] = await connection.query(
        `SELECT
           TABLE_NAME,
           COLUMN_NAME,
           COLUMN_TYPE,
           IS_NULLABLE,
           COLUMN_KEY
         FROM information_schema.columns
         WHERE TABLE_SCHEMA = DATABASE()
         ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      );

      const tables: DatabaseTable[] = toRows(tableRows).map((row) => ({
        name: String(row.TABLE_NAME),
        type: row.TABLE_TYPE === "VIEW" ? "view" : "table",
      }));

      const columns: Record<string, DatabaseColumn[]> = {};

      for (const row of toRows(columnRows)) {
        const key = String(row.TABLE_NAME);

        columns[key] ??= [];
        columns[key].push({
          name: String(row.COLUMN_NAME),
          type: String(row.COLUMN_TYPE),
          nullable: row.IS_NULLABLE === "YES",
          primaryKey: row.COLUMN_KEY === "PRI",
        });
      }

      return createSchema(this.type, tables, columns);
    } finally {
      await connection.end();
    }
  }

  async executeReadQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const connection = await this.createConnection();

    try {
      const [rows] = await connection.query({
        sql: addSQLLimit(query, this.type),
        timeout: QUERY_TIMEOUT_MS,
      });

      return createExecutionResult(toRows(rows), startedAt);
    } finally {
      await connection.end();
    }
  }

  async executeWriteQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const connection = await this.createConnection();

    try {
      const normalizedQuery = validateWriteSQL(query);
      const [result] = await connection.query({
        sql: normalizedQuery,
        timeout: QUERY_TIMEOUT_MS,
      });

      return createExecutionResult(toRows(result), startedAt);
    } finally {
      await connection.end();
    }
  }
}

class SQLServerQueryAdapter implements DatabaseQueryAdapter {
  readonly type = "sqlserver" as const;
  private readonly config: Extract<
    DatabaseConnectionConfig,
    { type: "sqlserver" }
  >;

  constructor(
    config: Extract<DatabaseConnectionConfig, { type: "sqlserver" }>,
  ) {
    this.config = config;
  }

  private createConfig(): mssql.config {
    return {
      server: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      connectionTimeout: QUERY_TIMEOUT_MS,
      requestTimeout: QUERY_TIMEOUT_MS,
      options: {
        encrypt: this.config.ssl,
        trustServerCertificate: !this.config.ssl,
      },
    };
  }

  async getSchema(): Promise<DatabaseSchema> {
    const pool = await mssql.connect(this.createConfig());

    try {
      const tableResult = await pool.request().query(`
        SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
        FROM INFORMATION_SCHEMA.TABLES
        ORDER BY TABLE_SCHEMA, TABLE_NAME;
      `);

      const columnResult = await pool.request().query(`
        SELECT
          c.TABLE_SCHEMA,
          c.TABLE_NAME,
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.IS_NULLABLE,
          CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS IS_PRIMARY
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN (
          SELECT
            ku.TABLE_SCHEMA,
            ku.TABLE_NAME,
            ku.COLUMN_NAME
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
            ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
            AND tc.TABLE_SCHEMA = ku.TABLE_SCHEMA
          WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ) pk
          ON pk.TABLE_SCHEMA = c.TABLE_SCHEMA
          AND pk.TABLE_NAME = c.TABLE_NAME
          AND pk.COLUMN_NAME = c.COLUMN_NAME
        ORDER BY c.TABLE_SCHEMA, c.TABLE_NAME, c.ORDINAL_POSITION;
      `);

      const tables: DatabaseTable[] = tableResult.recordset.map((row) => ({
        name: row.TABLE_NAME,
        schema: row.TABLE_SCHEMA,
        type: row.TABLE_TYPE === "VIEW" ? "view" : "table",
      }));

      const columns: Record<string, DatabaseColumn[]> = {};

      for (const row of columnResult.recordset) {
        const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`;

        columns[key] ??= [];
        columns[key].push({
          name: row.COLUMN_NAME,
          type: row.DATA_TYPE,
          nullable: row.IS_NULLABLE === "YES",
          primaryKey: Boolean(row.IS_PRIMARY),
        });
      }

      return createSchema(this.type, tables, columns);
    } finally {
      await pool.close();
    }
  }

  async executeReadQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const pool = await mssql.connect(this.createConfig());

    try {
      const result = await pool.request().query(addSQLLimit(query, this.type));
      const rows = toRows(result.recordset);

      return createExecutionResult(rows, startedAt);
    } finally {
      await pool.close();
    }
  }

  async executeWriteQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const pool = await mssql.connect(this.createConfig());

    try {
      const normalizedQuery = validateWriteSQL(query);
      const result = await pool.request().query(normalizedQuery);
      const rows = toRows(result.recordset);

      return createExecutionResult(rows, startedAt);
    } finally {
      await pool.close();
    }
  }
}

class SQLiteQueryAdapter implements DatabaseQueryAdapter {
  readonly type = "sqlite" as const;
  private readonly config: Extract<
    DatabaseConnectionConfig,
    { type: "sqlite" }
  >;

  constructor(config: Extract<DatabaseConnectionConfig, { type: "sqlite" }>) {
    this.config = config;
  }

  async getSchema(): Promise<DatabaseSchema> {
    const database = new Database(this.config.database, {
      readonly: true,
      fileMustExist: true,
    });

    try {
      const tableRows = database
        .prepare(
          `
        SELECT name, type
        FROM sqlite_master
        WHERE type IN ('table', 'view')
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name;
      `,
        )
        .all() as { name: string; type: string }[];

      const tables: DatabaseTable[] = tableRows.map((row) => ({
        name: row.name,
        type: row.type === "view" ? "view" : "table",
      }));

      const columns: Record<string, DatabaseColumn[]> = {};

      for (const table of tables) {
        const escapedName = table.name.replace(/"/g, '""');
        const columnRows = database
          .prepare(`PRAGMA table_info("${escapedName}")`)
          .all() as {
          name: string;
          type: string;
          notnull: number;
          pk: number;
        }[];

        columns[table.name] = columnRows.map((row) => ({
          name: row.name,
          type: row.type,
          nullable: row.notnull === 0,
          primaryKey: row.pk > 0,
        }));
      }

      return createSchema(this.type, tables, columns);
    } finally {
      database.close();
    }
  }

  async executeReadQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const database = new Database(this.config.database, {
      readonly: true,
      fileMustExist: true,
    });

    try {
      const statement = database.prepare(addSQLLimit(query, this.type));

      if (!statement.reader) {
        throw new Error("Only read-only SQLite queries are allowed.");
      }

      const rows = statement.all() as Record<string, unknown>[];

      return createExecutionResult(rows, startedAt);
    } finally {
      database.close();
    }
  }

  async executeWriteQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const database = new Database(this.config.database, {
      readonly: false,
      fileMustExist: true,
    });

    try {
      const normalizedQuery = validateWriteSQL(query);
      const statement = database.prepare(normalizedQuery);

      if (statement.reader) {
        throw new Error("Expected a write query for SQLite.");
      }

      const result = statement.run() as { changes: number; lastInsertRowid: number };

      return createExecutionResult(
        [{ changes: result.changes, lastInsertRowid: result.lastInsertRowid }],
        startedAt,
      );
    } finally {
      database.close();
    }
  }
}

class MongoDBQueryAdapter implements DatabaseQueryAdapter {
  readonly type = "mongodb" as const;
  private readonly config: Extract<
    DatabaseConnectionConfig,
    { type: "mongodb" }
  >;

  constructor(config: Extract<DatabaseConnectionConfig, { type: "mongodb" }>) {
    this.config = config;
  }

  private getUri(): string {
    const username = encodeURIComponent(this.config.username);
    const password = encodeURIComponent(this.config.password);

    return `mongodb://${username}:${password}@${this.config.host}:${this.config.port}/?authSource=admin`;
  }

  async getSchema(): Promise<DatabaseSchema> {
    const client = new MongoClient(this.getUri(), {
      serverSelectionTimeoutMS: QUERY_TIMEOUT_MS,
      tls: this.config.ssl,
    });

    try {
      await client.connect();

      const database = client.db(this.config.database);
      const collectionNames = await database
        .listCollections(
          {},
          {
            nameOnly: true,
          },
        )
        .toArray();

      const tables: DatabaseTable[] = [];
      const columns: Record<string, DatabaseColumn[]> = {};

      for (const collectionInfo of collectionNames) {
        const collection = database.collection(collectionInfo.name);
        const sample = await collection.findOne(
          {},
          {
            projection: { _id: 0 },
            maxTimeMS: QUERY_TIMEOUT_MS,
          },
        );

        tables.push({
          name: collectionInfo.name,
          type: "collection",
        });

        columns[collectionInfo.name] = Object.entries(sample ?? {}).map(
          ([name, value]) => ({
            name,
            type:
              value === null
                ? "null"
                : Array.isArray(value)
                  ? "array"
                  : typeof value,
            nullable: true,
            primaryKey: name === "_id",
          }),
        );
      }

      return createSchema(this.type, tables, columns);
    } finally {
      await client.close();
    }
  }

  async executeReadQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const client = new MongoClient(this.getUri(), {
      serverSelectionTimeoutMS: QUERY_TIMEOUT_MS,
    });

    try {
      await client.connect();

      const database = client.db(this.config.database);
      const input = JSON.parse(query) as {
        collection: string;
        operation: "find" | "count";
        filter?: Record<string, unknown>;
        projection?: Record<string, 0 | 1>;
        sort?: Record<string, 1 | -1>;
        limit?: number;
      };

      if (!input.collection || !["find", "count"].includes(input.operation)) {
        throw new Error("Unsupported MongoDB read operation.");
      }

      const collection = database.collection(input.collection);

      if (input.operation === "count") {
        const count = await collection.countDocuments(input.filter ?? {}, {
          maxTimeMS: QUERY_TIMEOUT_MS,
        });

        return createExecutionResult([{ count }], startedAt);
      }

      const rows = await collection
        .find(input.filter ?? {}, {
          projection: input.projection,
          maxTimeMS: QUERY_TIMEOUT_MS,
        })
        .sort(input.sort ?? {})
        .limit(
          Math.min(Math.max(input.limit ?? MAX_QUERY_ROWS, 1), MAX_QUERY_ROWS),
        )
        .toArray();

      return createExecutionResult(
        rows as Record<string, unknown>[],
        startedAt,
      );
    } finally {
      await client.close();
    }
  }

  async executeWriteQuery(query: string): Promise<QueryExecutionResult> {
    const startedAt = Date.now();
    const client = new MongoClient(this.getUri(), {
      serverSelectionTimeoutMS: QUERY_TIMEOUT_MS,
    });

    try {
      await client.connect();

      const database = client.db(this.config.database);
      const input = JSON.parse(query) as {
        collection: string;
        operation: "insertOne" | "updateOne" | "deleteOne";
        filter?: Record<string, unknown>;
        document?: Record<string, unknown>;
        update?: Record<string, unknown>;
      };

      if (!input.collection) {
        throw new Error("Collection is required for MongoDB write operations.");
      }

      const collection = database.collection(input.collection);

      let result: unknown;

      switch (input.operation) {
        case "insertOne":
          result = await collection.insertOne(input.document ?? {});
          break;
        case "updateOne":
          if (!input.filter || !input.update) {
            throw new Error("filter and update are required for updateOne.");
          }
          result = await collection.updateOne(input.filter, input.update, {
            maxTimeMS: QUERY_TIMEOUT_MS,
          });
          break;
        case "deleteOne":
          if (!input.filter) {
            throw new Error("filter is required for deleteOne.");
          }
          result = await collection.deleteOne(input.filter, {
            maxTimeMS: QUERY_TIMEOUT_MS,
          });
          break;
        default:
          throw new Error(
            `Unsupported MongoDB write operation: ${input.operation}`,
          );
      }

      return createExecutionResult(
        [{ result }],
        startedAt,
      );
    } finally {
      await client.close();
    }
  }
}

export function createDatabaseQueryAdapter(
  config: DatabaseConnectionConfig,
): DatabaseQueryAdapter {
  switch (config.type) {
    case "postgresql":
      return new PostgreSQLQueryAdapter(config);

    case "mysql":
      return new MySQLQueryAdapter(config);

    case "mariadb":
      return new MariaDBQueryAdapter(config);

    case "mongodb":
      return new MongoDBQueryAdapter(config);

    case "sqlite":
      return new SQLiteQueryAdapter(config);

    case "sqlserver":
      return new SQLServerQueryAdapter(config);

    default: {
      const unsupportedDatabase: never = config;
      throw new Error(
        `Unsupported database type: ${JSON.stringify(unsupportedDatabase)}`,
      );
    }
  }
}
