import type { QueryExecutionResult } from "@/lib/database/query-types";
import type { DatabaseConnectionConfig } from "@/lib/database/types";

export type MessageRole = "user" | "assistant";

export interface ChatQueryExecution {
  query: string;
  success: boolean;
  result?: QueryExecutionResult;
  error?: string;
};

export interface ChatError {
  code: "RATE_LIMITED" | "AI_ERROR";
  title: string;
  message: string;
  retryAt?: string;
  action?: string;
};

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  status?: string;
  queryExecutions?: ChatQueryExecution[];
  error?: ChatError;
};

export interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
};

export interface SavedDatabaseConnection {
  id: string;
  config: DatabaseConnectionConfig;
  createdAt: Date;
  updatedAt: Date;
};

export interface WorkspaceConversation extends Conversation {
  messages: ChatMessage[];
  connectionId: string | null;
};

export interface WorkspaceStorage {
  version: 1;
  connections: SavedDatabaseConnection[];
  conversations: WorkspaceConversation[];
  activeConnectionId: string | null;
  activeConversationId: string | null;
};
