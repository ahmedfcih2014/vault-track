import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppBottomSheet } from '@/components/bottom-sheet';
import { ScreenShell } from '@/components/screen-shell';
import { TransactionList } from '@/components/transaction-list';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { useArchives } from '@/hooks/use-archives';
import { useTheme } from '@/hooks/use-theme';
import { formatDisplayDate, formatSignedEgp, type ArchiveMeta, type SpendingIncome } from '@vault-track/shared';

export default function ArchivesScreen() {
  const theme = useTheme();
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
    <>
      <ScreenShell
        title="Archives"
        subtitle="Closed spending periods appear here after you end a period.">
        {isLoading ? (
          <Card>
            <Text style={[styles.centered, { color: theme.textSecondary }]}>Loading archives...</Text>
          </Card>
        ) : error ? (
          <Card>
            <Text style={[styles.centered, { color: theme.negative }]}>{error}</Text>
          </Card>
        ) : archives.length === 0 ? (
          <Card>
            <Text style={[styles.centered, { color: theme.textSecondary }]}>
              No archives yet. End a spending period to create your first archive.
            </Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {archives.map((archive) => (
              <Pressable key={archive.id} onPress={() => void openDetail(archive)}>
                <Card>
                  <Text style={[styles.filename, { color: theme.text }]}>{archive.filename}</Text>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    Closed {formatDisplayDate(archive.archivedAt)}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScreenShell>

      <AppBottomSheet
        open={selectedArchive !== null}
        title="Archive detail"
        onClose={closeDetail}>
        {detailLoading || !selectedArchive ? (
          <Text style={{ color: theme.textSecondary }}>Loading archive...</Text>
        ) : detail ? (
          <ArchiveDetail
            archive={selectedArchive}
            snapshot={detail}
            isExporting={exportingId === selectedArchive.id}
            onExport={() => void handleExport(selectedArchive.id)}
          />
        ) : (
          <Text style={{ color: theme.negative }}>Unable to load archive.</Text>
        )}
      </AppBottomSheet>
    </>
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
  const theme = useTheme();
  const balanceValue = Number(snapshot.balance);
  const isPositive = balanceValue >= 0;

  return (
    <View style={styles.detail}>
      <View>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>{archive.filename}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary, marginTop: 4 }]}>
          {formatDisplayDate(snapshot.startedAt)} → {formatDisplayDate(snapshot.resetedAt!)}
        </Text>
      </View>

      <Card>
        <CardTitle>Final balance</CardTitle>
        <CardValue color={isPositive ? theme.positive : theme.negative}>
          {formatSignedEgp(snapshot.balance)}
        </CardValue>
      </Card>

      <Button
        label={isExporting ? 'Exporting...' : 'Export JSON'}
        disabled={isExporting}
        onPress={onExport}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Transactions</Text>
        <TransactionList transactions={snapshot.transactions} variant="spending" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  filename: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
  },
  centered: {
    textAlign: 'center',
    fontSize: 14,
  },
  detail: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
