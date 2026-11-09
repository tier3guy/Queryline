import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm?: () => void;
}

export default function Modal({ isOpen, onClose, title, children, confirmText = "Confirm", cancelText = "Cancel", confirmColor = "#f36b3f", onConfirm }: ModalProps) {
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
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {children}

          {onConfirm ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 h-9 border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50`}
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 h-9 bg-${confirmColor.replace("#", "")} px-3 text-sm font-medium text-white transition-colors hover:bg-[#f36b3f]`}
              >
                {confirmText}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}