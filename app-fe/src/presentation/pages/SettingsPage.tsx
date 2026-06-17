import { useState } from "react";
import { Download } from "lucide-react";
import { exportFullBackup } from "@/infrastructure/bootstrap/dexie-app-bootstrap";
import { Button } from "@/presentation/components/ui/button";
import { Card } from "@/presentation/components/ui/card";

export function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Backup and app preferences.
        </p>
      </header>

      <Card className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-slate-100">Export all data</h2>
          <p className="mt-1 text-sm text-slate-400">
            Download a JSON backup of saving, spending, and archives. Keep this file
            safe in case you change devices.
          </p>
        </div>
        <Button
          className="w-full"
          data-testid="export-all-backup"
          disabled={isExporting}
          onClick={() => {
            setIsExporting(true);
            setMessage(null);
            void exportFullBackup()
              .then(() => setMessage("Backup downloaded."))
              .catch((error) => {
                setMessage(
                  error instanceof Error ? error.message : "Failed to export backup",
                );
              })
              .finally(() => setIsExporting(false));
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export all data"}
        </Button>
        {message ? <p className="text-sm text-slate-400">{message}</p> : null}
      </Card>
    </div>
  );
}
