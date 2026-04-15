import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, TouchableOpacity, Linking } from 'react-native';
import { PaintingMatch } from '../../services/paintingMatcher';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey } from '../../constants/palettes';
import { PAINTING_IMAGES } from '../../constants/paintingImages';
import { Ionicons } from '@expo/vector-icons';

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

  const localImage = PAINTING_IMAGES[painting.id];

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

      {localImage && (
        <Image
          source={localImage}
          style={styles.paintingImage}
          resizeMode="cover"
        />
      )}

      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {painting.title}
      </Text>
      <Text style={[styles.artist, { color: subtextColor }]}>
        {painting.artist}, {painting.year}
      </Text>

      <View style={styles.linkRow}>
        <TouchableOpacity
          style={[styles.linkBtn, { backgroundColor: isDark ? '#2c2c2e' : '#e8e8ed' }]}
          onPress={() => {
            const q = encodeURIComponent(`${painting.title} ${painting.artist} painting`);
            Linking.openURL(`https://www.google.com/search?tbm=isch&q=${q}`);
          }}
        >
          <Ionicons name="image-outline" size={14} color={textColor} />
          <Text style={[styles.linkText, { color: textColor }]}>View Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.linkBtn, { backgroundColor: isDark ? '#2c2c2e' : '#e8e8ed' }]}
          onPress={() => {
            const q = encodeURIComponent(`${painting.title} ${painting.artist}`);
            Linking.openURL(`https://en.wikipedia.org/w/index.php?search=${q}`);
          }}
        >
          <Ionicons name="book-outline" size={14} color={textColor} />
          <Text style={[styles.linkText, { color: textColor }]}>Wikipedia</Text>
        </TouchableOpacity>
      </View>

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
  paintingImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
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
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  artist: {
    fontSize: 12,
    marginTop: 4,
  },
  linkRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
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
