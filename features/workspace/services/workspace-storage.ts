import type {
  ChatMessage,
  WorkspaceStorage,
} from "@/features/workspace/types";

const STORAGE_KEY = "queryline:workspace";
const STORAGE_VERSION = 1;

function createInitialWorkspace(): WorkspaceStorage {
  return {
    version: STORAGE_VERSION,
    connections: [],
    conversations: [],
    activeConnectionId: null,
    activeConversationId: null,
  };
};

function deserializeMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    createdAt: new Date(message.createdAt),
  };
};

export function loadWorkspaceStorage(): WorkspaceStorage {
  if (typeof window === "undefined") {
    return createInitialWorkspace();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return createInitialWorkspace();
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== STORAGE_VERSION ||
      !("connections" in parsed) ||
      !Array.isArray(parsed.connections) ||
      !("conversations" in parsed) ||
      !Array.isArray(parsed.conversations)
    ) {
      return createInitialWorkspace();
    }

    const workspace = parsed as WorkspaceStorage;

    return {
      ...workspace,
      conversations: workspace.conversations.map((conversation) => ({
        ...conversation,
        updatedAt: new Date(conversation.updatedAt),
        messages: Array.isArray(conversation.messages)
          ? conversation.messages.map(deserializeMessage)
          : [],
      })),
    };
  } catch (error) {
    console.error("Unable to load Queryline workspace:", error);

    return createInitialWorkspace();
  }
};

export function saveWorkspaceStorage(
  workspace: WorkspaceStorage,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch (error) {
    console.error("Unable to save Queryline workspace:", error);

    throw new Error("Unable to save workspace data in this browser.");
  }
};
