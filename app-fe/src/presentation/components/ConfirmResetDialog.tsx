import type { ReactNode } from "react";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/presentation/lib/utils";

interface ConfirmResetDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ConfirmResetDialog({
  open,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: ConfirmResetDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <DialogShell onClose={onCancel}>
      <h2 className="text-lg font-semibold text-slate-50">End this period?</h2>
      <p className="mt-2 text-sm text-slate-400">
        This will archive the current spending period and start a fresh one with zero balance.
        This action cannot be undone from the app.
      </p>
      <div className="mt-5 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          data-testid="confirm-end-period"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ending..." : "End period"}
        </Button>
      </div>
    </DialogShell>
  );
}

function DialogShell({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/80"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5",
        )}
        role="alertdialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
