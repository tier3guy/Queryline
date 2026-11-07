"use client";

import { useState } from "react";

import type { DatabaseConnectionConfig } from "@/lib/database/types";
import type {
  ChatError,
  ChatMessage,
  SavedDatabaseConnection,
  WorkspaceConversation,
} from "@/features/workspace/types";

import Chat from "@/features/workspace/components/chat/chat";
import Composer from "@/features/workspace/components/composer/composer";
import ConnectDatabaseForm from "@/features/workspace/components/connect-database/connect-database-form";
import Sidebar from "@/features/workspace/components/sidebar/sidebar";
import WorkspaceHeader from "@/features/workspace/components/header/header";
import { useWorkspaceStorage } from "@/features/workspace/hooks/use-workspace-storage";

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
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          connection: activeConnection.config,
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
      <main className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading workspace...
      </main>
    );
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-background text-foreground">
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

      <section className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader
          onMenuClick={() => setSidebarOpen(true)}
          onConnectClick={handleOpenNewConnection}
          conversationTitle={activeConversation?.title}
          connectionName={headerConnection?.config.name}
          connectionType={headerConnection?.config.type}
          isConnected={Boolean(activeConnection)}
        />

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
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Chat
              messages={messages}
              isLoading={isSending}
              activeAssistantId={activeAssistantId}
              onSuggestionClick={handleSendMessage}
            />

            <div className="border h-100 mx-[19.5%] mb-20 rounded-2xl flex flex-col gap-1 justify-center items-center border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              <h3 className="text-black font-medium">
                Please connect to you database to start a new chat.
              </h3>
              <p>
                No database connection selected. Please connect to a database to
                start a new chat.
              </p>
              <button
                type="button"
                onClick={handleOpenNewConnection}
                className="mt-6 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Connect Database
              </button>
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
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]"
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
            className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="border-b border-border px-6 py-5">
              <h2
                id="new-chat-title"
                className="text-lg font-semibold tracking-tight"
              >
                Start a new chat
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose the database you want to work with.
              </p>
            </div>

            <div className="space-y-2 px-6 py-5">
              {workspace.connections.map((connection) => (
                <button
                  key={connection.id}
                  type="button"
                  onClick={() => setSelectedConnectionId(connection.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selectedConnectionId === connection.id
                      ? "border-foreground bg-muted"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-xs font-semibold">
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
                    <span className="block truncate text-sm font-medium">
                      {connection.config.name}
                    </span>

                    <span className="block text-xs text-muted-foreground">
                      {connection.config.type}
                    </span>
                  </span>

                  <span
                    className={`size-4 rounded-full border ${
                      selectedConnectionId === connection.id
                        ? "border-4 border-foreground"
                        : "border-border"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
              <button
                type="button"
                onClick={() => setNewChatDialogOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartChat}
                disabled={!selectedConnectionId}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
