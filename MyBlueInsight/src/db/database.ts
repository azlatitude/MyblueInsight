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
  `);
  return db;
}
