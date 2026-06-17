import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders } from '@/app/providers';
import { VaultColors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: VaultColors.background },
            headerStyle: { backgroundColor: VaultColors.card },
            headerTintColor: VaultColors.text,
            headerTitleStyle: { fontWeight: '600' },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
