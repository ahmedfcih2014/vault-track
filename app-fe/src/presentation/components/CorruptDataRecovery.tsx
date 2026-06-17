import { useState } from "react";
import { exportCorruptDataRecovery } from "@/infrastructure/bootstrap/dexie-app-bootstrap";
import { Button } from "@/presentation/components/ui/button";

interface CorruptDataRecoveryProps {
  message: string;
}

export function CorruptDataRecovery({ message }: CorruptDataRecoveryProps) {
  const [isExporting, setIsExporting] = useState(false);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <div className="max-w-sm space-y-4">
        <h1 className="text-lg font-semibold">Data recovery needed</h1>
        <p className="text-sm text-slate-400">{message}</p>
        <p className="text-sm text-slate-500">
          Try exporting a raw backup, then clear this site&apos;s data in your browser
          settings and reopen Vault Track.
        </p>
        <Button
          className="w-full"
          disabled={isExporting}
          onClick={() => {
            setIsExporting(true);
            void exportCorruptDataRecovery().finally(() => setIsExporting(false));
          }}
        >
          {isExporting ? "Exporting..." : "Export raw backup"}
        </Button>
      </div>
    </div>
  );
}
