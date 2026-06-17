import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'icon';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  variant = 'default',
  size = 'default',
  label,
  children,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'default'
      ? theme.primary
      : variant === 'destructive'
        ? theme.destructive
        : variant === 'secondary'
          ? theme.backgroundSelected
          : 'transparent';

  const textColor =
    variant === 'ghost' ? theme.text : variant === 'secondary' ? theme.text : '#ffffff';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'icon' ? styles.icon : styles.default,
        { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
      {...props}>
      {label ? (
        <Text style={[styles.label, { color: textColor }, textStyle]}>{label}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  default: {
    minHeight: TouchTarget,
    paddingHorizontal: 16,
    width: '100%',
  },
  icon: {
    width: TouchTarget,
    height: TouchTarget,
    borderRadius: TouchTarget / 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
