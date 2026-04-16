import { cacheDirectory, writeAsStringAsync, readAsStringAsync } from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import { getDocumentAsync } from 'expo-document-picker';
import { getAllMoods, saveMood, MoodEntryRow } from '../db/moodRepository';
import { getDatabase } from '../db/database';

interface BackupData {
  version: 1;
  exportedAt: string;
  entries: MoodEntryRow[];
  settings: { key: string; value: string }[];
}

export async function exportData(): Promise<void> {
  const entries = await getAllMoods();
  const db = await getDatabase();
  const settings = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM user_settings'
  );

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
    settings: settings ?? [],
  };

  const json = JSON.stringify(backup, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `MyBlueInsight_backup_${date}.json`;
  const filePath = `${cacheDirectory}${fileName}`;

  await writeAsStringAsync(filePath, json);

  await shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: 'Export Mood Data',
    UTI: 'public.json',
  });
}

export async function importData(): Promise<{ imported: number; skipped: number }> {
  const result = await getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) {
    return { imported: 0, skipped: 0 };
  }

  const fileUri = result.assets[0].uri;
  const json = await readAsStringAsync(fileUri);

  const backup: BackupData = JSON.parse(json);

  if (!backup.version || !Array.isArray(backup.entries)) {
    throw new Error('Invalid backup file format');
  }

  let imported = 0;
  let skipped = 0;

  for (const entry of backup.entries) {
    if (!entry.date || !entry.color_hex || !entry.mood_key || !entry.mood_name) {
      skipped++;
      continue;
    }
    await saveMood(
      entry.date,
      entry.color_hex,
      entry.mood_key,
      entry.mood_name,
      entry.note ?? null,
      entry.exercise_type ?? null,
    );
    imported++;
  }

  // Restore settings
  if (Array.isArray(backup.settings)) {
    const db = await getDatabase();
    for (const { key, value } of backup.settings) {
      await db.runAsync(
        'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    }
  }

  return { imported, skipped };
}
