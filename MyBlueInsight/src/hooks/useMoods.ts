import { useState, useEffect, useCallback } from 'react';
import { MoodEntryRow, getAllMoods, getMoodsForRange, saveMood } from '../db/moodRepository';
import { formatDateKey } from '../utils/dateHelpers';

export function useMoods() {
  const [entries, setEntries] = useState<MoodEntryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllMoods();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (date: Date, colorHex: string, moodKey: string, moodName: string, note: string | null, exerciseType: string | null) => {
      await saveMood(formatDateKey(date), colorHex, moodKey, moodName, note, exerciseType);
      await refresh();
    },
    [refresh]
  );

  const getMoodMap = useCallback((): Map<string, MoodEntryRow> => {
    const map = new Map<string, MoodEntryRow>();
    entries.forEach((e) => map.set(e.date, e));
    return map;
  }, [entries]);

  return { entries, loading, refresh, save, getMoodMap };
}
