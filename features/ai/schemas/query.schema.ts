
import { z } from "zod";

const baseConnectionSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

const networkConnectionSchema = baseConnectionSchema.extend({
  host: z.string().trim().min(1),
  port: z.number().int().min(1).max(65535),
  database: z.string().trim().min(1),
  username: z.string().min(1),
  password: z.string(),
  ssl: z.boolean(),
});

const connectionSchema = z.discriminatedUnion("type", [
  networkConnectionSchema.extend({
    type: z.literal("postgresql"),
  }),
  networkConnectionSchema.extend({
    type: z.literal("mysql"),
  }),
  networkConnectionSchema.extend({
    type: z.literal("mariadb"),
  }),
  networkConnectionSchema.extend({
    type: z.literal("mongodb"),
  }),
  networkConnectionSchema.extend({
    type: z.literal("sqlserver"),
  }),
  baseConnectionSchema.extend({
    type: z.literal("sqlite"),
    database: z.string().trim().min(1),
  }),
]);

const openRouterSchema = z.object({
  apiKey: z.string().trim().max(500).optional(),
  model: z.string().trim().max(200).optional(),
}).optional();

export const databaseQuerySchema = z.object({
  message: z.string().trim().min(1).max(10000),
  connection: connectionSchema,
  openRouter: openRouterSchema,
  permission: z.enum(["read-only", "ask-before-write", "read-write"]).default("read-only"),
});

export type DatabaseQueryInput = z.infer<typeof databaseQuerySchema>;

export const executeApprovedQuerySchema = z.object({
  query: z.string().trim().min(1).max(12000),
  connection: connectionSchema,
  openRouter: openRouterSchema,
  permission: z.enum(["read-only", "ask-before-write", "read-write"]).default("read-write"),
  pendingApprovalId: z.string(),
});

export type ExecuteApprovedQueryInput = z.infer<typeof executeApprovedQuerySchema>;
