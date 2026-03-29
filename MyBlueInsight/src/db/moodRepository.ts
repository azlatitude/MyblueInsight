import { getDatabase } from './database';

export interface MoodEntryRow {
  id: string;
  date: string;
  color_hex: string;
  mood_key: string;
  mood_name: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

function generateId(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getMoodForDate(date: string): Promise<MoodEntryRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<MoodEntryRow>(
    'SELECT * FROM mood_entries WHERE date = ?',
    [date]
  );
  return result ?? null;
}

export async function getMoodsForRange(startDate: string, endDate: string): Promise<MoodEntryRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MoodEntryRow>(
    'SELECT * FROM mood_entries WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startDate, endDate]
  );
}

export async function getAllMoods(): Promise<MoodEntryRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MoodEntryRow>('SELECT * FROM mood_entries ORDER BY date ASC');
}

export async function saveMood(
  date: string,
  colorHex: string,
  moodKey: string,
  moodName: string,
  note: string | null
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const existing = await getMoodForDate(date);

  if (existing) {
    await db.runAsync(
      'UPDATE mood_entries SET color_hex = ?, mood_key = ?, mood_name = ?, note = ?, updated_at = ? WHERE date = ?',
      [colorHex, moodKey, moodName, note, now, date]
    );
  } else {
    await db.runAsync(
      'INSERT INTO mood_entries (id, date, color_hex, mood_key, mood_name, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [generateId(), date, colorHex, moodKey, moodName, note, now, now]
    );
  }
}
