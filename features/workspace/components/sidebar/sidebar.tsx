"use client";

import type { SavedDatabaseConnection, WorkspaceConversation } from "@/features/workspace/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onNewConnection: () => void;
  conversations: WorkspaceConversation[];
  connections: SavedDatabaseConnection[];
  activeConversationId: string | null;
  activeConnectionId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onSelectConnection: (connectionId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onClearHistory: () => void;
};

const databaseLabels: Record<string, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  mariadb: "MariaDB",
  mongodb: "MongoDB",
  sqlite: "SQLite",
  sqlserver: "SQL Server",
};

const databaseInitials: Record<string, string> = {
  postgresql: "PG",
  mysql: "MY",
  mariadb: "MA",
  mongodb: "MG",
  sqlite: "SQ",
  sqlserver: "MS",
};

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  onNewConnection,
  conversations,
  connections,
  activeConversationId,
  activeConnectionId,
  onSelectConversation,
  onSelectConnection,
  onDeleteConnection,
  onDeleteConversation,
  onClearHistory,
}: SidebarProps) {
  const handleDeleteConnection = (connectionId: string, name: string) => {
    if (
      window.confirm(
        `Delete connection "${name}"? Its conversations will be preserved.`,
      )
    ) {
      onDeleteConnection(connectionId);
    }
  };

  const handleDeleteConversation = (
    conversationId: string,
    title: string,
  ) => {
    if (window.confirm(`Delete conversation "${title}"? This cannot be undone.`)) {
      onDeleteConversation(conversationId);
    }
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Delete all conversation history? Your saved database connections will not be affected.",
      )
    ) {
      onClearHistory();
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-border bg-background transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <a href="/workspace" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-lg font-semibold text-white">
              q
            </div>

            <span className="text-[17px] font-semibold tracking-tight">
              Queryline
            </span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close sidebar"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        <div className="space-y-2 p-4">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            <span className="text-lg leading-none">+</span>
            New Chat
          </button>

          <button
            type="button"
            onClick={() => {
              onNewConnection();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <span className="text-lg leading-none">+</span>
            New Connection
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <section>
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Connections
              </h2>

              <span className="text-[10px] tabular-nums text-muted-foreground">
                {connections.length}
              </span>
            </div>

            {connections.length > 0 ? (
              <div className="space-y-1">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className={`group flex items-center gap-1 rounded-lg pr-1 transition-colors ${
                      activeConnectionId === connection.id
                        ? "bg-muted"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectConnection(connection.id);
                        onClose();
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-left ${
                        activeConnectionId === connection.id
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-xs font-semibold">
                        {databaseInitials[connection.config.type]}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                          {connection.config.name}
                        </span>

                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {databaseLabels[connection.config.type]}
                        </span>
                      </span>

                      {activeConnectionId === connection.id && (
                        <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${connection.config.name}`}
                      title="Delete connection"
                      onClick={() =>
                        handleDeleteConnection(
                          connection.id,
                          connection.config.name,
                        )
                      }
                      className="shrink-0 rounded-full p-2 text-muted-foreground opacity-0 transition-all hover:bg-background hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-xs leading-5 text-muted-foreground">
                No database connections yet.
              </p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Recent conversations
              </h2>

              {/* {conversations.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] font-medium text-muted-foreground transition-colors hover:text-destructive"
                >
                  Clear all
                </button>
              )} */}
            </div>

            {conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group flex items-center gap-1 rounded-lg pr-1 transition-colors ${
                      activeConversationId === conversation.id
                        ? "bg-muted"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectConversation(conversation.id);
                        onClose();
                      }}
                      className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                        activeConversationId === conversation.id
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {conversation.title}
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${conversation.title}`}
                      title="Delete conversation"
                      onClick={() =>
                        handleDeleteConversation(
                          conversation.id,
                          conversation.title,
                        )
                      }
                      className="shrink-0 rounded-full m-2 p-2 text-muted-foreground opacity-0 transition-all hover:bg-background hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-xs leading-5 text-muted-foreground">
                Your conversations will appear here.
              </p>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};
