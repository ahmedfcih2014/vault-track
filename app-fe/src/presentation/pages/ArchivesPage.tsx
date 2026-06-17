import { useState } from "react";
import { Download } from "lucide-react";
import {
  formatDisplayDate,
  formatSignedEgp,
  type ArchiveMeta,
  type SpendingIncome,
} from "@vault-track/shared";
import { BottomSheet } from "@/presentation/components/BottomSheet";
import { TransactionList } from "@/presentation/components/TransactionList";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitle, CardValue } from "@/presentation/components/ui/card";
import { useArchives } from "@/presentation/hooks/use-archives";
import { cn } from "@/presentation/lib/utils";

export function ArchivesPage() {
  const { archives, isLoading, error, getArchive, exportArchive } = useArchives();
  const [selectedArchive, setSelectedArchive] = useState<ArchiveMeta | null>(null);
  const [detail, setDetail] = useState<SpendingIncome | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const openDetail = async (archive: ArchiveMeta) => {
    setSelectedArchive(archive);
    setDetailLoading(true);
    setDetail(null);
    try {
      const snapshot = await getArchive(archive.id);
      setDetail(snapshot);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedArchive(null);
    setDetail(null);
  };

  const handleExport = async (id: string) => {
    setExportingId(id);
    try {
      await exportArchive(id);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Archives</h1>
        <p className="mt-1 text-sm text-slate-400">
          Closed spending periods appear here after you end a period.
        </p>
      </header>

      {isLoading ? (
        <Card className="text-center text-sm text-slate-400">Loading archives...</Card>
      ) : error ? (
        <Card className="text-center text-sm text-rose-400">{error}</Card>
      ) : archives.length === 0 ? (
        <Card className="text-center text-sm text-slate-400">
          No archives yet. End a spending period to create your first archive.
        </Card>
      ) : (
        <ul className="space-y-2">
          {archives.map((archive) => (
            <li key={archive.id}>
              <button
                type="button"
                className="w-full min-h-11 text-left"
                data-testid="archive-item"
                onClick={() => void openDetail(archive)}
              >
                <Card className="transition-colors hover:border-emerald-500/40">
                  <p className="text-sm font-medium text-slate-100">{archive.filename}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Closed {formatDisplayDate(archive.archivedAt)}
                  </p>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        open={selectedArchive !== null}
        title="Archive detail"
        onClose={closeDetail}
      >
        {detailLoading || !selectedArchive ? (
          <p className="text-sm text-slate-400">Loading archive...</p>
        ) : detail ? (
          <ArchiveDetail
            archive={selectedArchive}
            snapshot={detail}
            isExporting={exportingId === selectedArchive.id}
            onExport={() => void handleExport(selectedArchive.id)}
          />
        ) : (
          <p className="text-sm text-rose-400">Unable to load archive.</p>
        )}
      </BottomSheet>
    </div>
  );
}

function ArchiveDetail({
  archive,
  snapshot,
  isExporting,
  onExport,
}: {
  archive: ArchiveMeta;
  snapshot: SpendingIncome;
  isExporting: boolean;
  onExport: () => void;
}) {
  const balanceValue = Number(snapshot.balance);
  const isPositive = balanceValue >= 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-500">{archive.filename}</p>
        <p className="mt-1 text-sm text-slate-400">
          {formatDisplayDate(snapshot.startedAt)} → {formatDisplayDate(snapshot.resetedAt!)}
        </p>
      </div>

      <Card>
        <CardTitle>Final balance</CardTitle>
        <CardValue className={cn(isPositive ? "text-emerald-400" : "text-rose-400")}>
          {formatSignedEgp(snapshot.balance)}
        </CardValue>
      </Card>

      <Button className="w-full" onClick={onExport} disabled={isExporting}>
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? "Exporting..." : "Export JSON"}
      </Button>

      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Transactions
        </h3>
        <TransactionList transactions={snapshot.transactions} variant="spending" />
      </section>
    </div>
  );
}
