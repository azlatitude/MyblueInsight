import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { DayCell } from './DayCell';
import { MoodEntryRow } from '../../db/moodRepository';
import { getMonthDays, getFirstWeekdayOfMonth, formatDateKey } from '../../utils/dateHelpers';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  year: number;
  month: number;
  moodMap: Map<string, MoodEntryRow>;
  onDayPress: (date: Date) => void;
}

export function CalendarGrid({ year, month, moodMap, onDayPress }: Props) {
  const isDark = useColorScheme() === 'dark';
  const days = getMonthDays(year, month);
  const firstWeekday = getFirstWeekdayOfMonth(year, month);
  const padding: (Date | null)[] = Array(firstWeekday).fill(null);
  const allCells = [...padding, ...days];

  // Pad to complete last week
  while (allCells.length % 7 !== 0) allCells.push(null);

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={[styles.weekdayLabel, { color: isDark ? '#888' : '#8E8E93' }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {allCells.map((date, i) => (
          <View key={i} style={styles.cell}>
            {date ? (
              <DayCell
                date={date}
                entry={moodMap.get(formatDateKey(date)) ?? null}
                onPress={() => onDayPress(date)}
              />
            ) : (
              <View style={styles.emptyCell} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8 },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, padding: 3 },
  emptyCell: { flex: 1 },
});
