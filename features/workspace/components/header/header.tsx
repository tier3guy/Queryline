"use client";

interface WorkspaceHeaderProps {
  onMenuClick: () => void;
  onConnectClick: () => void;
};

export default function WorkspaceHeader({
  onMenuClick,
  onConnectClick,
}: WorkspaceHeaderProps) {
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
            New conversation
          </p>
          <p className="text-xs text-muted-foreground">
            Your AI database workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 sm:flex">
          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">
            No database connected
          </span>
        </div>

        <button
          type="button"
          onClick={onConnectClick}
          className="rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium text-background transition-opacity hover:opacity-85 sm:text-sm"
        >
          Connect database
        </button>
      </div>
    </header>
  );
}
