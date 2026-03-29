import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { MoodEntryRow } from '../../db/moodRepository';
import { formatDateKey } from '../../utils/dateHelpers';
import { useMostCommonMood, useDiversityScore } from '../../hooks/useReviewStats';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey } from '../../constants/palettes';
import { Ionicons } from '@expo/vector-icons';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props { entries: MoodEntryRow[] }

export function YearlyReview({ entries }: Props) {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1c1c1e' : '#f8f8f8';
  const { getHexForKey } = usePalette();
  const [year, setYear] = useState(new Date().getFullYear());

  const yearEntries = useMemo(() => {
    return entries.filter((e) => e.date.startsWith(String(year)));
  }, [entries, year]);

  const mostCommon = useMostCommonMood(yearEntries);
  const diversity = useDiversityScore(yearEntries);
  const totalDays = yearEntries.length;
  const daysInYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
  const coverage = daysInYear > 0 ? Math.round((totalDays / daysInYear) * 100) : 0;

  const entryMap = useMemo(() => {
    const m = new Map<string, MoodKey>();
    yearEntries.forEach((e) => m.set(e.date, (e.mood_key ?? 'gray') as MoodKey));
    return m;
  }, [yearEntries]);

  return (
    <View>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => setYear(year - 1)}>
          <Ionicons name="chevron-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.yearText, { color: textColor }]}>{year}</Text>
        <TouchableOpacity onPress={() => setYear(year + 1)}>
          <Ionicons name="chevron-forward" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Year at a Glance</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.yearGrid}>
            {MONTHS.map((mName, mIdx) => {
              const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
              return (
                <View key={mName} style={styles.monthCol}>
                  <Text style={[styles.monthLabel, { color: isDark ? '#888' : '#666' }]}>{mName}</Text>
                  {Array.from({ length: daysInMonth }, (_, d) => {
                    const key = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`;
                    const moodKey = entryMap.get(key);
                    return (
                      <View
                        key={d}
                        style={[
                          styles.yearDot,
                          { backgroundColor: moodKey ? getHexForKey(moodKey) : (isDark ? '#222' : '#eee') },
                        ]}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Year Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statBig, { color: textColor }]}>{totalDays}</Text>
            <Text style={styles.statLabel}>Days Logged</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statBig, { color: textColor }]}>{coverage}%</Text>
            <Text style={styles.statLabel}>Coverage</Text>
          </View>
          <View style={styles.statItem}>
            {mostCommon && <View style={[styles.statDot, { backgroundColor: mostCommon.hex }]} />}
            <Text style={[styles.statSmall, { color: textColor }]} numberOfLines={1}>
              {mostCommon?.name.split(' / ')[0] ?? 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Most Common</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statBig, { color: textColor }]}>{diversity}</Text>
            <Text style={styles.statLabel}>Diversity</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  yearText: { fontSize: 16, fontWeight: '600' },
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  yearGrid: { flexDirection: 'row', gap: 3 },
  monthCol: { alignItems: 'center', gap: 2 },
  monthLabel: { fontSize: 9, marginBottom: 4 },
  yearDot: { width: 10, height: 10, borderRadius: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statDot: { width: 16, height: 16, borderRadius: 8, marginBottom: 4 },
  statBig: { fontSize: 22, fontWeight: '700' },
  statSmall: { fontSize: 12, fontWeight: '600' },
  statLabel: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
});
