import { z } from "zod";

const networkConnectionSchema = z.object({
  name: z.string().min(1).max(100),
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1).max(255),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(2048),
  ssl: z.boolean(),
});

const postgresqlSchema = networkConnectionSchema.extend({
  type: z.literal("postgresql"),
});

const mysqlSchema = networkConnectionSchema.extend({
  type: z.literal("mysql"),
});

const mariadbSchema = networkConnectionSchema.extend({
  type: z.literal("mariadb"),
});

const mongodbSchema = networkConnectionSchema.extend({
  type: z.literal("mongodb"),
});

const sqlserverSchema = networkConnectionSchema.extend({
  type: z.literal("sqlserver"),
});

const sqliteSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.literal("sqlite"),
  filePath: z.string().min(1).max(2048),
});

export const databaseQuerySchema = z.object({
  connection: z.discriminatedUnion("type", [
    postgresqlSchema,
    mysqlSchema,
    mariadbSchema,
    mongodbSchema,
    sqliteSchema,
    sqlserverSchema,
  ]),
  message: z.string().trim().min(1).max(10000),
});

export type DatabaseQueryInput = z.infer<typeof databaseQuerySchema>;