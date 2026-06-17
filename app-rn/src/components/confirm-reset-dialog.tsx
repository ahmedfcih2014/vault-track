import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

interface ConfirmResetDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmResetDialog({
  open,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmResetDialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.dialog, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
          onPress={(event) => event.stopPropagation()}>
          <Text style={[styles.title, { color: theme.text }]}>End spending period?</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            This closes the current period, creates an archive, and starts a fresh period at zero.
            This cannot be undone.
          </Text>
          <View style={styles.actions}>
            <Button
              variant="secondary"
              label="Cancel"
              onPress={onCancel}
              disabled={isSubmitting}
              style={styles.actionButton}
            />
            <Button
              variant="destructive"
              label={isSubmitting ? 'Ending...' : 'End period'}
              onPress={onConfirm}
              disabled={isSubmitting}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    width: undefined,
  },
});
