"use client";

import { useEffect, useState } from "react";
import Chat from "@/features/workspace/components/chat/chat";
import type { DatabaseConnectionConfig } from "@/lib/database/types";
import Sidebar from "@/features/workspace/components/sidebar/sidebar";
import Composer from "@/features/workspace/components/composer/composer";
import WorkspaceHeader from "@/features/workspace/components/header/header";
import { useWorkspaceStorage } from "@/features/workspace/hooks/use-workspace-storage";
import ConnectDatabaseForm from "@/features/workspace/components/connect-database/connect-database-form";
import type {
  ChatError,
  ChatMessage,
  SavedDatabaseConnection,
  WorkspaceConversation,
  WorkspaceQueryPermission,
} from "@/features/workspace/types";
import type { PendingApproval } from "@/lib/database/query-types";
import Icon from "@/components/icons";

interface OpenRouterSettings {
  apiKey: string;
  model: string;
}

const PERMISSION_STORAGE_KEY = "queryline:query-permission";

export default function WorkspacePage() {
  const { workspace, setWorkspace, isLoaded } = useWorkspaceStorage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(
    null,
  );
  const [permission, setPermission] = useState<WorkspaceQueryPermission>(
    "read-only",
  );
  const [pendingApproval, setPendingApproval] = useState<{
    id: string;
    query: string;
    databaseType: string;
  } | null>(null);
  const [pendingApprovalDialogOpen, setPendingApprovalDialogOpen] =
    useState(false);

  // Load query permission from settings (localStorage).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERMISSION_STORAGE_KEY);
      if (
        stored === "read-only" ||
        stored === "ask-before-write" ||
        stored === "read-write"
      ) {
        setPermission(stored);
      }
    } catch {
      // Ignore storage errors; default to read-only.
    }
  }, []);

  const activeConversation =
    workspace.conversations.find(
      (conversation) => conversation.id === workspace.activeConversationId,
    ) ?? null;

  const activeConnection =
    workspace.connections.find(
      (connection) => connection.id === activeConversation?.connectionId,
    ) ?? null;

  const headerConnection =
    activeConnection ??
    workspace.connections.find(
      (connection) => connection.id === workspace.activeConnectionId,
    ) ??
    null;

  const editingConnection =
    workspace.connections.find(
      (connection) => connection.id === editingConnectionId,
    ) ?? null;

  const messages = activeConversation?.messages ?? [];

  const updateConversationMessages = (
    conversationId: string,
    updater: (messages: ChatMessage[]) => ChatMessage[],
  ) => {
    setWorkspace((previous) => ({
      ...previous,
      conversations: previous.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: updater(conversation.messages),
              updatedAt: new Date(),
            }
          : conversation,
      ),
    }));
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConnection || !activeConversation) {
      return;
    }

    if (isSending || !content.trim()) {
      return;
    }

    const messageContent = content.trim();
    const now = new Date();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
      createdAt: now,
    };

    const assistantId = crypto.randomUUID();

    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: now,
    };

    const conversationId = activeConversation.id;

    setWorkspace((previous) => ({
      ...previous,
      conversations: previous.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title:
                conversation.messages.length === 0
                  ? messageContent.length > 48
                    ? `${messageContent.slice(0, 48).trim()}...`
                    : messageContent
                  : conversation.title,
              messages: [
                ...conversation.messages,
                userMessage,
                assistantMessage,
              ],
              updatedAt: now,
            }
          : conversation,
      ),
    }));

    setActiveAssistantId(assistantId);
    setIsSending(true);

    try {
      const storedSettings = localStorage.getItem(
        "queryline:openrouter-settings",
      );

      let openRouterSettings: OpenRouterSettings | null = null;

      if (storedSettings) {
        try {
          openRouterSettings = JSON.parse(storedSettings) as OpenRouterSettings;
        } catch {
          throw new Error(
            "Invalid OpenRouter settings. Please update your settings.",
          );
        }
      }

      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          connection: activeConnection.config,
          ...(openRouterSettings?.apiKey?.trim() &&
          openRouterSettings?.model?.trim()
            ? {
                openRouter: {
                  apiKey: openRouterSettings.apiKey.trim(),
                  model: openRouterSettings.model.trim(),
                },
              }
            : {}),
          permission,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message ?? "Failed to generate a response.");
      }

      if (!response.body) {
        throw new Error("Streaming is not supported by this response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");

        buffer = events.pop() ?? "";

        for (const event of events) {
          const data = event
            .split("\n")
            .find((line) => line.startsWith("data: "));

          if (!data) {
            continue;
          }

          const payload = JSON.parse(data.slice(6));

          if (payload.type === "token") {
            updateConversationMessages(conversationId, (previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      content: item.content + payload.content,
                    }
                  : item,
              ),
            );
          }

          if (payload.type === "status") {
            updateConversationMessages(conversationId, (previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      status: payload.step,
                    }
                  : item,
              ),
            );
          }

          if (payload.type === "error") {
            updateConversationMessages(conversationId, (previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      error: payload.error as ChatError,
                    }
                  : item,
              ),
            );
          }

          if (payload.type === "pending_approval") {
            setPendingApproval(payload.pendingApproval);
            setPendingApprovalDialogOpen(true);

            updateConversationMessages(conversationId, (previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      pendingApproval: payload.pendingApproval,
                    }
                  : item,
              ),
            );
          }

          if (payload.type === "query_executed") {
            setPendingApproval(null);
            setPendingApprovalDialogOpen(false);

            updateConversationMessages(conversationId, (previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      pendingApproval: {
                        ...item.pendingApproval,
                        status: "approved",
                      } as PendingApproval,
                    }
                  : item,
              ),
            );
          }
        }
      }
    } catch (error) {
      updateConversationMessages(conversationId, (previous) =>
        previous.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                error: {
                  code: "AI_ERROR",
                  title: "Unable to complete your request",
                  message:
                    error instanceof Error
                      ? error.message
                      : "Something went wrong. Please try again.",
                },
              }
            : item,
        ),
      );
    } finally {
      setIsSending(false);
      setActiveAssistantId(null);
    }
  };

  const handleOpenNewConnection = () => {
    setEditingConnectionId(null);
    setConnectDialogOpen(true);
  };

  const handlePendingApprovalAction = async (
    action: "approve" | "reject" | "edit",
    editedQuery?: string,
  ) => {
    if (!pendingApproval || !activeConversation) return;

    setPendingApprovalDialogOpen(false);

    if (action === "reject") {
      setPendingApproval(null);
      updateConversationMessages(activeConversation.id, (previous) =>
        previous.map((item) => {
          if (item.pendingApproval?.id === pendingApproval.id) {
            return {
              ...item,
              pendingApproval: {
                ...item.pendingApproval,
                status: "rejected",
              } as PendingApproval,
            };
          }
          return item;
        }),
      );
      return;
    }

    const queryToExecute =
      action === "edit" && editedQuery ? editedQuery : pendingApproval.query;

    setPendingApproval({
      ...pendingApproval,
      query: queryToExecute,
    });

    updateConversationMessages(activeConversation.id, (previous) =>
      previous.map((item) => {
        if (item.pendingApproval?.id === pendingApproval.id) {
          return {
            ...item,
            pendingApproval: {
              ...item.pendingApproval,
              query: queryToExecute,
            } as PendingApproval,
          };
        }
        return item;
      }),
    );

    if (action === "approve" || action === "edit") {
      await executeApprovedQuery(queryToExecute);
    }
  };

  const executeApprovedQuery = async (query: string) => {
    if (!activeConnection || !activeConversation) return;

    setIsSending(true);

    try {
      const storedSettings = localStorage.getItem(
        "queryline:openrouter-settings",
      );

      let openRouterSettings: OpenRouterSettings | null = null;

      if (storedSettings) {
        try {
          openRouterSettings = JSON.parse(storedSettings) as OpenRouterSettings;
        } catch {
          // Ignore invalid settings.
        }
      }

      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          connection: activeConnection.config,
          ...(openRouterSettings?.apiKey?.trim() &&
          openRouterSettings?.model?.trim()
            ? {
                openRouter: {
                  apiKey: openRouterSettings.apiKey.trim(),
                  model: openRouterSettings.model.trim(),
                },
              }
            : {}),
          permission: "read-write",
          pendingApprovalId: pendingApproval?.id ?? "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? "Failed to execute approved query.");
      }

      if (!response.body) {
        throw new Error("Streaming is not supported by this response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");

        buffer = events.pop() ?? "";

        for (const event of events) {
          const data = event
            .split("\n")
            .find((line) => line.startsWith("data: "));

          if (!data) {
            continue;
          }

          const payload = JSON.parse(data.slice(6));

          if (payload.type === "query_executed") {
            setPendingApproval(null);
            setPendingApprovalDialogOpen(false);

            updateConversationMessages(activeConversation.id, (previous) =>
              previous.map((item) => {
                if (item.pendingApproval?.id === pendingApproval?.id) {
                  return {
                    ...item,
                    queryExecutions: [
                      ...(item.queryExecutions ?? []),
                      {
                        query: payload.query,
                        success: payload.success,
                        result: payload.result,
                        error: payload.error,
                        isWrite: true,
                      },
                    ],
                    pendingApproval: {
                      ...item.pendingApproval,
                      status: "approved",
                    } as PendingApproval,
                  };
                }
                return item;
              }),
            );
          }

          if (payload.type === "error") {
            setPendingApproval(null);
            setPendingApprovalDialogOpen(false);

            updateConversationMessages(activeConversation.id, (previous) =>
              previous.map((item) => {
                if (item.pendingApproval?.id === pendingApproval?.id) {
                  return {
                    ...item,
                    pendingApproval: {
                      ...item.pendingApproval,
                      status: "rejected",
                    } as PendingApproval,
                    error: payload.error as ChatError,
                  };
                }
                return item;
              }),
            );
          }
        }
      }
    } catch (error) {
      setPendingApproval(null);
      setPendingApprovalDialogOpen(false);

      updateConversationMessages(activeConversation.id, (previous) =>
        previous.map((item) => {
          if (item.pendingApproval?.id === pendingApproval?.id) {
            return {
              ...item,
              pendingApproval: {
                ...item.pendingApproval,
                status: "rejected",
              } as PendingApproval,
              error: {
                code: "AI_ERROR",
                title: "Unable to execute query",
                message:
                  error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again.",
              },
            };
          }
          return item;
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    if (isSending) {
      return;
    }

    if (workspace.connections.length === 0) {
      handleOpenNewConnection();
      return;
    }

    setSelectedConnectionId(
      workspace.activeConnectionId ?? workspace.connections[0].id,
    );
    setNewChatDialogOpen(true);
  };

  const handleStartChat = () => {
    if (!selectedConnectionId || isSending) {
      return;
    }

    const connectionExists = workspace.connections.some(
      (connection) => connection.id === selectedConnectionId,
    );

    if (!connectionExists) {
      return;
    }

    const now = new Date();

    const newConversation: WorkspaceConversation = {
      id: crypto.randomUUID(),
      title: "New conversation",
      updatedAt: now,
      messages: [],
      connectionId: selectedConnectionId,
    };

    setWorkspace((previous) => ({
      ...previous,
      activeConnectionId: selectedConnectionId,
      activeConversationId: newConversation.id,
      conversations: [newConversation, ...previous.conversations],
    }));

    setNewChatDialogOpen(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    if (isSending) {
      return;
    }

    const conversation = workspace.conversations.find(
      (item) => item.id === conversationId,
    );

    setWorkspace((previous) => ({
      ...previous,
      activeConversationId: conversationId,
      activeConnectionId:
        conversation?.connectionId ?? previous.activeConnectionId,
    }));
  };

  const handleConnectDatabase = (config: DatabaseConnectionConfig) => {
    const now = new Date();

    setWorkspace((previous) => {
      if (editingConnectionId) {
        return {
          ...previous,
          connections: previous.connections.map((connection) =>
            connection.id === editingConnectionId
              ? {
                  ...connection,
                  config,
                  updatedAt: now,
                }
              : connection,
          ),
          activeConnectionId: editingConnectionId,
        };
      }

      const newConnection: SavedDatabaseConnection = {
        id: crypto.randomUUID(),
        config,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...previous,
        connections: [newConnection, ...previous.connections],
        activeConnectionId: newConnection.id,
      };
    });

    setEditingConnectionId(null);
    setConnectDialogOpen(false);
  };

  const handleSelectConnection = (connectionId: string) => {
    if (isSending) {
      return;
    }

    setEditingConnectionId(connectionId);
    setConnectDialogOpen(true);
  };

  const handleCloseConnectionForm = () => {
    setConnectDialogOpen(false);
    setEditingConnectionId(null);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setWorkspace((previous) => ({
      ...previous,
      connections: previous.connections.filter(
        (connection) => connection.id !== connectionId,
      ),
      activeConnectionId:
        previous.activeConnectionId === connectionId
          ? null
          : previous.activeConnectionId,
    }));

    if (editingConnectionId === connectionId) {
      handleCloseConnectionForm();
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    setWorkspace((previous) => ({
      ...previous,
      conversations: previous.conversations.filter(
        (conversation) => conversation.id !== conversationId,
      ),
      activeConversationId:
        previous.activeConversationId === conversationId
          ? null
          : previous.activeConversationId,
    }));
  };

  const handleClearHistory = () => {
    setWorkspace((previous) => ({
      ...previous,
      conversations: [],
      activeConversationId: null,
    }));
  };

  if (!isLoaded) {
    return (
      <main className="flex h-dvh items-center justify-center bg-[#fafafa]">
        <div className="flex items-center gap-3 border border-neutral-200 bg-white px-5 py-4">
          <span className="size-2 animate-pulse bg-[#f36b3f]" />
          <span className="text-xs font-medium uppercase tracking-[1.2px] text-neutral-500">
            Loading workspace
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-[#fafafa] text-neutral-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onNewConnection={handleOpenNewConnection}
        conversations={workspace.conversations}
        connections={workspace.connections}
        activeConversationId={workspace.activeConversationId}
        activeConnectionId={workspace.activeConnectionId}
        onSelectConversation={handleSelectConversation}
        onSelectConnection={handleSelectConnection}
        onDeleteConnection={handleDeleteConnection}
        onDeleteConversation={handleDeleteConversation}
        onClearHistory={handleClearHistory}
      />

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <WorkspaceHeader
          onMenuClick={() => setSidebarOpen(true)}
          onConnectClick={handleOpenNewConnection}
          conversationTitle={activeConversation?.title}
          connectionName={headerConnection?.config.name}
          connectionType={headerConnection?.config.type}
          isConnected={Boolean(activeConnection)}
        />

          {pendingApprovalDialogOpen && pendingApproval && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setPendingApprovalDialogOpen(false);
                }
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="pending-approval-title"
                className="flex max-w-xl flex-col border border-neutral-200 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
                  <div>
                    <h2
                      id="pending-approval-title"
                      className="text-base font-semibold text-neutral-950"
                    >
                      Approve Write Query
                    </h2>
                    <p className="mt-1 text-xs text-neutral-500">
                      Queryline wants to execute a write operation. Review and
                      approve before it runs.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-[0.1em]">
                      Proposed Query
                    </h3>
                    <div className="mt-1 overflow-auto border rounded bg-neutral-50 p-3 text-[11px] font-mono text-neutral-700 max-h-48">
                      {pendingApproval.query}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-[0.1em]">
                      Action
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      Choose how to proceed with this write operation.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePendingApprovalAction("reject")
                      }
                      disabled={isSending}
                      className="flex-1 h-9 border border-neutral-200 px-4 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePendingApprovalAction("edit")
                      }
                      disabled={isSending}
                      className="flex-1 h-9 border border-neutral-200 px-4 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePendingApprovalAction("approve")
                      }
                      disabled={isSending}
                      className="flex-1 h-9 bg-neutral-950 px-4 text-xs font-medium text-white transition-colors hover:bg-[#f36b3f] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeConnection ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <Chat
                messages={messages}
                isLoading={isSending}
                activeAssistantId={activeAssistantId}
                onSuggestionClick={handleSendMessage}
              />
            </div>

            <Composer onSend={handleSendMessage} disabled={isSending} />
          </>
        ) : activeConversation && messages.length > 0 ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <Chat
                messages={messages}
                isLoading={false}
                activeAssistantId={null}
                onSuggestionClick={handleSendMessage}
              />
            </div>

            <div className="border-t border-neutral-200 bg-white px-6 py-4">
              <div className="mx-auto flex max-w-3xl items-start gap-3">
                <span className="mt-0.5 size-2 shrink-0 bg-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-900">
                    Database connection unavailable
                  </p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    This conversation is preserved, but its database connection
                    is no longer available. Reconnect your database to continue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenNewConnection}
                  className="shrink-0 border border-neutral-300 px-3 py-2 text-xs font-medium transition-colors hover:border-neutral-950 hover:bg-neutral-50"
                >
                  Reconnect
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-6 pb-16 pt-16 sm:px-10 md:pt-24">
              <div className="max-w-[680px]">
                <div className="mb-8 flex items-center gap-3">
                  <span className="size-2 bg-[#f36b3f]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-neutral-500">
                    Welcome to Queryline
                  </p>
                </div>

                <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-2px] text-neutral-950 sm:text-5xl md:text-6xl md:tracking-[-3px]">
                  Your database,
                  <br />
                  <span className="text-neutral-400">understood.</span>
                </h1>

                <p className="mt-6 max-w-[480px] text-sm leading-7 text-neutral-500">
                  Connect a database to get started. Ask questions in natural
                  language, explore your schema, and understand your data
                  without writing SQL manually.
                </p>

                <button
                  type="button"
                  onClick={handleOpenNewConnection}
                  className="group mt-9 inline-flex h-11 items-center gap-5 border border-neutral-950 bg-neutral-950 px-5 text-sm font-medium text-white transition-colors hover:border-[#f36b3f] hover:bg-[#f36b3f]"
                >
                  Connect database
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>

              <div className="mt-auto grid border-l border-t border-neutral-200 pt-0 sm:grid-cols-3">
                {[
                  {
                    number: "01",
                    title: "Connect",
                    description: "Connect your existing database.",
                  },
                  {
                    number: "02",
                    title: "Ask",
                    description: "Describe what you want to know.",
                  },
                  {
                    number: "03",
                    title: "Explore",
                    description: "Inspect queries and results.",
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="border-b border-r border-neutral-200 bg-white p-5"
                  >
                    <span className="font-mono text-[10px] text-neutral-400">
                      / {item.number}
                    </span>
                    <h3 className="mt-5 text-sm font-semibold text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {connectDialogOpen && (
        <ConnectDatabaseForm
          key={editingConnectionId ?? "new-connection"}
          onClose={handleCloseConnectionForm}
          onConnect={handleConnectDatabase}
          initialConfig={editingConnection?.config ?? null}
        />
      )}

      {newChatDialogOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setNewChatDialogOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-chat-title"
            className="w-full max-w-md border border-neutral-300 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.3px] text-[#f36b3f]">
                  Workspace
                </p>
                <h2
                  id="new-chat-title"
                  className="text-lg font-semibold tracking-tight text-neutral-950"
                >
                  Start a new chat
                </h2>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Choose the database you want to work with.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNewChatDialogOpen(false)}
                aria-label="Close dialog"
                className="flex size-8 items-center justify-center border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-950 hover:text-neutral-950"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 px-6 py-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[1.2px] text-neutral-400">
                Available connections ({workspace.connections.length})
              </p>

              {workspace.connections.map((connection) => (
                <button
                  key={connection.id}
                  type="button"
                  onClick={() => setSelectedConnectionId(connection.id)}
                  className={`flex w-full items-center gap-3 border p-3 text-left transition-colors ${
                    selectedConnectionId === connection.id
                      ? "border-neutral-950 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center border border-neutral-200 bg-white font-mono text-[10px] font-semibold text-neutral-700">
                    {connection.config.type === "postgresql"
                      ? "PG"
                      : connection.config.type === "mysql"
                        ? "MY"
                        : connection.config.type === "mariadb"
                          ? "MA"
                          : connection.config.type === "mongodb"
                            ? "MG"
                            : connection.config.type === "sqlite"
                              ? "SQ"
                              : "MS"}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-900">
                      {connection.config.name}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.8px] text-neutral-400">
                      {connection.config.type}
                    </span>
                  </span>

                  <span
                    className={`flex size-4 shrink-0 items-center justify-center border ${
                      selectedConnectionId === connection.id
                        ? "border-neutral-950"
                        : "border-neutral-300"
                    }`}
                  >
                    {selectedConnectionId === connection.id && (
                      <span className="size-2 bg-[#f36b3f]" />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setNewChatDialogOpen(false);
                  handleOpenNewConnection();
                }}
                className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-950"
              >
                <Icon name="connect" className="mr-1 size-3 inline-block" /> 
                Add connection
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewChatDialogOpen(false)}
                  className="h-9 border border-neutral-300 bg-white px-4 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-950"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={!selectedConnectionId}
                  className="h-9 border border-neutral-950 bg-neutral-950 px-4 text-xs font-medium text-white transition-colors hover:border-[#f36b3f] hover:bg-[#f36b3f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Start chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
