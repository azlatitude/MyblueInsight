import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useMoods } from '../../src/hooks/useMoods';
import { ArtStyleCard } from '../../src/components/art/ArtStyleCard';
import { ArtCanvas } from '../../src/components/art/ArtCanvas';
import { PaintingCard } from '../../src/components/art/PaintingCard';
import { formatDateKey, getWeekRange } from '../../src/utils/dateHelpers';
import { MoodEntryRow } from '../../src/db/moodRepository';
import { findMatchingPainting } from '../../src/services/paintingMatcher';
import { Ionicons } from '@expo/vector-icons';

type Period = 'Week' | 'Month' | 'Year';
type ArtStyleType = 'watercolor' | 'mosaic' | 'flowField' | 'nebula';

const ART_STYLES: { key: ArtStyleType; title: string; subtitle: string }[] = [
  { key: 'watercolor', title: 'Landscape', subtitle: 'Layered hills & sky' },
  { key: 'mosaic', title: 'Mondrian', subtitle: 'Color block composition' },
  { key: 'flowField', title: 'Fractal Flower', subtitle: 'Petal bloom patterns' },
  { key: 'nebula', title: 'Nebula', subtitle: 'Cosmic clouds & stars' },
];

export default function ArtScreen() {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#fff' : '#000';
  const bg = isDark ? '#000' : '#fff';
  const segBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const segActive = isDark ? '#333' : '#fff';

  const { entries, refresh } = useMoods();
  const [period, setPeriod] = useState<Period>('Month');
  const [viewDate, setViewDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );
  const [style, setStyle] = useState<ArtStyleType>('watercolor');
  const [seed, setSeed] = useState(Date.now());
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<any>(null);

  const filteredEntries = getEntriesForPeriod(entries, period, viewDate);
  const paintingMatch = useMemo(() => findMatchingPainting(filteredEntries), [filteredEntries]);

  function getEntriesForPeriod(allEntries: MoodEntryRow[], p: Period, refDate: Date): MoodEntryRow[] {
    if (p === 'Week') {
      const { start, end } = getWeekRange(refDate);
      const s = formatDateKey(start);
      const e = formatDateKey(end);
      return allEntries.filter((entry) => entry.date >= s && entry.date <= e);
    } else if (p === 'Month') {
      const y = refDate.getFullYear();
      const m = String(refDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, refDate.getMonth() + 1, 0).getDate();
      return allEntries.filter((e) => e.date >= `${y}-${m}-01` && e.date <= `${y}-${m}-${lastDay}`);
    } else {
      const y = String(refDate.getFullYear());
      return allEntries.filter((e) => e.date.startsWith(y));
    }
  }

  const navigateBack = () => {
    const d = new Date(viewDate);
    if (period === 'Week') d.setDate(d.getDate() - 7);
    else if (period === 'Month') d.setMonth(d.getMonth() - 1);
    else d.setFullYear(d.getFullYear() - 1);
    setViewDate(d);
    setGenerated(false);
  };

  const navigateForward = () => {
    const d = new Date(viewDate);
    if (period === 'Week') d.setDate(d.getDate() + 7);
    else if (period === 'Month') d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    setViewDate(d);
    setGenerated(false);
  };

  const getPeriodLabel = (): string => {
    if (period === 'Week') {
      const { start, end } = getWeekRange(viewDate);
      const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
      return `${fmt(start)} - ${fmt(end)}`;
    } else if (period === 'Month') {
      return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
    } else {
      return `${viewDate.getFullYear()}`;
    }
  };

  const handleGenerate = () => {
    setSeed(Date.now());
    setGenerated(true);
  };

  const handleSave = async () => {
    Alert.alert('Save', 'To save this artwork, take a screenshot of the canvas.');
  };

  const handleShare = async () => {
    Alert.alert('Share', 'To share this artwork, take a screenshot and share from your Photos app.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: textColor }]}>Mood Art</Text>

        <Text style={[styles.label, { color: isDark ? '#888' : '#666' }]}>Time Period</Text>
        <View style={[styles.segmented, { backgroundColor: segBg }]}>
          {(['Week', 'Month', 'Year'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.segment, period === p && [styles.segmentActive, { backgroundColor: segActive }]]}
              onPress={() => { setPeriod(p); setGenerated(false); }}
            >
              <Text style={[styles.segmentText, { color: period === p ? textColor : '#8E8E93' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.periodNav}>
          <TouchableOpacity onPress={navigateBack} style={styles.periodNavBtn}>
            <Ionicons name="chevron-back" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.periodLabel, { color: textColor }]}>{getPeriodLabel()}</Text>
          <TouchableOpacity onPress={navigateForward} style={styles.periodNavBtn}>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: isDark ? '#888' : '#666' }]}>Art Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
          {ART_STYLES.map((s) => (
            <ArtStyleCard
              key={s.key}
              title={s.title}
              subtitle={s.subtitle}
              isSelected={style === s.key}
              onPress={() => { setStyle(s.key); setGenerated(false); }}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.generateBtn, filteredEntries.length === 0 && styles.disabledBtn]}
          onPress={handleGenerate}
          disabled={filteredEntries.length === 0}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={20} color="#fff" />
          <Text style={styles.generateText}>
            {generated ? 'Generate Again' : 'Generate Art'}
          </Text>
        </TouchableOpacity>

        {filteredEntries.length === 0 && (
          <Text style={[styles.hint, { color: isDark ? '#666' : '#999' }]}>
            Record some moods first to generate art!
          </Text>
        )}

        {generated && filteredEntries.length > 0 && (
          <View style={styles.canvasContainer}>
            <View ref={canvasRef} collapsable={false}>
              <ArtCanvas
                entries={filteredEntries}
                style={style}
                seed={seed}
                size={300}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={textColor} />
                ) : (
                  <Ionicons name="download-outline" size={20} color={textColor} />
                )}
                <Text style={[styles.actionText, { color: textColor }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={textColor} />
                <Text style={[styles.actionText, { color: textColor }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleGenerate}>
                <Ionicons name="refresh-outline" size={20} color={textColor} />
                <Text style={[styles.actionText, { color: textColor }]}>Again</Text>
              </TouchableOpacity>
            </View>

            {paintingMatch && (
              <View style={styles.paintingSection}>
                <PaintingCard match={paintingMatch} />
              </View>
            )}
          </View>
        )}

        {!generated && (
          <View style={styles.placeholder}>
            <Ionicons name="color-palette-outline" size={56} color={isDark ? '#333' : '#ddd'} />
            <Text style={[styles.placeholderText, { color: isDark ? '#555' : '#aaa' }]}>
              Select a period and style, then generate your mood art!
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12 },
  label: { fontSize: 13, fontWeight: '600', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  segmented: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 10, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 14, fontWeight: '600' },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  periodNavBtn: { padding: 6 },
  periodLabel: { fontSize: 15, fontWeight: '600', minWidth: 120, textAlign: 'center' },
  styleScroll: { paddingHorizontal: 12 },
  generateBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledBtn: { opacity: 0.4 },
  generateText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  hint: { textAlign: 'center', marginTop: 8, fontSize: 13 },
  canvasContainer: { alignItems: 'center', marginTop: 24 },
  actions: { flexDirection: 'row', gap: 24, marginTop: 16 },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12 },
  placeholder: { alignItems: 'center', marginTop: 40, gap: 12 },
  placeholderText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  paintingSection: { width: '100%', paddingHorizontal: 16 },
});
