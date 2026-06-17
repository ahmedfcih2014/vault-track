import { StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';

import { TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Input(props: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.input,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          color: theme.text,
        },
        props.style,
      ]}
      {...props}
    />
  );
}

export function Label({ children, nativeID }: { children: React.ReactNode; nativeID?: string }) {
  const theme = useTheme();
  return (
    <Text nativeID={nativeID} style={[styles.label, { color: theme.text }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: TouchTarget,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});
