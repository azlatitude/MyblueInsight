import { Platform } from 'react-native';

let db: any = null;

export async function getDatabase(): Promise<any> {
  if (db) return db;
  if (Platform.OS === 'web') {
    // SQLite not available on web — return a mock
    db = {
      getFirstAsync: async () => null,
      getAllAsync: async () => [],
      runAsync: async () => {},
      execAsync: async () => {},
    };
    return db;
  }
  const SQLite = require('expo-sqlite');
  db = await SQLite.openDatabaseAsync('myblueinsight.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      color_hex TEXT NOT NULL,
      mood_name TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS artworks (
      id TEXT PRIMARY KEY,
      image_uri TEXT NOT NULL,
      time_range_start TEXT NOT NULL,
      time_range_end TEXT NOT NULL,
      style TEXT NOT NULL,
      generated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Add mood_key column if missing (migration for existing installs)
  try {
    await db.runAsync('ALTER TABLE mood_entries ADD COLUMN mood_key TEXT');
  } catch {
    // Column already exists
  }

  // Add exercise_type column if missing
  try {
    await db.runAsync('ALTER TABLE mood_entries ADD COLUMN exercise_type TEXT');
  } catch {
    // Column already exists
  }

  // Backfill mood_key for rows where it is NULL
  const CLASSIC_MAP: Record<string, string> = {
    '#FF3B30': 'red', '#FF9500': 'orange', '#FFCC00': 'yellow',
    '#34C759': 'green', '#5AC8FA': 'lightBlue', '#007AFF': 'darkBlue',
    '#AF52DE': 'purple', '#FF6B9D': 'pink', '#8E8E93': 'gray', '#1C1C1E': 'black',
  };
  const unmigrated = await db.getAllAsync<{ id: string; color_hex: string }>(
    'SELECT id, color_hex FROM mood_entries WHERE mood_key IS NULL'
  );
  for (const row of unmigrated) {
    const key = CLASSIC_MAP[row.color_hex.toUpperCase()] ?? CLASSIC_MAP[row.color_hex] ?? 'gray';
    await db.runAsync('UPDATE mood_entries SET mood_key = ? WHERE id = ?', [key, row.id]);
  }
  return db;
}
