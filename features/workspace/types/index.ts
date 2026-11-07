import type { QueryExecutionResult } from "@/lib/database/query-types";

export type MessageRole = "user" | "assistant";

export interface ChatQueryExecution {
  query: string;
  success: boolean;
  result?: QueryExecutionResult;
  error?: string;
};

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  status?: string;
  queryExecutions?: ChatQueryExecution[];
};

export interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
};