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

export const connectionTestSchema = z.discriminatedUnion(
  "type",
  [
    z.object({
      ...commonFields,
      type: z.literal("postgresql"),
    }),

    z.object({
      ...commonFields,
      type: z.literal("mysql"),
    }),
  ]
);

export type ConnectionTestInput = z.infer<
  typeof connectionTestSchema
>;