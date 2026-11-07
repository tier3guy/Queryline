import type { DatabaseType } from "@/lib/database/types";

export interface DatabaseTable {
  name: string;
  schema?: string;
  type?: string;
};

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
};

export interface DatabaseSchema {
  tables: DatabaseTable[];
  columns: Record<string, DatabaseColumn[]>;
  relationships?: {
    table: string;
    column: string;
    referencedTable: string;
    referencedColumn: string;
  }[];
};

export interface QueryExecutionResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
};

export interface DatabaseAdapter {
  readonly type: DatabaseType;

  getTables(): Promise<DatabaseTable[]>;

  getSchema(tableNames?: string[]): Promise<DatabaseSchema>;

  executeQuery(query: string): Promise<QueryExecutionResult>;
};
