import React, { useState } from 'react';
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
];

export function MoodPickerSheet({ date, existingEntry, onSave, onClose }: Props) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#1c1c1e' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const { colors } = usePalette();

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
    ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Pressable style={[styles.sheet, { backgroundColor: bg }]} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
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
                    {selectedHex === mood.hex && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </View>
                  <Text style={[styles.moodLabel, { color: textColor }]} numberOfLines={1}>
                    {mood.name.split(' / ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.noteLabel, { color: isDark ? '#888' : '#666' }]}>
              Note (optional)
            </Text>
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
            <Text style={[styles.charCount, { color: isDark ? '#555' : '#aaa' }]}>
              {note.length}/280
            </Text>

            <Text style={[styles.noteLabel, { color: isDark ? '#888' : '#666' }]}>
              Exercise (optional)
            </Text>
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
                          ? (isDark ? '#007AFF' : '#007AFF')
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
                      size={18}
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

            <TouchableOpacity
              style={[styles.saveBtn, !selectedHex && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!selectedHex}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
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
    padding: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  dateText: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodItem: { width: '20%', alignItems: 'center', marginBottom: 16 },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  moodLabel: { fontSize: 10, marginTop: 4, textAlign: 'center' },
  noteLabel: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  exerciseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  exerciseLabel: { fontSize: 11, fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
