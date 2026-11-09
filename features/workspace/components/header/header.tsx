"use client";

interface WorkspaceHeaderProps {
  onMenuClick: () => void;
  onConnectClick: () => void;
  conversationTitle?: string;
  connectionName?: string;
  connectionType?: string;
  isConnected: boolean;
};

export default function WorkspaceHeader({
  onMenuClick,
  onConnectClick,
  conversationTitle,
  connectionName,
  connectionType,
  isConnected,
}: WorkspaceHeaderProps) {
  const title = conversationTitle || connectionName || "Queryline";

  const subtitle = conversationTitle
    ? isConnected
      ? `Connected to ${connectionName}`
      : "Database connection unavailable"
    : connectionName
      ? connectionType ?? "Database connection"
      : "Your AI database workspace";

  const statusLabel = isConnected
    ? "Connected"
    : connectionName
      ? "Connection unavailable"
      : "No database connected";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex size-9 shrink-0 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 lg:hidden"
          aria-label="Open sidebar"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="size-4"
            aria-hidden="true"
          >
            <path
              d="M3 5H17M3 10H17M3 15H17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </button>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[13px] font-semibold tracking-tight text-neutral-950">
              {title}
            </p>

            {conversationTitle && (
              <span className="hidden shrink-0 border border-neutral-200 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-neutral-400 sm:inline-flex">
                Chat
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[11px] text-neutral-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-2 border-neutral-200 sm:flex">
          <span
            className={`size-1.5 ${
              isConnected ? "bg-[#f36b3f]" : "bg-neutral-300"
            }`}
          />

          <span
            className={`text-[11px] ${
              isConnected ? "text-neutral-700" : "text-neutral-400"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </header>
  );
};
