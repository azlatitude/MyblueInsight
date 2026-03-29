import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, useColorScheme } from 'react-native';
import { MoodEntryRow } from '../../db/moodRepository';
import { isToday, isFuture } from '../../utils/dateHelpers';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey, isLightColor } from '../../constants/palettes';

interface Props {
  date: Date;
  entry: MoodEntryRow | null;
  onPress: () => void;
}

export function DayCell({ date, entry, onPress }: Props) {
  const isDark = useColorScheme() === 'dark';
  const today = isToday(date);
  const future = isFuture(date);
  const dayNum = date.getDate();
  const { getHexForKey } = usePalette();

  const displayHex = entry ? getHexForKey(entry.mood_key as MoodKey) : undefined;
  const bgColor = displayHex ?? 'transparent';
  const needsDarkText = displayHex ? isLightColor(displayHex) : false;
  const textColor = entry
    ? (needsDarkText ? '#000' : '#fff')
    : (isDark ? '#fff' : '#000');

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={future}
      style={[
        styles.cell,
        {
          backgroundColor: displayHex ?? 'transparent',
          borderColor: today ? (isDark ? '#fff' : '#000') : (entry ? 'transparent' : (isDark ? '#333' : '#ddd')),
          borderWidth: today ? 2.5 : (entry ? 0 : 1),
          opacity: future ? 0.3 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.dayText, { color: textColor }]}>{dayNum}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 14, fontWeight: '600' },
});
