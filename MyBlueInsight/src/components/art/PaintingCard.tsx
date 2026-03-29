import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { PaintingMatch } from '../../services/paintingMatcher';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey } from '../../constants/palettes';

interface Props {
  match: PaintingMatch;
}

export function PaintingCard({ match }: Props) {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const subtextColor = isDark ? '#888' : '#666';
  const cardBg = isDark ? '#1c1c1e' : '#f8f8f8';
  const { getHexForKey } = usePalette();
  const { painting, similarity } = match;

  // Sort mood profile entries by weight descending for the color strip
  const profileEntries = Object.entries(painting.moodProfile)
    .sort(([, a], [, b]) => b - a) as [MoodKey, number][];

  const matchPct = Math.round(similarity * 100);

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: subtextColor }]}>Your mood reminds us of...</Text>
          <View style={[styles.badge, { backgroundColor: isDark ? '#2c2c2e' : '#e8e8ed' }]}>
            <Text style={[styles.badgeText, { color: textColor }]}>{matchPct}% match</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {painting.titleZh}
      </Text>
      <Text style={[styles.titleEn, { color: subtextColor }]} numberOfLines={1}>
        {painting.title}
      </Text>
      <Text style={[styles.artist, { color: subtextColor }]}>
        {painting.artistZh} ({painting.artist}), {painting.year}
      </Text>

      <View style={styles.colorStrip}>
        {profileEntries.map(([key, weight]) => (
          <View
            key={key}
            style={[
              styles.colorSegment,
              {
                backgroundColor: getHexForKey(key),
                flex: weight,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  header: {
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  titleEn: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 2,
  },
  artist: {
    fontSize: 12,
    marginTop: 4,
  },
  colorStrip: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  colorSegment: {
    height: '100%',
  },
});
