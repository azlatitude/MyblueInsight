import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useMoods } from '../../src/hooks/useMoods';
import { WeeklyReview } from '../../src/components/review/WeeklyReview';
import { MonthlyReview } from '../../src/components/review/MonthlyReview';
import { YearlyReview } from '../../src/components/review/YearlyReview';

type Period = 'Week' | 'Month' | 'Year';

export default function ReviewScreen() {
  const isDark = useColorScheme() === 'dark';
  const { entries } = useMoods();
  const [period, setPeriod] = useState<Period>('Month');

  const textColor = isDark ? '#fff' : '#000';
  const bg = isDark ? '#000' : '#fff';
  const segBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const segActive = isDark ? '#333' : '#fff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>Review</Text>
      <View style={[styles.segmented, { backgroundColor: segBg }]}>
        {(['Week', 'Month', 'Year'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.segment, period === p && [styles.segmentActive, { backgroundColor: segActive }]]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.segmentText, { color: period === p ? textColor : '#8E8E93' }]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {period === 'Week' && <WeeklyReview entries={entries} />}
        {period === 'Month' && <MonthlyReview entries={entries} />}
        {period === 'Year' && <YearlyReview entries={entries} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12 },
  segmented: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: { fontSize: 14, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 16 },
});
