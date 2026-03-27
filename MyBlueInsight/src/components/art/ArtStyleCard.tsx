import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';

interface Props {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
}

export function ArtStyleCard({ title, subtitle, isSelected, onPress }: Props) {
  const isDark = useColorScheme() === 'dark';
  const cardBg = isSelected
    ? (isDark ? '#1a3a5c' : '#e8f0fe')
    : (isDark ? '#1c1c1e' : '#f8f8f8');
  const borderColor = isSelected ? '#007AFF' : (isDark ? '#333' : '#ddd');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 4,
  },
  title: { fontSize: 13, fontWeight: '700' },
  subtitle: { fontSize: 11, marginTop: 4 },
});
