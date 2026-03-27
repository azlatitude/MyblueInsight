import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { MoodEntryRow } from '../../db/moodRepository';
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
  const elements = useMemo<SvgDescriptor[]>(() => {
    const colorFreqs = calculateFrequencies(entries);
    if (colorFreqs.length === 0) return [];
    switch (artStyle) {
      case 'watercolor': return generateWatercolor(colorFreqs, seed, size);
      case 'mosaic':     return generateMosaic(colorFreqs, seed, size);
      case 'flowField':  return generateFlowField(colorFreqs, seed, size);
      case 'nebula':     return generateNebula(colorFreqs, seed, size);
    }
  }, [entries, artStyle, seed, size]);

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
                fill="none"
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

function calculateFrequencies(entries: MoodEntryRow[]): { hex: string; ratio: number }[] {
  if (entries.length === 0) return [];
  const counts = new Map<string, number>();
  entries.forEach((e) => counts.set(e.color_hex, (counts.get(e.color_hex) ?? 0) + 1));
  const total = entries.length;
  return Array.from(counts.entries())
    .map(([hex, count]) => ({ hex, ratio: count / total }))
    .sort((a, b) => b.ratio - a.ratio);
}
