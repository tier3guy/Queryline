import { z } from "zod";

const commonFields = {
  name: z.string().trim().min(1, "Connection name is required")
    .max(80),

  host: z.string().trim().min(1, "Host is required")
    .max(253),

  port: z.coerce.number()
    .int()
    .min(1)
    .max(65535),

  database: z.string().trim()
    .min(1, "Database name is required")
    .max(128),

  username: z.string().trim()
    .min(1, "Username is required")
    .max(128),

  password: z.string()
    .min(1, "Password is required")
    .max(1024),

  ssl: z.boolean().default(false),
};

const baseSchema = {
  name: z.string().min(1, "Connection name is required."),
  database: z.string().min(1, "Database name is required."),
};

const networkSchema = {
  ...baseSchema,
  host: z.string().min(1, "Host is required."),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
  ssl: z.boolean().default(false),
};

export const connectionTestSchema = z.discriminatedUnion("type", [
  z.object({
    ...networkSchema,
    type: z.literal("postgresql"),
  }),

  z.object({
    ...networkSchema,
    type: z.literal("mysql"),
  }),

  z.object({
    ...networkSchema,
    type: z.literal("mariadb"),
  }),

  z.object({
    ...networkSchema,
    type: z.literal("mongodb"),
  }),

  z.object({
    ...networkSchema,
    type: z.literal("sqlserver"),
  }),

  z.object({
    ...baseSchema,
    type: z.literal("sqlite"),
  }),
]);

export type ConnectionTestInput = z.infer<
  typeof connectionTestSchema
>;