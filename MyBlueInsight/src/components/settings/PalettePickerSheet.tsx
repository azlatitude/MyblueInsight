import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { PALETTES } from '../../constants/palettes';
import { usePalette } from '../../context/PaletteContext';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onClose: () => void;
}

export function PalettePickerSheet({ onClose }: Props) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#1c1c1e' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const subtextColor = isDark ? '#888' : '#666';
  const { palette, setPaletteId } = usePalette();

  const handleSelect = async (id: string) => {
    await setPaletteId(id);
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={[styles.sheet, { backgroundColor: bg }]} onPress={(e) => e.stopPropagation()}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: textColor }]}>Color Palette</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>Choose your mood color style</Text>

          {PALETTES.map((p) => {
            const isActive = p.id === palette.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.paletteRow,
                  {
                    backgroundColor: isDark ? '#2c2c2e' : '#f5f5f5',
                    borderColor: isActive ? (isDark ? '#fff' : '#007AFF') : 'transparent',
                    borderWidth: isActive ? 2 : 2,
                  },
                ]}
                onPress={() => handleSelect(p.id)}
                activeOpacity={0.7}
              >
                <View style={styles.paletteHeader}>
                  <View>
                    <Text style={[styles.paletteName, { color: textColor }]}>
                      {p.displayNameZh}  {p.displayName}
                    </Text>
                    <Text style={[styles.paletteDesc, { color: subtextColor }]}>{p.description}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color={isDark ? '#fff' : '#007AFF'} />}
                </View>
                <View style={styles.colorStrip}>
                  {p.colors.map((c) => (
                    <View key={c.key} style={[styles.colorDot, { backgroundColor: c.hex }]} />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
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
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  paletteRow: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paletteName: { fontSize: 15, fontWeight: '700' },
  paletteDesc: { fontSize: 11, marginTop: 2 },
  colorStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
