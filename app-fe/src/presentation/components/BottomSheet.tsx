import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/presentation/lib/utils";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-slate-950/70"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-3xl border border-slate-800 bg-slate-900 p-4",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
