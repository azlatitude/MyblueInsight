import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, useColorScheme, Image } from 'react-native';
import { MoodEntryRow } from '../../db/moodRepository';
import { isToday, isFuture } from '../../utils/dateHelpers';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey, isLightColor } from '../../constants/palettes';

const diamondImage = require('../../assets/diamond.png');

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
  const isGold = entry?.mood_key === 'gold';
  const needsDarkText = displayHex ? isLightColor(displayHex) : false;
  const textColor = entry
    ? (needsDarkText ? '#000' : '#fff')
    : (isDark ? '#fff' : '#000');

  if (isGold) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={future}
        style={[
          styles.cell,
          {
            backgroundColor: 'transparent',
            borderColor: today ? (isDark ? '#fff' : '#000') : 'transparent',
            borderWidth: today ? 2.5 : 0,
            borderRadius: 8,
            opacity: future ? 0.3 : 1,
          },
        ]}
        activeOpacity={0.7}
      >
        <Image source={diamondImage} style={styles.diamondBg} resizeMode="contain" />
        <Text style={[styles.dayText, { color: '#fff' }]}>{dayNum}</Text>
        {entry?.exercise_type && (
          <View style={[styles.exerciseDot, { borderColor: 'transparent' }]} />
        )}
      </TouchableOpacity>
    );
  }

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
      {entry?.exercise_type && (
        <View style={[styles.exerciseDot, { borderColor: displayHex ?? 'transparent' }]} />
      )}
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
  diamondBg: {
    position: 'absolute',
    width: '90%',
    height: '90%',
  },
  dayText: { fontSize: 14, fontWeight: '600' },
  exerciseDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
});
