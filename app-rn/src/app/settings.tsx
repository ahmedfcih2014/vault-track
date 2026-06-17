import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MaxContentWidth } from '@/constants/theme';
import { exportFullBackup } from '@/infrastructure/bootstrap/sqlite-app-bootstrap';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 16, paddingBottom: insets.bottom + 24 },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Backup and app preferences.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Export all data</Text>
        <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
          Share a JSON backup of saving, spending, and archives. Keep this file safe in case you
          change devices.
        </Text>
        <Button
          label={isExporting ? 'Exporting...' : 'Export all data'}
          disabled={isExporting}
          onPress={() => {
            setIsExporting(true);
            setMessage(null);
            void exportFullBackup()
              .then(() => setMessage('Backup shared.'))
              .catch((error) => {
                setMessage(error instanceof Error ? error.message : 'Failed to export backup');
              })
              .finally(() => setIsExporting(false));
          }}
        />
        {message ? <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text> : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
  },
});
