import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePalette } from '../../context/PaletteContext';
import { MoodEntryRow } from '../../db/moodRepository';
import { Ionicons } from '@expo/vector-icons';
import { DiamondGem } from '../DiamondGem';

interface Props {
  date: Date | null;
  existingEntry: MoodEntryRow | null;
  onSave: (colorHex: string, moodKey: string, moodName: string, note: string | null, exerciseType: string | null) => void;
  onClose: () => void;
}

const EXERCISE_TYPES = [
  { key: 'run', icon: 'fitness-outline' as const, label: 'Run' },
  { key: 'walk', icon: 'walk-outline' as const, label: 'Walk' },
  { key: 'yoga', icon: 'body-outline' as const, label: 'Yoga' },
  { key: 'gym', icon: 'barbell-outline' as const, label: 'Gym' },
  { key: 'swim', icon: 'water-outline' as const, label: 'Swim' },
  { key: 'bike', icon: 'bicycle-outline' as const, label: 'Bike' },
  { key: 'stairs', icon: 'trending-up-outline' as const, label: 'Stairs' },
];

export function MoodPickerSheet({ date, existingEntry, onSave, onClose }: Props) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#1c1c1e' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const { colors } = usePalette();
  const scrollRef = useRef<ScrollView>(null);

  const [selectedHex, setSelectedHex] = useState<string | null>(
    existingEntry ? colors.find((c) => c.key === existingEntry.mood_key)?.hex ?? existingEntry.color_hex : null
  );
  const [note, setNote] = useState(existingEntry?.note ?? '');
  const [exerciseType, setExerciseType] = useState<string | null>(
    existingEntry?.exercise_type ?? null
  );

  const handleSelect = (hex: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedHex(hex);
  };

  const handleSave = () => {
    if (!selectedHex) return;
    const mood = colors.find((m) => m.hex === selectedHex);
    if (!mood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSave(mood.hex, mood.key, mood.name, note.trim() || null, exerciseType);
  };

  const dateStr = date
    ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Pressable style={[styles.sheet, { backgroundColor: bg }]} onPress={(e) => e.stopPropagation()}>
          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={styles.scrollBody}>
            <View style={styles.handle} />
            <Text style={[styles.title, { color: textColor }]}>How are you feeling?</Text>
            <Text style={[styles.dateText, { color: isDark ? '#888' : '#666' }]}>{dateStr}</Text>

            <View style={styles.colorGrid}>
              {colors.map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  style={styles.moodItem}
                  onPress={() => handleSelect(mood.hex)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: mood.hex },
                      selectedHex === mood.hex && styles.selected,
                    ]}
                  >
                    {mood.key === 'gold' && (
                      <DiamondGem size={20} />
                    )}
                    {selectedHex === mood.hex && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={[styles.moodLabel, { color: textColor }]} numberOfLines={1}>
                    {mood.name.split(' / ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.noteSection}>
                <Text style={[styles.sectionLabel, { color: isDark ? '#888' : '#666' }]}>Note</Text>
                <TextInput
                  style={[
                    styles.noteInput,
                    {
                      color: textColor,
                      borderColor: isDark ? '#333' : '#ddd',
                      backgroundColor: isDark ? '#2c2c2e' : '#f5f5f5',
                    },
                  ]}
                  placeholder="How was your day?"
                  placeholderTextColor={isDark ? '#555' : '#aaa'}
                  value={note}
                  onChangeText={(t) => setNote(t.slice(0, 280))}
                  multiline
                  maxLength={280}
                />
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: isDark ? '#888' : '#666' }]}>Exercise</Text>
            <View style={styles.exerciseRow}>
              {EXERCISE_TYPES.map((ex) => {
                const isActive = exerciseType === ex.key;
                return (
                  <TouchableOpacity
                    key={ex.key}
                    style={[
                      styles.exerciseItem,
                      {
                        backgroundColor: isActive
                          ? '#007AFF'
                          : (isDark ? '#2c2c2e' : '#f0f0f0'),
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setExerciseType(isActive ? null : ex.key);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={ex.icon}
                      size={16}
                      color={isActive ? '#fff' : (isDark ? '#aaa' : '#666')}
                    />
                    <Text
                      style={[
                        styles.exerciseLabel,
                        { color: isActive ? '#fff' : (isDark ? '#aaa' : '#666') },
                      ]}
                    >
                      {ex.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Save button always visible at bottom */}
          <TouchableOpacity
            style={[styles.saveBtn, !selectedHex && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!selectedHex}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: '85%',
  },
  scrollBody: { flexGrow: 0 },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  dateText: { fontSize: 13, textAlign: 'center', marginTop: 2, marginBottom: 14 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodItem: { width: '16.66%', alignItems: 'center', marginBottom: 10 },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  moodLabel: { fontSize: 9, marginTop: 3, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  noteSection: { flex: 1 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginTop: 4, marginBottom: 4 },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  exerciseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 3,
  },
  exerciseLabel: { fontSize: 10, fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
