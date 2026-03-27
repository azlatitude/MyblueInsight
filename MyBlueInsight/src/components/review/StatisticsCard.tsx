import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface Props {
  label: string;
  value: string;
  dotColor?: string;
}

export function StatisticsCard({ label, value, dotColor }: Props) {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={styles.container}>
      {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.value, { color: isDark ? '#fff' : '#000' }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
  value: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
});
