import { useMemo } from 'react';
import { MoodEntryRow } from '../db/moodRepository';
import { MoodColor, MOOD_COLORS, getMoodByHex } from '../constants/moodColors';

export interface MoodDistribution {
  mood: MoodColor;
  count: number;
  ratio: number;
}

export function useMoodDistribution(entries: MoodEntryRow[]): MoodDistribution[] {
  return useMemo(() => {
    if (entries.length === 0) return [];
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      counts.set(e.color_hex, (counts.get(e.color_hex) ?? 0) + 1);
    });
    const total = entries.length;
    return Array.from(counts.entries())
      .map(([hex, count]) => ({
        mood: getMoodByHex(hex) ?? MOOD_COLORS[0],
        count,
        ratio: count / total,
      }))
      .sort((a, b) => b.ratio - a.ratio);
  }, [entries]);
}

export function useMostCommonMood(entries: MoodEntryRow[]): MoodColor | null {
  return useMemo(() => {
    if (entries.length === 0) return null;
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      counts.set(e.color_hex, (counts.get(e.color_hex) ?? 0) + 1);
    });
    let maxHex = '';
    let maxCount = 0;
    counts.forEach((count, hex) => {
      if (count > maxCount) { maxCount = count; maxHex = hex; }
    });
    return getMoodByHex(maxHex) ?? null;
  }, [entries]);
}

export function useLongestStreak(entries: MoodEntryRow[]): { mood: MoodColor; count: number } | null {
  return useMemo(() => {
    if (entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    let bestHex = sorted[0].color_hex;
    let bestCount = 1;
    let curHex = sorted[0].color_hex;
    let curCount = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1].date);
      const curDate = new Date(sorted[i].date);
      const diffDays = (curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (sorted[i].color_hex === curHex && Math.round(diffDays) === 1) {
        curCount++;
      } else {
        curHex = sorted[i].color_hex;
        curCount = 1;
      }
      if (curCount > bestCount) {
        bestCount = curCount;
        bestHex = curHex;
      }
    }
    const mood = getMoodByHex(bestHex);
    return mood ? { mood, count: bestCount } : null;
  }, [entries]);
}

export function useDiversityScore(entries: MoodEntryRow[]): number {
  return useMemo(() => {
    if (entries.length === 0) return 0;
    const unique = new Set(entries.map((e) => e.color_hex));
    return Math.round((unique.size / MOOD_COLORS.length) * 100);
  }, [entries]);
}
