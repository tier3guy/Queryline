
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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label="Open sidebar"
        >
          <span className="text-xl">☰</span>
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {title}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 sm:flex">
          <span
            className={`size-1.5 rounded-full ${
              isConnected
                ? "bg-emerald-500"
                : "bg-muted-foreground/50"
            }`}
          />

          <span className="text-xs text-muted-foreground">
            {isConnected
              ? "Connected"
              : connectionName
                ? "Connection unavailable"
                : "No database connected"}
          </span>
        </div>

        <button
          type="button"
          onClick={onConnectClick}
          className="rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium text-background transition-opacity hover:opacity-85 sm:text-sm"
        >
          {isConnected || connectionName
            ? "Add connection"
            : "Connect database"}
        </button>
      </div>
    </header>
  );
}
