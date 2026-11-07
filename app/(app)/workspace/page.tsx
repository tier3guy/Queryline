"use client";

import { useState } from "react";
import Chat from "@/features/workspace/components/chat/chat";
import type { ChatMessage } from "@/features/workspace/types";
import type { DatabaseConnectionConfig } from "@/lib/database/types";
import Sidebar from "@/features/workspace/components/sidebar/sidebar";
import Composer from "@/features/workspace/components/composer/composer";
import WorkspaceHeader from "@/features/workspace/components/header/header";
import ConnectDatabaseForm from "@/features/workspace/components/connect-database/connect-database-form";

export default function WorkspacePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connection, setConnection] = useState<DatabaseConnectionConfig | null>(null);

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleConnectDatabase = (
    config: DatabaseConnectionConfig,
  ) => {
    setConnection(config);
    setConnectDialogOpen(false);

    console.log("Database configuration submitted:", {
      ...config,
      password: "********",
    });
  };

  return (
    <main className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader
          onMenuClick={() => setSidebarOpen(true)}
          onConnectClick={() => setConnectDialogOpen(true)}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Chat
            messages={messages}
            onSuggestionClick={handleSendMessage}
          />
        </div>

        <Composer onSend={handleSendMessage} />
      </section>

      {connectDialogOpen && (
        <ConnectDatabaseForm
          onClose={() => setConnectDialogOpen(false)}
          onConnect={handleConnectDatabase}
        />
      )}
    </main>
  );
};
