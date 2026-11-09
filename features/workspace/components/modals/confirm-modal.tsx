import Icon from "@/components/icons";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  icon?: "alert-circle" | "checkmark-circle" | "eye" | "eye-off" | "loading" | "plug-socket" | "floppy-disk" | "settings" | "ai-chat" | "connect";
}

export function ConfirmModal({ isOpen, onClose, title, text, confirmText = "Delete", cancelText = "Cancel", confirmColor = "#f36b3f", onConfirm, icon = "alert-circle" }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-w-lg w-full max-xl m-4 flex-col border border-neutral-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-2">
          <div className="flex items-center gap-2">
            <Icon name={icon} size={20} color="#e53e3e" />
            <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-neutral-600">{text}</p>
        </div>

        <div className="flex gap-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 h-9 bg-[${confirmColor}] px-3 text-sm font-medium text-white transition-colors  hover:bg-[#f36b3f]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}