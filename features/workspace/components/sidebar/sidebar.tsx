
"use client";

import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
};

const conversations = [
  { id: "1", title: "Explore customer database" },
  { id: "2", title: "Monthly revenue analysis" },
  { id: "3", title: "Find inactive users" },
  { id: "4", title: "Product performance" },
];

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
}: SidebarProps) {
  const [activeConversation, setActiveConversation] = useState("1");

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

        <div className="p-4">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            <span className="text-lg leading-none">+</span>
            New chat
            <span className="ml-auto text-xs text-background/50">⌘ K</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Recent conversations
          </div>

          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setActiveConversation(conversation.id);
                  onClose();
                }}
                className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                  activeConversation === conversation.id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {conversation.title}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              AG
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Guest user</p>
              <p className="text-xs text-muted-foreground">Free workspace</p>
            </div>

            <span className="text-muted-foreground">···</span>
          </button>
        </div>
      </aside>
    </>
  );
};
