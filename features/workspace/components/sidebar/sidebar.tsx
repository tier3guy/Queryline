"use client";

import { useState } from "react";
import Icon from "@/components/icons";
import { ConfirmModal } from "@/features/workspace/components/modals/confirm-modal";
import Logo from "@/components/shared/logo/logo";
import SettingsModal from "@/features/workspace/components/settings";
import type {
  SavedDatabaseConnection,
  WorkspaceConversation,
} from "@/features/workspace/types";

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
}

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
}: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteConnectionModal, setDeleteConnectionModal] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConversationModal, setDeleteConversationModal] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const handleDeleteConnection = (connectionId: string, name: string) => {
    setDeleteConnectionModal({ id: connectionId, name });
  };
  const handleDeleteConversation = (conversationId: string, title: string) => {
    setDeleteConversationModal({ id: conversationId, title });
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-5">
          <Logo />

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        <div className="shrink-0 space-y-2 border-b border-neutral-200 p-4">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#f36b3f]"
          >
            <Icon name="ai-chat" size={16} color="#fff" />
            New Chat
          </button>

          <button
            type="button"
            onClick={() => {
              onNewConnection();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            <Icon name="connect" size={16} color="#000" />
            New Connection
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-3 py-5">
          <section>
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Connections
              </h2>

              <span className="text-[10px] tabular-nums text-neutral-400">
                {connections.length.toString().padStart(2, "0")}
              </span>
            </div>

            {connections.length > 0 ? (
              <div className="space-y-1">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className={`group flex items-center gap-1 border-l-2 pr-1 transition-colors ${
                      activeConnectionId === connection.id
                        ? "border-[#f36b3f] bg-neutral-100"
                        : "border-transparent hover:bg-neutral-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectConnection(connection.id);
                        onClose();
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left ${
                        activeConnectionId === connection.id
                          ? "text-neutral-950"
                          : "text-neutral-500 hover:text-neutral-950"
                      }`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-600">
                        {databaseInitials[connection.config.type]}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium">
                          {connection.config.name}
                        </span>

                        <span className="mt-0.5 block truncate text-[10px] text-neutral-400">
                          {databaseLabels[connection.config.type]}
                        </span>
                      </span>

                      {activeConnectionId === connection.id && (
                        <span className="size-1.5 shrink-0 bg-[#f36b3f]" />
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
                      className="shrink-0 p-2 text-neutral-400 opacity-0 transition-all hover:bg-white hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-xs leading-5 text-neutral-400">
                No database connections yet.
              </p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Recent Conversations
              </h2>

              <span className="text-[10px] tabular-nums text-neutral-400">
                {conversations.length.toString().padStart(2, "0")}
              </span>
            </div>

            {conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group flex items-center gap-1 border-l-2 pr-1 transition-colors ${
                      activeConversationId === conversation.id
                        ? "border-[#f36b3f] bg-neutral-100"
                        : "border-transparent hover:bg-neutral-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectConversation(conversation.id);
                        onClose();
                      }}
                      className={`min-w-0 flex-1 truncate px-3 py-2.5 text-left text-[12px] transition-colors ${
                        activeConversationId === conversation.id
                          ? "font-medium text-neutral-950"
                          : "text-neutral-500 hover:text-neutral-950"
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
                      className="m-1 shrink-0 p-2 text-neutral-400 opacity-0 transition-all hover:bg-white hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-xs leading-5 text-neutral-400">
                Your conversations will appear here.
              </p>
            )}
          </section>
        </div>

        <div className="shrink-0 p-3">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-neutral-50 border-t border-neutral-200 pt-5"
          >
            <Icon name="settings" size={18} color="#737373" />

            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium text-neutral-800">
                Settings
              </span>
              <span className="mt-0.5 block text-[10px] text-neutral-400">
                AI provider & query permissions
              </span>
            </span>

            <span className="text-neutral-400">→</span>
          </button>

          <div className="mt-2 border-t border-neutral-200 pt-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex size-9 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-700">
                G
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-neutral-900">
                  Guest User
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                  Local Session
                </p>
              </div>

              <span className="size-1.5 bg-[#f36b3f]" />
            </div>
          </div>
        </div>
      </aside>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      {deleteConnectionModal && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeleteConnectionModal(null)}
          title="Delete Connection"
          text="Are you sure you want to delete this connection? Its conversations will be preserved."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            onDeleteConnection(deleteConnectionModal!.id);
            setDeleteConnectionModal(null);
          }}
        />
      )}

      {deleteConversationModal && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeleteConversationModal(null)}
          title="Delete Conversation"
          text="Are you sure you want to delete this conversation? This cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            onDeleteConversation(deleteConversationModal!.id);
            setDeleteConversationModal(null);
          }}
        />
      )}
    </>
  );
}
