import { z } from "zod";

export const databaseQuerySchema = z.object({
  message: z.string().trim().min(1).max(10000),
});

export type DatabaseQueryInput = z.infer<typeof databaseQuerySchema>;