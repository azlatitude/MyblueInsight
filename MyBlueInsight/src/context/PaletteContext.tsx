import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Palette, PaletteMoodColor, MoodKey, PALETTES, getPaletteById } from '../constants/palettes';
import { getDatabase } from '../db/database';

interface PaletteContextValue {
  palette: Palette;
  colors: PaletteMoodColor[];
  setPaletteId: (id: string) => Promise<void>;
  getHexForKey: (key: MoodKey) => string;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<Palette>(PALETTES[0]);

  useEffect(() => {
    (async () => {
      const db = await getDatabase();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM user_settings WHERE key = ?',
        ['palette_id']
      );
      if (row?.value) {
        setPalette(getPaletteById(row.value));
      }
    })();
  }, []);

  const setPaletteId = useCallback(async (id: string) => {
    const p = getPaletteById(id);
    setPalette(p);
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
      ['palette_id', id]
    );
  }, []);

  const getHexForKey = useCallback(
    (key: MoodKey): string => {
      return palette.colors.find((c) => c.key === key)?.hex ?? '#8E8E93';
    },
    [palette]
  );

  return (
    <PaletteContext.Provider value={{ palette, colors: palette.colors, setPaletteId, getHexForKey }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('usePalette must be used within PaletteProvider');
  return ctx;
}
