import { useEffect } from "react";
import { cn } from "@/presentation/lib/utils";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(onDismiss, 2500);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-50",
        "rounded-xl border border-emerald-500/30 bg-emerald-950 px-4 py-3 text-sm text-emerald-100 shadow-lg",
      )}
      role="status"
    >
      {message}
    </div>
  );
}
