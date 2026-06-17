import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CorruptDataRecovery } from '@/components/corrupt-data-recovery';
import { OfflineBanner } from '@/components/offline-banner';
import { DOMAIN_ERROR_CODES, DomainError } from '@vault-track/shared';

import { SqliteAppBootstrap } from '@/infrastructure/bootstrap/sqlite-app-bootstrap';
import { useAppStore } from '@/hooks/use-app-store';
import { useTheme } from '@/hooks/use-theme';

const bootstrap = new SqliteAppBootstrap();

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const theme = useTheme();
  const isBootstrapped = useAppStore((state) => state.isBootstrapped);
  const isBootstrapping = useAppStore((state) => state.isBootstrapping);
  const bootstrapError = useAppStore((state) => state.bootstrapError);
  const isCorruptData = useAppStore((state) => state.isCorruptData);
  const setBootstrapping = useAppStore((state) => state.setBootstrapping);
  const setBootstrapError = useAppStore((state) => state.setBootstrapError);
  const setSnapshot = useAppStore((state) => state.setSnapshot);
  const setCorruptData = useAppStore((state) => state.setCorruptData);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function runBootstrap() {
      if (initialLoadDone.current) {
        return;
      }

      setBootstrapping(true);
      setBootstrapError(null);
      setCorruptData(false);

      try {
        await bootstrap.ensureSeeded();
        const snapshot = await bootstrap.getSnapshot();
        if (!cancelled) {
          setSnapshot(snapshot);
          initialLoadDone.current = true;
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof DomainError && error.code === DOMAIN_ERROR_CODES.CORRUPT_DATA) {
            setCorruptData(true, error.message);
          } else {
            const message =
              error instanceof Error ? error.message : 'Failed to initialize app data';
            setBootstrapError(message);
          }
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }

    void runBootstrap();

    return () => {
      cancelled = true;
    };
  }, [setBootstrapping, setBootstrapError, setSnapshot, setCorruptData]);

  if (isCorruptData) {
    return <CorruptDataRecovery message={bootstrapError ?? 'Stored data is invalid.'} />;
  }

  if (bootstrapError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Unable to load Vault Track</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{bootstrapError}</Text>
      </View>
    );
  }

  if (!isBootstrapped || isBootstrapping) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.subtitle, { color: theme.textSecondary, marginTop: 12 }]}>
          Loading Vault Track...
        </Text>
      </View>
    );
  }

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
