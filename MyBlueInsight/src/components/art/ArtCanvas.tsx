import React, { useMemo } from 'react';
import { Canvas, Circle, Group, LinearGradient, Path, Skia, vec, BlurMask, RadialGradient } from '@shopify/react-native-skia';
import { MoodEntryRow } from '../../db/moodRepository';
import { generateWatercolor, generateMosaic, generateFlowField, generateNebula, ArtElement } from '../../services/artGenerator';

interface Props {
  entries: MoodEntryRow[];
  style: 'watercolor' | 'mosaic' | 'flowField' | 'nebula';
  seed: number;
  size: number;
}

export function ArtCanvas({ entries, style: artStyle, seed, size }: Props) {
  const elements = useMemo(() => {
    const colorFreqs = calculateFrequencies(entries);
    switch (artStyle) {
      case 'watercolor': return generateWatercolor(colorFreqs, seed, size);
      case 'mosaic': return generateMosaic(colorFreqs, seed, size);
      case 'flowField': return generateFlowField(colorFreqs, seed, size);
      case 'nebula': return generateNebula(colorFreqs, seed, size);
    }
  }, [entries, artStyle, seed, size]);

  return (
    <Canvas style={{ width: size, height: size, borderRadius: 16 }}>
      {elements.map((el, i) => {
        if (el.type === 'rect') {
          const paint = Skia.Paint();
          paint.setColor(Skia.Color(el.color));
          paint.setAlphaf(el.opacity ?? 1);
          const rect = Skia.XYWHRect(el.x, el.y, el.width!, el.height!);
          return <Group key={i}>{/* rect drawn via path */}
            <Path
              path={(() => { const p = Skia.Path.Make(); p.addRect(rect); return p; })()}
              color={el.color}
              opacity={el.opacity ?? 1}
            />
          </Group>;
        }
        if (el.type === 'circle') {
          return (
            <Circle
              key={i}
              cx={el.x}
              cy={el.y}
              r={el.radius!}
              color={el.color}
              opacity={el.opacity ?? 1}
            >
              {el.blur && <BlurMask blur={el.blur} style="normal" />}
            </Circle>
          );
        }
        if (el.type === 'path') {
          const path = Skia.Path.Make();
          if (el.points && el.points.length > 0) {
            path.moveTo(el.points[0].x, el.points[0].y);
            for (let j = 1; j < el.points.length; j++) {
              path.lineTo(el.points[j].x, el.points[j].y);
            }
          }
          return (
            <Path
              key={i}
              path={path}
              color={el.color}
              opacity={el.opacity ?? 1}
              style="stroke"
              strokeWidth={el.strokeWidth ?? 1}
            />
          );
        }
        return null;
      })}
    </Canvas>
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
