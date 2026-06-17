import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.container, { bottom: insets.bottom + 80 }]}>
      <View style={[styles.toast, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
        <Text style={[styles.text, { color: theme.text }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toast: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 480,
    width: '100%',
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
