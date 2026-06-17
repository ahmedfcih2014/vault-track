import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { exportCorruptDataRecovery } from '@/infrastructure/bootstrap/sqlite-app-bootstrap';
import { useTheme } from '@/hooks/use-theme';

interface CorruptDataRecoveryProps {
  message: string;
}

export function CorruptDataRecovery({ message }: CorruptDataRecoveryProps) {
  const theme = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Data recovery needed</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Try exporting a raw backup, then clear app storage or reinstall Vault Track.
        </Text>
        <Button
          label={isExporting ? 'Exporting...' : 'Export raw backup'}
          disabled={isExporting}
          onPress={() => {
            setIsExporting(true);
            void exportCorruptDataRecovery().finally(() => setIsExporting(false));
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    gap: 12,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
