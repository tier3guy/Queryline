import type { DatabaseType } from "@/lib/database/types";

export interface DatabaseTable {
  name: string;
  schema?: string;
  type: "table" | "view" | "collection";
};;

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
};

export interface DatabaseRelationship {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
};

export interface DatabaseSchema {
  databaseType: DatabaseType;
  tables: DatabaseTable[];
  columns: Record<string, DatabaseColumn[]>;
  relationships: DatabaseRelationship[];
};

export interface QueryExecutionResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
};

export interface DatabaseQueryAdapter {
  readonly type: DatabaseType;
  getSchema(): Promise<DatabaseSchema>;
  executeReadQuery(query: string): Promise<QueryExecutionResult>;
};
