import { documentDirectory, writeAsStringAsync, readAsStringAsync, getInfoAsync } from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { getAllMoods } from '../db/moodRepository';
import { getDatabase } from '../db/database';
import { saveMood } from '../db/moodRepository';

const BACKUP_FILENAME = 'MyBlueInsight_icloud_backup.json';

interface BackupData {
  version: 1;
  exportedAt: string;
  entries: Array<{
    date: string;
    color_hex: string;
    mood_key: string;
    mood_name: string;
    note: string | null;
    exercise_type: string | null;
  }>;
  settings: { key: string; value: string }[];
}

function getBackupPath(): string {
  // Files in documentDirectory are automatically included in iOS iCloud
  // device backups when the user has iCloud Backup enabled in Settings.
  return `${documentDirectory}${BACKUP_FILENAME}`;
}

/**
 * Save a full JSON backup to the app's Documents directory.
 * iOS automatically backs up this directory to iCloud.
 * Call this after every mood save for continuous protection.
 */
export async function autoBackup(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  try {
    const entries = await getAllMoods();
    const db = await getDatabase();
    const settings = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM user_settings'
    );

    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: entries.map((e) => ({
        date: e.date,
        color_hex: e.color_hex,
        mood_key: e.mood_key ?? 'gray',
        mood_name: e.mood_name,
        note: e.note ?? null,
        exercise_type: e.exercise_type ?? null,
      })),
      settings: settings ?? [],
    };

    const json = JSON.stringify(backup);
    await writeAsStringAsync(getBackupPath(), json);
  } catch (error) {
    console.warn('Auto-backup failed:', error);
  }
}

/**
 * Check if a local backup exists and restore data into an empty database.
 * Call this on app launch after database initialization.
 * Returns the number of entries restored, or 0 if no restore was needed.
 */
export async function autoRestore(): Promise<number> {
  if (Platform.OS !== 'ios') return 0;

  try {
    // Only restore if current database is empty
    const existingEntries = await getAllMoods();
    if (existingEntries.length > 0) return 0;

    const backupPath = getBackupPath();
    const info = await getInfoAsync(backupPath);
    if (!info.exists) return 0;

    const json = await readAsStringAsync(backupPath);
    const backup: BackupData = JSON.parse(json);

    if (!backup.version || !Array.isArray(backup.entries)) return 0;

    let restored = 0;
    for (const entry of backup.entries) {
      if (!entry.date || !entry.color_hex || !entry.mood_key || !entry.mood_name) continue;
      await saveMood(
        entry.date,
        entry.color_hex,
        entry.mood_key,
        entry.mood_name,
        entry.note ?? null,
        entry.exercise_type ?? null,
      );
      restored++;
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

    return restored;
  } catch (error) {
    console.warn('Auto-restore failed:', error);
    return 0;
  }
}

/**
 * Get info about the last backup (for UI display).
 */
export async function getBackupInfo(): Promise<{ exists: boolean; date: string | null }> {
  try {
    const info = await getInfoAsync(getBackupPath());
    if (!info.exists) return { exists: false, date: null };

    const json = await readAsStringAsync(getBackupPath());
    const backup: BackupData = JSON.parse(json);
    return { exists: true, date: backup.exportedAt };
  } catch {
    return { exists: false, date: null };
  }
}
