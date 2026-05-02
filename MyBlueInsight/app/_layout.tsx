import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from '../src/db/database';
import { PaletteProvider } from '../src/context/PaletteContext';
import { autoRestore } from '../src/services/iCloudSync';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      await getDatabase();
      const restored = await autoRestore();
      if (restored > 0) {
        console.log(`Auto-restored ${restored} entries from iCloud backup`);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaletteProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PaletteProvider>
    </GestureHandlerRootView>
  );
}
