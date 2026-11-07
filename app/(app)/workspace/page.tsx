"use client";

import { useState } from "react";
import Chat from "@/features/workspace/components/chat/chat";
import type { DatabaseConnectionConfig } from "@/lib/database/types";
import Sidebar from "@/features/workspace/components/sidebar/sidebar";
import Composer from "@/features/workspace/components/composer/composer";
import WorkspaceHeader from "@/features/workspace/components/header/header";
import type {
  ChatMessage,
  ChatQueryExecution,
} from "@/features/workspace/types";
import ConnectDatabaseForm from "@/features/workspace/components/connect-database/connect-database-form";

interface QueryApiResponse {
  success: boolean;
  answer?: string;
  queryExecutions?: ChatQueryExecution[];
  message?: string;
}

export default function WorkspacePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connection, setConnection] = useState<DatabaseConnectionConfig | null>(
    null,
  );
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(
    null,
  );

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    const assistantId = crypto.randomUUID();
    setActiveAssistantId(assistantId);

    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    setMessages((previous) => [...previous, userMessage, assistantMessage]);

    setIsSending(true);

    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
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
            setMessages((previous) =>
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
            setMessages((previous) =>
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
            throw new Error(payload.message);
          }
        }
      }
    } catch (error) {
      setMessages((previous) =>
        previous.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content:
                  item.content ||
                  (error instanceof Error
                    ? error.message
                    : "Something went wrong."),
              }
            : item,
        ),
      );
    } finally {
      setIsSending(false);
      setActiveAssistantId(null);
    }
  };

  const handleNewChat = () => {
    if (isSending) {
      return;
    }

    setMessages([]);
  };

  const handleConnectDatabase = (config: DatabaseConnectionConfig) => {
    setConnection(config);
    setConnectDialogOpen(false);
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
            isLoading={isSending}
            activeAssistantId={activeAssistantId}
            onSuggestionClick={handleSendMessage}
          />
        </div>

        <Composer onSend={handleSendMessage} disabled={isSending} />
      </section>

      {connectDialogOpen && (
        <ConnectDatabaseForm
          onClose={() => setConnectDialogOpen(false)}
          onConnect={handleConnectDatabase}
        />
      )}
    </main>
  );
}
