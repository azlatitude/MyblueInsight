import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { MoodEntryRow } from '../../db/moodRepository';
import { formatMonthYear, formatDateKey, getMonthDays, getFirstWeekdayOfMonth } from '../../utils/dateHelpers';
import { useMoodDistribution, useMostCommonMood, useLongestStreak, useDiversityScore, useExerciseInsight } from '../../hooks/useReviewStats';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey } from '../../constants/palettes';
import { Ionicons } from '@expo/vector-icons';

interface Props { entries: MoodEntryRow[] }

export function MonthlyReview({ entries }: Props) {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1c1c1e' : '#f8f8f8';
  const { getHexForKey } = usePalette();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const monthEntries = useMemo(() => {
    const startKey = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return entries.filter((e) => e.date >= startKey && e.date <= endKey);
  }, [entries, year, month]);

  const distribution = useMoodDistribution(monthEntries);
  const mostCommon = useMostCommonMood(monthEntries);
  const streak = useLongestStreak(monthEntries);
  const diversity = useDiversityScore(monthEntries);
  const exerciseInsight = useExerciseInsight(monthEntries);

  const days = getMonthDays(year, month);
  const pad = getFirstWeekdayOfMonth(year, month);

  const navigate = (dir: number) => {
    if (dir === -1) {
      if (month === 0) { setMonth(11); setYear(year - 1); }
      else setMonth(month - 1);
    } else {
      if (month === 11) { setMonth(0); setYear(year + 1); }
      else setMonth(month + 1);
    }
  };

  return (
    <View>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigate(-1)}>
          <Ionicons name="chevron-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.rangeText, { color: textColor }]}>
          {formatMonthYear(year, month)}
        </Text>
        <TouchableOpacity onPress={() => navigate(1)}>
          <Ionicons name="chevron-forward" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Mood Grid</Text>
        <View style={styles.grid}>
          {Array(pad).fill(null).map((_, i) => (
            <View key={`pad-${i}`} style={styles.gridCell} />
          ))}
          {days.map((d) => {
            const key = formatDateKey(d);
            const entry = entries.find((e) => e.date === key);
            return (
              <View key={key} style={styles.gridCell}>
                <View
                  style={[
                    styles.gridDot,
                    { backgroundColor: entry ? getHexForKey(entry.mood_key as MoodKey) : (isDark ? '#222' : '#eee') },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            {mostCommon && <View style={[styles.statDot, { backgroundColor: mostCommon.hex }]} />}
            <Text style={[styles.statValue, { color: textColor }]} numberOfLines={1}>
              {mostCommon?.name.split(' / ')[0] ?? 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Most Common</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {streak ? `${streak.count} days` : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>{diversity}/100</Text>
            <Text style={styles.statLabel}>Diversity</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Distribution</Text>
        {distribution.length === 0 ? (
          <Text style={{ color: isDark ? '#666' : '#999' }}>No moods recorded</Text>
        ) : (
          distribution.map((d) => (
            <View key={d.mood.key} style={styles.distRow}>
              <View style={[styles.distDot, { backgroundColor: d.mood.hex }]} />
              <Text style={[styles.distName, { color: textColor }]} numberOfLines={1}>
                {d.mood.name.split(' / ')[0]}
              </Text>
              <View style={styles.distBarBg}>
                <View style={[styles.distBar, { backgroundColor: d.mood.hex, width: `${d.ratio * 100}%` }]} />
              </View>
              <Text style={[styles.distPct, { color: isDark ? '#888' : '#666' }]}>
                {Math.round(d.ratio * 100)}%
              </Text>
            </View>
          ))
        )}
      </View>

      {exerciseInsight && (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.insightRow}>
            <Ionicons name="fitness-outline" size={16} color={isDark ? '#888' : '#666'} />
            <Text style={[styles.insightText, { color: isDark ? '#ccc' : '#444' }]}>
              {exerciseInsight}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  rangeText: { fontSize: 16, fontWeight: '600' },
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  gridDot: { flex: 1, borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statDot: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '700' },
  statLabel: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  distDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  distName: { width: 80, fontSize: 12 },
  distBarBg: { flex: 1, height: 14, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.15)', marginHorizontal: 8, overflow: 'hidden' },
  distBar: { height: '100%', borderRadius: 3 },
  distPct: { width: 32, fontSize: 11, textAlign: 'right' },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  insightText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
