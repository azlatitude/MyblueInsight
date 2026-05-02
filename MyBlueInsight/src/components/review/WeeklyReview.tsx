import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { MoodEntryRow } from '../../db/moodRepository';
import { getWeekRange, formatDateKey, formatDateRange } from '../../utils/dateHelpers';
import { useMoodDistribution, useExerciseInsight } from '../../hooks/useReviewStats';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey } from '../../constants/palettes';
import { Ionicons } from '@expo/vector-icons';

interface Props { entries: MoodEntryRow[] }

export function WeeklyReview({ entries }: Props) {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1c1c1e' : '#f8f8f8';
  const { getHexForKey } = usePalette();
  const [weekDate, setWeekDate] = useState(new Date());

  const { start, end } = getWeekRange(weekDate);

  const weekEntries = useMemo(() => {
    const s = formatDateKey(start);
    const e = formatDateKey(end);
    return entries.filter((entry) => entry.date >= s && entry.date <= e);
  }, [entries, start, end]);

  const distribution = useMoodDistribution(weekEntries);
  const exerciseInsight = useExerciseInsight(weekEntries);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [start]);

  const navigate = (dir: number) => {
    const d = new Date(weekDate);
    d.setDate(d.getDate() + dir * 7);
    setWeekDate(d);
  };

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigate(-1)}>
          <Ionicons name="chevron-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.rangeText, { color: textColor }]}>
          {formatDateRange(start, end)}
        </Text>
        <TouchableOpacity onPress={() => navigate(1)}>
          <Ionicons name="chevron-forward" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.strip}>
          {weekDays.map((d, i) => {
            const key = formatDateKey(d);
            const entry = entries.find((e) => e.date === key);
            return (
              <View key={i} style={styles.stripDay}>
                <View style={{ position: 'relative' }}>
                  <View
                    style={[
                      entry?.mood_key === 'gold' ? styles.diamond : styles.circle,
                      { backgroundColor: entry ? getHexForKey(entry.mood_key as MoodKey) : (isDark ? '#333' : '#e0e0e0') },
                    ]}
                  />
                  {entry?.exercise_type && (
                    <View style={styles.exerciseBadge}>
                      <Ionicons name="fitness-outline" size={10} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={[styles.dayLabel, { color: isDark ? '#888' : '#666' }]}>
                  {dayLabels[i]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Distribution</Text>
        {distribution.length === 0 ? (
          <Text style={{ color: isDark ? '#666' : '#999', paddingVertical: 12 }}>
            No moods this week
          </Text>
        ) : (
          distribution.map((d) => (
            <View key={d.mood.key} style={styles.distRow}>
              <View style={[d.mood.key === 'gold' ? styles.distDiamond : styles.distDot, { backgroundColor: d.mood.hex }]} />
              <Text style={[styles.distName, { color: textColor }]} numberOfLines={1}>
                {d.mood.name.split(' / ')[0]}
              </Text>
              <View style={styles.distBarBg}>
                <View
                  style={[styles.distBar, { backgroundColor: d.mood.hex, width: `${d.ratio * 100}%` }]}
                />
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
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rangeText: { fontSize: 16, fontWeight: '600' },
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  strip: { flexDirection: 'row', justifyContent: 'space-around' },
  stripDay: { alignItems: 'center' },
  circle: { width: 32, height: 32, borderRadius: 16 },
  diamond: { width: 28, height: 28, borderRadius: 4, transform: [{ rotate: '45deg' }] },
  dayLabel: { fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  distDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  distDiamond: { width: 10, height: 10, borderRadius: 2, marginRight: 8, transform: [{ rotate: '45deg' }] },
  distName: { width: 100, fontSize: 12 },
  distBarBg: {
    flex: 1,
    height: 14,
    borderRadius: 3,
    backgroundColor: 'rgba(128,128,128,0.15)',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  distBar: { height: '100%', borderRadius: 3 },
  distPct: { width: 32, fontSize: 11, textAlign: 'right' },
  exerciseBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  insightText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
