export interface SvgCircleDescriptor {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}

export interface SvgRectDescriptor {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  stroke?: string;
  strokeWidth?: number;
}

export interface SvgPathDescriptor {
  type: 'path';
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  fill?: string;
}

export type SvgDescriptor = SvgCircleDescriptor | SvgRectDescriptor | SvgPathDescriptor;

interface ColorFreq {
  hex: string;
  ratio: number;
}

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedColor(freqs: ColorFreq[], rand: () => number): string {
  const roll = rand();
  let cum = 0;
  for (const f of freqs) {
    cum += f.ratio;
    if (roll <= cum) return f.hex;
  }
  return freqs[freqs.length - 1]?.hex ?? '#888888';
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const val = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return { r: (val >> 16) & 255, g: (val >> 8) & 255, b: val & 255 };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

// Lighten a hex color by mixing with white
function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr},${lg},${lb})`;
}

// ── Watercolor: layered landscape with mountains, hills, water ──
export function generateWatercolor(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];

  // Sky gradient background — use lightest mood color
  const skyColor = lighten(freqs[0]?.hex ?? '#87CEEB', 0.7);
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: skyColor, opacity: 1 });

  // Sun/moon
  const sunX = size * (0.2 + rand() * 0.6);
  const sunY = size * (0.1 + rand() * 0.15);
  const sunColor = lighten(weightedColor(freqs, rand), 0.5);
  elements.push({ type: 'circle', cx: sunX, cy: sunY, r: size * 0.06 + rand() * size * 0.03, fill: sunColor, opacity: 0.6 });

  // Generate 5-7 landscape layers from back to front
  const layerCount = 5 + Math.floor(rand() * 3);
  for (let layer = 0; layer < layerCount; layer++) {
    const baseY = size * (0.25 + (layer / layerCount) * 0.55);
    const hex = weightedColor(freqs, rand);
    const alpha = 0.4 + layer * 0.08;
    const fillColor = rgba(hex, Math.min(alpha, 0.85));

    // Build a wavy mountain/hill contour
    const points: number[] = [];
    const segments = 12 + Math.floor(rand() * 8);
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * size;
      const amplitude = size * (0.06 + rand() * 0.1) * (1 - layer / layerCount * 0.5);
      const freq1 = 2 + rand() * 3;
      const freq2 = 4 + rand() * 5;
      const y = baseY
        - Math.sin((i / segments) * Math.PI * freq1 + rand() * 6) * amplitude
        - Math.sin((i / segments) * Math.PI * freq2 + rand() * 4) * amplitude * 0.4
        + rand() * size * 0.02;
      points.push(x, y);
    }

    // Build SVG path: contour + fill to bottom
    let d = `M ${points[0].toFixed(1)} ${points[1].toFixed(1)}`;
    for (let i = 2; i < points.length; i += 2) {
      const prevX = points[i - 2], prevY = points[i - 1];
      const currX = points[i], currY = points[i + 1];
      const cpx = (prevX + currX) / 2;
      d += ` Q ${prevX.toFixed(1)} ${prevY.toFixed(1)} ${cpx.toFixed(1)} ${((prevY + currY) / 2).toFixed(1)}`;
    }
    d += ` L ${size} ${size} L 0 ${size} Z`;

    elements.push({
      type: 'path',
      d,
      stroke: rgba(hex, 0.15),
      strokeWidth: 0.5,
      opacity: 1,
      fill: fillColor,
    });
  }

  // Soft mist/cloud circles in upper portion
  for (let i = 0; i < 8; i++) {
    const hex = weightedColor(freqs, rand);
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size * 0.4,
      r: size * 0.08 + rand() * size * 0.12,
      fill: rgba(hex, 0.06 + rand() * 0.06),
      opacity: 1,
    });
  }

  return elements;
}

// ── Mosaic: Mondrian-style recursive rectangle subdivision ──
export function generateMosaic(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];
  const lineWidth = Math.max(3, Math.round(size / 60));

  // White background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#FAFAFA', opacity: 1 });

  interface MondrianRect { x: number; y: number; w: number; h: number; }
  const rects: MondrianRect[] = [];

  function subdivide(x: number, y: number, w: number, h: number, depth: number) {
    const minSize = size * 0.08;
    // Decide whether to split — deeper = less likely
    if (depth > 5 || (w < minSize && h < minSize) || (depth > 1 && rand() < 0.15)) {
      rects.push({ x, y, w, h });
      return;
    }

    // Split horizontally or vertically based on aspect ratio
    const splitH = w > h ? (rand() < 0.7) : (rand() < 0.3);

    if (splitH && w > minSize * 1.5) {
      const split = x + w * (0.3 + rand() * 0.4);
      subdivide(x, y, split - x, h, depth + 1);
      subdivide(split, y, x + w - split, h, depth + 1);
    } else if (!splitH && h > minSize * 1.5) {
      const split = y + h * (0.3 + rand() * 0.4);
      subdivide(x, y, w, split - y, depth + 1);
      subdivide(x, split, w, y + h - split, depth + 1);
    } else {
      rects.push({ x, y, w, h });
    }
  }

  // Start subdivision with margin
  const margin = lineWidth;
  subdivide(margin, margin, size - margin * 2, size - margin * 2, 0);

  // Fill rectangles — ~40% colored, rest white
  for (const r of rects) {
    const shouldColor = rand() < 0.4;
    const fill = shouldColor ? weightedColor(freqs, rand) : '#FAFAFA';
    const gap = lineWidth / 2;
    elements.push({
      type: 'rect',
      x: r.x + gap,
      y: r.y + gap,
      width: Math.max(1, r.w - gap * 2),
      height: Math.max(1, r.h - gap * 2),
      fill,
      opacity: 1,
    });
  }

  // Draw black grid lines over all subdivision boundaries
  // Outer border
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: 'transparent', opacity: 1, stroke: '#1a1a1a', strokeWidth: lineWidth * 1.5 });

  // Internal lines — collect unique split positions
  for (const r of rects) {
    // Right edge
    if (r.x + r.w < size - margin * 2) {
      elements.push({
        type: 'path',
        d: `M ${(r.x + r.w).toFixed(1)} ${r.y.toFixed(1)} L ${(r.x + r.w).toFixed(1)} ${(r.y + r.h).toFixed(1)}`,
        stroke: '#1a1a1a',
        strokeWidth: lineWidth,
        opacity: 1,
      });
    }
    // Bottom edge
    if (r.y + r.h < size - margin * 2) {
      elements.push({
        type: 'path',
        d: `M ${r.x.toFixed(1)} ${(r.y + r.h).toFixed(1)} L ${(r.x + r.w).toFixed(1)} ${(r.y + r.h).toFixed(1)}`,
        stroke: '#1a1a1a',
        strokeWidth: lineWidth,
        opacity: 1,
      });
    }
  }

  return elements;
}

// ── Fractal: spiral fractal with branching curves ──
export function generateFlowField(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];

  // Soft warm background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#FAFAF5', opacity: 1 });

  // Draw fractal spiral branches
  function spiral(cx: number, cy: number, startAngle: number, startR: number, turns: number, depth: number) {
    if (depth <= 0 || startR < 1) return;

    const color = weightedColor(freqs, rand);
    const steps = 30 + Math.floor(rand() * 20);
    const angleStep = (turns * Math.PI * 2) / steps;
    const shrink = 0.97 - rand() * 0.02;
    const pts: { x: number; y: number }[] = [];

    let r = startR;
    let angle = startAngle;
    for (let i = 0; i <= steps; i++) {
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      pts.push({ x, y });
      angle += angleStep;
      r *= shrink;
    }

    // Build smooth path
    if (pts.length > 1) {
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let j = 1; j < pts.length; j++) {
        const prev = pts[j - 1], curr = pts[j];
        d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} ${((prev.x + curr.x) / 2).toFixed(1)} ${((prev.y + curr.y) / 2).toFixed(1)}`;
      }
      elements.push({
        type: 'path',
        d,
        stroke: color,
        strokeWidth: 1 + depth * 0.5,
        opacity: 0.3 + depth * 0.1,
      });
    }

    // Leaf dots along the spiral
    for (let i = 0; i < pts.length; i += 4 + Math.floor(rand() * 3)) {
      const leafColor = weightedColor(freqs, rand);
      elements.push({
        type: 'circle',
        cx: pts[i].x,
        cy: pts[i].y,
        r: 1.5 + rand() * 3 * (depth / 4),
        fill: rgba(leafColor, 0.3 + rand() * 0.3),
        opacity: 1,
      });
    }

    // Branch sub-spirals from endpoints
    if (depth > 1) {
      const branchCount = 1 + Math.floor(rand() * 2);
      for (let b = 0; b < branchCount; b++) {
        const branchPt = pts[Math.floor(pts.length * (0.3 + rand() * 0.5))];
        spiral(
          branchPt.x, branchPt.y,
          startAngle + (rand() - 0.5) * Math.PI,
          startR * (0.3 + rand() * 0.2),
          turns * (0.5 + rand() * 0.3),
          depth - 1,
        );
      }
    }
  }

  // Multiple spiral centers
  const spiralCount = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < spiralCount; i++) {
    const cx = size * (0.15 + rand() * 0.7);
    const cy = size * (0.15 + rand() * 0.7);
    const startAngle = rand() * Math.PI * 2;
    const startR = size * (0.1 + rand() * 0.15);
    const turns = 1.5 + rand() * 2;
    const direction = rand() > 0.5 ? 1 : -1;
    spiral(cx, cy, startAngle * direction, startR, turns * direction, 4);
  }

  // Scattered accent dots
  for (let i = 0; i < 30; i++) {
    const hex = weightedColor(freqs, rand);
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size,
      r: 1 + rand() * 2,
      fill: rgba(hex, 0.2 + rand() * 0.2),
      opacity: 1,
    });
  }

  return elements;
}

// ── Nebula: cosmic clouds & stars (unchanged) ──
export function generateNebula(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];

  // Dark space background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#080820', opacity: 1 });

  // Large nebula cloud circles
  for (const { hex, ratio } of freqs) {
    const cloudCount = Math.floor(ratio * 18) + 4;
    for (let i = 0; i < cloudCount; i++) {
      const r = rand() * size * 0.35 + size * 0.10;
      elements.push({
        type: 'circle',
        cx: rand() * size,
        cy: rand() * size,
        r,
        fill: rgba(hex, rand() * 0.10 + 0.02),
        opacity: 1,
      });
    }
  }

  // Medium bright patches
  for (let i = 0; i < 40; i++) {
    const hex = weightedColor(freqs, rand);
    const r = rand() * size * 0.08 + size * 0.02;
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size,
      r,
      fill: rgba(hex, rand() * 0.08 + 0.02),
      opacity: 1,
    });
  }

  // Stars
  for (let i = 0; i < 200; i++) {
    const starOpacity = rand() * 0.7 + 0.3;
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size,
      r: rand() * 1.2 + 0.3,
      fill: `rgba(255,255,255,${starOpacity.toFixed(3)})`,
      opacity: 1,
    });
  }

  // Bright star highlights
  for (let i = 0; i < 15; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    elements.push({ type: 'circle', cx, cy, r: rand() * 7 + 4, fill: 'rgba(255,255,255,0.06)', opacity: 1 });
    elements.push({ type: 'circle', cx, cy, r: rand() * 1.8 + 1.0, fill: 'rgba(255,255,255,1)', opacity: 1 });
  }

  return elements;
}
