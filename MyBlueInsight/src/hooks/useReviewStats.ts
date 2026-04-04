import { useMemo } from 'react';
import { MoodEntryRow } from '../db/moodRepository';
import { PaletteMoodColor } from '../constants/palettes';
import { usePalette } from '../context/PaletteContext';

export type MoodColor = PaletteMoodColor;

export interface MoodDistribution {
  mood: PaletteMoodColor;
  count: number;
  ratio: number;
}

export function useMoodDistribution(entries: MoodEntryRow[]): MoodDistribution[] {
  const { colors } = usePalette();
  return useMemo(() => {
    if (entries.length === 0) return [];
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      const key = e.mood_key ?? 'gray';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const total = entries.length;
    return Array.from(counts.entries())
      .map(([moodKey, count]) => ({
        mood: colors.find((c) => c.key === moodKey) ?? colors[0],
        count,
        ratio: count / total,
      }))
      .sort((a, b) => b.ratio - a.ratio);
  }, [entries, colors]);
}

export function useMostCommonMood(entries: MoodEntryRow[]): PaletteMoodColor | null {
  const { colors } = usePalette();
  return useMemo(() => {
    if (entries.length === 0) return null;
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      const key = e.mood_key ?? 'gray';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    let maxKey = '';
    let maxCount = 0;
    counts.forEach((count, key) => {
      if (count > maxCount) { maxCount = count; maxKey = key; }
    });
    return colors.find((c) => c.key === maxKey) ?? null;
  }, [entries, colors]);
}

export function useLongestStreak(entries: MoodEntryRow[]): { mood: PaletteMoodColor; count: number } | null {
  const { colors } = usePalette();
  return useMemo(() => {
    if (entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    let bestKey = sorted[0].mood_key ?? 'gray';
    let bestCount = 1;
    let curKey = bestKey;
    let curCount = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1].date);
      const curDate = new Date(sorted[i].date);
      const diffDays = (curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      const entryKey = sorted[i].mood_key ?? 'gray';

      if (entryKey === curKey && Math.round(diffDays) === 1) {
        curCount++;
      } else {
        curKey = entryKey;
        curCount = 1;
      }
      if (curCount > bestCount) {
        bestCount = curCount;
        bestKey = curKey;
      }
    }
    const mood = colors.find((c) => c.key === bestKey);
    return mood ? { mood, count: bestCount } : null;
  }, [entries, colors]);
}

export function useDiversityScore(entries: MoodEntryRow[]): number {
  const { colors } = usePalette();
  return useMemo(() => {
    if (entries.length === 0) return 0;
    const unique = new Set(entries.map((e) => e.mood_key ?? 'gray'));
    return Math.round((unique.size / colors.length) * 100);
  }, [entries, colors]);
}

export function useExerciseInsight(entries: MoodEntryRow[]): string | null {
  const { colors } = usePalette();
  return useMemo(() => {
    const exerciseDays = entries.filter((e) => e.exercise_type);
    const restDays = entries.filter((e) => !e.exercise_type);
    if (exerciseDays.length < 3) return null;

    const topMood = (list: MoodEntryRow[]) => {
      if (list.length === 0) return null;
      const counts = new Map<string, number>();
      list.forEach((e) => {
        const key = e.mood_key ?? 'gray';
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      let maxKey = '';
      let maxCount = 0;
      counts.forEach((count, key) => {
        if (count > maxCount) { maxCount = count; maxKey = key; }
      });
      const mood = colors.find((c) => c.key === maxKey);
      const pct = Math.round((maxCount / list.length) * 100);
      return mood ? { name: mood.name.split(' / ')[0], pct } : null;
    };

    const exMood = topMood(exerciseDays);
    const restMood = topMood(restDays);
    if (!exMood) return null;

    if (restMood && restDays.length >= 3) {
      return `On exercise days, your top mood is ${exMood.name} (${exMood.pct}%). On rest days, it's ${restMood.name} (${restMood.pct}%).`;
    }
    return `On exercise days, your top mood is ${exMood.name} (${exMood.pct}%).`;
  }, [entries, colors]);
}
