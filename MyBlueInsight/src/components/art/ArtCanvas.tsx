import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { MoodEntryRow } from '../../db/moodRepository';
import { usePalette } from '../../context/PaletteContext';
import { MoodKey } from '../../constants/palettes';
import {
  generateWatercolor,
  generateMosaic,
  generateFlowField,
  generateNebula,
  SvgDescriptor,
} from '../../services/artGenerator';

interface Props {
  entries: MoodEntryRow[];
  style: 'watercolor' | 'mosaic' | 'flowField' | 'nebula';
  seed: number;
  size: number;
}

export function ArtCanvas({ entries, style: artStyle, seed, size }: Props) {
  const { getHexForKey } = usePalette();
  const elements = useMemo<SvgDescriptor[]>(() => {
    const colorFreqs = calculateFrequencies(entries, getHexForKey);
    if (colorFreqs.length === 0) return [];
    switch (artStyle) {
      case 'watercolor': return generateWatercolor(colorFreqs, seed, size);
      case 'mosaic':     return generateMosaic(colorFreqs, seed, size);
      case 'flowField':  return generateFlowField(colorFreqs, seed, size);
      case 'nebula':     return generateNebula(colorFreqs, seed, size);
    }
  }, [entries, artStyle, seed, size, getHexForKey]);

  return (
    <View style={{ width: size, height: size, borderRadius: 16, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {elements.map((el, i) => {
          if (el.type === 'rect') {
            return (
              <Rect
                key={i}
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                fill={el.fill}
                opacity={el.opacity}
                stroke={el.stroke}
                strokeWidth={el.strokeWidth}
              />
            );
          }
          if (el.type === 'circle') {
            return (
              <Circle
                key={i}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill={el.fill}
                opacity={el.opacity}
              />
            );
          }
          if (el.type === 'path') {
            return (
              <Path
                key={i}
                d={el.d}
                stroke={el.stroke}
                strokeWidth={el.strokeWidth}
                fill={el.fill ?? 'none'}
                opacity={el.opacity}
              />
            );
          }
          return null;
        })}
      </Svg>
    </View>
  );
}

function calculateFrequencies(
  entries: MoodEntryRow[],
  getHexForKey: (key: MoodKey) => string
): { hex: string; ratio: number }[] {
  if (entries.length === 0) return [];
  const counts = new Map<string, number>();
  entries.forEach((e) => {
    const key = e.mood_key ?? 'gray';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const total = entries.length;
  return Array.from(counts.entries())
    .map(([moodKey, count]) => ({ hex: getHexForKey(moodKey as MoodKey), ratio: count / total }))
    .sort((a, b) => b.ratio - a.ratio);
}
