import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CalendarGrid } from '../../src/components/calendar/CalendarGrid';
import { MoodPickerSheet } from '../../src/components/calendar/MoodPickerSheet';
import { PalettePickerSheet } from '../../src/components/settings/PalettePickerSheet';
import { useMoods } from '../../src/hooks/useMoods';
import { formatMonthYear } from '../../src/utils/dateHelpers';
import { exportData, importData } from '../../src/services/dataBackup';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { entries, save, refresh, getMoodMap } = useMoods();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const moodMap = getMoodMap();

  const goBack = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const goForward = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const handleDayPress = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowPicker(true);
  }, []);

  const handleSave = useCallback(
    async (colorHex: string, moodKey: string, moodName: string, note: string | null, exerciseType: string | null) => {
      if (selectedDate) {
        await save(selectedDate, colorHex, moodKey, moodName, note, exerciseType);
      }
      setShowPicker(false);
    },
    [selectedDate, save]
  );

  const textColor = isDark ? '#fff' : '#000';

  const handleExport = async () => {
    setShowMenu(false);
    try {
      await exportData();
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const handleImport = async () => {
    setShowMenu(false);
    try {
      const { imported, skipped } = await importData();
      if (imported > 0) {
        await refresh();
        Alert.alert('Import Complete', `${imported} entries imported${skipped ? `, ${skipped} skipped` : ''}.`);
      }
    } catch (e: any) {
      Alert.alert('Import Failed', e.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>
          {formatMonthYear(year, month)}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.navBtn}>
            <Ionicons name="ellipsis-horizontal" size={22} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPalette(true)} style={styles.navBtn}>
            <Ionicons name="color-palette-outline" size={22} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goForward} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {showMenu && (
        <View style={[styles.menu, { backgroundColor: isDark ? '#2c2c2e' : '#fff' }]}>
          <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color={textColor} />
            <Text style={[styles.menuText, { color: textColor }]}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleImport}>
            <Ionicons name="push-outline" size={20} color={textColor} />
            <Text style={[styles.menuText, { color: textColor }]}>Import Data</Text>
          </TouchableOpacity>
        </View>
      )}

      <CalendarGrid
        year={year}
        month={month}
        moodMap={moodMap}
        onDayPress={handleDayPress}
      />

      <Modal visible={showPicker} animationType="slide" transparent>
        <MoodPickerSheet
          date={selectedDate}
          existingEntry={selectedDate ? moodMap.get(
            `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
          ) ?? null : null}
          onSave={handleSave}
          onClose={() => setShowPicker(false)}
        />
      </Modal>

      <Modal visible={showPalette} animationType="slide" transparent>
        <PalettePickerSheet onClose={() => setShowPalette(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700' },
  navBtn: { padding: 8 },
  menu: {
    position: 'absolute',
    top: 100,
    right: 16,
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
