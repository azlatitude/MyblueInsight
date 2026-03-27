import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { getDatabase } from '../src/db/database';

export default function RootLayout() {
  useEffect(() => {
    getDatabase();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
