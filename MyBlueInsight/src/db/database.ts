import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
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
