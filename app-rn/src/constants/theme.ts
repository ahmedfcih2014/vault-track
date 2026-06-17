import '@/global.css';

import { Platform } from 'react-native';

export const VaultColors = {
  background: '#020617',
  card: '#0f172a',
  cardBorder: '#1e293b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',
  primary: '#059669',
  primaryLight: '#34d399',
  destructive: '#e11d48',
  destructiveLight: '#fb7185',
  positive: '#34d399',
  negative: '#fb7185',
} as const;

export const Colors = {
  light: {
    text: VaultColors.text,
    background: VaultColors.background,
    backgroundElement: VaultColors.card,
    backgroundSelected: '#1e293b',
    textSecondary: VaultColors.textMuted,
    border: VaultColors.cardBorder,
    primary: VaultColors.primary,
    destructive: VaultColors.destructive,
    positive: VaultColors.positive,
    negative: VaultColors.negative,
  },
  dark: {
    text: VaultColors.text,
    background: VaultColors.background,
    backgroundElement: VaultColors.card,
    backgroundSelected: '#1e293b',
    textSecondary: VaultColors.textMuted,
    border: VaultColors.cardBorder,
    primary: VaultColors.primaryLight,
    destructive: VaultColors.destructiveLight,
    positive: VaultColors.positive,
    negative: VaultColors.negative,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const TouchTarget = 44;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 480;
